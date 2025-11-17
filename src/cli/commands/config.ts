import fs from "fs";
import os from "os";
import path from "path";
import chalk from "chalk";
import ini from "ini";
import { Command } from "commander";

const CONFIG_PATH = path.join(os.homedir(), ".commitra");

function ensureConfigFile(): Record<string, any> {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, "");
  }
  const raw = fs.readFileSync(CONFIG_PATH, "utf8");
  return ini.parse(raw);
}

function saveConfig(cfg: Record<string, any>) {
  fs.writeFileSync(CONFIG_PATH, ini.stringify(cfg), "utf8");
}

function handleGet(keys: string[]) {
  const cfg = ensureConfigFile();

  if (!keys.length) {
    console.log(chalk.cyanBright("\n🧾 Current Commitra Config:\n"));
    for (const [key, value] of Object.entries(cfg)) {
      console.log(`${chalk.green(key)}=${chalk.white(value)}`);
    }
    console.log();
    return;
  }

  for (const key of keys) {
    if (cfg[key]) {
      console.log(`${key}=${cfg[key]}`);
    } else {
      console.log(chalk.gray(`${key}: not set`));
    }
  }
}

function handleSet(pairs: string[]) {
  if (!pairs.length) {
    console.error(chalk.red("No key=value pairs provided."));
    process.exit(1);
  }

  const cfg = ensureConfigFile();

  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (!key) continue;
    cfg[key.trim()] = value ?? "";
    console.log(chalk.green(`✓ Set ${key}=${value ?? ""}`));
  }

  saveConfig(cfg);
  console.log(chalk.cyan(`\n✅ Configuration updated at ${CONFIG_PATH}\n`));
}


export function registerConfigCommand(program: Command) {
  const cmd = program.command("config").description("View or update Commitra configuration");

  cmd
    .command("get [keys...]")
    .description("Get one or more configuration values")
    .action((keys: string[]) => handleGet(keys));

  cmd
    .command("set [pairs...]")
    .description("Set one or more configuration values (key=value)")
    .action((pairs: string[]) => handleSet(pairs));
}
