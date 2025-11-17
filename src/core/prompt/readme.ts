import { Dependency } from "../detect/projectMetadata";

export const readmeSchema = {
  title: "string",
  overview: "long, multi-paragraph description",
  tech_stack: ["list of technologies"],

  features: [
    {
      title: "string",
      description: "multi-sentence explanation",
      files: ["optional list of files"]
    }
  ],

  dependencies: [
    {
      name: "string",
      description: "what this dependency is used for",
      category: "framework | ui | orm | blockchain | etc"
    }
  ],

  project_structure: "full multi-line tree EXACTLY as provided",

  core_folders: [
    {
      path: "folder path",
      description: "what this folder contains"
    }
  ],

  api_routes: [
    {
      route: "string",
      purpose: "multi-sentence purpose",
      input: "parameters",
      output: "response",
      file: "path"
    }
  ],

  installation: ["steps"],
  development: ["dev instructions"],
  environment_variables: ["list or Not provided"],
  testing: ["test instructions"],
  deployment: ["deploy instructions"],

  contracts: [
    {
      path: "file path",
      description: "what this contract likely does"
    }
  ],

  libraries: [
    {
      name: "string",
      files: ["optional list"]
    }
  ],

  screenshots: ["optional"],
  badges: ["optional"],

  contributing: "long text",
  license: "license or Not provided",
  contact: "email or Not provided"
};


export const buildReadmePrompt = ({
  name,
  description,
  stack,
  structure,
  dependencies,
  apis,
}: {
  name: string;
  description: string;
  stack: { summary: string; frontend?: string; backend?: string; db?: string };
  structure: string;
  dependencies: Dependency[];
  apis?: string[];
}) => {

  return `
    You will now produce a detailed JSON object describing this project.

    USE ONLY THE INFORMATION PROVIDED.

    SCHEMA:
    ${JSON.stringify(readmeSchema, null, 2)}

    PROJECT DATA:

    Name:
    ${name}

    Description:
    ${description}

    Tech Stack:
    ${stack.summary}

    Dependencies:
    ${dependencies.map((d) => d.name).join(", ")}

    API Routes:
    ${apis?.join("\n")}

    Project Structure (use EXACTLY as-is, do NOT regenerate or reorder):
    ${structure}

    Return ONLY JSON. No markdown.
  `;
};

export const readmeSystemPrompt = `
You are Commitra's documentation engine.

You MUST output a single JSON object that EXACTLY matches the provided schema.

STRICT RULES:
- Use ONLY the provided project structure, dependencies, and filenames.
- Do NOT regenerate or modify the project structure. Copy it verbatim.
- Do NOT hallucinate files, folders, libraries, or APIs.
- overview MUST be at least 3 paragraphs.
- features MUST be inferred from real component folders (dashboard, ui, api, hooks, etc.).
- dependencies MUST have meaningful descriptions based on REAL library purpose.
- api_routes MUST include purpose, inputs, outputs, and file path.
- core_folders MUST describe what the folder actually contains.
- If information is truly missing, return "Not provided".
- NEVER output undefined or null.
- NEVER output markdown — ONLY pure JSON.
- Output MUST be valid JSON with no trailing commas.
`;

// Dependencies (JSON array of { name, version }):
//   ${JSON.stringify(dependencies, null, 2)}