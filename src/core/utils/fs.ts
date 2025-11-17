import fs from "fs";
import path from "path";
import { minimatch } from "minimatch";
import { BASE_EXCLUDE_PATTERNS, ROOT_MARKERS } from "./constants";


function directoryHasRootMarker(dir: string): boolean {
  if (!fs.existsSync(dir)) return false;

  const entries = fs.readdirSync(dir);

  return ROOT_MARKERS.some((marker) => {
    // Wildcard matcher
    if (marker.includes("*")) {
      const regexPattern = marker.replace(/\./g, "\\.").replace(/\*/g, ".*");
      const regex = new RegExp(`^${regexPattern}$`);
      return entries.some((file) => regex.test(file));
    }

    // Folder marker 
    if (marker.startsWith(".")) {
      const candidate = path.join(dir, marker);
      return fs.existsSync(candidate);
    }

    return entries.includes(marker);
  });
}

export function getProjectRoot(startDir: string = process.cwd()): string {
  let dir = path.resolve(startDir);

  while (true) {
    if (directoryHasRootMarker(dir)) {
      return dir;
    }

    const parent = path.dirname(dir);

    if (parent === dir) {
      return startDir;
    }

    dir = parent;
  }
}

export function debugRootDetection() {
  const root = getProjectRoot();
  console.log("Detected Project Root:", root);

  const foundMarkers = ROOT_MARKERS.filter((marker) => {
    // wildcard can't be directly tested
    if (marker.includes("*")) return true;
    return fs.existsSync(path.join(root, marker));
  });

  console.log("Markers Present:", foundMarkers);
}

export function loadCommitraConfig(root: string) {
  const CONFIG_FILES = [
    ".commitra.json",
    ".commitra.yaml",
    ".commitra.yml",
    "commitrc",
    "commitrc.json"
  ];

  for (const file of CONFIG_FILES) {
    const full = path.join(root, file);
    if (fs.existsSync(full)) {
      try {
        if (file.endsWith(".yaml") || file.endsWith(".yml")) {
          return require("yaml").parse(fs.readFileSync(full, "utf-8"));
        }
        return JSON.parse(fs.readFileSync(full, "utf-8"));
      } catch (e) {
        console.warn("⚠️ Failed to parse Commitra config:", file);
      }
    }
  }

  return {};
}

export function readDirectoryTree(
  root: string,
  depth = 3,
  excludeList: string[] = []
) {
  const visited = new Set<string>();

  function isExcluded(item: string, fullPath: string): boolean {
    return excludeList.some(
      (pattern) =>
        minimatch(item, pattern, { matchBase: true }) ||
        minimatch(fullPath, pattern, { matchBase: true })
    );
  }

  function walk(dir: string, level: number): string {
    if (level > depth) return "";

    let real: string;
    try {
      real = fs.realpathSync(dir);
    } catch {
      return "";
    }

    if (visited.has(real)) return "";
    visited.add(real);

    let items: string[];
    try {
      items = fs.readdirSync(dir);
    } catch {
      return "";
    }

    let output = "";

    for (const item of items) {
      const full = path.join(dir, item);

      if (isExcluded(item, full)) continue;

      let stat;
      try {
        stat = fs.statSync(full);
      } catch {
        continue;
      }

      output += `${"│   ".repeat(level)}├── ${item}\n`;

      if (stat.isDirectory()) {
        output += walk(full, level + 1);
      }
    }

    return output;
  }

  return walk(root, 0);
}

export function buildExcludeList(root: string) {
  const cfg = loadCommitraConfig(root);

  const userExcludes = cfg?.readme?.exclude ?? [];
  const userIncludes = cfg?.readme?.include ?? [];

  const finalExcludes = BASE_EXCLUDE_PATTERNS.filter(
    (pattern) => !userIncludes.includes(pattern)
  );

  return [...new Set([...finalExcludes, ...userExcludes])];
}

export function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function writeFileSafe(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.writeFileSync(filePath, content, "utf8");
}

