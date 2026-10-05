import { notFound } from "next/navigation";
import { loadLocalizedConcepts } from "@/lib/content";
import { isLocale } from "@/lib/locale";
import { messages } from "@/lib/messages";
import { ConceptCatalog } from "@/components/ConceptCatalog";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const text = messages[locale].home;
  const concepts = loadLocalizedConcepts(locale);
  const entries = concepts.map(
    ({ id, title, section, tags, status, summary }) => ({
      id,
      title,
      section,
      tags,
      status,
      summary,
    }),
  );
  return (
    <>
      <header className="page-header">
        <div className="page-context">
          <span className="context-dot" />
          {text.context}
        </div>
        <h1>{text.title}</h1>
        <p>{text.intro}</p>
      </header>
      <div className="study-principle">
        <span className="principle-icon" aria-hidden="true">
          ↳
        </span>
        <div>
          <strong>{text.principle}</strong>
          <p>{text.advice}</p>
        </div>
      </div>
      <ConceptCatalog concepts={entries} locale={locale} />
      <footer className="page-footer">
        {text.footer}
        <span>Interview Atlas</span>
      </footer>
    </>
  );
}
