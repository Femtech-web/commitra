import { spawnSync } from "child_process";
import path from "path";


function stripBanner(o: string) {
  if (!o) return o;

  return o
    // remove GitHub metadata warning block
    .replace(/Commitra will still run[\s\S]+?detected\.\s*/gi, "")
    // remove ASCII art block
    .replace(/_{4,}[\s\S]+?v\d+\.\d+\.\d+\)\s*/gi, "")
    .trim();
}



export function runDistCli(args: string[], opts: { cwd?: string } = {}) {
  const dist = path.resolve(process.cwd(), "dist", "index.js");

  const res = spawnSync(process.execPath, [dist, ...args], {
    cwd: opts.cwd,
    encoding: "utf8",
    env: { ...process.env },
  });

  return {
    ...res,
    stdout: stripBanner(res.stdout),
    stderr: stripBanner(res.stderr),
  };
}

export function runSrcCli(args: string[], opts: { cwd?: string } = {}) {
  const src = path.resolve(process.cwd(), "src", "index.ts");

  const res = spawnSync("tsx", [src, ...args], {
    cwd: opts.cwd,
    encoding: "utf8",
    env: { ...process.env },
  });

  return {
    ...res,
    stdout: stripBanner(res.stdout),
    stderr: stripBanner(res.stderr),
  };
}

