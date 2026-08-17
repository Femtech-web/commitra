import { execFileSync } from "node:child_process";
import fs from "node:fs";

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
const patterns = [
  /\b(?:gsk|sk-proj|sk-ant|ghp)_[A-Za-z0-9_-]{20,}\b/g,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
];
const findings = [];
for (const file of files) {
  if (!fs.existsSync(file) || fs.statSync(file).size > 2_000_000) continue;
  let content;
  try { content = fs.readFileSync(file, "utf8"); } catch { continue; }
  for (const pattern of patterns) {
    if (pattern.test(content)) findings.push(file);
    pattern.lastIndex = 0;
  }
}
if (findings.length) {
  console.error(`Potential committed secrets found in:\n${[...new Set(findings)].map((file) => `- ${file}`).join("\n")}`);
  process.exit(1);
}
console.log("No high-confidence secrets found in repository files.");
