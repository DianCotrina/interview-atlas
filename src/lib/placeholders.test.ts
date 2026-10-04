import { expect, it } from "vitest";
import { splitPlaceholders } from "./placeholders";
it("preserves multiline placeholders and neighboring source text", () => {
  expect(
    splitPlaceholders("Before [COMPLETAR: número de jobs\n migrados] after"),
  ).toEqual([
    { kind: "text", text: "Before " },
    { kind: "placeholder", text: "[COMPLETAR: número de jobs\n migrados]" },
    { kind: "text", text: " after" },
  ]);
});
it("recognizes every placeholder and preserves an incomplete one as plain text", () => {
  const source = "[COMPLETAR: uno] [COMPLETAR: dos] [COMPLETAR: open";
  const tokens = splitPlaceholders(source);
  expect(tokens.filter((t) => t.kind === "placeholder")).toHaveLength(2);
  expect(tokens.map((t) => t.text).join("")).toBe(source);
});
