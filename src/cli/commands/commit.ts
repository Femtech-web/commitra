import chalk from "chalk";
import { confirm, intro, isCancel, outro, select, spinner, text } from "@clack/prompts";
import type { Command } from "commander";
import { getRuntimeConfig } from "../../core/config/manager.js";
import { createAIClient } from "../../core/ai/ai.js";
import { buildCommitPrompt } from "../../core/prompt/commit.js";
import { buildEnhancedDiffContext, getStagedFiles } from "../../core/git/diff.js";
import { detectProjectMetadata } from "../../core/detect/projectMetadata.js";
import { findMetadataRootForStagedFiles } from "../../core/utils/fs.js";
import type { ChatMessage } from "../../core/ai/types.js";
import { commitWithMessage, getCurrentBranch, getGitRemote, getRecentCommitSubjects, requireRepositoryRoot } from "../../core/git/repo.js";
import { runGit } from "../../core/git/command.js";
import { normalizeCommitMessage, parseCommitFormat, parseSuggestionCount, type CommitFormat } from "../../core/commit/message.js";
import { redactSensitiveText } from "../../core/privacy/redact.js";
import { copyToClipboard } from "../../core/output/clipboard.js";
import { resolveProjectOutput, writeGeneratedFile } from "../../core/output/file.js";

type CommitOptions = {
  generate?: string;
  suggestOnly?: boolean;
  dryRun?: boolean;
  yes?: boolean;
  all?: boolean;
  copy?: boolean;
  json?: boolean;
  output?: string;
  force?: boolean;
  exclude?: string[];
  debugContext?: boolean;
  redact?: boolean;
  format?: CommitFormat;
  prompt?: string;
};

function writeResult(message: string, options: CommitOptions, metadata: Record<string, unknown>, root: string): void {
  const output = options.json ? `${JSON.stringify({ message, ...metadata })}\n` : `${message}\n`;
  if (options.output) {
    writeGeneratedFile(resolveProjectOutput(root, options.output, "commit-message.txt"), output, options.force);
    return;
  }
  process.stdout.write(output);
}

export async function runCommitCommand(options: CommitOptions = {}) {
  let root: string;
  try {
    root = requireRepositoryRoot();
  } catch {
    console.error(chalk.red("Not a git repository."));
    process.exitCode = 1;
    return;
  }

  if (options.all) runGit(["add", "--update"], { cwd: root });
  const stagedFiles = getStagedFiles(root, options.exclude || []);
  if (!stagedFiles.length) {
    console.log(chalk.yellow("No staged changes found — stage files first with `git add`."));
    return;
  }

  const quiet = Boolean(options.suggestOnly || options.dryRun || options.json || options.output);
  if (!getGitRemote(root)?.includes("github.com") && !quiet) {
    console.log(chalk.yellow("Commitra will still run, but GitHub metadata won't be detected."));
  }

  const rawDiff = buildEnhancedDiffContext(6_000, root, options.exclude || []);
  const redacted = options.redact === false ? { text: rawDiff, redactions: 0 } : redactSensitiveText(rawDiff);
  if (!redacted.text.trim()) {
    console.log(chalk.yellow("Unable to build context from the staged changes."));
    return;
  }

  if (options.debugContext) {
    process.stdout.write(`${redacted.text}\n`);
    if (redacted.redactions) console.error(chalk.yellow(`Redacted ${redacted.redactions} sensitive value(s).`));
    return;
  }

  const meta = await detectProjectMetadata(findMetadataRootForStagedFiles(root));
  const techStack = `language: ${meta.language}, ecosystem: ${meta.ecosystem}, dependencies: ${(meta.dependencies || [])
    .map((dependency: { name: string }) => dependency.name)
    .slice(0, 10)
    .join(", ")}`;
  const cfg = await getRuntimeConfig();
  const generateCount = parseSuggestionCount(options.generate ?? cfg.generate);
  const format = parseCommitFormat(options.format, cfg.format);
  const prompt = buildCommitPrompt({
    diff: redacted.text,
    branch: getCurrentBranch(root) || "HEAD",
    lastCommits: getRecentCommitSubjects(5, root),
    techStack,
    locale: cfg.locale || Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0],
    maxLength: cfg.maxLength,
    format,
    customInstructions: options.prompt || "",
  });

  if (!quiet) intro(chalk.bgBlueBright.black(" Commitra "));
  const spin = spinner();
  if (!quiet) spin.start(`Analyzing ${stagedFiles.length} staged file(s) using ${cfg.provider}...`);

  const messages: ChatMessage[] = [
    { role: "system", content: "Generate accurate commit messages from the supplied staged-change context." },
    { role: "user", content: prompt },
  ];
  let choices: string[];
  try {
    const ai = createAIClient(cfg);
    const responses = await Promise.all(
      Array.from({ length: generateCount }, () => ai.chat(messages, {
        max_tokens: format === "conventional-body" ? 300 : 120,
        temperature: 0.4,
        n: 1,
        type: "commit",
      })),
    );
    choices = [...new Set(responses.flatMap((response) => response.choices)
      .map((choice) => normalizeCommitMessage(choice.message?.content || "", cfg.maxLength, format))
      .filter(Boolean))];
  } catch (error) {
    if (!quiet) spin.stop("Failed");
    console.error(chalk.red("AI generation failed:"), error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }
  if (!quiet) spin.stop(redacted.redactions ? `Generated (${redacted.redactions} sensitive value(s) redacted)` : "Generated");
  if (!choices.length) throw new Error("No commit messages generated.");

  const metadata = { provider: cfg.provider, format, stagedFiles: stagedFiles.length, redactions: redacted.redactions };
  if (options.suggestOnly || options.dryRun || options.json || options.output) {
    writeResult(choices[0], options, metadata, root);
    return;
  }
  if (options.copy) {
    copyToClipboard(choices[0]);
    console.log(chalk.green("Copied commit message to clipboard."));
    return;
  }
  if (options.yes) {
    commitWithMessage(choices[0], [], root);
    outro(chalk.green("✔ Successfully committed!"));
    return;
  }

  let final = choices[0];
  if (choices.length > 1) {
    const selected = await select({ message: "Choose your preferred commit message:", options: choices.map((choice) => ({ label: choice, value: choice })) });
    if (isCancel(selected)) return void outro("Commit cancelled.");
    final = selected as string;
  } else {
    const action = await select({
      message: `Review commit message:\n\n   ${final}\n`,
      options: [{ label: "Use", value: "use" }, { label: "Edit", value: "edit" }, { label: "Cancel", value: "cancel" }],
    });
    if (action === "cancel" || isCancel(action)) return void outro("Commit cancelled.");
    if (action === "edit") {
      const edited = await text({ message: "Edit commit message:", initialValue: final, validate: (value) => value?.trim() ? undefined : "Message cannot be empty." });
      if (isCancel(edited)) return void outro("Commit cancelled.");
      final = edited.trim();
      const proceed = await confirm({ message: `Proceed with this commit message?\n\n   ${final}\n` });
      if (!proceed || isCancel(proceed)) return void outro("Commit cancelled.");
    }
  }

  try {
    commitWithMessage(final, [], root);
    outro(chalk.green("✔ Successfully committed!"));
  } catch (error) {
    console.error(chalk.red("Commit failed:"), error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

export function registerCommitCommand(program: Command) {
  program.command("commit")
    .description("Generate an AI-powered commit message")
    .option("--suggest-only", "Print only the first suggestion")
    .option("--dry-run", "Generate without committing")
    .option("-y, --yes", "Commit the first suggestion without prompting")
    .option("-a, --all", "Stage modifications and deletions to tracked files")
    .option("-c, --copy", "Copy the first suggestion to the clipboard")
    .option("--json", "Print machine-readable JSON")
    .option("-o, --output <path>", "Write the result to a file")
    .option("-f, --force", "Overwrite an existing output file")
    .option("-x, --exclude <patterns...>", "Exclude paths from AI context")
    .option("--debug-context", "Print the redacted AI context without sending it")
    .option("--no-redact", "Disable automatic secret redaction")
    .option("-t, --format <format>", "plain | conventional | conventional-scoped | conventional-body | gitmoji")
    .option("-p, --prompt <instruction>", "Add project-specific generation guidance")
    .option("-g, --generate <n>", "Generate 1-10 suggestions")
    .action(runCommitCommand);
}
