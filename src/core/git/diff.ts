import { BASE_EXCLUDE_PATTERNS } from "../utils/constants.js";
import { runGit } from "./command.js";

const DEFAULT_CONTEXT_CHARS = 6_000;
const DIFF_CAPTURE_LIMIT = 512 * 1024;
const LARGE_FILE_THRESHOLD = 200;

type FileStat = { file: string; additions: number; deletions: number; total: number };

const excludeArgs = BASE_EXCLUDE_PATTERNS.map((pattern) => `:(exclude)${pattern}`);
const pathspecs = (excludes: readonly string[] = []) => [
  ...excludeArgs,
  ...excludes.map((pattern) => `:(exclude)${pattern}`),
];

function parseNumstat(output: string): FileStat[] {
  const records = output.split("\0");
  const stats: FileStat[] = [];
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (!record) continue;
    const firstTab = record.indexOf("\t");
    const secondTab = record.indexOf("\t", firstTab + 1);
    if (firstTab < 0 || secondTab < 0) continue;
    const add = record.slice(0, firstTab);
    const del = record.slice(firstTab + 1, secondTab);
    let file = record.slice(secondTab + 1);
    if (!file) {
      const oldPath = records[index + 1] || "";
      file = records[index + 2] || oldPath;
      index += 2;
    }
    const additions = Number(add) || 0;
    const deletions = Number(del) || 0;
    stats.push({ file, additions, deletions, total: additions + deletions });
  }
  return stats;
}

export const getStagedFiles = (cwd = process.cwd(), excludes: readonly string[] = []): string[] => {
  const result = runGit(
    ["diff", "--cached", "--name-only", "-z", "--diff-algorithm=minimal", "--", ...pathspecs(excludes)],
    { cwd, allowFailure: true, maxOutputBytes: DIFF_CAPTURE_LIMIT },
  );
  return result.stdout.split("\0").filter(Boolean);
};

export const getDiffStats = (cwd = process.cwd(), excludes: readonly string[] = []): FileStat[] => {
  const result = runGit(
    ["diff", "--cached", "--numstat", "-z", "--diff-algorithm=minimal", "--", ...pathspecs(excludes)],
    { cwd, allowFailure: true, maxOutputBytes: DIFF_CAPTURE_LIMIT },
  );
  return parseNumstat(result.stdout);
};

function summarize(stats: readonly FileStat[]): string {
  if (!stats.length) return "";
  const additions = stats.reduce((sum, file) => sum + file.additions, 0);
  const deletions = stats.reduce((sum, file) => sum + file.deletions, 0);
  const top = [...stats].sort((a, b) => b.total - a.total).slice(0, 10);
  return [
    `Files changed: ${stats.length}`,
    `Additions: ${additions}, Deletions: ${deletions}, Total changes: ${additions + deletions}`,
    "",
    "Top modified files:",
    ...top.map((file) => `- ${file.file} (+${file.additions}/-${file.deletions}, ${file.total} changes)`),
  ].join("\n");
}

export const getDiffSummary = (cwd = process.cwd(), excludes: readonly string[] = []): string =>
  summarize(getDiffStats(cwd, excludes));

export const buildDiffSnippets = (
  files: readonly string[],
  perFileMaxLines = 25,
  totalMaxChars = 4_000,
  cwd = process.cwd(),
): string => {
  if (!files.length || totalMaxChars <= 0) return "";
  const result = runGit(
    ["diff", "--cached", "--unified=0", "--no-ext-diff", "--", ...files.slice(0, 5)],
    { cwd, allowFailure: true, maxOutputBytes: DIFF_CAPTURE_LIMIT },
  );
  if (!result.stdout) return "";

  const selected: string[] = [];
  const lineCounts = new Map<string, number>();
  let currentFile = "";
  for (const line of result.stdout.split("\n")) {
    if (line.startsWith("diff --git ")) {
      currentFile = line;
      selected.push(line);
      continue;
    }
    const isHeader = line.startsWith("--- ") || line.startsWith("+++ ") || line.startsWith("@@");
    const isChange = (line.startsWith("+") || line.startsWith("-")) && !line.startsWith("+++") && !line.startsWith("---");
    if (!isHeader && !isChange) continue;
    const count = lineCounts.get(currentFile) || 0;
    if (isChange && count >= perFileMaxLines) continue;
    if (isChange) lineCounts.set(currentFile, count + 1);
    selected.push(line);
  }

  const text = selected.join("\n").slice(0, totalMaxChars);
  return text ? `Context snippets (truncated):\n${text}` : "";
};

export const buildEnhancedDiffContext = (
  maxChars = DEFAULT_CONTEXT_CHARS,
  cwd = process.cwd(),
  excludes: readonly string[] = [],
): string => {
  const files = getStagedFiles(cwd, excludes);
  if (!files.length) return "";
  const stats = getDiffStats(cwd, excludes);
  const summary = summarize(stats) || `Files changed: ${files.length}`;
  const rankedFiles = [...stats].sort((a, b) => b.total - a.total).map((item) => item.file);

  if (files.length > LARGE_FILE_THRESHOLD) {
    return [
      "CHANGES SUMMARY (large diff mode):",
      summary,
      "",
      `Detailed snippets skipped because ${files.length} files are staged.`,
    ].join("\n").slice(0, maxChars);
  }

  const snippets = buildDiffSnippets(
    rankedFiles.length ? rankedFiles : files,
    25,
    Math.max(0, maxChars - summary.length - 40),
    cwd,
  );
  return [`CHANGES SUMMARY:\n${summary}`, snippets && `CODE CONTEXT:\n${snippets}`]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, maxChars);
};
