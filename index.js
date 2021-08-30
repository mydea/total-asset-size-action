const { setFailed } = require('@actions/core');
const run = require('./lib/run');

async function runAction() {
  try {
    await run();
  } catch (error) {
    setFailed(error.message);
  }
}

runAction();
