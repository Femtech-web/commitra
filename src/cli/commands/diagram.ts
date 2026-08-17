import ora from "ora";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import { createAIClient } from "../../core/ai/ai";
import { getRuntimeConfig } from "../../core/config/manager";
import { buildDiagramContext } from "../../core/context";
import { diagramSystemPrompt, buildDiagramUserPrompt } from "../../core/prompt/diagram";
import { mermaidFromDiagramJson, fallbackMermaidFromContext } from "../../core/output/diagram";
import { logError, logSuccess } from "../../core/output/logger";
import { getProjectRoot } from "../../core/utils/fs";
import { parseJsonResponse } from "../../core/ai/response.js";
import { resolveProjectOutput, writeGeneratedFile } from "../../core/output/file.js";

export async function runDiagramCommand(opts?: {
  summarize?: boolean;
  output?: string;
  depth?: number;
  type?: string;
  baseUrl?: string;
  force?: boolean;
}) {
  console.log(chalk.cyanBright("\n🕸️  Commitra Workflow Diagram Generator\n"));
  const spinner = ora("Scanning project and building context...").start();

  try {
    const root = getProjectRoot()
    const depth = Number(opts?.depth ?? 3);
    if (!Number.isInteger(depth) || depth < 1 || depth > 10) throw new Error("Depth must be between 1 and 10.");
    const requestedType = (opts?.type || "flow").toLowerCase();
    if (!["flow", "sequence", "system"].includes(requestedType)) throw new Error("Type must be flow, sequence, or system.");
    const type = requestedType as "flow" | "sequence" | "system";
    const ctx = await buildDiagramContext(root, depth);

    spinner.text = "Building prompt...";
    const userPrompt = buildDiagramUserPrompt({
      name: ctx.name,
      description: ctx.description,
      structure: ctx.structure,
      apis: ctx.apis,
      type,
      depth,
      baseUrl: opts?.baseUrl ?? null
    });

    let mermaid = "";

    if (opts?.summarize) {
      spinner.text = "Contacting AI for diagram JSON...";
      const cfg = await getRuntimeConfig();
      const ai = createAIClient(cfg);

      try {
        const response = await ai.chat(
          [
            { role: "system", content: diagramSystemPrompt },
            { role: "user", content: userPrompt }
          ],
          { max_tokens: 4000, temperature: 0.0 }
        );

        const raw = response.choices?.[0]?.message?.content || "";
        mermaid = mermaidFromDiagramJson(parseJsonResponse(raw), type);
      } catch (err: any) {
        spinner.warn("AI diagram generation failed or returned invalid JSON - using deterministic fallback.");
        mermaid = fallbackMermaidFromContext(ctx, type);
      }
    }

    if (!mermaid) {
      mermaid = fallbackMermaidFromContext(ctx, type);
    }

    spinner.succeed("Diagram built!");

    const output = resolveProjectOutput(root, opts?.output || "", "FLOW.md");
    const mdBlock = `\`\`\`mermaid\n${mermaid}\n\`\`\`\n`;

    const ext = path.extname(output).toLowerCase();
    const content = ext === ".mmd" ? mermaid : mdBlock;
    writeGeneratedFile(output, content, opts?.force);
    logSuccess(`\nDiagram saved to: ${chalk.green(output)}\n`);

  } catch (err: any) {
    spinner.fail("Diagram generation failed");
    logError(err.message);
    process.exitCode = 1;
  }
}

export function registerDiagramCommand(program: Command) {
  program
    .command("diagram")
    .description("Generate an architecture Mermaid diagram")
    .option("-s, --summarize", "Use AI to enrich the diagram (deterministic by default)")
    .option("-o, --output <file>", "Save diagram to a file (default: FLOW.md)")
    .option("-d, --depth <n>", "Directory tree depth to scan", (v) => parseInt(v, 10))
    .option("-t, --type <type>", "Diagram type: flow | sequence | system (default: flow)", "flow")
    .option("-b, --base-url <url>", "Optional base URL used when rendering example endpoints")
    .option("-f, --force", "Overwrite an existing output file")
    .action((options) => runDiagramCommand(options));
}
