import fs from "fs";
import path from "path";

export function findDistDiff() {
  const distDir = path.resolve(process.cwd(), "dist");
  const file = fs.readdirSync(distDir).find((f) => f.startsWith("diff-") && f.endsWith(".js"));
  if (!file) throw new Error("Could not find dist/diff-*.js");
  return file;
}
