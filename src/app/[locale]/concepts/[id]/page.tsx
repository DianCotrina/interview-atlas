import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadLocalizedConcepts } from "@/lib/content";
import { isLocale, localeHref } from "@/lib/locale";
import { messages } from "@/lib/messages";
import { ConceptMarkdown } from "@/components/ConceptMarkdown";
import { QuestionPractice } from "@/components/QuestionPractice";
import { MissionInvitation } from "@/components/MissionInvitation";
import { missionIds } from "@/lib/collection-game";

export const dynamicParams = false;
export function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return [];
  return loadLocalizedConcepts(params.locale).map((concept) => ({
    id: concept.id,
  }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  if (!isLocale(locale)) notFound();
  const concept = loadLocalizedConcepts(locale).find(
    (value) => value.id === id,
  );
  return {
    title: concept?.title ?? messages[locale].concept.notFound,
    description: concept?.summary,
    alternates: {
      languages: {
        es: localeHref("es", `/concepts/${id}/`),
        en: localeHref("en", `/concepts/${id}/`),
      },
    },
  };
}
export default async function ConceptPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  if (!isLocale(locale)) notFound();
  const text = messages[locale].concept;
  const sectionLabels: Record<string, string> = messages[locale].sections;
  const concepts = loadLocalizedConcepts(locale);
  const concept = concepts.find((value) => value.id === id);
  if (!concept) notFound();
  const related = concepts.filter(
    (value) => value.section === concept.section && value.id !== concept.id,
  );
  return (
    <article className="concept-page">
      <Link href={localeHref(locale)} className="back-link">
        ‹ {text.back}
      </Link>
      <header className="concept-header">
        <p className="concept-section">
          {sectionLabels[concept.section] ?? concept.section}
        </p>
        <h1>{concept.title}</h1>
      </header>
      <div className="reminder-grid">
        <section className="quick-reminder" aria-labelledby="summary-heading">
          <h2 id="summary-heading">{text.summary}</h2>
          <ConceptMarkdown body={concept.summary} locale={locale} />
        </section>
        <section className="interview-box" aria-labelledby="interview-heading">
          <h2 id="interview-heading" lang="en">
            <span aria-hidden="true">“</span>
            {text.interview}
          </h2>
          <p lang="en">{concept.interviewLine}</p>
        </section>
      </div>
      {missionIds.some((id) => id === concept.id) && <MissionInvitation locale={locale} compact />}
      <details className="concept-details" open>
        <summary>{text.details}</summary>
        <ConceptMarkdown body={concept.body} locale={locale} />
      </details>
      <QuestionPractice
        conceptId={concept.id}
        questions={concept.drillQuestions}
        locale={locale}
      />
      {related.length > 0 && (
        <section className="related">
          <h2>{text.related}</h2>
          <div>
            {related.map((value) => (
              <Link
                href={localeHref(locale, `/concepts/${value.id}/`)}
                key={value.id}
              >
                {value.title}
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <footer className="page-footer">
        {text.footer}
        <Link href={localeHref(locale)}>{text.library}</Link>
      </footer>
    </article>
  );
}
