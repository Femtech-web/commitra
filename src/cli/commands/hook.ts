import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import type { Command } from "commander";
import { getGitPath, requireRepositoryRoot } from "../../core/git/repo.js";

const HOOK_NAME = "prepare-commit-msg";
const MARKER = "Commitra Git hook";
const shellQuote = (value: string) => `'${value.replace(/'/g, `'"'"'`)}'`;

export async function installHook(hookPath: string, hookEntryFile: string) {
  await fs.access(hookEntryFile).catch(() => {
    throw new Error(`Hook entry not found at ${hookEntryFile}. Run \`npm run build\` first.`);
  });
  await fs.mkdir(path.dirname(hookPath), { recursive: true });

  const existing = await fs.readFile(hookPath, "utf8").catch(() => "");
  if (existing.includes(MARKER)) return void console.log(chalk.yellow("Hook already installed."));

  const backupPath = `${hookPath}.commitra-backup`;
  if (existing) {
    await fs.access(backupPath).then(() => {
      throw new Error(`Cannot preserve the existing hook because ${backupPath} already exists.`);
    }).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
    await fs.rename(hookPath, backupPath);
  }

  const backup = shellQuote(backupPath);
  const shim = `#!/bin/sh
# ${MARKER} — auto-generated
if [ -x ${backup} ]; then
  ${backup} "$@" || exit $?
fi
exec ${shellQuote(process.execPath)} ${shellQuote(hookEntryFile)} "$@"
`;
  await fs.writeFile(hookPath, shim, { encoding: "utf8", mode: 0o755 });
  await fs.chmod(hookPath, 0o755);
  console.log(chalk.green(`✔ Commitra hook installed → ${hookPath}`));
}

export async function uninstallHook(hookPath: string) {
  const existing = await fs.readFile(hookPath, "utf8").catch(() => "");
  if (!existing.includes(MARKER)) return void console.log(chalk.gray("Hook is not installed or was not created by Commitra."));
  await fs.unlink(hookPath);
  const backupPath = `${hookPath}.commitra-backup`;
  await fs.rename(backupPath, hookPath).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
  console.log(chalk.yellow(`Commitra hook removed → ${hookPath}`));
}

export function registerHookCommand(program: Command) {
  program.command("hook")
    .description("Install or uninstall Commitra’s prepare-commit-msg Git hook")
    .argument("<action>", "install | uninstall")
    .action(async (action: string) => {
      const root = requireRepositoryRoot();
      const hookPath = path.join(getGitPath("hooks", root), HOOK_NAME);
      const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
      const hookEntryFile = path.join(packageRoot, "dist", "hook-entry.js");
      if (action === "install") return installHook(hookPath, hookEntryFile);
      if (action === "uninstall") return uninstallHook(hookPath);
      throw new Error(`Invalid hook action: ${action}`);
    });
}
