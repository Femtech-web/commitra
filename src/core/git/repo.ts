import path from "node:path";
import { gitOutput, runGit } from "./command.js";

export function getRepositoryRoot(cwd = process.cwd()): string | null {
  const result = runGit(["rev-parse", "--show-toplevel"], { cwd, allowFailure: true });
  return result.status === 0 ? result.stdout.trim() || null : null;
}

export function requireRepositoryRoot(cwd = process.cwd()): string {
  const root = getRepositoryRoot(cwd);
  if (!root) throw new Error("Not a git repository.");
  return root;
}

export function getGitRemote(cwd = process.cwd()): string | null {
  try {
    return gitOutput(["remote", "get-url", "origin"], { cwd }) || null;
  } catch {
    return null;
  }
}

export function getCurrentBranch(cwd = process.cwd()): string | null {
  try {
    return gitOutput(["branch", "--show-current"], { cwd }) || null;
  } catch {
    return null;
  }
}

export function getRecentCommitSubjects(count = 5, cwd = process.cwd()): string[] {
  const result = runGit(["log", "-n", String(count), "--pretty=format:%s"], { cwd, allowFailure: true });
  return result.status === 0 ? result.stdout.split("\n").filter(Boolean) : [];
}

export function getGitPath(name: string, cwd = process.cwd()): string {
  return path.resolve(cwd, gitOutput(["rev-parse", "--git-path", name], { cwd }));
}

export function commitWithMessage(message: string, extraArgs: readonly string[] = [], cwd = process.cwd()): void {
  runGit(["commit", "-m", message, ...extraArgs], { cwd, stdio: "inherit" });
}

export function isGithubRepo(cwd = process.cwd()): boolean {
  const remote = getGitRemote(cwd);
  return remote ? remote.includes("github.com") : false;
}
