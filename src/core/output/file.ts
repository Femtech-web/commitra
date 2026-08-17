import fs from "node:fs";
import path from "node:path";

export function resolveProjectOutput(root: string, requested: string, fallback: string): string {
  const rootPath = path.resolve(root);
  const outputPath = path.resolve(rootPath, requested || fallback);
  if (outputPath !== rootPath && !outputPath.startsWith(`${rootPath}${path.sep}`)) {
    throw new Error("Output must stay inside the project directory.");
  }
  return outputPath;
}

export function writeGeneratedFile(outputPath: string, content: string, force = false): void {
  const existing = fs.existsSync(outputPath) ? fs.lstatSync(outputPath) : null;
  if (existing?.isSymbolicLink()) throw new Error(`Refusing to overwrite symbolic link: ${outputPath}`);
  if (existing && !force) throw new Error(`${outputPath} already exists. Use --force to overwrite it.`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const temporary = path.join(path.dirname(outputPath), `.${path.basename(outputPath)}.${process.pid}.tmp`);
  try {
    fs.writeFileSync(temporary, content, { encoding: "utf8", mode: 0o644 });
    fs.renameSync(temporary, outputPath);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}
