"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CatalogEntry } from "../lib/content";

export const sectionLabels: Record<string, string> = {
  Fundamentals: "Fundamentos",
  Patterns: "Patrones",
  Behavioral: "Historias STAR",
  "AI Engineering": "AI code review",
};
const sectionOrder = [
  "Fundamentals",
  "Patterns",
  "Behavioral",
  "AI Engineering",
];
export function Sidebar({ concepts }: { concepts: CatalogEntry[] }) {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <Link href="/" className="brand" aria-label="Interview Atlas, inicio">
        <span className="brand-mark" aria-hidden="true">
          a
        </span>
        <span>
          Interview
          <br />
          <strong>Atlas</strong>
        </span>
      </Link>
      <p className="sidebar-caption">
        Tu biblioteca para pensar
        <br />y responder con claridad.
      </p>
      <nav aria-label="Navegación de estudio">
        <Link
          href="/"
          className={`library-link ${pathname === "/" ? "selected" : ""}`}
          aria-current={pathname === "/" ? "page" : undefined}
        >
          <span aria-hidden="true">▦</span> Todos los conceptos
        </Link>
        {sectionOrder
          .filter((section) => concepts.some((c) => c.section === section))
          .map((section) => (
            <div className="nav-group" key={section}>
              <p className="nav-group-label">
                {sectionLabels[section] ?? section}
              </p>
              {concepts
                .filter((c) => c.section === section)
                .map((concept) => {
                  const active =
                    pathname.replace(/\/$/, "") === `/concepts/${concept.id}`;
                  return (
                    <Link
                      className={`concept-nav ${active ? "selected" : ""}`}
                      href={`/concepts/${concept.id}/`}
                      key={concept.id}
                      aria-current={active ? "page" : undefined}
                    >
                      <span
                        className={`nav-dot ${concept.status}`}
                        aria-hidden="true"
                      />
                      {concept.title}
                    </Link>
                  );
                })}
            </div>
          ))}
      </nav>
      <div className="sidebar-note">
        <span aria-hidden="true">↗</span>
        <p>
          Primero explica el enfoque.
          <br />
          Después escribe el código.
        </p>
      </div>
    </aside>
  );
}
