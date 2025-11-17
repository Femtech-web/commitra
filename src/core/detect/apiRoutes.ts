import fs from "fs";
import path from "path";
import { minimatch } from "minimatch";
import { BASE_EXCLUDE_PATTERNS } from "../utils/constants";

export interface APIRoute {
  method: string;
  path: string;
  file: string;
}

const EXCLUDED_DIRS = new Set(
  BASE_EXCLUDE_PATTERNS.concat(["contracts",
    "contracts/**",
    "contracts/lib",
    "contracts/lib/**",
  ]).map((p) =>
    p
      .replace(/\*.*$/, "")
      .replace(/\\/g, "/")
      .trim()
  )
);

function isExcluded(p: string) {
  return BASE_EXCLUDE_PATTERNS.some((pattern) => {
    return minimatch(p, pattern, { matchBase: true });
  });
}

export function detectAPIRoutes(root: string, language: string): string[] {
  const hints = API_PATH_HINTS[language.toLowerCase()] ?? [];
  const found: string[] = [];

  // Priority scan of Known API directories
  for (const hint of hints) {
    const full = path.join(root, hint);
    if (fs.existsSync(full) && !isExcluded(full)) {
      collectRoutes(full, found, root);
    }
  }

  if (found.length === 0) {
    scanAllForApi(root, found, root);
  }

  return Array.from(new Set(found));
}

function scanAllForApi(dir: string, output: string[], base: string) {
  const name = path.basename(dir);

  // Skip excluded dirs 
  if (EXCLUDED_DIRS.has(name) || isExcluded(dir)) return;

  let items: string[] = [];

  try {
    items = fs.readdirSync(dir);
  } catch {
    return;
  }

  for (const item of items) {
    const full = path.join(dir, item);

    if (isExcluded(full)) continue;

    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      scanAllForApi(full, output, base);
      continue;
    }

    if (NON_API_EXTENSIONS.some(ext => item.endsWith(ext))) {
      continue;
    }

    if (!API_FILE_REGEX.some((r) => r.test(item))) {
      continue;
    }

    output.push(cleanRoutePath(full, base));
  }
}

function collectRoutes(dir: string, output: string[], base: string) {
  if (EXCLUDED_DIRS.has(path.basename(dir)) || isExcluded(dir)) return;

  let items: string[] = [];

  try {
    items = fs.readdirSync(dir);
  } catch {
    return;
  }

  for (const item of items) {
    const full = path.join(dir, item);

    if (isExcluded(full)) continue;

    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      collectRoutes(full, output, base);
    } else {
      if (API_FILE_REGEX.some((r) => r.test(item))) {
        output.push(cleanRoutePath(full, base));
      }
    }
  }
}

function cleanRoutePath(fullPath: string, base: string): string {
  const rel = fullPath.replace(base, "").replace(/\\/g, "/");

  return rel
    .replace(/\.(ts|js|py|go|rs|php|java|rb|swift|rb)$/i, "")
    .replace(/\/route$/, "")
    .replace(/\/index$/, "")
    .replace(/controller/i, "")
    .trim();
}

const NON_API_EXTENSIONS = [
  ".sol",
  ".t.sol",
  ".vy",
  ".move",
  ".proto",
];


export const API_PATH_HINTS: Record<string, string[]> = {
  javascript: [
    "app/api",
    "src/api",
    "api",
    "routes",
    "server/routes",
    "src/routes",
    "src/controllers",
  ],
  typescript: [
    "app/api",
    "src/api",
    "api",
    "routes",
    "src/routes",
    "controller",
    "src/controller",
  ],
  python: [
    "app",
    "api",
    "apis",
    "routes",
    "views",
    "fastapi_app",
    "src/api",
  ],
  go: [
    "handlers",
    "routes",
    "api",
    "controllers",
    "cmd",
  ],
  rust: [
    "src/routes",
    "src/api",
    "src/handlers",
  ],
  php: [
    "app/Http/Controllers",
    "routes/api.php",
    "routes/web.php",
  ],
  java: [
    "src/main/java",
    "src/main/resources/routes",
    "controllers",
  ],
  ruby: [
    "app/controllers",
    "app/api",
    "routes",
  ],
  elixir: [
    "lib/*_web/controllers",
    "lib/*_web/router.ex",
  ],
  swift: [
    "Sources/App/Routes",
    "Sources/App/Controllers",
  ],
};

export const API_FILE_REGEX = [
  /route\.(ts|js|py|go|rs|php|java|rb)$/i,
  /controller\.(ts|js|py|go|rs|php|java|rb)$/i,
  /handler\.(ts|js)$/i,
  /^api\.(ts|js)$/i,
  /endpoint\.(ts|js|py)$/i,
];

