import { getRuntimeConfig } from "../config/manager.js";
import { createAIClient } from "../ai/ai.js";

export async function classifyWithAI(payload: { language: string; packageManager?: string; dependencies: string[] }): Promise<any> {
  const cfg = await getRuntimeConfig();
  const ai = createAIClient(cfg);

  const depList = payload.dependencies.slice(0, 200).join(", ");
  const prompt = `
  You are Commitra, an expert project analyzer. Given the project's language (${payload.language}) and the following dependency list, produce a JSON object that classifies packages into categories:

  - framework, frontend, backend, database, ui (array), devops (array), testing (array), cloud (array), buildTools (array), libraries (array), summary (one-line), and confidence (0..1).

  Dependencies:
  ${depList}

  Return strictly JSON only. Example:

  {
    "framework": "FastAPI",
    "frontend": null,
    "backend": "FastAPI",
    "database": "SQLAlchemy",
    "ui": ["Tailwind CSS"],
    "devops": ["Docker"],
    "testing": ["Pytest"],
    "cloud": ["AWS (Boto3)"],
    "buildTools": [],
    "libraries": ["OpenAI SDK"],
    "summary": "Python | FastAPI backend | SQLAlchemy | Docker",
    "confidence": 0.86
  }
`;

  const response = await ai.chat(
    [
      { role: "system", content: "You are Commitra, an assistant that returns precise JSON classifications." },
      { role: "user", content: prompt },
    ],
    { max_tokens: 800 }
  );

  const text = response.choices?.[0]?.message?.content ?? "";
  try {
    const jsonStart = text.indexOf("{");
    const jsonText = text.slice(jsonStart);
    const parsed = JSON.parse(jsonText);
    parsed.confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0));
    return parsed;
  } catch (err) {
    throw new Error("AI classification failed to return valid JSON");
  }
}
