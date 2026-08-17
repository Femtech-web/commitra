import fs from "node:fs";
import chalk from "chalk";
import ini from "ini";
import type { Command } from "commander";
import { CONFIG_PATH } from "../../core/config/manager.js";
import { parseCommitFormat, parseSuggestionCount } from "../../core/commit/message.js";

const SECRET_KEYS = new Set(["OPENAI_API_KEY", "GROQ_API_KEY", "ANTHROPIC_API_KEY"]);
const ALLOWED_KEYS = new Set([
  ...SECRET_KEYS,
  "provider", "model", "LOCAL_MODEL_URL", "timeout", "locale", "generate", "max-length", "format",
]);

function mask(key: string, value: unknown): string {
  const text = String(value ?? "");
  if (!SECRET_KEYS.has(key)) return text;
  return text.length > 8 ? `${text.slice(0, 4)}…${text.slice(-4)}` : "[set]";
}

function readConfig(): Record<string, string> {
  try {
    return ini.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

function saveConfig(config: Record<string, string>): void {
  const temporary = `${CONFIG_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, ini.stringify(config), { encoding: "utf8", mode: 0o600 });
  fs.chmodSync(temporary, 0o600);
  fs.renameSync(temporary, CONFIG_PATH);
}

function validate(key: string, value: string): void {
  if (!ALLOWED_KEYS.has(key)) throw new Error(`Unknown configuration key: ${key}`);
  if (key === "provider" && !["openai", "groq", "anthropic", "local"].includes(value)) throw new Error("Invalid provider.");
  if (key === "generate") parseSuggestionCount(value);
  if (key === "format") parseCommitFormat(value);
  if (key === "timeout" && (!Number.isInteger(Number(value)) || Number(value) < 1_000 || Number(value) > 300_000)) throw new Error("timeout must be between 1000 and 300000 milliseconds.");
  if (key === "max-length" && (!Number.isInteger(Number(value)) || Number(value) < 40 || Number(value) > 500)) throw new Error("max-length must be between 40 and 500.");
  if (key === "LOCAL_MODEL_URL") {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("LOCAL_MODEL_URL must be HTTP(S) without credentials.");
  }
}

function handleGet(keys: string[]): void {
  const config = readConfig();
  const requested = keys.length ? keys : Object.keys(config).sort();
  if (!requested.length) return void console.log(chalk.gray("No configuration values are set."));
  for (const key of requested) {
    console.log(Object.hasOwn(config, key) ? `${key}=${mask(key, config[key])}` : chalk.gray(`${key}: not set`));
  }
}

function handleSet(pairs: string[]): void {
  if (!pairs.length) throw new Error("No key=value pairs provided.");
  const config = readConfig();
  for (const pair of pairs) {
    const separator = pair.indexOf("=");
    if (separator < 1) throw new Error(`Expected key=value, received: ${pair}`);
    const key = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1).trim();
    validate(key, value);
    config[key] = value;
    console.log(chalk.green(`✓ Set ${key}=${mask(key, value)}`));
  }
  saveConfig(config);
  console.log(chalk.cyan(`Configuration updated at ${CONFIG_PATH}`));
}

function handleUnset(keys: string[]): void {
  if (!keys.length) throw new Error("Provide at least one key to unset.");
  const config = readConfig();
  for (const key of keys) {
    validate(key, key === "provider" ? "groq" : key === "generate" ? "1" : key === "format" ? "conventional" : key === "timeout" ? "30000" : key === "max-length" ? "120" : key === "LOCAL_MODEL_URL" ? "http://localhost:11434" : "placeholder");
    delete config[key];
  }
  saveConfig(config);
}

export function registerConfigCommand(program: Command) {
  const command = program.command("config").description("View or update Commitra configuration");
  command.command("get [keys...]").description("Get configuration values (secrets are masked)").action(handleGet);
  command.command("set [pairs...]").description("Set configuration values (key=value)").action(handleSet);
  command.command("unset <keys...>").description("Remove configuration values").action(handleUnset);
}
