import chalk from "chalk";

export function logInfo(message: string) {
  console.log(chalk.cyan("ℹ️  " + message));
}

export function logSuccess(message: string) {
  console.log(chalk.green("✅ " + message));
}

export function logError(message: string) {
  console.error(chalk.red("❌ " + message));
}

export function logWarn(message: string) {
  console.warn(chalk.yellow("⚠️  " + message));
}
