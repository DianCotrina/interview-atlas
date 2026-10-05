/** @param {string} source @param {string} file @returns {string[]} */
export function extractCsharpFences(source, file) {
  const aliases = new Set(["csharp", "cs", "c#"]);
  const otherLanguages = new Set(["go", "typescript", "ts", "javascript", "js", "json", "sql", "sh", "bash", "text", "plaintext", "mermaid", "html", "css", "python", "c", "cpp"]);
  const lines = source.split(/\r?\n/);
  const result = [];
  for (let index = 0; index < lines.length; index++) {
    const opener = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(lines[index]);
    if (!opener) {
      if (/^\s*(?:>\s*|[-+*]\s+|\d+[.)]\s+)*(`{3,}|~{3,})/.test(lines[index]))
        throw new Error(`${file}: flatten nested/deeply indented fences for sample verification`);
      continue;
    }
    const language = opener[3].trim().split(/\s+/)[0].toLowerCase();
    if (!aliases.has(language) && !otherLanguages.has(language))
      throw new Error(`${file}: label each code fence with a recognized language; got '${language}'`);
    const closing = new RegExp(`^ {0,3}${opener[2][0]}{${opener[2].length},}\\s*$`);
    const body = [];
    index++;
    while (index < lines.length && !closing.test(lines[index])) {
      body.push(lines[index].replace(new RegExp(`^ {0,${opener[1].length}}`), ""));
      index++;
    }
    if (index >= lines.length) throw new Error(`${file}: unclosed code fence`);
    if (aliases.has(language)) result.push(body.join("\n").trimEnd());
  }
  return result;
}
