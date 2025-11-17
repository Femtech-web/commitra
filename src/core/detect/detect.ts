import { detectLanguageAndManager, extractDependencies } from "./extractors";
import { classifyLocally, LocalClassification } from "./localClassifier";
import { classifyWithAI } from "./aiClassifier";

export type StackInfo = {
  language: string;
  packageManager?: string;
  framework?: string | null;
  frontend?: string | null | any;
  backend?: string | null | any;
  database?: string | null;
  ui?: string[];
  devops?: string[];
  libraries?: string[];
  testing?: string[];
  cloud?: string[];
  buildTools?: string[];
  summary: string;
  confidence: number;
  source?: "local" | "ai" | "hybrid";
};


export async function detectStack(projectRoot: string,): Promise<StackInfo> {
  const { language, packageManager } = detectLanguageAndManager(projectRoot);

  // extract dependencies 
  const deps = await extractDependencies(projectRoot, language, packageManager);

  // fast local classifier 
  const local: LocalClassification = classifyLocally(deps);

  // if local confidence high then accept
  const localConfidence = local.overallConfidence ?? 0;
  let final: StackInfo;

  if (localConfidence >= 0.8) {
    final = synthesizeStackInfo(language, packageManager, local, "local");
  } else {
    try {
      const ai = await classifyWithAI({ language, packageManager, dependencies: deps as any });
      final = mergeLocalAndAI(language, packageManager, local, ai);
      final.source = final.confidence >= localConfidence ? "hybrid" : "local";
    } catch (err) {
      final = synthesizeStackInfo(language, packageManager, local, "local");
      final.source = "local";
    }
  }

  return final;
}

function synthesizeStackInfo(language: string, packageManager: string | undefined, local: LocalClassification, source: StackInfo["source"]): StackInfo {
  const summaryParts: string[] = [];
  if (language) summaryParts.push(language);
  if (local.framework) summaryParts.push(local.framework);
  if (local.frontend) summaryParts.push(local.frontend);
  if (local.backend) summaryParts.push(local.backend);
  if (local.database) summaryParts.push(local.database);

  const summary = summaryParts.filter(Boolean).join(" | ");
  return {
    language,
    packageManager,
    framework: local.framework || null,
    frontend: local.frontend || null,
    backend: local.backend || null,
    database: local.database || null,
    ui: local.ui || [],
    devops: local.devops || [],
    libraries: local.libraries || [],
    testing: local.testing || [],
    cloud: local.cloud || [],
    buildTools: local.buildTools || [],
    summary: summary || "Unknown",
    confidence: local.overallConfidence ?? 0,
    source,
  };
}

function mergeLocalAndAI(language: string, packageManager: string | undefined, local: LocalClassification, ai: any): StackInfo {
  const weightLocal = 0.7;
  const weightAI = 0.3;

  const pickString = (l?: string | null, a?: string | null) => (l && a ? (Math.random() < 0.5 ? l : a) : l || a || null);

  const merged: StackInfo = {
    language,
    packageManager,
    framework: pickString(local.framework || null, ai.framework || null),
    frontend: pickString(local.frontend || null, ai.frontend || null),
    backend: pickString(local.backend || null, ai.backend || null),
    database: pickString(local.database || null, ai.database || null),
    ui: Array.from(new Set([...(local.ui || []), ...(ai.ui || [])])),
    devops: Array.from(new Set([...(local.devops || []), ...(ai.devops || [])])),
    libraries: Array.from(new Set([...(local.libraries || []), ...(ai.libraries || [])])),
    testing: Array.from(new Set([...(local.testing || []), ...(ai.testing || [])])),
    cloud: Array.from(new Set([...(local.cloud || []), ...(ai.cloud || [])])),
    buildTools: Array.from(new Set([...(local.buildTools || []), ...(ai.buildTools || [])])),
    summary: ai.summary || local.summary || "",
    confidence: Math.min(1, (local.overallConfidence || 0) * weightLocal + (ai.confidence || 0) * weightAI),
    source: "hybrid",
  };

  if (!merged.summary) {
    merged.summary = [merged.language, merged.framework, merged.frontend, merged.backend].filter(Boolean).join(" | ") || "Unknown";
  }

  return merged;
}
