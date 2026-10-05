import { readdirSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const root = fileURLToPath(new URL("../", import.meta.url));
function snippets(locale) {
  const result = new Map();
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.name.endsWith(".md")) {
        const { data, content } = matter(readFileSync(path, "utf8"));
        const blocks = [...content.matchAll(/^```csharp\r?\n([\s\S]*?)^```\s*$/gm)]
          .map((match) => match[1].trimEnd());
        if (blocks.length) result.set(data.id, blocks);
      }
    }
  }
  visit(join(root, "content", locale));
  return result;
}
const spanish = snippets("es");
const english = snippets("en");
const registered = ["anagrams", "dictionary-counting", "first-duplicate", "grouping"];
if (JSON.stringify([...spanish.keys()].sort()) !== JSON.stringify(registered))
  throw new Error("Every C# concept needs sample tests: update the registered sample list");
if (JSON.stringify([...english.keys()].sort()) !== JSON.stringify(registered))
  throw new Error("English C# samples must match Spanish samples");
for (const [id, blocks] of spanish) {
  if (JSON.stringify(blocks) !== JSON.stringify(english.get(id)))
    throw new Error(`${id}: translated C# code drifted from its tested source`);
  if (blocks.length !== 1) throw new Error(`${id}: register each new sample explicitly`);
}
const directory = join(root, "samples", "InterviewAtlas.Samples.Tests", "Generated");
mkdirSync(directory, { recursive: true });
writeFileSync(join(directory, "StudySamples.g.cs"),
  "// Generated from Markdown. Do not edit.\n#nullable enable\nnamespace InterviewAtlas.Samples;\n" +
  "public partial class StudySamples\n{\n" +
  registered.map((id) => `// Source: content/es/patterns/${id}.md\n${spanish.get(id)[0]}`).join("\n\n") +
  "\n}\n");
console.log(`Generated ${registered.length} displayed C# samples.`);
