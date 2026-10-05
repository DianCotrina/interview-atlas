import { expect, it } from "vitest";
import { countingTrace, groupingTrace, duplicateTrace, anagramTrace } from "./collection-traces";

it("increments existing counts without overwriting other keys", () => {
  const steps = countingTrace(["OK", "WAIT", "OK"]);
  expect(steps.map((s) => s.expected)).toEqual(["create", "create", "increment"]);
  expect(steps[2].before).toEqual([{ key: "OK", value: "1" }, { key: "WAIT", value: "1" }]);
  expect(steps[2].after).toEqual([{ key: "OK", value: "2" }, { key: "WAIT", value: "1" }]);
  expect(countingTrace([])).toEqual([]);
});

it("appends grouping actions in order, including repeated actions", () => {
  const steps = groupingTrace([["Ada", "scan"], ["Lin", "check"], ["Ada", "scan"]]);
  expect(steps.map((s) => s.expected)).toEqual(["create", "create", "append"]);
  expect(steps[2].after).toEqual([{ key: "Ada", value: "[scan, scan]" }, { key: "Lin", value: "[check]" }]);
  expect(groupingTrace([])).toEqual([]);
});

it("stops at the earliest second occurrence, not the earliest original value", () => {
  const steps = duplicateTrace(["A", "B", "B", "A"]);
  expect(steps.map((s) => s.expected)).toEqual(["add", "add", "stop"]);
  expect(steps[2].after).toEqual([{ key: "A", value: "✓" }, { key: "B", value: "✓" }, { key: "return", value: "B" }]);
  expect(duplicateTrace([])).toEqual([]);
  expect(duplicateTrace(["A", "B"]).every((s) => s.expected === "add")).toBe(true);
});

it("rejects extra letters before counting, in either direction", () => {
  for (const [a, b] of [["abc", "abcd"], ["abcd", "abc"]]) {
    const steps = anagramTrace(a, b);
    expect(steps).toHaveLength(1);
    expect(steps[0].expected).toBe("reject");
    expect(steps[0].after.at(-1)).toEqual({ key: "return", value: "false" });
  }
});

it.each([
  ["aab", "aba", "true"],
  ["aab", "abb", "false"],
  ["abc", "abd", "false"],
  ["A", "a", "false"],
  ["", "", "true"],
  ["😀a", "a😀", "true"],
])("compares C# UTF-16 char frequencies for %s / %s", (a, b, result) => {
  expect(anagramTrace(a, b).at(-1)?.after.at(-1)).toEqual({ key: "return", value: result });
});
