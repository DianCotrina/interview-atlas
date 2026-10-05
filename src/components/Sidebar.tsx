"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CatalogEntry } from "../lib/content";
import { localeHref, type Locale } from "../lib/locale";
import { messages } from "../lib/messages";
import { LanguageSelector } from "./LanguageSelector";
import { gameCopy } from "../lib/game-copy";
import { version } from "../../package.json";
const sectionOrder = [
  "Fundamentals",
  "Patterns",
  "Behavioral",
  "AI Engineering",
];
export function Sidebar({
  concepts,
  locale,
}: {
  concepts: CatalogEntry[];
  locale: Locale;
}) {
  const pathname = usePathname();
  const text = messages[locale];
  const sectionLabels: Record<string, string> = text.sections;
  const home = localeHref(locale);
  return (
    <aside className="sidebar">
      <Link href={home} className="brand" aria-label={text.sidebar.home}>
        <span className="brand-mark" aria-hidden="true">
          a
        </span>
        <span>
          Interview
          <br />
          <strong>Atlas</strong>
          <small className="app-version" aria-label={`${text.sidebar.version} ${version}`}>v{version}</small>
        </span>
      </Link>
      <p className="sidebar-caption">{text.sidebar.caption}</p>
      <LanguageSelector locale={locale} />
      <nav aria-label={text.sidebar.navigation}>
        <Link
          href={home}
          className={`library-link ${pathname === home ? "selected" : ""}`}
          aria-current={pathname === home ? "page" : undefined}
        >
          <span aria-hidden="true">▦</span> {text.sidebar.all}
        </Link>
        <Link href={localeHref(locale, "/play/")} className={`library-link ${pathname.replace(/\/$/, "") === `/${locale}/play` ? "selected" : ""}`}
          aria-current={pathname.replace(/\/$/, "") === `/${locale}/play` ? "page" : undefined}>
          <span aria-hidden="true">✦</span> {gameCopy[locale].enter}
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
                    pathname.replace(/\/$/, "") ===
                    `/${locale}/concepts/${concept.id}`;
                  return (
                    <Link
                      className={`concept-nav ${active ? "selected" : ""}`}
                      href={localeHref(locale, `/concepts/${concept.id}/`)}
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
        <p>{text.sidebar.note}</p>
      </div>
    </aside>
  );
}
