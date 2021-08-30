const buildOutputText = require('./build-output-text');
const { context } = require('@actions/github');

module.exports = async function createOrUpdateComment(
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
};
