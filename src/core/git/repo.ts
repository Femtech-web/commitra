import { execSync } from "child_process";

export function getGitRemote(): string | null {
  try {
    return execSync("git remote get-url origin", { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

export function getCurrentBranch(): string | null {
  try {
    return execSync("git branch --show-current", { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

export function isGithubRepo(): boolean {
  const remote = getGitRemote();
  return remote ? remote.includes("github.com") : false;
}
