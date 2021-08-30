const { getInput } = require('@actions/core');
const { exec } = require('@actions/exec');
const { getOctokit, context } = require('@actions/github');
const getPullRequest = require('./utils/get-pull-request');
const createOrUpdateComment = require('./utils/create-or-update-comment');
const getAssetSizes = require('./utils/get-asset-sizes');

module.exports = async function run() {
  let repoToken = getInput('repo_token', { required: true });

  let filePatternsStr = getInput('file_patterns', { required: true });
  let buildCommand = getInput('build_command', { required: true });

  let filePatterns = JSON.parse(filePatternsStr);

  let octokit = getOctokit(repoToken);

  let pullRequest = await getPullRequest(context, octokit);
  let prAssets = await getAssetSizes(buildCommand, filePatterns);

  await exec(`git checkout ${pullRequest.base.sha}`);

  let mainAssets = await getAssetSizes(buildCommand, filePatterns);

  await createOrUpdateComment(octokit, pullRequest, prAssets, mainAssets);
};
