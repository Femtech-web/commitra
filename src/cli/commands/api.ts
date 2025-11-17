import ora from "ora";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { Command } from "commander";
import { createAIClient } from "../../core/ai/ai";
import { logError } from "../../core/output/logger";
import { buildApiContext } from "../../core/context";
import { buildApiPrompt, apiSystemPrompt } from "../../core/prompt/api";
import { buildApiDocFromJSON, formatMarkdown } from "../../core/output/markdown";
import { getRuntimeConfig } from "../../core/config/manager";
import { getProjectRoot } from "../../core/utils/fs";


export async function runApiCommand(options: { output?: string; baseUrl?: string }) {
  console.log(chalk.cyanBright("\n📡 Commitra API Documentation Generator\n"));
  const spinner = ora("Scanning project...").start();

  try {
    const root = getProjectRoot()
    const ctx = await buildApiContext(root);

    if (!ctx.apis.length) {
      spinner.fail("No API endpoints found.");
      return;
    }

    spinner.text = "Building API prompt...";

    const prompt = buildApiPrompt(ctx, options.baseUrl ?? "");

    spinner.text = "Generating API documentation...";
    const cfg = await getRuntimeConfig();
    const ai = createAIClient(cfg);

    const response = await ai.chat(
      [
        { role: "system", content: apiSystemPrompt },
        { role: "user", content: prompt },
      ],
      { max_tokens: 16000, temperature: 0.2 }
    );

    const raw = response.choices?.[0]?.message?.content || "{}";

    let json;
    try {
      json = JSON.parse(raw);
    } catch (err) {
      throw new Error("AI returned invalid JSON");
    }

    const markdown = buildApiDocFromJSON(json);
    const formatted = await formatMarkdown(markdown);

    const outputPath = path.join(root, options.output ?? "API_DOCS.md");
    fs.writeFileSync(outputPath, formatted, "utf-8");

    spinner.succeed(`API docs generated: ${outputPath}`);
  } catch (err: any) {
    spinner.fail("API generation failed.");
    logError(err.message);
  }
}

export function registerApiCommand(program: Command) {
  program
    .command("api")
    .description("Generate full API documentation using AI")
    .option("-o, --output <file>", "Specify output file (default: API_DOCS.md)")
    .option("-b, --base-url <url>", "Specify the API base URL (optional)")
    .action((options) => runApiCommand(options));
}


