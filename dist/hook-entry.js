#!/usr/bin/env node
import fs from 'fs/promises';
import chalk from 'chalk';
import { intro, spinner, outro } from '@clack/prompts';
import { b as buildEnhancedDiffContext, g as getRuntimeConfig, c as createAIClient, a as buildCommitPrompt } from './diff-DZJcZj9c.js';
import 'os';
import 'path';
import 'ini';
import 'openai';
import 'node-abort-controller';
import 'groq-sdk';
import 'fs';
import 'url';
import 'child_process';

async function runPrepareCommitMsg(messageFilePath, _commitSource) {
  if (!messageFilePath) {
    console.error(
      chalk.red(
        "Commitra: Missing commit message file path. This file should only be run via the Git prepare-commit-msg hook."
      )
    );
    process.exit(1);
  }
  try {
    const raw = await fs.readFile(messageFilePath, "utf8");
    const clean = raw.split("\n").filter((line) => !line.trim().startsWith("#")).join("\n").trim();
    if (clean.length > 0) {
      return;
    }
  } catch {
    return;
  }
  const diff = buildEnhancedDiffContext();
  if (!diff.trim()) {
    return;
  }
  const cfg = await getRuntimeConfig();
  const ai = createAIClient(cfg);
  const prompt = buildCommitPrompt({
    diff,
    branch: "",
    lastCommits: [],
    techStack: "",
    locale: cfg.locale || "en",
    maxLength: 120
  });
  const messages = [
    { role: "system", content: "You are Commitra. Generate concise and meaningful git commit messages." },
    { role: "user", content: prompt }
  ];
  intro(chalk.bgBlueBright.black(" Commitra Hook "));
  const s = spinner();
  s.start("Analyzing staged changes...");
  let suggestions = [];
  try {
    const res = await ai.chat(messages, {
      max_tokens: 400,
      n: Number(cfg.generate) || 1,
      temperature: 0.4,
      type: "commit"
    });
    suggestions = (res.choices || []).map((c) => c.message?.content?.trim()).filter(Boolean);
  } finally {
    s.stop("Analysis complete");
  }
  if (suggestions.length === 0) {
    return;
  }
  let output = "";
  output += `# \u{1F916} Commitra AI suggestions
`;
  output += `# Choose one by uncommenting it OR edit freely.

`;
  for (const s2 of suggestions) {
    output += `# ${s2}
`;
  }
  output += `
`;
  try {
    await fs.appendFile(messageFilePath, output, "utf8");
    outro(chalk.green("\u2714 Commitra suggestions added"));
  } catch (err) {
    console.error("Commitra hook write error:", err.message || err);
    process.exit(1);
  }
}

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
  } catch (err) {
    console.error("Commitra Hook Failure:", err?.message || err);
    process.exit(1);
  }
})();
