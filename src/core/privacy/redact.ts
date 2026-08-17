const RULES: RegExp[] = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  /\b(?:gsk|sk-proj|sk-ant|ghp|github_pat)_[A-Za-z0-9_-]{12,}\b/g,
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
  /\b(?:password|passwd|secret|token|api[_-]?key)\s*[:=]\s*(["']?)[^\s"']{6,}\1/gi,
  /\b(?:https?|postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s:@/]+:[^\s@/]+@/gi,
];

export function redactSensitiveText(input: string): { text: string; redactions: number } {
  let text = input;
  let redactions = 0;
  for (const rule of RULES) {
    text = text.replace(rule, (match) => {
      redactions += 1;
      if (match.includes("://") && match.endsWith("@")) {
        return match.replace(/\/\/[^@]+@/, "//[REDACTED]@");
      }
      const separator = match.match(/^([^:=]+[:=]\s*)/);
      return separator ? `${separator[1]}[REDACTED]` : "[REDACTED]";
    });
  }
  return { text, redactions };
}
