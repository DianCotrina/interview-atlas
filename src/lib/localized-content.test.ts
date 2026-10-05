import { afterEach, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadLocalizedConcepts } from "./content";
import { filterConcepts } from "./search";

const source = `---
id: sample
title: Sample
section: Fundamentals
tags: [hashmap]
status: learned
summary: Summary.
interviewLine: Explain the trade-off.
drillQuestions:
  - id: first
    question: Question?
    answer: Answer.
---
Study body. [COMPLETAR: real job count]`;
const roots: string[] = [];
function fixture(english = source) {
  const root = mkdtempSync(join(tmpdir(), "atlas-locales-"));
  roots.push(root);
  for (const locale of ["es", "en"]) {
    mkdirSync(join(root, locale));
    writeFileSync(
      join(root, locale, "sample.md"),
      locale === "en" ? english : source,
    );
  }
  return root;
}
afterEach(() =>
  roots
    .splice(0)
    .forEach((root) => rmSync(root, { recursive: true, force: true })),
);

it("loads complete translations with the same progress identities", () => {
  const es = loadLocalizedConcepts("es");
  const en = loadLocalizedConcepts("en");
  expect(en).toHaveLength(6);
  expect(en.flatMap((c) => c.drillQuestions)).toHaveLength(11);
  expect(en.map((c) => [c.id, c.drillQuestions.map((q) => q.id)])).toEqual(
    es.map((c) => [c.id, c.drillQuestions.map((q) => q.id)]),
  );
  expect(en.find((c) => c.id === "big-o")?.body).toContain("time *and* space");
  expect(es.find((c) => c.id === "airflow-migration")?.body).toContain(
    "plataforma",
  );
  expect(filterConcepts(en, "complexity").map((c) => c.id)).toContain("big-o");
  expect(filterConcepts(en, "hashmap").map((c) => c.id)).toContain(
    "choosing-collections",
  );
});

it.each([
  ["concept ID", source.replace("id: sample", "id: another")],
  ["question ID", source.replace("id: first", "id: changed")],
  ["status", source.replace("status: learned", "status: pending")],
  ["section", source.replace("section: Fundamentals", "section: Patterns")],
  [
    "interview sentence",
    source.replace("Explain the trade-off.", "Different claim."),
  ],
  ["placeholder", source.replace("[COMPLETAR: real job count]", "42 jobs")],
])("rejects translation drift in %s", (_label, english) => {
  expect(() => loadLocalizedConcepts("en", fixture(english))).toThrow(
    /translation/i,
  );
});

it("rejects missing translations instead of mixing languages", () => {
  const root = fixture();
  rmSync(join(root, "en", "sample.md"));
  expect(() => loadLocalizedConcepts("es", root)).toThrow(/translation/i);
});

it("rejects extra translated concepts instead of creating separate histories", () => {
  const root = fixture();
  writeFileSync(
    join(root, "en", "extra.md"),
    source.replace("id: sample", "id: extra"),
  );
  expect(() => loadLocalizedConcepts("en", root)).toThrow(/translation/i);
});
