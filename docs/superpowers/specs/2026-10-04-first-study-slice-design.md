# First study slice — design for Diego's review

Date: 2026-10-04. Status: proposed; implementation has not started.

## Intended outcome

Diego can open a concept, understand the reminder in two minutes, practice an English
interview explanation, and record a self-assessment. The repo also demonstrates design
choices he can defend in interviews. This first slice starts Phase 1; it does not
complete the whole phase.

## Decisions Diego has already selected

- Next.js + TypeScript frontend and a Go API from the first version.
- Markdown concept pages built into static pages; reading does not depend on the API.
- Go owns persistent study progress in PostgreSQL.
- Review-attempt history rather than only the latest mutable state.
- AI code review is study material and a checklist.
- A public personal GitHub repository at `DianCotrina/interview-atlas`.

## First usable scope

1. Next.js scaffold with strict TypeScript, ESLint, Vitest, and static export.
2. A build-time Markdown/frontmatter pipeline with stable concept identifiers.
3. A searchable catalog and readable concept pages. Initial seed pages: Big O, the
   hidden loop, List vs HashSet vs Dictionary, problem framing, and the Airflow STAR
   story. Include the proposed AI-review page below. Add the remaining seed pages in
   subsequent Phase 1 tasks.
4. Original Spanish study wording and English interview lines, with visible amber
   `[COMPLETAR: ...]` placeholders. Never infer experience metrics.
5. In-page practice questions: reveal the supplied answer, then self-grade with
   "knew it", "hesitated", or "didn't know". Questions without a supplied answer do
   not get an assessment control.
6. Go HTTP API, PostgreSQL schema, and integration tests for recording and retrieving
   attempts. Local development uses a PostgreSQL Docker Compose service.
7. README, environment examples, small Conventional Commits, and a Claude review of
   the final diff before the implementation handoff.

The catalog is the first screen. Concept pages place the summary and English line
above details. Navigation shows sections containing loaded pages. The reading surface
uses a restrained light theme, visible focus states, responsive layout, and system
fonts. No decorative imagery is needed for this slice.

## Proposed attempt granularity — needs Diego's review

| Option | Benefit | Trade-off |
| --- | --- | --- |
| Per question, proposed for this slice | History matches the spec's future question-level scheduler | Each question needs a stable identifier independent of its text |
| Per concept | Smaller model and UI | Later question-level scheduling needs new history or a migration rule |

Approving this design selects the per-question proposal. Existing drill text remains
unchanged. Question IDs are explicit metadata, not hashes of mutable question text.
Concept filenames/IDs are stable even if display titles change.

## Proposed storage and HTTP contract

These are reviewable details of the selected attempt-history approach, not additional
decisions assumed to be accepted.

- One append-only `review_attempts` table: `attempt_id` (UUID primary key),
  `concept_id`, `question_id`, `grade`, and server-assigned UTC `created_at`.
- Grades are `knew-it`, `hesitated`, and `did-not-know`, validated in both HTTP and SQL.
- `POST /api/attempts` accepts the client-generated attempt ID, concept ID, question
  ID, and grade. The attempt ID also supplies retry deduplication.
- First insertion returns 201. Repeating the same ID and payload returns the existing
  attempt with 200. Reusing an ID with a different payload returns 409.
- A database uniqueness constraint enforces deduplication, including concurrent
  requests. Do not use a check-then-insert race.
- `GET /api/progress` returns per-question attempt counts and latest grade/time,
  grouped with concept IDs. Progress is derived from the history; there is no separate
  mutable progress table in this slice.
- Invalid requests return 400. Database unavailability returns 503 and a clear error;
  internal database details stay out of the HTTP response.
- These are transport/storage records. The later Domain/Application exercises,
  repository abstractions, and scheduling rules remain Diego's work.

If the API fails, the UI keeps the concept and answer visible and offers an explicit
retry. It keeps the same attempt ID for that assessment's retries in the current
session. It does not claim the grade was saved until confirmed. No automatic retry
loop, durable offline queue, or synchronization policy is added in this slice.

## Boundaries and non-goals

- The Next.js build never connects to PostgreSQL or the Go API.
  This uses Next.js's documented [static export](https://nextjs.org/docs/app/guides/static-exports).
- Go never renders concept pages. Markdown remains the content source of truth.
- PostgreSQL and the unauthenticated development API bind to loopback locally.
  Publishing the source repo does not publish the progress service. Hosting and
  authentication need Diego's later decisions before any public API deployment.
- No due dates, Leitner boxes, weakest-concept ranking, or scheduled drill mode until
  Diego implements and explains his scheduler.
- No visualizers yet: the two original HTML files mentioned in the spec are absent.
- No algorithm function samples are added in this slice. The C# sample-test project
  becomes required when subsequent pages add executable C# snippets; the .NET SDK is
  currently not available in this environment.
- No changes to `docs/CONTENT_SEED.md`, no invented metrics, no external AI calls,
  and no scaffolding of later AWS phases.

## Dependencies and alternatives

- Next.js/React are Diego's choice; Vite was the original alternative.
- `gray-matter` parses frontmatter instead of maintaining a custom YAML parser.
- `react-markdown` renders Markdown instead of maintaining a custom renderer; raw
  HTML stays disabled.
- Vitest tests content parsing/search; Go's standard test and HTTP packages cover
  the API. No additional HTTP framework or ORM is needed.
- `pgx` supplies PostgreSQL access/pooling; `database/sql` with a PostgreSQL driver
  is the alternative. Use explicit SQL for the small attempt-history schema.
  Reference: [pgx documentation](https://pkg.go.dev/github.com/jackc/pgx/v5).
- Docker Compose runs the chosen PostgreSQL service locally; installing and managing
  a host PostgreSQL service is the alternative.

## Proposed new study copy — AI code review

Title: **Revisar código generado por IA**. Section: **AI Engineering**.

Summary: "Trata la salida de la IA como una propuesta de cambio. Tu responsabilidad
es comprobar que cumple el requisito, que maneja los casos límite y que puedes
explicar sus decisiones."

Checklist:

1. "Reformula el requisito y revisa si el código resuelve ese problema."
2. "Busca casos límite: entrada vacía, duplicados, errores y límites de tamaño."
3. "Explica tiempo y espacio; busca bucles escondidos y llamadas innecesarias."
4. "Revisa validación, manejo de errores y datos sensibles."
5. "Ejecuta pruebas que puedan detectar una solución incorrecta."
6. "Lee el diff completo y comprueba que puedes defenderlo sin ayuda de la IA."

Interview line: "I use AI to propose implementations, then I review correctness,
edge cases, complexity, and tests before I take ownership of the change."

Practice question: "¿Por qué no basta con que el código generado por IA compile?"
Answer: "Compilar verifica tipos y sintaxis, pero no demuestra que el código cumpla
el requisito ni que maneje los casos límite."

Do not silently correct disputed technical simplifications in existing seed pages.
Content corrections and missing interview lines should be proposed separately.

## Verification and first-slice acceptance

- `npm run build` exports the initial catalog and every included concept route.
- `npm test` and TypeScript checks pass, including malformed frontmatter and search.
- `go test ./...` passes; real PostgreSQL integration tests verify persistence across
  API instances, duplicate/concurrent requests, and conflicting payloads.
- Read a concept and reveal its answer with the API stopped; reading still works.
- Verify keyboard navigation, focus, mobile layout, and amber placeholders visually.
- Inspect the source diff to verify `[DIEGO]` implementations and seed copy are intact.
- The first-slice handoff states explicitly which Phase 1 tasks remain.

## Interviewer pushback for Diego

PostgreSQL and append-only history add operational work for a one-user app. Which
learning or product requirement justifies that cost? If an insert succeeds but its
HTTP response is lost, how should the retry avoid counting two reviews?

## What changed and why

The selected stack is now Next.js, TypeScript, and Go instead of Vite/.NET.
Static content keeps reading independent of progress-service availability.
PostgreSQL and attempt history are Diego's selected learning trade-offs.
The first slice records assessments without taking over his scheduler exercise.
