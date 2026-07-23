export function canSend(subject: string): boolean {
  return subject.trim().length > 0;
}

export function buildMailtoUrl(args: { to: string; subject: string; body: string }): string {
  const parts: string[] = [];
  if (args.subject) parts.push(`subject=${encodeURIComponent(args.subject)}`);
  if (args.body) parts.push(`body=${encodeURIComponent(args.body)}`);
  return parts.length > 0 ? `mailto:${args.to}?${parts.join("&")}` : `mailto:${args.to}`;
}
