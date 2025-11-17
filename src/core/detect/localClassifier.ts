import Fuse from "fuse.js";
import { LIBRARY_MAP } from "../utils/constants";


export type LocalClassification = {
  framework?: string | null;
  frontend?: string | null;
  backend?: string | null;
  database?: string | null;
  ui?: string[];
  devops?: string[];
  libraries?: string[];
  testing?: string[];
  cloud?: string[];
  buildTools?: string[];
  summary?: string;
  overallConfidence?: number;
  matches?: Record<string, number>;
};

const keys = Object.keys(LIBRARY_MAP);
const fuse = new Fuse(keys.map(k => ({ key: k })), { keys: ["key"], threshold: 0.3 });

export function classifyLocally(deps: { dependencies: string[]; raw?: any }): LocalClassification {
  const result: LocalClassification = {
    ui: [],
    devops: [],
    libraries: [],
    testing: [],
    cloud: [],
    buildTools: [],
    matches: {},
    overallConfidence: 0,
  };

  const matches: Record<string, number> = {};
  let matchCount = 0;

  for (const d of deps.dependencies || []) {
    const name = d.toLowerCase();
    if (LIBRARY_MAP[name]) {
      const entry = LIBRARY_MAP[name];
      addToCategory(result, entry.category, entry.label);
      matches[name] = 1;
      matchCount++;
      continue;
    }

    // fuzzy match by package substring or fuse
    const substr = keys.find(k => name.includes(k));
    if (substr) {
      const entry = LIBRARY_MAP[substr];
      addToCategory(result, entry.category, entry.label);
      matches[name] = 0.8;
      matchCount++;
      continue;
    }

    const fuseRes = fuse.search(name);
    if (fuseRes.length) {
      const k = (fuseRes[0].item as any).key;
      const entry = LIBRARY_MAP[k];
      addToCategory(result, entry.category, entry.label);
      matches[name] = 0.6;
      matchCount++;
      continue;
    }

    matches[name] = 0;
  }

  // compute overall confidence: ratio of matched deps weighted by match score
  const totalScore = Object.values(matches).reduce((s, v) => s + v, 0);
  const overallConfidence = deps.dependencies && deps.dependencies.length > 0 ? Math.min(1, totalScore / deps.dependencies.length) : 0;

  result.matches = matches;
  result.overallConfidence = Number(overallConfidence.toFixed(2));

  result.summary = [
    result.framework,
    result.frontend,
    result.backend,
    result.database,
    result.ui && result.ui.length ? `UI: ${result.ui.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  return result;
}

function addToCategory(out: LocalClassification, category: string, label: string) {
  switch (category) {
    case "framework":
      out.framework = out.framework || label;
      break;
    case "frontend":
      out.frontend = out.frontend || label;
      break;
    case "backend":
      out.backend = out.backend || label;
      break;
    case "database":
      out.database = out.database || label;
      break;
    case "ui":
      out.ui = Array.from(new Set([...(out.ui || []), label]));
      break;
    case "devops":
      out.devops = Array.from(new Set([...(out.devops || []), label]));
      break;
    case "testing":
      out.testing = Array.from(new Set([...(out.testing || []), label]));
      break;
    case "cloud":
      out.cloud = Array.from(new Set([...(out.cloud || []), label]));
      break;
    case "libraries":
      out.libraries = Array.from(new Set([...(out.libraries || []), label]));
      break;
    case "buildTools":
      out.buildTools = Array.from(new Set([...(out.buildTools || []), label]));
      break;
    default:
      out.libraries = Array.from(new Set([...(out.libraries || []), label]));
  }
}
