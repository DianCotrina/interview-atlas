export type BoardRow = { key: string; value: string };
export type Decision = "create" | "increment" | "append" | "add" | "stop" | "continue" | "reject" | "match" | "mismatch";
export type Reason = "new-key" | "known-key" | "new-group" | "known-group" | "unseen" | "repeated" | "equal-length" | "unequal-length" | "same-frequency" | "different-frequency" | "empty-anagrams";
export type TraceStep = { item: string; before: BoardRow[]; after: BoardRow[]; expected: Decision; choices: Decision[]; reason: Reason };

export function countingTrace(values: readonly string[]): TraceStep[] {
  const counts = new Map<string, number>();
  return values.map((item) => {
    const before = countRows(counts);
    const exists = counts.has(item);
    counts.set(item, (counts.get(item) ?? 0) + 1);
    return { item, before, after: countRows(counts), expected: exists ? "increment" : "create",
      choices: ["create", "increment"], reason: exists ? "known-key" : "new-key" };
  });
}
export function groupingTrace(records: readonly (readonly [string, string])[]): TraceStep[] {
  const groups = new Map<string, string[]>();
  const rows = () => [...groups].map(([key, values]) => ({ key, value: `[${values.join(", ")}]` }));
  return records.map(([key, value]) => {
    const before = rows();
    const exists = groups.has(key);
    groups.set(key, [...(groups.get(key) ?? []), value]);
    return { item: `${key}: ${value}`, before, after: rows(), expected: exists ? "append" : "create",
      choices: ["create", "append"], reason: exists ? "known-group" : "new-group" };
  });
}
export function duplicateTrace(values: readonly string[]): TraceStep[] {
  const seen = new Set<string>();
  const rows = () => [...seen].map((key) => ({ key, value: "✓" }));
  const steps: TraceStep[] = [];
  for (const item of values) {
    const before = rows();
    const repeated = seen.has(item);
    if (!repeated) seen.add(item);
    steps.push({ item, before, after: repeated ? [...rows(), { key: "return", value: item }] : rows(),
      expected: repeated ? "stop" : "add", choices: ["add", "stop"], reason: repeated ? "repeated" : "unseen" });
    if (repeated) break;
  }
  return steps;
}
export function anagramTrace(a: string, b: string): TraceStep[] {
  const countsA = new Map<string, number>();
  const countsB = new Map<string, number>();
  const lengths = [{ key: "a.Length", value: String(a.length) }, { key: "b.Length", value: String(b.length) }];
  const rows = () => [...lengths, ...countRows(countsA, "a:"), ...countRows(countsB, "b:")];
  const equalLength = a.length === b.length;
  const steps: TraceStep[] = [{ item: `${JSON.stringify(a)} / ${JSON.stringify(b)}`, before: rows(),
    after: equalLength ? rows() : [...rows(), { key: "return", value: "false" }],
    expected: equalLength ? "continue" : "reject", choices: ["continue", "reject"],
    reason: equalLength ? "equal-length" : "unequal-length" }];
  if (!equalLength) return steps;
  for (const [name, input, counts] of [["a", a, countsA], ["b", b, countsB]] as const) {
    // Index UTF-16 units, matching C# foreach(char), rather than JS code points.
    for (let index = 0; index < input.length; index++) {
      const item = input[index];
      const before = rows();
      const exists = counts.has(item);
      counts.set(item, (counts.get(item) ?? 0) + 1);
      steps.push({ item: `${name}[${index}] = ${JSON.stringify(item)}`, before, after: rows(),
        expected: exists ? "increment" : "create", choices: ["create", "increment"],
        reason: exists ? "known-key" : "new-key" });
    }
  }
  if (!countsA.size) {
    steps.push({ item: "a / b", before: rows(), after: [...rows(), { key: "return", value: "true" }],
      expected: "match", choices: ["match", "mismatch"], reason: "empty-anagrams" });
  }
  for (const [key, count] of countsA) {
    const matches = countsB.get(key) === count;
    const last = key === [...countsA.keys()].at(-1);
    const result = !matches ? "false" : last ? "true" : undefined;
    steps.push({ item: `${JSON.stringify(key)}: a=${count}, b=${countsB.get(key) ?? 0}`,
      before: rows(), after: result ? [...rows(), { key: "return", value: result }] : rows(),
      expected: matches ? "match" : "mismatch", choices: ["match", "mismatch"],
      reason: matches ? "same-frequency" : "different-frequency" });
    if (!matches) break;
  }
  return steps;
}

function countRows(counts: Map<string, number>, prefix = ""): BoardRow[] {
  return [...counts].map(([key, count]) => ({ key: `${prefix}${key}`, value: String(count) }));
}
