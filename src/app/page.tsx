import { loadConcepts } from "../lib/content";
import { ConceptCatalog } from "../components/ConceptCatalog";

export default function HomePage() {
  const concepts = loadConcepts();
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
          Tu espacio de preparación
        </div>
        <h1>Conceptos para la entrevista.</h1>
        <p>Busca una idea, repasa el porqué y practícala en voz alta.</p>
      </header>
      <div className="study-principle">
        <span className="principle-icon" aria-hidden="true">
          ↳
        </span>
        <div>
          <strong>Que puedas explicarlo importa tanto como resolverlo.</strong>
          <p>
            Reformula, aclara las reglas, compara enfoques y di tiempo{" "}
            <em>y</em> espacio.
          </p>
        </div>
      </div>
      <ConceptCatalog concepts={entries} />
      <footer className="page-footer">
        Pequeños repasos. Respuestas más claras.<span>Interview Atlas</span>
      </footer>
    </>
  );
}
