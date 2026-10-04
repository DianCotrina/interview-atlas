export type TextToken = { kind: "text" | "placeholder"; text: string };
export function splitPlaceholders(text: string): TextToken[] {
  const tokens: TextToken[] = [];
  let cursor = 0;
  for (const match of text.matchAll(/\[COMPLETAR:[\s\S]*?\]/g)) {
    if (match.index > cursor)
      tokens.push({ kind: "text", text: text.slice(cursor, match.index) });
    tokens.push({ kind: "placeholder", text: match[0] });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length)
    tokens.push({ kind: "text", text: text.slice(cursor) });
  return tokens;
}
