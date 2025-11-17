import ora from "ora";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { Command } from "commander";
import { createAIClient } from "../../core/ai/ai";
import { getRuntimeConfig } from "../../core/config/manager";
import { buildDiagramContext } from "../../core/context";
import { diagramSystemPrompt, buildDiagramUserPrompt } from "../../core/prompt/diagram";
import { mermaidFromDiagramJson, fallbackMermaidFromContext } from "../../core/output/diagram";
import { logError, logSuccess } from "../../core/output/logger";
import { getProjectRoot } from "../../core/utils/fs";

export async function runDiagramCommand(opts?: {
  summarize?: boolean;
  output?: string;
  depth?: number;
  type?: string;
  baseUrl?: string;
}) {
  console.log(chalk.cyanBright("\n🕸️  Commitra Workflow Diagram Generator\n"));
  const spinner = ora("Scanning project and building context...").start();

  try {
    const root = getProjectRoot()
    const depth = Number(opts?.depth ?? 3);
    const type = (opts?.type || "flow").toLowerCase() as "flow" | "sequence" | "system";
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

    if (opts?.summarize || true) {
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
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          const cleaned = raw.replace(/^[\u200B\s`]*json\s*/i, "").replace(/```json|```/g, "").trim();
          parsed = JSON.parse(cleaned);
        }

        mermaid = mermaidFromDiagramJson(parsed, type);
      } catch (err: any) {
        spinner.warn("AI diagram generation failed or returned invalid JSON - using deterministic fallback.");
        mermaid = fallbackMermaidFromContext(ctx, type);
      }
    }

    if (!mermaid) {
      mermaid = fallbackMermaidFromContext(ctx, type);
    }

    spinner.succeed("Diagram built!");

    const output = opts?.output ?? path.resolve(root, opts?.output ?? "FLOW.md");
    const mdBlock = `\`\`\`mermaid\n${mermaid}\n\`\`\`\n`;

    const ext = path.extname(output).toLowerCase();
    const content = ext === ".mmd" ? mermaid : mdBlock;
    fs.writeFileSync(output, content, "utf-8");
    logSuccess(`\nDiagram saved to: ${chalk.green(output)}\n`);

  } catch (err: any) {
    spinner.fail("Diagram generation failed");
    logError(err.message);
  }
}

export function registerDiagramCommand(program: Command) {
  program
    .command("diagram")
    .description("Generate an architecture Mermaid diagram (AI-powered)")
    .option("-s, --summarize", "Include an AI-generated short architecture summary (best-effort)")
    .option("-o, --output <file>", "Save diagram to a file (default: FLOW.md)")
    .option("-d, --depth <n>", "Directory tree depth to scan", (v) => parseInt(v, 10))
    .option("-t, --type <type>", "Diagram type: flow | sequence | system (default: flow)", "flow")
    .option("-b, --base-url <url>", "Optional base URL used when rendering example endpoints")
    .action((options) => runDiagramCommand(options));
}
