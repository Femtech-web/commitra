import { execSync, spawnSync } from "child_process";
import { BASE_EXCLUDE_PATTERNS } from "../utils/constants";

const excludeArgs = BASE_EXCLUDE_PATTERNS.map((p) => `:(exclude)${p}`);

export const getStagedFiles = (): string[] => {
  const args = [
    "diff",
    "--cached",
    "--name-only",
    "--diff-algorithm=minimal",
    ...excludeArgs,
  ];
  const { stdout } = spawnSync("git", args, { encoding: "utf8" });
  if (!stdout) return [];
  return stdout.split("\n").filter(Boolean);
};

export const getDiffSummary = (): string => {
  try {
    const args = [
      "diff",
      "--cached",
      "--numstat",
      "--diff-algorithm=minimal",
      ...excludeArgs,
    ];
    const { stdout } = spawnSync("git", args, { encoding: "utf8" });
    if (!stdout) return "";

    const stats = stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [add, del, file] = line.split("\t");
        return {
          file,
          additions: Number(add) || 0,
          deletions: Number(del) || 0,
          total: (Number(add) || 0) + (Number(del) || 0),
        };
      });

    const totalFiles = stats.length;
    const totalAdditions = stats.reduce((s, f) => s + f.additions, 0);
    const totalDeletions = stats.reduce((s, f) => s + f.deletions, 0);
    const totalChanges = stats.reduce((s, f) => s + f.total, 0);
    const top = stats.sort((a, b) => b.total - a.total).slice(0, 10);

    const lines: string[] = [
      `Files changed: ${totalFiles}`,
      `Additions: ${totalAdditions}, Deletions: ${totalDeletions}, Total changes: ${totalChanges}`,
      "",
      "Top modified files:",
      ...top.map(
        (f) => `- ${f.file} (+${f.additions}/-${f.deletions}, ${f.total} changes)`
      ),
    ];

    return lines.join("\n");
  } catch (err) {
    console.error("Error in getDiffSummary:", err);
    return "";
  }
};

export const buildDiffSnippets = (files: string[], perFileMaxLines = 25, totalMaxChars = 4000): string => {
  try {
    const targetFiles = files.slice(0, 5);
    const parts: string[] = [];
    let remaining = totalMaxChars;

    for (const f of targetFiles) {
      const stdout = execSync(`git diff --cached --unified=0 -- "${f}"`, { encoding: "utf8" });
      if (!stdout) continue;

      const lines = stdout.split("\n").filter(Boolean);
      const picked: string[] = [];
      let count = 0;

      for (const line of lines) {
        const isHunk = line.startsWith("@@");
        const isChange =
          (line.startsWith("+") || line.startsWith("-")) &&
          !line.startsWith("+++") &&
          !line.startsWith("---");
        if (isHunk || isChange) {
          picked.push(line);
          count++;
          if (count >= perFileMaxLines) break;
        }
      }

      if (picked.length > 0) {
        const block = [`# ${f}`, ...picked].join("\n");
        if (block.length <= remaining) {
          parts.push(block);
          remaining -= block.length;
        } else {
          parts.push(block.slice(0, remaining));
          remaining = 0;
        }
      }

      if (remaining <= 0) break;
    }

    if (parts.length === 0) return "";
    return ["Context snippets (truncated):", ...parts].join("\n");
  } catch {
    return "";
  }
};

export const buildEnhancedDiffContext = (): string => {
  const files = getStagedFiles();

  const LARGE_FILE_THRESHOLD = 200;
  if (files.length > LARGE_FILE_THRESHOLD) {
    const summary = getDiffSummary();

    return [
      "CHANGES SUMMARY (large diff mode):",
      summary || "(no summary available)",
      "",
      `Diff too large (${files.length} files). Detailed snippets were skipped.`,
      "Only summary is included to avoid performance issues.",
    ].join("\n");
  }

  const summary = getDiffSummary();
  const snippets = buildDiffSnippets(files);

  let final = "";

  if (summary) final += `CHANGES SUMMARY:\n${summary}\n\n`;
  if (snippets) final += `CODE CONTEXT:\n${snippets}\n\n`;

  if (!final.trim()) {
    try {
      const fallback = execSync("git diff --cached --unified=3", {
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024
      });
      final = `FULL DIFF (fallback):\n${fallback}`;
    } catch {
      final = "Unable to produce diff.";
    }
  }

  return final.trim();
};

