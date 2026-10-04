# First Study Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver six readable study pages and record question self-assessments through a local Go/PostgreSQL API.

**Architecture:** Next.js exports Markdown pages independently of Go and PostgreSQL. Go appends review attempts and derives progress; a stable attempt ID makes retries idempotent. This is one vertical slice, with three independently testable deliverables and an integration dependency between them.

**Tech Stack:** Next.js 16.3.8, React 19.3.0, strict TypeScript, Vitest 5.0.3, gray-matter 4.0.3, react-markdown 10.1.0, remark-gfm 4.0.1, Go, pgx v5.11.0, PostgreSQL 18, Docker Compose.

**Spec:** `docs/superpowers/specs/2026-10-04-first-study-slice-design.md` (approved by Diego on 2026-10-04).

## Global Constraints

- "The Next.js build never connects to PostgreSQL or the Go API."
- "No changes to `docs/CONTENT_SEED.md`, no invented metrics, no external AI calls, and no scaffolding of later AWS phases."
- "Question IDs are explicit metadata, not hashes of mutable question text."
- "Questions without a supplied answer do not get an assessment control."
- "No due dates, Leitner boxes, weakest-concept ranking, or scheduled drill mode until Diego implements and explains his scheduler."
- "The later Domain/Application exercises, repository abstractions, and scheduling rules remain Diego's work."
- "Publishing the source repo does not publish the progress service."
- Keep TypeScript strict; use `unknown` and runtime narrowing for untrusted metadata/HTTP data, not unexplained `any`.
- Node 26 and Go 1.27.1 are available locally. Verified registry requirements: Next.js needs Node >=20.9; Vitest 5 needs ^22.12, ^24, or >=26; pgx v5.11.0 needs Go >=1.25. Resolve remaining development dependencies and commit both lockfiles.
- Explain each new dependency: remark-gfm preserves seed tables; the alternative is a custom table renderer. Other dependency alternatives are already recorded in the approved design.
- No complete C# algorithm functions are included in these six pages. Adding them requires the .NET sample tests in a subsequent task.

## Review Focus

- Malformed or duplicate content/question IDs: fail the build with a useful filename instead of silently losing history (Task 1).
- A second arrow inside a drill answer and multiline placeholders: preserve the whole source answer and placeholder (Task 1).
- Concurrent retries with an identical attempt ID: exactly one stored attempt; a different payload for that ID returns conflict (Task 2).
- An unknown write outcome followed by retry: reuse the original assessment ID and payload, and never announce an unconfirmed save (Task 3).
- API unavailable, long text, keyboard-only use, and narrow screens: reading and answer reveal remain usable, with visible placeholders and focus (Tasks 1 and 3).

## File Map

| Files | Responsibility |
| --- | --- |
| `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `eslint.config.mjs`, `vitest.config.ts` | Frontend tools, strict checking, static export |
| `content/fundamentals/{big-o,hidden-loop,choosing-collections}.md` | Original seed study copy |
| `content/patterns/problem-framing.md`, `content/behavioral/airflow-migration.md`, `content/ai-engineering/ai-code-review.md` | Original framing/STAR copy and approved new AI copy |
| `src/lib/content.ts`, `src/lib/search.ts`, `src/lib/placeholders.ts` and matching `.test.ts` files | Validated content loading, title/tag search, placeholder tokenization |
| `src/components/{ConceptCatalog,ConceptMarkdown}.tsx`, `src/components/ConceptMarkdown.test.tsx`, `src/app/{layout,page}.tsx`, `src/app/concepts/[id]/page.tsx`, `src/app/{globals.css,icon.svg}` | Catalog, accessible reading view, GFM tables, branding |
| `api/go.mod`, `api/go.sum`, `api/internal/postgres/{store.go,schema.sql,store_integration_test.go}` | Transport records and PostgreSQL attempt persistence |
| `api/internal/httpapi/{handler.go,validation.go,validation_test.go,handler_integration_test.go}` | HTTP contract, validation, CORS, error responses |
| `api/cmd/{server,migrate}/main.go`, `api/internal/testdb/database.go` | Local process lifecycle, explicit schema application, isolated integration-test databases |
| `src/lib/{progress-api,assessment-session}.ts` and matching `.test.ts` files | Typed API client and retry-safe assessment session |
| `src/components/{QuestionPractice,ProgressSummary}.tsx` | Answer reveal, self-grade controls, saved progress |
| `compose.yaml`, `.env.example`, `Makefile`, `.github/workflows/ci.yml`, `README.md` | Reproducible local setup, test/build commands, CI and handoff |

## Task 1: Static study catalog and content pages `[AGENT]`

**Interfaces:** `loadConcepts(directory?: string): Concept[]`; `parseConcept(source: string, file: string): Concept`; `filterConcepts<T extends CatalogEntry>(concepts: readonly T[], query: string, section?: string): T[]`; `splitPlaceholders(text: string): TextToken[]`; `ConceptCatalog({ concepts }: { concepts: CatalogEntry[] })`; `ConceptMarkdown({ body }: { body: string })`.

The shared frontend content shape is:

```typescript
export type StudyStatus = "learned" | "in-progress" | "pending";
export type DrillQuestion = { id: string; question: string; answer: string };
export type Concept = {
  id: string; title: string; section: string; tags: string[];
  status: StudyStatus; summary: string; interviewLine: string;
  body: string; drillQuestions: DrillQuestion[];
};
export type CatalogEntry = Pick<Concept,
  "id" | "title" | "section" | "tags" | "status" | "summary">;
export type TextToken =
  | { kind: "text"; text: string }
  | { kind: "placeholder"; text: string };
```

- [ ] **Step 1: Configure the frontend and add meaningful failing logic tests.**

Create the frontend configurations from the file map. Set `output: "export"` and `trailingSlash: true` in Next.js; set `strict: true` in TypeScript. Add `dev`, `build`, `test` (`vitest run`), `typecheck` (`tsc --noEmit`), and `lint` (`eslint .`) package scripts. Use system fonts, with no build-time font network fetch.

Install the approved runtime packages plus `remark-gfm` using `npm install --save-exact`; add TypeScript, React/Node types, ESLint, `eslint-config-next@16.3.8`, and `vitest@5.0.3` as development tools. Do not add a router, component library, CMS, backend-in-Next.js, or state library.

Create parser/search/placeholder tests, including these concrete expectations:

```typescript
it("preserves a multiline experience placeholder", () => {
  const value = "Before [COMPLETAR: número de jobs\n migrados] after";
  expect(splitPlaceholders(value)).toEqual([
    { kind: "text", text: "Before " },
    { kind: "placeholder", text: "[COMPLETAR: número de jobs\n migrados]" },
    { kind: "text", text: " after" },
  ]);
});
it("searches accented titles without changing displayed copy", () => {
  const concepts = loadConcepts();
  expect(filterConcepts(concepts, "complejidad").map(c => c.id)).toContain("big-o");
  expect(filterConcepts(concepts, "hashmap").map(c => c.id)).toContain("choosing-collections");
});
```

Also assert that unknown `status`, missing required fields, duplicate concept IDs, and duplicate question IDs within one concept throw errors naming the file/ID. The loader accepts frontmatter as `unknown` and validates it. The final framing question's answer must preserve its second `→` character.

- [ ] **Step 2: Run the tests and confirm the missing parser/search/tokenizer causes failure.**

Run `npm test`; expect imports or functions to be missing. Confirm the failure is about the unimplemented logic, not a broken test runner.

- [ ] **Step 3: Implement the loader and transfer exactly the approved content.**

Create the six Markdown files listed in the map. Preserve seed page wording and status; add only structural frontmatter and explicit IDs. Use these stable IDs and sections:

| Concept ID | Section | Question IDs |
| --- | --- | --- |
| `big-o` | Fundamentals | `nested-loops`, `simplify-n-plus-k`, `time-and-space` |
| `hidden-loop` | Fundamentals | `repeated-contains`, `string-lookup` |
| `choosing-collections` | Fundamentals | `membership-or-value`, `ordered-history`, `hashtable-legacy` |
| `problem-framing` | Patterns | `brute-force-counting`, `clarifying-rules` |
| `airflow-migration` | Behavioral | none; the seed supplies no drill answer |
| `ai-code-review` | AI Engineering | `compile-vs-correctness` |

Drill question/answer wording comes directly from the seed; when extracting it, split on the first ` → ` only. Summary metadata uses existing source sentences; the Airflow interview box quotes the seed's existing result sentence verbatim, from "Support now opens the Airflow UI" through "a few clicks." No new experience wording or metrics are needed. Copy the AI page's approved prose from the design; its study status is `pending`.

The parser validates every required string, tags, question/answer pair, status and stable ID. IDs follow `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`. The loader recursively reads only `.md` files, sorts deterministically, and rejects duplicate concept IDs. It validates question uniqueness within each concept. Use the following search and placeholder mechanisms:

```typescript
const normalize = (value: string) => value.normalize("NFD")
  .replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es");
const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
// A result matches every term against normalized title + tags.
// section, when supplied, is an exact section filter.
const placeholderPattern = /\[COMPLETAR:[\s\S]*?\]/g;
// Slice ordinary text between match indices; keep each complete match unchanged.
```

Implement static catalog/page routes with `generateStaticParams` from `loadConcepts`. Include `notFound()` for unknown IDs. `ConceptCatalog` receives only a serializable metadata projection; Markdown stays in statically rendered pages. Render GFM tables with `react-markdown` + `remark-gfm`, with raw HTML disabled. Highlight placeholder tokens in paragraph/list/table text without replacing their content. Use a styled interview box above expandable details, visible focus styles, a labeled search input, and a locally authored SVG favicon. Do not add empty navigation sections.

- [ ] **Step 4: Verify logic, export, and the reading surface.**

Run `npm test`, `npm run typecheck`, and `npm run build` with Go/PostgreSQL not running. Verify `out/index.html` and all six `out/concepts/<id>/index.html` files exist. Unit-check that the transferred source preserves the drill answer's second arrow and all Airflow placeholders. Render-test a GFM table and a raw HTML payload: a table renders, injected HTML does not execute or render as an element.

Open the meaningful catalog in a browser only after it exists. Check search, all six routes, 1440-pixel and narrow layouts, keyboard focus, and the Airflow amber placeholders. Confirm the summary and English box fit above the laptop fold.

- [ ] **Step 5: Commit this independently usable static deliverable.**

Run `git diff --check` and verify `git diff --exit-code f5ff159 HEAD -- docs/CONTENT_SEED.md`. Stage only Task 1 files, then commit `feat: add static study catalog and concept pages`.

## Task 2: Local PostgreSQL review-attempt API `[AGENT]`

**Consumes:** The stable concept/question IDs and approved grade vocabulary. No frontend or content filesystem access is required to run the API.

**Produces:** `POST /api/attempts`, `GET /api/progress`, and `GET /healthz`. In package `postgres`, define `AttemptInput`, `Attempt`, `QuestionProgress`, `ErrAttemptConflict`, `ApplySchema(ctx, pool) error`, `NewStore(pool) *Store`, `(*Store).Append(ctx, input) (Attempt, bool, error)`, and `(*Store).Progress(ctx) ([]QuestionProgress, error)`.

```go
type AttemptInput struct {
    AttemptID string `json:"attemptId"`
    ConceptID string `json:"conceptId"`
    QuestionID string `json:"questionId"`
    Grade string `json:"grade"`
}
type Attempt struct {
    AttemptInput
    CreatedAt time.Time `json:"createdAt"`
}
type QuestionProgress struct {
    ConceptID string `json:"conceptId"`
    QuestionID string `json:"questionId"`
    AttemptCount int64 `json:"attemptCount"`
    LatestGrade string `json:"latestGrade"`
    LastReviewedAt time.Time `json:"lastReviewedAt"`
}
```

Define `httpapi.NewHandler(store *postgres.Store, allowedOrigins []string) http.Handler`. Keep the transport/storage structs here; do not create Diego's future Domain/Application packages or repository architecture.

- [ ] **Step 1: Configure the module, local database and isolated test fixture.**

Create module `github.com/DianCotrina/interview-atlas/api` with a Go 1.27 directive (the installed toolchain) and pin `github.com/jackc/pgx/v5 v5.11.0`. Create this local Compose service; credentials are local examples, not production secrets:

```yaml
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: atlas
      POSTGRES_PASSWORD: atlas-local
      POSTGRES_DB: atlas
    ports: ["127.0.0.1:54329:5432"]
    volumes: ["atlas-postgres-data:/var/lib/postgresql"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U atlas -d atlas"]
      interval: 2s
      timeout: 5s
      retries: 15
volumes:
  atlas-postgres-data:
```

Create a tagged integration-test helper with signature `testdb.Config(t *testing.T) *pgxpool.Config`. It requires `TEST_DATABASE_URL` (fails clearly if absent), creates a uniquely named `atlas_test_<random-hex>` schema through an administrative connection, sets `RuntimeParams["search_path"]` on a copied pool config, and registers cleanup dropping only that uniquely created schema. Use `pgx.Identifier{schema}.Sanitize()` when constructing schema SQL. Each test owns its own schema; never truncate development history or drop a shared database. Production files must not import the test helper.

- [ ] **Step 2: Write failing validation and real PostgreSQL tests.**

Pure validation tests cover malformed UUIDs, unsupported grade, empty/oversized IDs, and IDs outside the stable slug grammar. Integration tests use `//go:build integration` and the isolated helper, including this assertion sequence:

```go
func TestAppendDeduplicates(t *testing.T) {
    ctx := context.Background()
    pool, err := pgxpool.NewWithConfig(ctx, testdb.Config(t))
    if err != nil { t.Fatal(err) }
    defer pool.Close()
    if err := ApplySchema(ctx, pool); err != nil { t.Fatal(err) }
    store := NewStore(pool)
    input := AttemptInput{
        AttemptID: "11111111-1111-4111-8111-111111111111",
        ConceptID: "big-o", QuestionID: "time-and-space", Grade: "hesitated",
    }
    first, created, err := store.Append(ctx, input)
    if err != nil || !created { t.Fatalf("first append: created=%v err=%v", created, err) }
    again, created, err := store.Append(ctx, input)
    if err != nil || created || !again.CreatedAt.Equal(first.CreatedAt) {
        t.Fatalf("replay changed history: created=%v err=%v", created, err)
    }
    input.Grade = "knew-it"
    _, _, err = store.Append(ctx, input)
    if !errors.Is(err, ErrAttemptConflict) { t.Fatalf("want conflict, got %v", err) }
}
```

Add a concurrent test with 12 goroutines submitting the same ID/payload: exactly one reports creation; progress shows `attemptCount == 1`. Add a second distinct attempt and verify count/latest grade. Close the first pool, open a new pool from the same test schema config, and verify history remains.

Run `go test ./...` from `api/` and `TEST_DATABASE_URL=postgres://atlas:atlas-local@127.0.0.1:54329/atlas?sslmode=disable go test -tags=integration ./...` after starting the owned Compose service. Before implementation, expect missing store/validator functions, not a database-setup failure.

- [ ] **Step 3: Implement schema and atomic insertion.**

Embed and explicitly apply this schema through `api/cmd/migrate`; run it before the server. Reapplying the initial schema is safe; future changes need numbered migrations rather than silently editing a live schema.

```sql
CREATE TABLE IF NOT EXISTS review_attempts (
  attempt_id uuid PRIMARY KEY,
  concept_id text NOT NULL,
  question_id text NOT NULL,
  grade text NOT NULL CHECK (grade IN ('knew-it', 'hesitated', 'did-not-know')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS review_attempts_question_time
  ON review_attempts (concept_id, question_id, created_at DESC, attempt_id DESC);
```

Use parameterized SQL:

```sql
INSERT INTO review_attempts (attempt_id, concept_id, question_id, grade)
VALUES ($1, $2, $3, $4)
ON CONFLICT (attempt_id) DO NOTHING
RETURNING attempt_id, concept_id, question_id, grade, created_at;
```

On `pgx.ErrNoRows`, select the existing row by ID in a subsequent statement and compare all payload fields. Return the original row for a match or `ErrAttemptConflict` for a mismatch. This is insert-first under PostgreSQL's default read-committed behavior; do not pre-check for existence. The application exposes no update/delete operation for attempts.

Derive progress with `DISTINCT ON (concept_id, question_id)` and `COUNT(*) OVER (PARTITION BY concept_id, question_id)`, ordered by those IDs, then `created_at DESC, attempt_id DESC`. Return an empty JSON array for empty history, not `null`.

- [ ] **Step 4: Implement and test the HTTP boundary.**

Use standard `net/http` routes and a 16 KiB maximum request body. Decode exactly one JSON object, reject unknown fields/trailing JSON, validate UUID/slugs/grade, and assign timestamps on the server through PostgreSQL. Return JSON records matching the types above. Error JSON has `{ "error": { "code": string, "message": string } }` with no database internals.

| Request outcome | HTTP status |
| --- | --- |
| New attempt | 201 |
| Identical replay | 200 |
| ID reused for another payload | 409 |
| Invalid JSON/fields | 400 |
| Body too large | 413 |
| PostgreSQL unavailable | 503 |
| Request from a disallowed Origin | 403 |

Allow CORS only for configured exact local frontend origins; handle preflight for GET/POST and `Content-Type`. Set request/database timeouts and server read/write timeouts. The server binds `127.0.0.1:8080`; `DATABASE_URL` is required, and graceful shutdown closes the pool. `/healthz` checks the database and returns 200 or 503 without leaking connection details.

Real-database HTTP tests use `httptest.Server`, confirm 201/200/409 and progress counts, reject extra JSON fields/trailing objects before insertion, verify allowed/denied CORS, and close a test pool to verify the sanitized 503 response.

- [ ] **Step 5: Verify and commit the API deliverable.**

Run `gofmt`, `go test ./...`, and `go test -race -tags=integration ./...` with the isolated test configuration, then `go build ./cmd/server ./cmd/migrate`. Reapply the migration and confirm it succeeds without deleting data. Stage the API, Compose and environment files; commit `feat: persist review attempts in PostgreSQL`.

## Task 3: Assessment controls, local handoff and CI `[AGENT]`

**Consumes:** Task 1's `DrillQuestion`/stable IDs and Task 2's exact HTTP JSON contract.

**Produces:** `recordAttempt(input, fetcher?: typeof fetch): Promise<Attempt>`; `getProgress(fetcher?: typeof fetch): Promise<QuestionProgress[]>`; `assessmentReducer(state, action): AssessmentState`; and `QuestionPractice({ conceptId, questions })`.

Mirror the Go JSON types exactly in `progress-api.ts`; `createdAt` and `lastReviewedAt` are ISO strings. Grade is the string union `"knew-it" | "hesitated" | "did-not-know"`. Parse HTTP response values as `unknown`, validate them, and throw a typed error carrying the public HTTP status/code for invalid responses or API errors.

```typescript
export type AssessmentState =
  | { status: "idle" }
  | { status: "saving"; input: AttemptInput }
  | { status: "failed"; input: AttemptInput; message: string }
  | { status: "saved"; attempt: Attempt };
export type AssessmentAction =
  | { type: "start"; input: AttemptInput }
  | { type: "fail"; message: string }
  | { type: "retry" }
  | { type: "saved"; attempt: Attempt }
  | { type: "reset" };
```

- [ ] **Step 1: Write and run failing retry/client tests.**

```typescript
const input: AttemptInput = {
  attemptId: "11111111-1111-4111-8111-111111111111",
  conceptId: "big-o", questionId: "time-and-space", grade: "hesitated",
};
const saving = assessmentReducer({ status: "idle" }, { type: "start", input });
const failed = assessmentReducer(saving, { type: "fail", message: "Unavailable" });
expect(assessmentReducer(failed, { type: "retry" })).toEqual({ status: "saving", input });
expect(assessmentReducer(failed, { type: "start", input: { ...input, grade: "knew-it" } }))
  .toEqual(failed);
```

Tests stub `fetch` responses to confirm both 201 and replay 200 are accepted; 409/503/malformed JSON/network failure reject; retry sends identical serialized payload; and a failed request never transitions to saved. Run `npm test`; expect missing client/reducer imports before implementation.

- [ ] **Step 2: Implement client and assessment controls.**

Use `NEXT_PUBLIC_PROGRESS_API_URL`, defaulting locally to `http://127.0.0.1:8080`. Fetch with a finite abort timeout. Create the UUID once with `crypto.randomUUID()` when a new revealed question is graded. While saving or awaiting retry, disable alternative grade submissions, retain that exact input, and offer explicit retry. Only a confirmed success announces "Guardado" through an accessible live region. Do not automatically resend or persist an offline queue.

The reducer allows start only from idle, failure only from saving, retry only from failed, and saved only for the matching pending attempt. A retry does not regenerate an ID. Reset occurs when the learner explicitly moves to a new assessment after resolving the current one.

`QuestionPractice` reveals the supplied answer on a keyboard-accessible button before enabling "Lo sabía", "Dudé", and "No lo sabía". For an empty question list, render no grading controls. `ProgressSummary` shows actual saved counts/latest grades, with a distinct unavailable message instead of fabricated zero/success data. Both are client components; they never prevent the static concept text from rendering.

- [ ] **Step 3: Verify the complete slice against live local services.**

Run the API and Next.js development server on their documented loopback addresses. Reveal and grade a Big O question, reload, and verify the stored count/grade. Resend the exact attempt request and confirm the count remains one. Stop only this project's API process; reopen the concept, reveal its answer, submit a grade, and verify readable content plus an unsaved/error state. Restart the same API and explicitly retry the retained assessment. Confirm one recorded attempt.

Repeat keyboard navigation, long placeholder/table rendering and narrow-screen checks. Rerun `npm test`, `npm run typecheck`, `npm run build`, and the Go race/integration suite. Builds must still succeed without a running API/database. Inspect source changes for seed edits or any scheduler implementation.

- [ ] **Step 4: Add reproducible commands and CI.**

Create this Makefile; recipe indentation must use tabs. `TEST_DATABASE_URL` points at the local database and the test helper isolates its tables.

```makefile
DATABASE_URL ?= postgres://atlas:atlas-local@127.0.0.1:54329/atlas?sslmode=disable
TEST_DATABASE_URL ?= $(DATABASE_URL)
export DATABASE_URL TEST_DATABASE_URL
.PHONY: db migrate api web test-web test-api test-integration build check
db:
	docker compose up -d --wait postgres
migrate:
	cd api && go run ./cmd/migrate
api:
	cd api && go run ./cmd/server
web:
	npm run dev -- --hostname 127.0.0.1
test-web:
	npm test
	npm run typecheck
test-api:
	cd api && go test ./...
test-integration:
	cd api && go test -race -tags=integration ./...
build:
	npm run build
	cd api && go build ./cmd/server ./cmd/migrate
check: test-web test-api test-integration build
```

README lists prerequisites, package installation, `cp .env.example .env`, Compose startup, exporting Go's `DATABASE_URL`, migration, and the two server commands. Next.js automatically reads its root environment file; Go receives its environment from the shell. Explain the six initial concepts, self-grades/history, retry semantics, static/API boundary, pending Phase 1 tasks, and the `[DIEGO]` scheduler exercise. Include a four-line "What changed and why" note and link the ADRs without inventing Diego's unanswered interview defense.

Create this CI workflow. Action versions were verified through the official repositories' releases on 2026-10-04. CI uses a disposable database; it never connects to learner history. Do not add deployment or AWS jobs.

```yaml
name: CI
on: [push, pull_request]
permissions:
  contents: read
jobs:
  check:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:18-alpine
        env:
          POSTGRES_USER: atlas
          POSTGRES_PASSWORD: atlas-local
          POSTGRES_DB: atlas
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U atlas -d atlas"
          --health-interval 2s --health-timeout 5s --health-retries 15
    env:
      TEST_DATABASE_URL: postgres://atlas:atlas-local@127.0.0.1:5432/atlas?sslmode=disable
    steps:
      - uses: actions/checkout@v7.0.1
      - uses: actions/setup-node@v7.0.0
        with:
          node-version: '26'
          cache: npm
      - uses: actions/setup-go@v7.0.0
        with:
          go-version-file: api/go.mod
          cache-dependency-path: api/go.sum
      - run: npm ci
      - run: npm test
      - run: npm run typecheck
      - run: npm run build
      - run: go test ./...
        working-directory: api
      - run: go test -race -tags=integration ./...
        working-directory: api
      - run: go build ./cmd/server ./cmd/migrate
        working-directory: api
```

Create `.env.example` with these local values. Real `.env` files remain ignored.

```dotenv
NEXT_PUBLIC_PROGRESS_API_URL=http://127.0.0.1:8080
DATABASE_URL=postgres://atlas:atlas-local@127.0.0.1:54329/atlas?sslmode=disable
TEST_DATABASE_URL=postgres://atlas:atlas-local@127.0.0.1:54329/atlas?sslmode=disable
ALLOWED_ORIGINS=http://127.0.0.1:3000
```

- [ ] **Step 5: Review, fix supported findings, and publish the source.**

Commit the UI/tests as `feat: record question self-assessments`; commit CI/setup docs separately as `chore: add local workflow and first-slice CI`.

Ask a read-only Claude session to review the complete implementation diff against `AGENTS.md`, the approved design, and this plan. Restrict its tools to reading/searching. Validate findings before changing code; rerun only checks affected by fixes, followed by the final required build/test suite. Record unresolved material findings in the handoff.

Run `git diff --check`, verify no seed changes against baseline commit `f5ff159`, inspect the final commit diff and working-tree state, then push the authorized public repo. Verify the remote head matches the local head. Hand off the local URL, startup commands, concrete test results, completed first-slice scope, and remaining Phase 1 tasks. Do not claim the full Phase 1 or a live production deployment is complete.

## Plan Self-Review

All first-slice requirements map to one of the three tasks: static content/reading in Task 1, persistence/HTTP in Task 2, integration/CI/review in Task 3. The per-question and grade names match across TypeScript, Go and SQL. Every Review Focus condition has a test or explicit browser check. All files and cross-task interfaces are named above; no scheduler or later-phase implementation is included.

## Execution Handoff

Recommended method: **Native implementation by Codex, followed by a read-only Claude review**. The tasks share content IDs and transport contracts, so one implementer keeps integration straightforward. Diego already authorized Claude workers; sequential Claude implementation with Codex review is also available if he chooses it. Work in the current fresh repo unless Diego requests an isolated worktree.

The written plan needs Diego's review and execution-method selection before product implementation, as required by the writing-plans skill.

## What changed and why

The approved design is decomposed into three independently verifiable deliverables.
Content identity and the attempt JSON contract are explicit across the two languages.
Real database tests cover concurrent retry deduplication and persistent history.
The handoff keeps Diego's scheduler and ADR interview answers under his ownership.
