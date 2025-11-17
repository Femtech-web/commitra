import chalk from 'chalk';


export class KnownError extends Error { }

export const handleCliError = (error: any) => {
  if (error instanceof KnownError) {
    console.error(chalk.redBright(`❌ ${error.message}\n`));
    return;
  }

  console.error(chalk.redBright(`💥 Unexpected error:`));
  console.error(chalk.dim(error?.stack || error));
  console.error(
    chalk.gray(
      `\nCommitra \nIf this persists, open an issue on GitHub.`
    )
  );
};
