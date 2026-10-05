"use client";
import { useState } from "react";
import Link from "next/link";
import type { CatalogEntry } from "../lib/content";
import { filterConcepts } from "../lib/search";
import { localeHref, type Locale } from "../lib/locale";
import { messages } from "../lib/messages";
const sectionOrder = [
  "Fundamentals",
  "Patterns",
  "Behavioral",
  "AI Engineering",
];
export function ConceptCatalog({
  concepts,
  locale,
}: {
  concepts: CatalogEntry[];
  locale: Locale;
}) {
  const text = messages[locale].catalog;
  const sectionLabels: Record<string, string> = messages[locale].sections;
  const statusLabels = messages[locale].statuses;
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<string>();
  const sections = sectionOrder.filter((value) =>
    concepts.some((c) => c.section === value),
  );
  const visible = filterConcepts(concepts, query, section).sort(
    (a, b) =>
      sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section) ||
      a.title.localeCompare(b.title, locale),
  );
  return (
    <>
      <div className="catalog-tools">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">{text.searchLabel}</span>
          <input
            type="search"
            placeholder={text.placeholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="section-filters" aria-label={text.filter}>
          <button
            className={!section ? "active" : ""}
            aria-pressed={!section}
            onClick={() => setSection(undefined)}
          >
            {text.all}
          </button>
          {sections.map((value) => (
            <button
              key={value}
              className={section === value ? "active" : ""}
              aria-pressed={section === value}
              onClick={() => setSection(value)}
            >
              {sectionLabels[value] ?? value}
            </button>
          ))}
        </div>
      </div>
      <div className="list-heading">
        <h2>{text.heading}</h2>
        <span aria-live="polite">
          {visible.length} {visible.length === 1 ? text.singular : text.plural}
        </span>
      </div>
      <ul className="concept-list">
        {visible.map((concept) => (
          <li key={concept.id}>
            <Link
              href={localeHref(locale, `/concepts/${concept.id}/`)}
              className={`concept-row section-${concept.section.toLowerCase().replaceAll(" ", "-")}`}
            >
              <div className="row-content">
                <div className="row-meta">
                  <span>
                    {sectionLabels[concept.section] ?? concept.section}
                  </span>
                  <span className={`status ${concept.status}`}>
                    {statusLabels[concept.status]}
                  </span>
                </div>
                <h3>{concept.title}</h3>
                <p>{concept.summary}</p>
                <div className="tags">
                  {concept.tags.slice(0, 3).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
              <span className="row-open" aria-hidden="true">
                ↗
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {visible.length === 0 && (
        <div className="empty-search">
          <h3>{text.emptyTitle}</h3>
          <p>{text.emptyAdvice}</p>
          <button
            className="secondary-button"
            onClick={() => {
              setQuery("");
              setSection(undefined);
            }}
          >
            {text.reset}
          </button>
        </div>
      )}
    </>
  );
}
