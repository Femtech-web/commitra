import fs from "fs/promises";
import chalk from "chalk";
import { spinner, intro, outro } from "@clack/prompts";
import { buildEnhancedDiffContext } from "../../core/git/diff.js";
import { createAIClient } from "../../core/ai/ai.js";
import { getRuntimeConfig } from "../../core/config/manager.js";
import { buildCommitPrompt } from "../../core/prompt/commit.js";
import type { ChatMessage } from "../../core/ai/types.js";


export async function runPrepareCommitMsg(messageFilePath: string, _commitSource?: string) {
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

    const clean = raw
      .split("\n")
      .filter((line) => !line.trim().startsWith("#"))
      .join("\n")
      .trim();

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
    maxLength: 120,
  });

  const messages: ChatMessage[] = [
    { role: "system", content: "You are Commitra. Generate concise and meaningful git commit messages." },
    { role: "user", content: prompt },
  ];

  intro(chalk.bgBlueBright.black(" Commitra Hook "));

  const s = spinner();
  s.start("Analyzing staged changes...");

  let suggestions: string[] = [];

  try {
    const res = await ai.chat(messages, {
      max_tokens: 400,
      n: Number(cfg.generate) || 1,
      temperature: 0.4,
      type: "commit",
    });

    suggestions = (res.choices || [])
      .map((c) => c.message?.content?.trim())
      .filter(Boolean) as string[];
  } finally {
    s.stop("Analysis complete");
  }

  if (suggestions.length === 0) {
    return;
  }

  let output = "";
  output += `# 🤖 Commitra AI suggestions\n`;
  output += `# Choose one by uncommenting it OR edit freely.\n\n`;
  for (const s of suggestions) {
    output += `# ${s}\n`;
  }

  output += `\n`;

  try {
    await fs.appendFile(messageFilePath, output, "utf8");
    outro(chalk.green("✔ Commitra suggestions added"));
  } catch (err: any) {
    console.error("Commitra hook write error:", err.message || err);
    process.exit(1);
  }
}
