import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import ini from 'ini';

export type RuntimeConfig = {
  provider: 'openai' | 'groq' | 'anthropic' | 'local';
  model?: any,
  openaiApiKey?: string;
  groqApiKey?: string;
  anthropicApiKey?: string;
  localModelUrl?: string;
  timeout?: number;
  proxy?: string | undefined;
  locale?: string,
  generate?: number
};

const CONFIG_PATH = path.join(os.homedir(), '.commitra');

const readConfigFile = async (): Promise<Record<string, string>> => {
  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf8');
    return ini.parse(raw);
  } catch {
    return {};
  }
};

export const getRuntimeConfig = async (cliConfig?: Partial<RuntimeConfig>): Promise<RuntimeConfig> => {
  const fileConfig = await readConfigFile();
  const env = process.env;

  const provider = (cliConfig?.provider ??
    fileConfig['provider'] ??
    env.COMMITRA_PROVIDER ??
    'groq') as RuntimeConfig['provider'];

  const model = (cliConfig?.model ??
    fileConfig['model'] ??
    env.COMMITRA_MODEL) as RuntimeConfig['provider'];

  const cfg: RuntimeConfig = {
    provider,
    model,
    openaiApiKey: cliConfig?.openaiApiKey ?? fileConfig['OPENAI_API_KEY'] ?? env.OPENAI_API_KEY,
    groqApiKey: cliConfig?.groqApiKey ?? fileConfig['GROQ_API_KEY'] ?? env.GROQ_API_KEY,
    anthropicApiKey: cliConfig?.anthropicApiKey ?? fileConfig['ANTHROPIC_API_KEY'] ?? env.ANTHROPIC_API_KEY,
    localModelUrl: cliConfig?.localModelUrl ?? fileConfig['LOCAL_MODEL_URL'] ?? env.LOCAL_MODEL_URL,
    timeout: cliConfig?.timeout ?? Number(fileConfig['timeout'] || env.COMMITRA_TIMEOUT || 10000),
    proxy: cliConfig?.proxy ?? (env.https_proxy || env.HTTPS_PROXY || env.http_proxy || env.HTTP_PROXY) ?? undefined,
    generate: Number(cliConfig?.generate ?? fileConfig['generate'] ?? env.COMMITRA_GENERATE ?? 1)
  };

  return cfg;
};
