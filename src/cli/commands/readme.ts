import ora from "ora";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { Command } from "commander";
import { createAIClient } from "../../core/ai/ai";
import { buildReadmeFromJSON, formatMarkdown } from "../../core/output/markdown";
import { logError } from "../../core/output/logger";
import { buildReadmeContext } from "../../core/context";
import { buildReadmePrompt, readmeSystemPrompt } from "../../core/prompt/readme";
import { getRuntimeConfig } from "../../core/config/manager";
import { getProjectRoot } from "../../core/utils/fs";

export const runReadmeCommand = async (options: { output: string }) => {
  console.log(chalk.cyanBright("\n📘 Commitra README Generator\n"));
  const spinner = ora("Analyzing project...").start();

  try {
    const root = getProjectRoot()
    const ctx = await buildReadmeContext(root);
    spinner.text = "Building AI prompt...";

    const prompt = buildReadmePrompt(ctx);

    spinner.text = `Generating ${options.output ?? "README.md"} with AI...`;
    const cfg = await getRuntimeConfig();
    const ai = createAIClient(cfg);

    const response = await ai.chat(
      [
        {
          role: "system",
          content: readmeSystemPrompt
        },
        { role: "user", content: prompt },
      ],
      { max_tokens: 16000, temperature: 0.4 }
    );

    const raw = response.choices?.[0]?.message?.content || "{}";

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("Bad JSON from LLM:", raw);
      throw new Error("LLM did not return valid JSON");
    }

    const markdown = buildReadmeFromJSON(data);
    const formatted = await formatMarkdown(markdown);

    const outputPath = path.join(root, options.output ?? "README.md");
    fs.writeFileSync(outputPath, formatted, "utf-8");

    spinner.succeed(chalk.greenBright(`${options.output ?? "README.md"}  generated successfully!`));
    console.log(chalk.gray(`\n📄 Saved to: ${outputPath}\n`));
  } catch (err: any) {
    spinner.fail("README generation failed");
    logError(err.message);
  }
};


export function registerReadmeCommand(program: Command) {
  program
    .command("readme")
    .description("Generate a signature-style README.md using AI")
    .option("-o, --output <file>", "Specify output file (default: README.md)")
    .action((options) => runReadmeCommand(options));
}
