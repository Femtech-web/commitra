import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function truncate(text: string, maxLength = 1500): string {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return "[Unserializable Object]";
  }
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}


export function loadPackageJson() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const searchPaths = [
    // inside dist 
    path.resolve(__dirname, "../../package.json"),

    // inside src
    path.resolve(__dirname, "../package.json"),

    // globally or in node_modules
    path.resolve(process.cwd(), "package.json"),

    // Fallback to nearest upward search
    path.resolve(__dirname, "../../../package.json"),
  ];

  for (const p of searchPaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, "utf8"));
      } catch (e) { }
    }
  }

  return { version: "1.0.0" };
}