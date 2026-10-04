import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadConcepts } from "../../../lib/content";
import { ConceptMarkdown } from "../../../components/ConceptMarkdown";
import { QuestionPractice } from "../../../components/QuestionPractice";

export function generateStaticParams() {
  return loadConcepts().map((concept) => ({ id: concept.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const concept = loadConcepts().find((value) => value.id === id);
  return {
    title: concept?.title ?? "Concepto no encontrado",
    description: concept?.summary,
  };
}
export default async function ConceptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const concepts = loadConcepts();
  const concept = concepts.find((value) => value.id === id);
  if (!concept) notFound();
  const related = concepts.filter(
    (value) => value.section === concept.section && value.id !== concept.id,
  );
  return (
    <article className="concept-page">
      <Link href="/" className="back-link">
        ‹ Todos los conceptos
      </Link>
      <header className="concept-header">
        <p className="concept-section">{concept.section}</p>
        <h1>{concept.title}</h1>
      </header>
      <div className="reminder-grid">
        <section className="quick-reminder" aria-labelledby="summary-heading">
          <h2 id="summary-heading">La idea en un minuto</h2>
          <ConceptMarkdown body={concept.summary} />
        </section>
        <section className="interview-box" aria-labelledby="interview-heading">
          <h2 id="interview-heading">
            <span aria-hidden="true">“</span>How to say it in the interview
          </h2>
          <p lang="en">{concept.interviewLine}</p>
        </section>
      </div>
      <details className="concept-details" open>
        <summary>Explicación completa</summary>
        <ConceptMarkdown body={concept.body} />
      </details>
      <QuestionPractice
        conceptId={concept.id}
        questions={concept.drillQuestions}
      />
      {related.length > 0 && (
        <section className="related">
          <h2>Conecta esta idea</h2>
          <div>
            {related.map((value) => (
              <Link href={`/concepts/${value.id}/`} key={value.id}>
                {value.title}
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <footer className="page-footer">
        Explica el porqué, no solo el código.
        <Link href="/">Volver a la biblioteca</Link>
      </footer>
    </article>
  );
}
