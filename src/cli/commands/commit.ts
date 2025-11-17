import { execSync } from "child_process";
import fs from "fs";
import chalk from "chalk";
import {
  intro,
  outro,
  spinner,
  select,
  confirm,
  text,
  isCancel,
} from "@clack/prompts";

import { getRuntimeConfig } from "../../core/config/manager.js";
import { createAIClient } from "../../core/ai/ai.js";
import { buildCommitPrompt } from "../../core/prompt/commit.js";
import { buildEnhancedDiffContext } from "../../core/git/diff.js";
import { detectProjectMetadata } from "../../core/detect/projectMetadata.js";
import { getProjectRoot } from "../../core/utils/fs.js";
import type { ChatMessage } from "../../core/ai/types.js";

export async function runCommitCommand(options?: { generate?: string; suggestOnly?: boolean }) {
  if (!fs.existsSync(".git")) {
    console.error(chalk.red("Not a git repository."));
    process.exit(1);
  }

  // check working tree
  const status = execSync("git status --porcelain", { encoding: "utf8" }).trim();
  if (!status) {
    console.log(chalk.yellow("Nothing to commit — working tree clean."));
    process.exit(0);
  }

  // check staged changes
  const staged = execSync("git diff --cached --name-only", { encoding: "utf8" }).trim();
  if (!staged) {
    console.log(chalk.yellow("No staged changes found — stage files first [git add <file>]"));
    process.exit(0);
  }

  // safe remote detection
  let remote = "";
  try {
    remote = execSync("git remote get-url origin", { encoding: "utf8" }).trim();
  } catch {
    remote = "";
  }

  if (!remote.includes("github.com")) {
    console.log(
      chalk.yellow("Commitra will still run, but GitHub metadata won't be detected.")
    );
  }

  let branch = "main";
  try {
    const b = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    if (b) branch = b;
  } catch {
  }

  // safe recent commit messages
  let lastCommits: string[] = [];
  try {
    const output = execSync("git log -n 5 --pretty=format:%s", { encoding: "utf8" }).trim();
    if (output) lastCommits = output.split("\n");
  } catch {
    lastCommits = [];
  }

  // diff buildup
  const diff = buildEnhancedDiffContext();
  if (!diff.trim()) {
    console.log(chalk.yellow("No staged changes found. Stage your changes first."));
    process.exit(0);
  }

  const root = getProjectRoot();
  const meta = await detectProjectMetadata(root);
  const dependencies = (meta.dependencies || [])
    .map((d: any) => d.name)
    .slice(0, 10)
    .join(", ");
  const techStack = `language: ${meta.language}, ecosystem: ${meta.ecosystem}, dependencies: ${dependencies}`;

  // ai config
  const cfg = await getRuntimeConfig();
  const generateCount = Math.max(
    1,
    Number(options?.generate ?? cfg.generate ?? 1)
  );

  const userLocale =
    cfg.locale || Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0];

  const prompt = buildCommitPrompt({
    diff,
    branch,
    lastCommits,
    techStack,
    locale: userLocale,
    maxLength: 120,
  });

  intro(chalk.bgBlueBright.black(" Commitra "));

  const ai = createAIClient(cfg);

  const msgs: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are Commitra, an expert AI that generates clean, conventional-style commit messages.",
    },
    { role: "user", content: prompt },
  ];

  const spin = spinner();
  spin.start(`Analyzing changes using ${cfg.provider}...`);

  // ai generation
  let choices: string[] = [];
  try {
    if (generateCount === 1) {
      const res = await ai.chat(msgs, {
        max_tokens: 400,
        temperature: 0.4,
        n: 1,
        type: "commit",
      });
      choices = res.choices.map((c) => c.message?.content?.trim()).filter(Boolean);
    } else {
      const res = await Promise.all(
        [...Array(generateCount)].map(async () => {
          const r = await ai.chat(msgs, {
            max_tokens: 400,
            temperature: 0.4,
            n: 1,
            type: "commit",
          });
          return r.choices[0].message?.content?.trim();
        })
      );
      choices = [...new Set(res.filter(Boolean))];
    }
  } catch (err: any) {
    spin.stop("Failed");
    console.error(chalk.red("AI generation failed:"), err.message);
    process.exit(1);
  }

  spin.stop("Generated");

  if (!choices.length) {
    console.error(chalk.red("No commit messages generated."));
    process.exit(1);
  }

  // suggest onlt
  if (options?.suggestOnly) {
    console.log(choices[0]);
    return;
  }

  // UX flow
  let final = choices[0];
  let useLikeThat = false;

  if (choices.length === 1) {
    const choice = await select({
      message: `Review commit message:\n\n   ${final}\n`,
      options: [
        { label: "Use", value: "use" },
        { label: "Edit", value: "edit" },
        { label: "Cancel", value: "cancel" },
      ],
    });

    if (choice === "cancel" || isCancel(choice)) {
      outro("Commit cancelled.");
      process.exit(0);
    }

    if (choice === "edit") {
      const edited = await text({
        message: "Edit commit message:",
        initialValue: final,
        validate: (v) =>
          v && v.trim().length > 0 ? undefined : "Message cannot be empty.",
      });
      if (isCancel(edited)) {
        outro("Commit cancelled.");
        process.exit(0);
      }
      final = edited.trim();
    } else {
      useLikeThat = true;
    }
  } else {
    const selected = await select({
      message: "Choose your preferred commit message:",
      options: choices.map((c) => ({ label: c, value: c })),
    });

    if (isCancel(selected)) {
      outro("Commit cancelled.");
      process.exit(0);
    }

    final = selected as string;
    useLikeThat = true;
  }


  if (!useLikeThat) {
    const proceed = await confirm({
      message: `Proceed with this commit message?\n\n   ${final}\n`,
    });
    if (!proceed) {
      outro("Commit cancelled.");
      process.exit(0);
    }
  }

  try {
    execSync(`git commit -m "${final.replace(/"/g, "'")}"`, {
      stdio: "inherit",
    });
    outro(chalk.green("✔ Successfully committed!"));
  } catch (err: any) {
    console.error(chalk.red("Commit failed:"), err.message);
    process.exit(1);
  }
}

export function registerCommitCommand(program: any) {
  program
    .command("commit")
    .description("Generate an AI-powered commit message")
    .option("--suggest-only", "Print suggestion only")
    .option("-g, --generate <n>", "Generate N suggestions", "1")
    .action(runCommitCommand);
}
