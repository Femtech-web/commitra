import fs from "fs/promises";
import os from "os";
import path from "path";
import ini from "ini";
import type { CommitFormat } from "../commit/message.js";
import { parseCommitFormat, parseSuggestionCount } from "../commit/message.js";

export type Provider = "openai" | "groq" | "anthropic" | "local";

export type RuntimeConfig = {
  provider: Provider;
  model?: string;
  openaiApiKey?: string;
  groqApiKey?: string;
  anthropicApiKey?: string;
  localModelUrl?: string;
  timeout: number;
  proxy?: string;
  locale?: string;
  generate: number;
  maxLength: number;
  format: CommitFormat;
};

export const CONFIG_PATH = path.join(os.homedir(), ".commitra");
const PROVIDERS = new Set<Provider>(["openai", "groq", "anthropic", "local"]);

export const readConfigFile = async (): Promise<Record<string, string>> => {
  try {
    return ini.parse(await fs.readFile(CONFIG_PATH, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw new Error(`Unable to read ${CONFIG_PATH}: ${(error as Error).message}`);
  }
};

export const writeConfigFile = async (config: Record<string, string>): Promise<void> => {
  const temporary = `${CONFIG_PATH}.${process.pid}.tmp`;
  await fs.writeFile(temporary, ini.stringify(config), { encoding: "utf8", mode: 0o600 });
  await fs.chmod(temporary, 0o600);
  await fs.rename(temporary, CONFIG_PATH);
};

function parseProvider(value: unknown): Provider {
  const provider = String(value || "groq") as Provider;
  if (!PROVIDERS.has(provider)) throw new Error(`Unsupported provider: ${provider}`);
  return provider;
}

function boundedInteger(value: unknown, fallback: number, min: number, max: number, name: string): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}.`);
  }
  return parsed;
}

function optionalUrl(value: unknown, name: string): string | undefined {
  if (!value) return undefined;
  const parsed = new URL(String(value));
  if (!new Set(["http:", "https:"]).has(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error(`${name} must be an HTTP(S) URL without embedded credentials.`);
  }
  return parsed.toString().replace(/\/$/, "");
}

export const getRuntimeConfig = async (cli: Partial<RuntimeConfig> = {}): Promise<RuntimeConfig> => {
  const file = await readConfigFile();
  const env = process.env;
  const provider = parseProvider(cli.provider ?? env.COMMITRA_PROVIDER ?? file.provider);
  const generateValue = cli.generate ?? env.COMMITRA_GENERATE ?? file.generate;

  return {
    provider,
    model: cli.model ?? env.COMMITRA_MODEL ?? file.model,
    openaiApiKey: cli.openaiApiKey ?? env.OPENAI_API_KEY ?? file.OPENAI_API_KEY,
    groqApiKey: cli.groqApiKey ?? env.GROQ_API_KEY ?? file.GROQ_API_KEY,
    anthropicApiKey: cli.anthropicApiKey ?? env.ANTHROPIC_API_KEY ?? file.ANTHROPIC_API_KEY,
    localModelUrl: optionalUrl(cli.localModelUrl ?? env.LOCAL_MODEL_URL ?? file.LOCAL_MODEL_URL, "LOCAL_MODEL_URL"),
    timeout: boundedInteger(cli.timeout ?? env.COMMITRA_TIMEOUT ?? file.timeout, 30_000, 1_000, 300_000, "timeout"),
    proxy: optionalUrl(cli.proxy ?? env.HTTPS_PROXY ?? env.https_proxy ?? env.HTTP_PROXY ?? env.http_proxy, "proxy"),
    locale: cli.locale ?? env.COMMITRA_LOCALE ?? file.locale,
    generate: parseSuggestionCount(generateValue),
    maxLength: boundedInteger(cli.maxLength ?? env.COMMITRA_MAX_LENGTH ?? file["max-length"], 120, 40, 500, "max-length"),
    format: parseCommitFormat(cli.format ?? env.COMMITRA_FORMAT ?? file.format),
  };
};
