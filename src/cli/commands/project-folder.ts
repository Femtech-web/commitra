import { Command } from "commander";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import ora from "ora";

import { readDirectoryTree, buildExcludeList, getProjectRoot } from "../../core/utils/fs";
import { logError } from "../../core/output/logger";

export async function runProjectFolderCommand(options?: { depth?: number; output?: string }) {
  console.log(chalk.cyanBright("\n📂 Commitra Project Folder generator\n"));

  const spinner = ora("Building folder tree...").start();

  try {
    const root = getProjectRoot()
    const depth = options?.depth ?? 3;

    const exclude = buildExcludeList(root);

    spinner.text = "Scanning directories...";
    const tree = readDirectoryTree(root, depth, exclude);

    spinner.succeed("Folder tree generated!");

    const outPath = path.resolve(root, options?.output ?? "PROJECT_FOLDER.md");
    const formatted = `\`\`\`text\n${tree}\`\`\`\n`;

    fs.writeFileSync(outPath, formatted, "utf-8");
    spinner.succeed(chalk.greenBright(`${options?.output ?? "PROJECT_FOLDER.md"}  generated successfully!`));

    console.log(chalk.gray(`\n📄 Saved to: ${outPath}\n`));
  } catch (err: any) {
    spinner.fail("Folder map generation failed");
    logError(err.message);
  }
}

export function registerProjectFolderCommand(program: Command) {
  program
    .command("folder")
    .description("Visualize the project directory tree structure")
    .option("-d, --depth <number>", "Depth level to scan (default: 3)", (val) => parseInt(val, 10))
    .option("-o, --output <file>", "Save folder map to a Markdown file (default: PROJECT_FOLDER.md)")
    .action((options) => runProjectFolderCommand(options));
}
