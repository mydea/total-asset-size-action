const { getInput } = require('@actions/core');
const { exec } = require('@actions/exec');
const { getOctokit, context } = require('@actions/github');
const { sync: glob } = require('glob');
const getPullRequest = require('./utils/get-pull-request');
const getGzipSize = require('gzip-size');
const fs = require('fs');
const buildOutputText = require('./utils/build-output-text');

module.exports = async function run() {
  let repoToken = getInput('repo_token', { required: true });

  console.log(repoToken);

  let filePatternsStr = getInput('file_patterns', { required: true });
  let buildCommand = getInput('build_command', { required: true });

  let filePatterns = JSON.parse(filePatternsStr);

  let octokit = getOctokit(repoToken);

  let pullRequest = await getPullRequest(context, octokit);
  let prAssets = await getAssetSizes(buildCommand, filePatterns);

  await exec(`git checkout ${pullRequest.base.sha}`);

  let mainAssets = await getAssetSizes(buildCommand, filePatterns, true);

  await createOrUpdateComment(octokit, pullRequest, prAssets, mainAssets);
};

async function createOrUpdateComment(
  octokit,
  pullRequest,
  prAssets,
  mainAssets
) {
  let uniqueCommentIdentifier =
    '_Created by [total-asset-size-action](https://github.com/mydea/total-asset-size-action/)_';

  let body = `${buildOutputText(
    prAssets,
    mainAssets
  )}\n\n${uniqueCommentIdentifier}`;

  // Try to find existing comment
  let { data: comments } = await octokit.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: pullRequest.number,
  });

  let existingComment = comments.find(
    (comment) =>
      comment.user.login === 'github-actions[bot]' &&
      comment.body.endsWith(uniqueCommentIdentifier)
  );

  try {
    if (existingComment) {
      await octokit.rest.issues.updateComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: existingComment.id,
        body,
      });
    } else {
      await octokit.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pullRequest.number,
        body,
      });
    }
  } catch (e) {
    console.log(`Could not create a comment automatically. This could be because github does not allow writing from actions on a fork.

See https://github.community/t5/GitHub-Actions/Actions-not-working-correctly-for-forks/td-p/35545 for more information.`);

    console.log(`Copy and paste the following into a comment yourself if you want to still show the diff:

${body}`);
  }
}

async function getAssetSizes(buildCommand, filePatterns, randomize = false) {
  await exec(buildCommand);

  let records = [];

  for (let filePattern of filePatterns) {
    let files = glob(filePattern);

    let record = {
      filePattern,
      raw: 0,
      gzip: 0,
      files: [],
    };

    for (let file of files) {
      let factor = randomize ? 0.5 + Math.random() : 1;

      let gzip = await getGzipSize.file(file);
      gzip *= factor;
      record.gzip += gzip;

      let stat = fs.statSync(file);
      let raw = stat.size;
      raw *= factor;
      record.raw += raw;

      record.files.push({ filePattern: file, raw, gzip });
    }

    records.push(record);
  }

  return records;
}
