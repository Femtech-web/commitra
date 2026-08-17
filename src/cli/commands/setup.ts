import chalk from "chalk";
import { confirm, intro, isCancel, outro, password, select, text } from "@clack/prompts";
import type { Command } from "commander";
import { readConfigFile, writeConfigFile, type Provider } from "../../core/config/manager.js";

const keyNames: Partial<Record<Provider, string>> = {
  groq: "GROQ_API_KEY",
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
};

export async function runSetup(): Promise<void> {
  intro(chalk.bgBlueBright.black(" Commitra setup "));
  const provider = await select<Provider>({
    message: "Choose an AI provider",
    options: [
      { value: "groq", label: "Groq", hint: "fast cloud inference" },
      { value: "openai", label: "OpenAI" },
      { value: "anthropic", label: "Anthropic" },
      { value: "local", label: "Local", hint: "Ollama or OpenAI-compatible" },
    ],
  });
  if (isCancel(provider)) return void outro("Setup cancelled.");

  const config = await readConfigFile();
  config.provider = provider;
  const model = await text({ message: "Model name (leave empty for the provider default)", placeholder: "default" });
  if (isCancel(model)) return void outro("Setup cancelled.");
  if (model.trim()) config.model = model.trim(); else delete config.model;

  if (provider === "local") {
    const url = await text({ message: "Local model URL", initialValue: "http://127.0.0.1:11434", validate: (value) => {
      try { const parsed = new URL(value); return ["http:", "https:"].includes(parsed.protocol) ? undefined : "Use an HTTP(S) URL."; }
      catch { return "Enter a valid URL."; }
    } });
    if (isCancel(url)) return void outro("Setup cancelled.");
    config.LOCAL_MODEL_URL = url;
  } else {
    delete config.LOCAL_MODEL_URL;
    const keyName = keyNames[provider]!;
    const storeKey = await confirm({ message: `Store ${keyName} in ~/.commitra? Environment variables are safer.`, initialValue: false });
    if (isCancel(storeKey)) return void outro("Setup cancelled.");
    if (storeKey) {
      const key = await password({ message: keyName, validate: (value) => value.trim() ? undefined : "API key cannot be empty." });
      if (isCancel(key)) return void outro("Setup cancelled.");
      config[keyName] = key.trim();
    }
  }

  await writeConfigFile(config);
  outro(chalk.green(`Setup complete. Provider: ${provider}`));
  if (provider !== "local" && !config[keyNames[provider]!]) {
    console.log(chalk.dim(`Set ${keyNames[provider]} in your environment before generating.`));
  }
}

export function registerSetupCommand(program: Command): void {
  program.command("setup").description("Interactively configure Commitra").action(runSetup);
}
