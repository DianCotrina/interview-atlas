import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConcepts, parseConcept } from "./content";

const valid = `---
id: sample
title: Sample
section: Fundamentals
tags: [hashmap]
status: learned
summary: Summary
interviewLine: Interview sentence.
drillQuestions:
  - id: first
    question: Question?
    answer: Answer.
---
Study body.`;
const directories: string[] = [];
afterEach(() =>
  directories
    .splice(0)
    .forEach((dir) => rmSync(dir, { recursive: true, force: true })),
);

describe("content validation", () => {
  it("keeps supplied drills in metadata without exposing duplicate answers in the body", () => {
    const concepts = loadConcepts();
    expect(concepts.flatMap((c) => c.drillQuestions)).toHaveLength(11);
    for (const concept of concepts) {
      expect(concept.body, concept.id).not.toMatch(/^drill:\s*$/m);
    }
  });
  it("loads a valid page without changing its body", () => {
    expect(parseConcept(valid, "sample.md")).toMatchObject({
      id: "sample",
      body: "Study body.",
      status: "learned",
    });
  });
  it.each([
    ["invalid status", valid.replace("status: learned", "status: invented")],
    ["missing title", valid.replace("title: Sample", "")],
    ["invalid ID", valid.replace("id: sample", "id: Sample Bad")],
    [
      "duplicate question",
      valid.replace(
        "---\nStudy body.",
        "  - id: first\n    question: Another?\n    answer: Yes.\n---\nStudy body.",
      ),
    ],
    ["empty answer", valid.replace("answer: Answer.", "answer: ''")],
  ])("rejects %s and names the source file", (_label, source) => {
    expect(() => parseConcept(source, "broken.md")).toThrow(/broken.md/);
  });
  it("rejects duplicate concept IDs instead of losing one page", () => {
    const dir = mkdtempSync(join(tmpdir(), "atlas-content-"));
    directories.push(dir);
    writeFileSync(join(dir, "one.md"), valid);
    writeFileSync(join(dir, "two.md"), valid);
    expect(() => loadConcepts(dir)).toThrow(/duplicate.*sample/i);
  });
  it("loads the approved six concepts and keeps framing's second arrow", () => {
    const concepts = loadConcepts();
    expect(concepts.map((c) => c.id).sort()).toEqual([
      "ai-code-review",
      "airflow-migration",
      "big-o",
      "choosing-collections",
      "hidden-loop",
      "problem-framing",
    ]);
    expect(
      concepts.find((c) => c.id === "problem-framing")?.drillQuestions[0]
        .answer,
    ).toContain("→ O(n²).");
    const airflow = concepts.find((c) => c.id === "airflow-migration");
    expect(airflow?.body).toContain("[COMPLETAR: número de jobs migrados]");
    expect(airflow?.body).toContain(
      "[COMPLETAR: tiempo aproximado de diagnóstico antes",
    );
    expect(airflow?.drillQuestions).toEqual([]);
  });
});
