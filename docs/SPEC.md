# Interview Atlas — Product Spec

**Owner:** Diego · **Status:** Phase 1 ready to start · **Last updated:** see git history

## Problem

Diego is preparing for senior .NET / full-stack interviews at US companies hiring
remotely from Latin America. His study material is scattered across chats and one-off
HTML pages, so concepts he learned (hash-map counting, two pointers, system design
resilience patterns) fade between sessions — a diagnostic drill after a break showed
patterns practiced only once or twice did not stick, while patterns repeated on separate
days did. He needs one place to (1) re-read a concept in two minutes, (2) be quizzed on
it at spaced intervals, and (3) build and explain real system design decisions.

## Goals

1. **Two-minute reminder:** any concept page is readable and actionable in under two
   minutes, with the "how to say it in the interview" line in English.
2. **Retention through spacing:** a drill mode resurfaces each concept on a schedule,
   prioritizing what Diego got wrong.
3. **System design by doing:** every architecture decision in this project is made by
   Diego and recorded as an ADR he can walk through in an interview.
4. **Close real gaps:** by Phase 3, Diego has deployed and operated Lambda, API Gateway,
   and DynamoDB himself — gaps flagged in his job applications.
5. **Portfolio-ready:** public repo with a clear README, ADRs, and a live URL.
6. **Practice a new stack:** implement the app with Next.js, TypeScript, and Go while
   retaining the .NET interview material. AI code review starts as study pages and a
   checklist, rather than an external AI integration.

## Non-goals

- **Not a LeetCode clone.** No online judge or code execution in the browser. Code
  samples are read, not run, on the site (correctness is ensured by tests in the repo).
- **Not multi-user.** One user: Diego. Don't design for teams, sharing, or social features.
- **Not a CMS.** Content is Markdown in the repo, edited in an editor and committed.
- **No mobile app.** Responsive web is enough.
- **No hard algorithms track.** Scope is the practical patterns that appear in senior
  enterprise/SaaS interviews and timed screening tests, not competitive programming.

## Users

- **Diego studying:** opens a page, reads, runs a visualizer, closes it.
- **Diego drilling:** answers 5–10 questions from memory, self-grades, sees what's weak.
- **Diego in an interview:** shares the live site and walks through ADRs and code.

---

## Phase 1 — Study site (Next.js + Go)

Concept pages are built from Markdown and exported as a static Next.js site. A Go API
stores study progress from this phase. An API outage must not prevent reading concepts.
Diego selected PostgreSQL and review-attempt history. The written first-slice design
and ADRs remain proposed until he reviews the schema and retry behavior.
Start with one useful slice; the original frontend-only weekend estimate no longer
covers the expanded scope.

### P0

- [ ] `[AGENT]` Scaffold Next.js + TypeScript, strict TS, ESLint, Vitest, and a Go API
      with Go tests. Folder layout: `content/` (Markdown), `src/app/`,
      `src/components/visualizers/`, and `api/`.
- [ ] `[DIEGO]` Choose the first progress API's storage and resource semantics;
      review ADR-009 (boundaries), ADR-010 (PostgreSQL), and ADR-011 (history).
- [ ] `[AGENT]` Implement the progress API and storage chosen by Diego. Keep this
      slice limited to API and infrastructure work; do not implement his scheduler
      or the later Domain/Application learning exercises.
- [ ] `[AGENT]` Markdown content pipeline: load `content/**/*.md` with frontmatter
      (`title`, `section`, `tags`, `drillQuestions`, `status: learned|in-progress|pending`).
      Load at build time and render with syntax highlighting for C#.
- [ ] `[AGENT]` Navigation by section: Fundamentals · Patterns · .NET & APIs ·
      System Design · Behavioral · Job Search · AI Engineering. Search box over titles and tags.
- [ ] `[AGENT]` Load all content from `docs/CONTENT_SEED.md` into `content/` pages,
      one concept per page. Keep `[COMPLETAR: ...]` placeholders visible and visually
      highlighted (e.g. amber badge "needs your real number").
- [ ] `[AGENT]` Concept page layout: summary first, then detail, then "Say it in the
      interview" (English) box, then related pages.
- [ ] `[AGENT]` Add an AI code-review study page and checklist. Propose new study
      wording for Diego to review; do not silently rewrite existing seed content.
- [ ] `[AGENT]` Visualizers (port and improve from Diego's two existing HTML pages):
      (a) List vs HashSet vs Dictionary lookup-cost race, (b) two pointers from both
      ends — two-sum and palindrome, (c) slow/fast pointers — remove duplicates.
      Step / auto / reset controls; narration of each decision.
- [ ] `[AGENT]` C# sample tests: a small `samples/` .NET 8 test project containing
      every C# snippet shown on the site, with xUnit tests. CI fails if a snippet breaks.
- [ ] `[DIEGO]` **Spaced-repetition scheduler** (pure TypeScript function, no UI).
      Leitner boxes: intervals 1, 2, 4, 8, 16 days. Self-grade "knew it" moves up a box;
      "hesitated" stays; "didn't know" resets to box 1. Diego writes it; agent reviews
      and writes tests with him. This is also an interview talking point.
- [ ] `[AGENT]` Drill mode UI on top of Diego's scheduler: shows due questions one at a
      time, answer hidden until "show answer", then three self-grade buttons. Progress in
      the Go API. Diego chooses outage and retry behavior before this integration.
      Shows "weakest concepts" list.
- [ ] `[AGENT]` Publish the static frontend and the Go API after Diego chooses hosting
      and access control. README with live URL. Do not publish a private-progress API
      before its authentication decision.

**Acceptance criteria (Phase 1)**
- Given a concept page, when Diego opens it, the summary and English interview line are
  visible without scrolling on a laptop screen.
- Given due drill questions, when Diego self-grades "didn't know", that question
  reappears the next day.
- Every C# snippet on the site compiles and passes its test in CI.
- No `[COMPLETAR]` placeholder has been replaced by invented data.
- Concept pages remain readable when the progress API is unavailable.

### P1
- [ ] `[AGENT]` Dark mode. Print-friendly "night before" cheat sheet page.
- [ ] `[AGENT]` Visualizer: sliding window (fixed size `k`), interval overlap with
      sort-first.
- [ ] `[DIEGO]` Write the interval-overlap and sliding-window C# solutions for the
      samples project before the visualizers are built.

---

## Phase 2 — Go backend architecture and drill progress

Goal: extend the Phase 1 Go progress API for spaced repetition and practice the
architecture Diego already used at work, adapted to Go and documented end to end.

Open decisions for Diego (each becomes an ADR — see `docs/SYSTEM_DESIGN_TRACK.md`):
- **ADR-001** How does drill progress extend the initial concept-progress model,
  and is offline progress worth supporting?
- **ADR-002** How the Domain layer stays independent of the PostgreSQL database
  selected in ADR-010; revisit storage only if requirements change.
- **ADR-003** API shape: endpoints for questions, attempts, due-list. REST resource
  design, status codes, idempotency of "record attempt".

### P0
- [ ] `[DIEGO]` Domain + Application packages: entities, the scheduler (ported to Go),
      repository interfaces. No infrastructure imports in these packages.
- [ ] `[AGENT]` Infrastructure layer implementing the repositories for the database
      Diego chose; migrations if he chose a relational DB.
- [ ] `[AGENT]` API layer: endpoints from ADR-003, validation, ProblemDetails errors,
      OpenAPI/Swagger.
- [ ] `[AGENT]` Frontend integrates drill progress with the API, with an offline
      fallback only if Diego chooses it (sync rules require an ADR).
- [ ] `[DIEGO]` Write the ADR explaining the dependency direction, in his own words,
      the way he'd explain the WCF-bridge project in an interview.

**Acceptance:** swapping the database implementation requires changing only the
  Infrastructure package and dependency wiring — demonstrated by a test using an in-memory
fake repository.

---

## Phase 3 — AWS serverless deployment (closes the job-application gaps)

Open decisions for Diego:
- **ADR-004** Compute: Go API hosted on Lambda behind API Gateway vs. a
  container service. Cold starts, cost, operational load.
- **ADR-005** Data: DynamoDB table design from his access patterns (single table vs one
  table per entity). This is the main learning target.
- **ADR-006** Auth for a single-user app: API key, Cognito, or another option. Content
  stays public; progress is private.
- **ADR-007** Infrastructure as code: AWS CDK (can be written in C#) vs SAM vs manual.

### P0
- [ ] `[DIEGO]` List every access pattern ("get due questions for today", "record
      attempt", "weakest 10 concepts") *before* designing the DynamoDB table.
- [ ] `[AGENT]` DynamoDB repository implementation behind the same interfaces as Phase 2.
- [ ] `[AGENT]` Frontend on S3 + CloudFront; API on Lambda + API Gateway; secrets in
      Secrets Manager.
- [ ] `[AGENT]` AWS budget alarm configured before anything else is deployed.
- [ ] `[DIEGO]` Write a runbook: how to deploy, roll back, and diagnose a failed request
      from logs. (Production-support experience is one of his strengths — show it.)

**Acceptance:** the Phase 2 in-memory test still passes unchanged. Live URL served from
AWS. Budget alarm verified.

---

## Phase 4 — AI drill coach (shows AI-assisted engineering)

- **ADR-008** How the app calls the Claude API safely: key server-side only, rate
  limiting, cost cap, behavior when the API is down (circuit breaker + fallback to
  static questions).
- [ ] `[AGENT]` Endpoint that generates a fresh drill question for a weak concept.
- [ ] `[AGENT]` "Framing coach": Diego types his 4 framing sentences for a problem; the
      model gives feedback using the hint ladder (question → pattern → outline, never the
      solution unprompted).
- [ ] `[DIEGO]` Resilience design for the external AI dependency, written as an ADR —
      this mirrors his "legacy WCF is flaky" system design answer.

---

## Success metrics

- Leading: Diego completes a drill session at least 4 days a week; each concept page
  answers his question in under two minutes (self-reported).
- Lagging: in mock interviews, framing (step 1–4) happens before any code in 9 of 10
  problems; Diego can walk through every ADR without notes; at least one real interview
  where he presents this project.

## Open questions

- (Diego, blocking Phase 2) Is moving progress off `localStorage` worth it on its own, or
  only as a vehicle to practice the backend? Go practice and server-side progress were
  chosen for Phase 1; document the drill-specific requirements in ADR-001.
- Resolved by Diego on 2026-10-04: public personal GitHub repo from day one.
