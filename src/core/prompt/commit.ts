import { truncate } from "../utils/helpers";
import type { CommitFormat } from "../commit/message.js";

export const buildCommitPrompt = ({
  diff,
  branch,
  lastCommits,
  techStack,
  locale = "en",
  maxLength = 100,
  format = "conventional",
  customInstructions = "",
}: {
  diff: string;
  branch: string;
  lastCommits: string[];
  techStack: string;
  locale?: string;
  maxLength?: number;
  format?: CommitFormat;
  customInstructions?: string;
}) => {
  const prev = lastCommits.slice(0, 3).join("\n- ");
  const shortDiff = truncate(diff, 6000);
  const formatRule = {
    plain: "Use a concise imperative subject without a required type prefix.",
    conventional: "Format: `type: subject` (no scope).",
    "conventional-scoped": "Format: `type(scope): subject` with the most relevant scope.",
    "conventional-body": "Format: `type(scope): subject`, optionally followed by a short explanatory body.",
    gitmoji: "Format: `<gitmoji> type: subject` using one relevant gitmoji.",
  }[format];

  return `
  You are Commitra, a professional AI trained to write conventional git commit messages.

  ## GOAL
  Generate ONE professional, conventional commit message that accurately describes the staged changes.

  ## CONTEXT
  Branch: ${branch}
  Tech stack: ${techStack}
  Language: ${locale}

  Previous commits:
  - ${prev}

  Code changes:
  \`\`\`diff
  ${shortDiff}
  \`\`\`

  ## CRITICAL RULES
  - Return ONLY the commit message (no explanations).
  - ${formatRule}
  - Maximum ${maxLength} characters.
  - Use imperative mood (e.g., "add", "fix", "update", not "added" or "fixed").
  - Be clear and specific — describe what changed and why.
  - Always include affected component/module if relevant.
  - Avoid redundancy with previous commits.

  ## COMMIT TYPES
  - feat: New user-facing feature
  - fix: Bug fix
  - refactor: Code restructuring or improvement
  - docs: Documentation only
  - chore: Maintenance or dependency updates
  - test: Test updates
  - perf: Performance improvement
  - build: Build system or dependency changes
  - ci: CI/CD pipeline changes
  - revert: Revert previous commit

  ## GOOD EXAMPLES
  - feat: add OAuth-based user login flow
  - fix: resolve race condition in session validation
  - refactor: simplify API handler middleware
  - docs: update API usage examples in README
  - chore: bump axios to v1.7.0 for security patch

  ## BAD EXAMPLES
  - vague or speculative descriptions not supported by the diff
  - updated files
  - minor fixes

  ## OUTPUT
  Return only the final commit message line, no markdown, no extra context.
  ${customInstructions ? `\n  Additional project instructions:\n  ${customInstructions}` : ""}
    `;
};
