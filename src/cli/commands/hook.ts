import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import { getProjectRoot } from "../../core/utils/fs.js";

const HOOK_NAME = "prepare-commit-msg";
const REL_HOOK_PATH = `.git/hooks/${HOOK_NAME}`;

async function installHook(hookPath: string, hookEntryFile: string) {
  const exists = await fs
    .stat(hookEntryFile)
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    console.error(
      chalk.red(
        `dist/hook-entry.js not found at:\n${hookEntryFile}\nRun \`npm run build\` first.`
      )
    );
    process.exit(1);
  }

  await fs.mkdir(path.dirname(hookPath), { recursive: true });

  const hookExists = await fs
    .readFile(hookPath, "utf8")
    .then((c) => c.includes("Commitra Git hook"))
    .catch(() => false);

  if (hookExists) {
    console.log(chalk.yellow("Hook already installed."));
    return;
  }

  // Create portable shim
  const shim = `#!/bin/sh
  # Commitra Git hook — auto-generated
  exec node ${JSON.stringify(hookEntryFile)} "$@"
  `;

  await fs.writeFile(hookPath, shim);
  await fs.chmod(hookPath, 0o755);

  console.log(chalk.green(`✔ Commitra hook installed → ${hookPath}`));
}

async function uninstallHook(hookPath: string) {
  const exists = await fs
    .readFile(hookPath, "utf8")
    .then((c) => c.includes("Commitra Git hook"))
    .catch(() => false);

  if (!exists) {
    console.log(chalk.gray("Hook is not installed or was not created by Commitra."));
    return;
  }

  await fs.unlink(hookPath);
  console.log(chalk.yellow(`🗑️ Commitra hook removed → ${hookPath}`));
}

export function registerHookCommand(program: any) {
  program
    .command("hook")
    .description("Install or uninstall Commitra’s prepare-commit-msg git hook")
    .argument("<action>", "install | uninstall")
    .action(async (action: "install" | "uninstall") => {
      const root = getProjectRoot();
      const hookPath = path.join(root, REL_HOOK_PATH);

      const pkgRoot = path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "..",
      );

      const hookEntryFile = path.join(pkgRoot, "dist", "hook-entry.js");

      if (action === "install") {
        await installHook(hookPath, hookEntryFile);
        return;
      }

      if (action === "uninstall") {
        await uninstallHook(hookPath);
        return;
      }

      console.error(chalk.red(`Invalid action: ${action}`));
      process.exit(1);
    });
}
