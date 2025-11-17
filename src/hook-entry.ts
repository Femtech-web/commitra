#!/usr/bin/env node

import { runPrepareCommitMsg } from "./cli/commands/prepare-commit-msg.js";

const commitMsgFile = process.argv[2];
const commitSource = process.argv[3];

if (!commitMsgFile) {
  console.error("Commitra Hook Error: Missing COMMIT_EDITMSG argument.");
  process.exit(1);
}

(async () => {
  try {
    await runPrepareCommitMsg(commitMsgFile, commitSource);
    process.exit(0);
  } catch (err: any) {
    console.error("Commitra Hook Failure:", err?.message || err);
    process.exit(1);
  }
})();
