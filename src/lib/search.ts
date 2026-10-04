import type { CatalogEntry } from "./content";
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es");
export function filterConcepts<T extends CatalogEntry>(
  concepts: readonly T[],
  query: string,
  section?: string,
): T[] {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  return concepts.filter((concept) => {
    const searchable = normalize(`${concept.title} ${concept.tags.join(" ")}`);
    return (
      (!section || concept.section === section) &&
      terms.every((term) => searchable.includes(term))
    );
  });
}
