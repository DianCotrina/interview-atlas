import { expect, it } from "vitest";
import { extractCsharpFences } from "../../scripts/csharp-fences.mjs";

it.each(["csharp", "cs", "c#"])("extracts the displayed method from a %s fence", (language) => {
  expect(extractCsharpFences(`\`\`\`${language}\nint Count() => 1;\n\`\`\``, "sample.md"))
    .toEqual(["int Count() => 1;"]);
});
it("recognizes tilde/indented fences with info attributes and ignores explicitly different languages", () => {
  const source = "   ~~~~csharp title=sample\n   int Count() => 1;\n   ~~~~~\n\n```go\nfunc main() {}\n```";
  expect(extractCsharpFences(source, "sample.md")).toEqual(["int Count() => 1;"]);
});
it.each(["```\nint Count() => 1;\n```", "```cshap\nint Count() => 1;\n```", "```csharp\nint Count() => 1;", "> ```csharp\n> int Count() => 1;\n> ```"])("rejects unclassifiable or unclosed code instead of skipping coverage", (source) => {
  expect(() => extractCsharpFences(source, "sample.md")).toThrow(/sample.md/);
});
