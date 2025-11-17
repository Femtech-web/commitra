export const apiSchema = {
  title: "string",
  overview: "long multi-paragraph explanation of the API layer",
  framework: "string (Next.js | Express | FastAPI | Go | etc)",
  routes: [
    {
      route: "string",
      method: "GET | POST | PUT | etc",
      purpose: "multi-sentence description",
      input: "detailed request params/body",
      output: "detailed JSON structure",
      file: "path to handler",
      errors: ["optional list of possible error cases"]
    }
  ],
  authentication: "explanation or Not provided",
  rate_limiting: "explanation or Not provided",
  examples: [
    {
      route: "string",
      curl: "example curl command",
      code: "typescript or python usage example"
    }
  ]
};

export function buildApiPrompt({ name, stack, apis, structure }: {
  name: string;
  stack: { summary: string; frontend?: string; backend?: string; db?: string };
  apis?: string[];
  structure: string;
}, baseUrl: string) {
  return `
  You are Commitra's API documentation engine.
  Return ONLY valid JSON that follows this schema:

  ${JSON.stringify(apiSchema, null, 2)}

  PROJECT INFORMATION:

  Project Name:
  ${name}

  Base URL: 
  ${baseUrl || "Not provided"}

  Detected Framework:
  ${stack.summary}

  API Routes:
  ${apis?.join("\n")}

  File Structure:
  \`\`\`text
  ${structure}
  \`\`\`

  RULES:
  - NEVER output undefined. Use "Not provided".
  - All descriptions MUST be multi-sentence.
  - Every endpoint MUST include input/output/errors.
  - If method is unknown, infer from file conventions.
  - DO NOT output markdown. JSON ONLY.
  `;
}

export const apiSystemPrompt = `
  You are Commitra's dedicated API documentation generator.

  INSTRUCTIONS (MUST FOLLOW):
  - Output **ONLY** a single, valid JSON object that adheres exactly to the schema provided in the user prompt.
  - Do NOT output any markdown, comments, or prose outside the JSON.
  - NEVER invent routes, methods, parameters, fields, or files that are not explicitly present in the API list passed in the user prompt. If information is missing, use the exact string: "Not provided".
  - All textual fields must be multi-sentence and descriptive (unless the schema explicitly expects a list).
  - Do NOT output 'null' or 'undefined'. Use "Not provided" instead.
  - Ensure every route object contains: 'route', 'method', 'file', 'purpose', 'input', and 'output'.
  - 'purpose' must be 2–4 sentences explaining why the route exists and how it is typically used.
  - 'input' must list expected parameters (path, query, headers, body) and data types where detectable; if not detectable, say "Not provided".
  - 'output' must describe the response shape, status codes, and example fields if discoverable; otherwise "Not provided".
  - If example usage can be inferred from files, include an 'examples' array with at least one example object containing 'curl' and 'javascript' fields, or "Not provided" if none.
  - Keep all strings safe for direct JSON parsing — escape newlines properly (\\n) and do not include stray backticks or markdown.
  - The top-level JSON must include keys: 'title', 'overview', 'routes' (array), and 'examples' (array or empty).
  - 'overview' must be at least 2 paragraphs summarizing the API surface and how it integrates with the project stack (use only info from project files/deps).
  - Maintain predictable ordering: 'title', 'overview', 'routes', 'examples'.
  - Validate that every 'file' path you reference exactly matches one of the file paths provided in the user prompt; if not matchable, write "Not provided".

  If you cannot comply with any rule above, return a JSON object with a single key 'error' and a short message explaining why (still JSON).

  Remember: JSON ONLY, no extra text.
`