import prettier from "prettier";
import { logError } from "./logger";
import { TECH_MAP } from "../utils/constants";

export async function formatMarkdown(content: string): Promise<string> {
  try {
    const config = await prettier.resolveConfig(process.cwd());
    return prettier.format(content, {
      parser: "markdown",
      printWidth: 99999,
      proseWrap: "preserve",
      singleQuote: false,
      tabWidth: 2,
      ...config
    });
  } catch (err: any) {
    logError("Failed to format markdown: " + err.message);
    return content;
  }
}

export function groupTechStack(items: string[]) {
  const out = {
    frontend: [] as string[],
    backend: [] as string[],
    ui: [] as string[],
    blockchain: [] as string[],
    misc: [] as string[],
  };

  for (const item of items || []) {
    const lower = item.toLowerCase();

    const match = (list: string[]) => list.some((k) => lower.includes(k));

    if (match(TECH_MAP.frontend)) out.frontend.push(item);
    else if (match(TECH_MAP.backend)) out.backend.push(item);
    else if (match(TECH_MAP.ui)) out.ui.push(item);
    else if (match(TECH_MAP.blockchain)) out.blockchain.push(item);
    else out.misc.push(item);
  }

  return out;
}

export function buildReadmeFromJSON(data: any) {
  const unescapeNewlines = (text: string = "") => text.replace(/\\n/g, "\n");

  const section = (title: string, body: string) =>
    body?.trim() && body.trim() !== "Not provided"
      ? `## ${title}\n\n${body.trim()}\n\n`
      : "";

  const list = (arr: any[], formatter: (x: any) => string) =>
    arr && arr.length
      ? arr.map(formatter).join("\n") + "\n\n"
      : "";

  const numbered = (arr: string[]) =>
    arr && arr.length
      ? arr.map((s, i) => `${i + 1}. ${s}`).join("\n") + "\n\n"
      : "";

  const apiSection = (routes: any[]) =>
    routes && routes.length
      ? routes
        .map(
          (r) => `
        ### \`${r.route}\`

        **Purpose:**  
        ${r.purpose}

        **Input:**  
        ${r.input}

        **Output:**  
        ${r.output}

        **File:**  
        \`${r.file}\`

        ---`
        )
        .join("\n\n") + "\n\n"
      : "";

  const grouped = groupTechStack(data.tech_stack || []);

  const techStackGrouped = `
  ### Frontend
  ${grouped.frontend.map((t) => `- ${t}`).join("\n") || "_None_"}

  ### Backend
  ${grouped.backend.map((t) => `- ${t}`).join("\n") || "_None_"}

  ### UI / Styling
  ${grouped.ui.map((t) => `- ${t}`).join("\n") || "_None_"}

  ### Blockchain / Web3
  ${grouped.blockchain.map((t) => `- ${t}`).join("\n") || "_None_"}

  ### Other
  ${grouped.misc.map((t) => `- ${t}`).join("\n") || "_None_"}
  `;

  return `
# ${data.title}

${data.overview}

## Tech Stack
${techStackGrouped}

${section(
    "Features",
    list(
      data.features,
      (f) =>
        `### ${f.title}\n${f.description}\n${f.files?.length ? "\n**Relevant Files:**\n" + f.files.map((x: any) => `- \`${x}\``).join("\n") : ""
        }`
    )
  )}

${section(
    "Dependencies",
    list(
      data.dependencies,
      (d) => `- **${d.name}** — ${d.description} _(Category: ${d.category})_`
    )
  )}

## Project Structure
\`\`\`text
${unescapeNewlines(data.project_structure)}
\`\`\`

${section(
    "Core Folders",
    list(data.core_folders, (f) => `- **${f.path}** — ${f.description}`)
  )}

${section("API Routes", apiSection(data.api_routes))}

${section("Installation", numbered(data.installation))}

${section("Development", list(data.development, (s) => `- ${s}`))}

${section("Environment Variables", list(data.environment_variables, (s) => `- ${s}`))}

${section("Testing", list(data.testing, (s) => `- ${s}`))}

${section("Deployment", list(data.deployment, (s) => `- ${s}`))}

${section(
    "Smart Contracts",
    list(data.contracts, (c) => `### \`${c.path}\`\n${c.description}`)
  )}

${section(
    "Libraries & Utilities",
    data.libraries?.length
      ? data.libraries.map((l: any) => `- ${l.name}`).join("\n") + "\n\n"
      : ""
  )}

${section("Contributing", data.contributing)}

${section("License", data.license)}

${section("Contact", data.contact)}

---

Built with ❤️ by [Commitra](https://github.com/commitra)
`.trim();
}


export function buildApiDocFromJSON(data: any) {
  const list = (arr: any[], fm: (x: any) => string) =>
    arr && arr.length ? arr.map(fm).join("\n\n") + "\n" : "";

  return `
# ${data.title}

${data.overview}

## Framework
${data.framework}

## API Routes
${list(
    data.routes,
    (r) => `### \`${r.method} ${r.route}\`

**Purpose:**  
${r.purpose}

**Input:**  
${r.input}

**Output:**  
${r.output}

**Errors:**  
${r.errors?.length ? r.errors.map((x: any) => `- ${x}`).join("\n") : "Not provided"}

**File:**  
\`${r.file}\`
`
  )}

## Authentication
${data.authentication}

## Rate Limiting
${data.rate_limiting}

## Usage Examples
${list(
    data.examples,
    (e) => `### ${e.route}

**cURL:**  
\`\`\`bash
${e.curl}
\`\`\`

**Code Example:**  
\`\`\`ts
${e.code}
\`\`\`
`
  )}

`.trim();
}
