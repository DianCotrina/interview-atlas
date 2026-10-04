import { expect, it } from "vitest";
import { filterConcepts } from "./search";
import { loadConcepts } from "./content";
it("finds the advertised examples in the real study catalog", () => {
  const actual = loadConcepts();
  expect(filterConcepts(actual, "complejidad").map((c) => c.id)).toContain(
    "big-o",
  );
  expect(filterConcepts(actual, "hashmap").map((c) => c.id)).toContain(
    "choosing-collections",
  );
});
const concepts = [
  {
    id: "one",
    title: "Complejidad y colecciones",
    section: "Fundamentals",
    tags: ["hashmap", "diccionario"],
    status: "learned" as const,
    summary: "Summary",
  },
  {
    id: "two",
    title: "Revisión de código",
    section: "AI Engineering",
    tags: ["ai"],
    status: "pending" as const,
    summary: "Summary",
  },
];
it("matches titles without accent or case sensitivity", () => {
  expect(filterConcepts(concepts, "revision").map((c) => c.id)).toEqual([
    "two",
  ]);
});
it("matches tags and requires all search terms", () => {
  expect(
    filterConcepts(concepts, "HASHMAP complejidad").map((c) => c.id),
  ).toEqual(["one"]);
  expect(filterConcepts(concepts, "hashmap revision")).toEqual([]);
});
it("combines an exact section filter with search", () => {
  expect(
    filterConcepts(concepts, "", "AI Engineering").map((c) => c.id),
  ).toEqual(["two"]);
  expect(filterConcepts(concepts, "   ")).toEqual(concepts);
});
