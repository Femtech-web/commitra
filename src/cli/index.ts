import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { handleCliError } from '../core/utils/error.js';

import { registerCommitCommand } from './commands/commit.js';
import { registerReadmeCommand } from './commands/readme.js';
import { registerApiCommand } from './commands/api.js';
import { registerDiagramCommand } from './commands/diagram.js';
import { registerProjectFolderCommand } from './commands/project-folder.js';
import { registerHookCommand } from "./commands/hook.js";
import { registerConfigCommand } from "./commands/config.js";
import { loadPackageJson } from "../core/utils/helpers.js";

const packageJson = loadPackageJson();

// --- CLI Banner ---
const showBanner = () => {
  console.log(
    chalk.cyanBright(
      figlet.textSync('Commitra', { horizontalLayout: 'fitted' })
    )
  );
  console.log(
    chalk.dim(`⚡️  The Intelligent Commit & Project AI CLI (v${packageJson.version})\n`)
  );
};

// --- CLI Entrypoint ---
export async function runCli(argv = process.argv) {
  const program = new Command();


  showBanner();

  program
    .name('commitra')
    .description('Commitra - the intelligent commit & project AI CLI')
    .version(packageJson.version)
    .showHelpAfterError()
    .configureHelp({
      sortSubcommands: true,
      subcommandTerm: (cmd) => chalk.green(cmd.name()),
    });

  // Register all subcommands
  registerCommitCommand(program);
  registerReadmeCommand(program);
  registerApiCommand(program);
  registerDiagramCommand(program);
  registerProjectFolderCommand(program);
  registerHookCommand(program);
  registerConfigCommand(program);

  try {
    await program.parseAsync(argv);
  } catch (error) {
    handleCliError(error);
    process.exit(1);
  }
}

// Auto-run when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCli();
}
