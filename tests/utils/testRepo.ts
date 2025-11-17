import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";

export function createTestRepo() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "commitra-int-"));
  execSync("git init -b main", { cwd: tmp });

  // create base commit
  fs.writeFileSync(path.join(tmp, "file.txt"), "hello\n", "utf8");
  execSync("git add .", { cwd: tmp });
  execSync('git commit -m "init"', { cwd: tmp });

  return tmp;
}

export function stageChange(repo: string) {
  fs.writeFileSync(path.join(repo, "file.txt"), "updated\n", "utf8");
  execSync("git add file.txt", { cwd: repo });
}
