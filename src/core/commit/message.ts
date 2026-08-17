export type CommitFormat = "plain" | "conventional" | "conventional-scoped" | "conventional-body" | "gitmoji";

const FORMATS = new Set<CommitFormat>([
  "plain",
  "conventional",
  "conventional-scoped",
  "conventional-body",
  "gitmoji",
]);

export function parseCommitFormat(value?: string, fallback: CommitFormat = "conventional"): CommitFormat {
  const format = value || fallback;
  if (!FORMATS.has(format as CommitFormat)) {
    throw new Error(`Invalid commit format: ${format}. Expected ${[...FORMATS].join(", ")}.`);
  }
  return format as CommitFormat;
}

export function parseSuggestionCount(value: string | number | undefined): number {
  const parsed = Number(value ?? 1);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 10) {
    throw new Error("Suggestion count must be an integer between 1 and 10.");
  }
  return parsed;
}

export function normalizeCommitMessage(raw: string, maxLength = 120, format: CommitFormat = "conventional"): string {
  let message = raw.trim().replace(/^```(?:text)?\s*|\s*```$/g, "").replace(/^(["'])|(["'])$/g, "");
  if (format !== "conventional-body") message = message.replace(/\s*\n\s*/g, " ");
  const [subject, ...body] = message.split("\n");
  const unboundedSubject = subject.trim().replace(/[.!]+$/, "");
  const hardClippedSubject = unboundedSubject.slice(0, maxLength).trim();
  const wordClippedSubject = hardClippedSubject.replace(/\s+\S*$/, "").trim();
  const cleanSubject = unboundedSubject.length > maxLength
    ? wordClippedSubject || hardClippedSubject
    : unboundedSubject;
  return [cleanSubject, ...body].join("\n").trim();
}
