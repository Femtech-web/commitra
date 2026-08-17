import { spawnSync } from "node:child_process";

export function copyToClipboard(value: string): void {
  const command = process.platform === "darwin" ? "pbcopy" : process.platform === "win32" ? "clip" : "xclip";
  const args = process.platform === "linux" ? ["-selection", "clipboard"] : [];
  const result = spawnSync(command, args, { input: value, encoding: "utf8", shell: false });
  if (result.error || result.status !== 0) {
    throw new Error(`Clipboard command failed. Install ${process.platform === "linux" ? "xclip" : command} or omit --copy.`);
  }
}
