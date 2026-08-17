import { spawnSync, type SpawnSyncOptionsWithStringEncoding } from "node:child_process";

const DEFAULT_MAX_OUTPUT = 1024 * 1024;

export type GitRunOptions = {
  cwd?: string;
  allowFailure?: boolean;
  maxOutputBytes?: number;
  stdio?: "pipe" | "inherit";
};

export type GitResult = {
  stdout: string;
  stderr: string;
  status: number;
  truncated: boolean;
};

export function runGit(args: readonly string[], options: GitRunOptions = {}): GitResult {
  const spawnOptions: SpawnSyncOptionsWithStringEncoding = {
    cwd: options.cwd,
    encoding: "utf8",
    shell: false,
    stdio: options.stdio ?? "pipe",
    maxBuffer: options.maxOutputBytes ?? DEFAULT_MAX_OUTPUT,
  };
  const result = spawnSync("git", [...args], spawnOptions);
  const status = result.status ?? 1;
  const truncated = (result.error as NodeJS.ErrnoException | undefined)?.code === "ENOBUFS";

  if (result.error && !truncated) throw result.error;
  if (status !== 0 && !options.allowFailure && !truncated) {
    throw new Error((result.stderr || result.error?.message || "Git command failed").trim());
  }

  return { stdout: result.stdout || "", stderr: result.stderr || "", status, truncated };
}

export function gitOutput(args: readonly string[], options: GitRunOptions = {}): string {
  return runGit(args, options).stdout.trim();
}
