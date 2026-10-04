# Interview Atlas first study slice: whole-branch review (c3555f1..HEAD)

The persistence and retry logic is correct, and I found nothing Critical. There is one Important issue, in content structure rather than code, and four Minor ones. I couldn't run any tests or builds because I only had Read, Glob and Grep. Pass/fail results come from the progress ledger, not from me.

## Findings

### Important

**1. The practice answers are already printed on the page, just above the "Revelar respuesta" button.**
- **Where:** the `drill:` lists at the end of these files:
  - `content/fundamentals/big-o.md:40-43`
  - `content/fundamentals/hidden-loop.md:28-30`
  - `content/fundamentals/choosing-collections.md:46-49`
  - `content/patterns/problem-framing.md:34-36`
- **How they show up:** the page renders the body inside `<details open>` (`src/app/concepts/[id]/page.tsx:56-59`), before `QuestionPractice` (`:60`).
- **Reproduce:** open `/concepts/big-o/`. "Explicación completa" is expanded and ends with `¿Qué dos complejidades debes decir siempre? → Tiempo y espacio.` Right below it, the practice card asks you to reveal that same answer and then asks "¿Cómo te fue antes de ver la respuesta?". This happens for 10 of the 11 graded questions.
- **Why it's a defect:**
  - The seed treats `drill:` as structured data (`docs/CONTENT_SEED.md:5-6`), just like `status:`. `status:` was moved into frontmatter and taken out of the body. `drill:` was copied into frontmatter but also left in the body.
  - Because the answer is visible before you grade, the self-grade can't measure recall. That grade is the only data this slice saves.
  - Every question/answer now exists twice. Only the frontmatter copy is tied to the question IDs and the saved history, so the two copies can drift apart.
  - Some answers also appear naturally in the explanation text (for example, step 3 of problem-framing). That is source material, not a defect.
- **Minimal fix:**
  - Delete those four trailing `drill:` blocks. The identical wording is already in each file's frontmatter, so no study text is lost. Because this touches `content/`, Diego needs to approve it.
  - Add a content test that fails if any body contains a line matching `/^drill:\s*$/m`, so a future seed transfer can't bring the duplicate back.

### Minor

**2. The AI review page says "1 preguntas".**
- **Where:** `src/components/QuestionPractice.tsx:152`.
- **Reproduce:** open `/concepts/ai-code-review/`; the heading reads "1 preguntas".
- **Fix:** use the singular for 1, the same way `ProgressSummary.tsx:72` and `:85` already do.

**3. After a 409 conflict, the only button offered is a retry that can never succeed.**
- **Where:**
  - `QuestionPractice.tsx:38-42` (the message) and `:107-113` (the retry button).
  - `assessment-session.ts:43-44` (the state can only go back to idle from "saved").
  - The grade buttons stay disabled (`QuestionPractice.tsx:96`).
- **Reproduce:**
  1. In devtools, block `127.0.0.1:8088/api/attempts`.
  2. Grade a question; it fails.
  3. Copy the `attemptId` from the failed request's payload.
  4. POST that same `attemptId` with a different grade using curl. The server returns 201.
  5. Unblock the URL and click "Reintentar guardado".

  It returns 409 every time. The card stays stuck until you reload the page.
- **Why:** the retry resends exactly the same payload, so the server's answer can never change.
- **Fix:** when `error.status === 409`, don't show the retry button. Tell the learner to reload the page to record a new review. This needs no reducer change.

**4. Two summaries are the whole page body flattened into one string.**
- **problem-framing (`content/patterns/problem-framing.md:7`):**
  - The summary starts with `1. ` and contains all five steps.
  - On the concept page (`page.tsx:47`) it renders as one ordered-list item with steps 1–5 run together.
  - In the catalog (`ConceptCatalog.tsx:88`, plain text) it shows literal `*reglas*` asterisks.
- **airflow-migration (`content/behavioral/airflow-migration.md:7`):**
  - The summary is the full STAR story, so the summary box repeats the whole details section.
  - In the catalog, its `[COMPLETAR]` placeholders are plain text and fall outside the two-line clamp (`globals.css:393-396`). The catalog preview gives no sign that the story is missing metrics.
- **Fix:**
  - Diego picks one existing source sentence per page, which is what the plan meant by "existing source sentences".
  - If a catalog summary still contains a placeholder, render it through `splitPlaceholders` with the `needs-input` class.

**5. The search test the plan required isn't there.**
- **Where:** `src/lib/search.test.ts:3-20` uses made-up test data only. The plan (lines 89-93) called for `filterConcepts(loadConcepts(), "complejidad")` to include `big-o`, and `"hashmap"` to include `choosing-collections`.
- **Why it matters:** both queries are advertised in the search box placeholder. Removing the `hashmap` tag from `choosing-collections.md` would break that search, and no test would fail.
- **Fix:** add the plan's two assertions against the real content.

## Review focus areas with no findings

- **Retries that arrive at the same time (insert-first):** correct.
  - `store.go:57-80` does a parameterized `INSERT … ON CONFLICT DO NOTHING RETURNING` first, with no existence check before it.
  - If another insert with the same ID is still in progress, PostgreSQL makes this one wait. When the insert returns no row, a separate follow-up read sees the committed row.
  - All payload fields are compared as one unit.
  - The integration tests (12 goroutines with the same ID, conflicts, a new connection pool, and a 503 when the database is closed) match the design's acceptance criteria.
- **Same ID with a different payload (409):** no false conflicts.
  - `validation.go:10` only accepts lowercase canonical UUIDs, and pgx returns the stored UUID in that same form. So the `!=` at `store.go:77` can't flag an identical replay as a conflict.
  - The client also rejects confirmations that don't match what it sent (`progress-api.ts:149-163`; reducer `:32-42`).
- **Client runtime validation:** responses are parsed as `unknown`. Timestamps, grades, slugs, counts and duplicate rows are all checked, and a 2xx response with bad data is rejected.
- **Outages:**
  - The server returns a 503 without database details.
  - The client gives up after 5 s with a clear error.
  - Progress shows a distinct "unavailable" state instead of fake zeros.
  - Reading and answer reveal keep working.
- **The static build doesn't depend on the API:** client components only import types from `content.ts`, and network calls only happen inside effects and click handlers.
- **Source content:**
  - All six pages, the 11 questions, statuses and IDs match the plan.
  - The `[COMPLETAR]` placeholders are intact.
  - `CONTENT_SEED.md` is not in the diff.
  - The AI review page matches the approved copy exactly.
- **`[DIEGO]` exercises:** there is no scheduler, Leitner box, due date or Domain/Application code. All `[DIEGO]` boxes in `SPEC.md` are still unchecked.
- **Intentional deviations:**
  - Port 8088 is used consistently in `cmd/server/main.go:33`, `progress-api.ts:35`, `.env.example` and the README.
  - The TypeScript ESLint plus React-hooks setup is documented, and CI runs lint.

Not a finding, but for Diego's `[DIEGO]` ADR review: ADR-011 still says "schema and written review are outstanding", while `SPEC.md` now says the schema was approved.

## Readiness

The API, persistence and client save/retry logic are ready, with no defects found. Before calling the slice done, fix finding 1: it's a small content-only change, but it needs Diego's approval because it touches `content/`. Findings 2–5 are small and can go in a follow-up commit. Afterwards, rerun `make check` and confirm that "Explicación completa" no longer shows the practice answers. That run will also be the first time anyone outside the ledger confirms the tests pass.


---

## Implementer verification and resolutions

Codex validated these findings against the actual source on 2026-10-04. Claude
was restricted to Read, Glob and Grep; Codex ran the checks described below.

| Finding | Resolution |
| --- | --- |
| 1 — duplicate exposed answers | Removed only the four trailing `drill:` body blocks. All original question/answer wording remains in frontmatter and `CONTENT_SEED.md` is unchanged. A regression test failed on the exposed duplicates and passes after the structural transfer correction. |
| 2 — singular question label | The one-question page now displays `1 pregunta`; verified in the browser. |
| 3 — permanent conflict retries | Failure state distinguishes retryable outages from permanent 409 conflicts. Conflicts keep alternative grades disabled, hide retry, and instruct a reload/history check. A failing regression test now passes. |
| 4 — long source summaries | Deferred: retain Diego's original source sentences until he chooses shorter wording. The desktop and narrow layouts were inspected; full concept placeholders remain highlighted. |
| 5 — real catalog search coverage | Added assertions for advertised `complejidad` and `hashmap` searches against the real content. |
| ADR status wording | ADR-011 now reflects Diego's approval of schema/retry behavior while leaving his own interview defense pending. |

### Verified behavior

- `make check` passes: 30 frontend tests, TypeScript, ESLint, Go tests, PostgreSQL
  race/integration tests, and static/frontend plus API builds.
- The static build passed with this project's API and PostgreSQL stopped.
- All six exported concept files exist and their local routes return HTTP 200.
- Browser verification covered all six routes, title/tag search, 1440px and 400px
  layouts, source tables, amber placeholders, keyboard reveal/grade, and focus.
- A confirmed review survived reload. Reposting it returned 200 with count one.
- During an API outage, reading/reveal worked and no save was announced. Recovery
  followed by explicit retry recorded one attempt; another replay kept count one.
- Two sample Big O reviews were saved during manual QA in the local development
  database. Automated integration tests use isolated schemas and clean up only
  their own data. No progress service was published.
- Seed diff against `f5ff159` is empty. Runtime dependency audit reports zero
  vulnerabilities. No scheduler, later learning architecture, or AWS code was added.

### Execution rulings

- Use TypeScript ESLint and React hook rules instead of the Next lint preset: its
  dependency audit reported an unpatched advisory. Cost: Next-specific lint rules
  are absent; the production build and browser checks cover Next integration.
- Use loopback port 8088 instead of 8080: another local Docker service owns 8080.
  Cost: the approved design's illustrative address differs from executable setup.
- Treat removing duplicate `drill:` blocks as a structural metadata correction:
  every question/answer and all other study wording stay unchanged. This implements
  the approved reveal flow without selecting new study wording for Diego.

### What changed and why

Practice answers now have one home in stable question metadata and start hidden.
Permanent ID conflicts offer a clear recovery instruction instead of an endless retry.
Regression tests cover the exposed-answer and conflict failures, plus real catalog searches.
Shorter summaries remain Diego's content choice; the approved first-slice boundary stays intact.
