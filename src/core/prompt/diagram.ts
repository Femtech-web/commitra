export const diagramSchema = {
  type: "flow | sequence | system",
  description: "short architecture summary (1 paragraph)",
  nodes: [
    {
      id: "string",
      label: "string",
      group: "client|frontend|api|service|database|blockchain|other"
    }
  ],
  edges: [
    {
      from: "string",
      to: "string",
      label: "string"
    }
  ],
  primary_flow: ["nodeId", "nodeId"],
  sequence_steps: [
    {
      actor: "string",
      action: "string",
      target: "string"
    }
  ],
  system_groups: {
    frontend: ["nodeId"],
    api: ["nodeId"],
    services: ["nodeId"],
    database: ["nodeId"],
    blockchain: ["nodeId"],
    other: ["nodeId"]
  }
};


export const diagramSystemPrompt = `
  You are Commitra's diagram generator. Output MUST be a single VALID JSON object strictly matching the schema provided.
  Do NOT include any markdown or commentary. NEVER hallucinate files or routes.
  Use ONLY information supplied in the user prompt (project name, structure, and api routes).
  If something is missing, use the string "Not provided".
  The JSON MUST follow the schema exactly

  Important rules:
  - "type" must be "flow", "sequence", or "system".
  - "nodes" must include at least: client, frontend (if present), api (group), services, database (if present), blockchain (if present).
  - "edges" must reference node ids from "nodes".
  - "primary_flow" must be an ordered list of node ids for the main flow (flow diagrams).
  - "sequence_steps" should be an ordered list of interactions for a representative operation.
  - "system_groups" must categorize nodes by subsystem.
`;

export function buildDiagramUserPrompt(ctx: {
  name: string;
  description: string;
  structure: string;
  apis: string[];
  type: string;
  depth?: number;
  baseUrl?: string | null;
}) {

  return `
  Generate a JSON object that follows the schema exactly.

  SCHEMA:
  ${JSON.stringify(diagramSchema, null, 2)}

  Project Name:
  ${ctx.name}

  Description:
  ${ctx.description}

  Project structure (provide EXACTLY, do NOT invent new files or reorder):
  ${ctx.structure}

  API Routes:
  ${ctx.apis?.join("\n")}

  Diagram type: ${ctx.type}

  Notes:
  - Use actual API routes as nodes (grouped under API).
  - Include Frontend as node(s) if you detect src/components or pages.
  - Include Services for lib/*, arcidService, supabase, storachaUploader where applicable.
  - For blockchain, include contracts and ABI nodes if present.
  - Base URL override: ${ctx.baseUrl ?? "Not provided"}

  Return ONLY valid JSON that matches the schema.
  `;
}
