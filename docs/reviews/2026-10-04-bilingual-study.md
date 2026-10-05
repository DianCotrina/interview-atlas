# Bilingual study verification — 2026-10-04

Diego approved Option A (static `/es/` and `/en/`, browser language and saved manual
selection). ADR-012 records that decision; deployment and progress architecture
remain the previously approved local-only design.

## Coordinator evidence

- `make check` passed with 71 frontend tests, strict types, lint, Go unit and real
  PostgreSQL race/integration tests, plus frontend/API builds.
- Fourteen localized export files (two catalogs and twelve concepts) have the
  correct HTML language and localized navigation; each local route returned 200.
- Both Big O exports contain the expected localized title/content. Entry `/` and
  legacy `/concepts/big-o/` returned 200; unsupported `/fr/` and an unknown English
  concept returned 404.
- Native browser checks covered desktop and 400px layouts, keyboard selection,
  same-concept switching, saved Spanish entry preference, direct English override,
  and a legacy AI-review link opening in the saved English preference.
- English and Spanish Big O pages displayed the same two existing QA reviews,
  translated question/grade labels, and matching counts.
- Only this project's local Go API was stopped for an outage check. Answer reveal
  remained usable; a keyboard-triggered grade could not confirm a save. The selector
  and alternative grades became disabled with localized recovery instructions.
- Restarting the API and reloading left the original history unchanged. No extra
  QA attempt was saved during this feature's browser checks. Servers were restored.
- Missing/extra translations, question identity changes, source status/section or
  interview sentence drift, and modified placeholders are rejected by content tests.
- Five original Spanish Markdown files are byte-identical after relocation. The
  already-English STAR source was literally translated into Spanish; its English
  version keeps the original facts and all unknown placeholder tokens.
- `CONTENT_SEED.md` and the entire Go API diff against `ae0f2a8` are empty.

## Corrections and execution decisions

- The tested Markdown component keeps the project's relative import convention;
  Vitest's existing configuration does not resolve the app-only `@` alias.
- After moving routes, the running dev process retained stale generated types that
  referenced removed source paths. Only that project's stale `.next/dev/types` were
  removed and the frontend restarted. The fresh production build passed; type
  checking remained enabled.
- A valid extended language tag (`en-US-u-ca-gregory`) initially fell back to Spanish.
  A failing regression test reproduced it. Built-in `Intl.Locale` now parses tags,
  and invalid tags still fall through to later supported preferences. No dependency
  was added.
- Interface dictionaries replace scattered labels; translations use stable IDs,
  and the selector guards unconfirmed review sessions instead of creating a new
  attempt identity. No offline queue, country lookup or scheduler was introduced.

## What changed and why

Static language URLs make reading and shared links choose the intended language.
Browser preferences initialize entry pages, while manual choices persist locally.
Stable study IDs retain the same PostgreSQL history across both translations.
Structural translation checks preserve unknown experience metrics and review identity.

## Claude review and coordinator resolutions

The fresh Claude session used Read, Glob and Grep only; it did not execute checks
or mutate the repository. It found no Critical or Important defects. Codex verified
its findings and completed one correction pass:

| Finding | Resolution |
| --- | --- |
| 1 / 10 — permanent conflict guard and coverage | Extracted the real assessment-state guard. The original all-failures behavior made a 409 regression test fail; the guard now blocks saving/retryable failures and releases after a confirmed save or definitive rejection. Three state tests pass. |
| 2 — repeated save announcement | Removed the selector note's live-status role. Pending guidance remains associated with the select using aria-describedby; save status still has its own existing announcement. |
| 3 — English pronunciation on Spanish pages | Marked the intentionally English interview heading lang=en; translated the Spanish navigation label to Revisión con IA. |
| 4 — STAR translation fidelity | Restored failed-task, rerunning, and downstream-team meaning in the authorized literal translation. All original placeholder tokens remain exact; no new experience claim was added. |
| 5 — README labels | Documented both grade-label sets and Guardado / Saved. |
| 6 — ownership of ADR rationale | Left Diego's rationale/answer open, clearly labeled implementation evidence and proposed interview wording as agent-written. |
| 7 — immediate select navigation | Kept the approved native selector and added a visible, described notice before selection explaining that it opens this page in the chosen language. Checked the updated 400px layout. |
| 8 — alternate URLs | Confirmed generated alternates are relative. An absolute metadataBase remains deferred until Diego chooses a real hosting domain. |
| 9 — default 404 | Confirmed Next's default 404 has no HTML language. Localized/ styled error pages remain a minor follow-up; unknown routes already return HTTP 404. No experimental routing flag was introduced. |

After corrections, make check passes with 71 tests and both builds. The corrected
selector notice was observed in the native browser and fits the 400px layout.

### Original read-only report

# Code review: bilingual study feature (`ae0f2a8..HEAD` plus pending docs)

**Verdict:** I found no Critical or Important defects. The feature matches what Diego approved for ADR-012 (Option A), and it is ready to merge once the small fixes below are made.

**Scope note:** This review is read-only. I didn't run tests, builds or browsers, so anything about runtime behaviour relies on the coordinator's evidence. I wasn't allowed to run git, so I reviewed the current text of README, AGENTS and SPEC against the code rather than a literal diff.

## Critical
None.

## Important
None.

## Minor: actual defects

1. **A 409 conflict leaves the language selector disabled with a message the user can't act on.**
   - **Where:** `src/components/QuestionPractice.tsx:38` sets `pending` for every `failed` state, including the non-retryable conflict (`:50-53`).
   - **Failure:** After a 409, the selector stays disabled and says "Confirm this review before changing language" (`src/lib/messages.ts:19`, `:120`). The review can never be confirmed, and only a reload clears it. After a 409 there is no retry identity left to protect, which was the whole reason for the guard (ADR-012:31). This is rare: it needs the same UUID sent with a different payload.
   - **Fix:** `const pending = state.status === "saving" || (state.status === "failed" && state.retryable);`

2. **The "confirm this review" note shows up on every save, including successful ones.**
   - **Where:** `src/components/LanguageSelector.tsx:47-51`.
   - **Failure:** `saving` counts as pending, so each grade briefly shows the amber note. Because it has `role="status"`, screen readers also announce "Confirm this review before changing language" on every grade, even when the save succeeds within milliseconds.
   - **Fix:** Keep `disabled` while saving. Either show the note only when a review has failed (this needs a second flag in the context), or drop `role="status"` and rely on `aria-describedby`.

3. **English text on Spanish pages isn't marked as English.**
   - **Where:** The heading at `src/app/[locale]/concepts/[id]/page.tsx:74-77` uses `messages.es.concept.interview`, which is "How to say it in the interview" (`messages.ts:157`). Its paragraph has `lang="en"` (`:78`); the heading doesn't. The Spanish section label "AI code review" (`messages.ts:126`) has the same problem.
   - **Failure:** Screen readers pronounce these English phrases with Spanish phonetics.
   - **Fix:** Add `lang="en"` to that `<h2>`. Keep the wording; it is English on purpose (spec line 14).

4. **Spanish STAR translation loses a little meaning.**
   - **Where:** `content/es/behavioral/airflow-migration.md:7` and `:18-19`.
   - **Failure:** "retries a single failed task instead of rerunning the whole pipeline" became "reintenta una sola tarea en vez de ejecutar todo el pipeline". That drops "failed" and the "re-" in rerunning. "a downstream team" became "otro equipo" (`:16-17`).
   - **Fix (for Diego to accept or reject):** "reintenta solo la tarea fallida en vez de volver a ejecutar todo el pipeline". No metric was invented.

5. **README still lists only the Spanish labels.** `README.md:49-50` lists only **Lo sabía / Dudé / No lo sabía**, and `:100` says **Guardado**. Both are now localized. Mention the English labels too ("Knew it / Hesitated / Did not know", "Saved").

6. **ADR-012 doesn't record Diego's own reason.**
   - **Where:** The Decision (`docs/adr/0012-static-bilingual-study-pages.md:22`) gives no "because" beyond "approved after presenting it as the recommended option". So an interviewer's "why Option A?" has no answer in the ADR.
   - **Inconsistency with ADR-011:** ADR-011 labels its 30-second line "Proposed wording for Diego to review". ADR-012:43 doesn't. Its pushback answer (`:39`) is also agent-written, under the "my answer" heading.
   - **Fix (docs only):** Leave `because ___` for Diego, and label the 30-second line as proposed wording.

## Minor: design questions or deferred items (not implementation defects)

7. **Changing the selector navigates immediately** (`LanguageSelector.tsx:26-38`). On Windows/Linux, pressing an arrow key on a focused, closed `<select>` fires `change` straight away, so a keyboard user exploring the control reloads into the other language. That is the WCAG 3.2.2 "On Input" pattern. It follows from the approved native select, so it's Diego's call. Options: two `<a hreflang>` links (which would also work without JavaScript), or a select with an apply button.

8. **The hreflang alternates are relative** (`src/app/[locale]/layout.tsx:28`, `concepts/[id]/page.tsx:34-39`). With no `metadataBase` set, I expect Next to output relative `href`s; please confirm in `out/`. Search engines want absolute URLs. Set `metadataBase` (and optionally `x-default: "/"`) when hosting is chosen.

9. **The 404 page isn't localized.** The app has multiple root layouts and no not-found page, so `out/404.html` is Next's default: English, unstyled, probably without `lang`, and with no link back to `/es/` or `/en/`. Separately, the `notFound` title fallback (`page.tsx:32`) can never run because `dynamicParams = false`. I'm not sure whether `global-not-found` still needs a flag in Next 16.3; check the [not-found docs](https://nextjs.org/docs/app/api-reference/file-conventions/not-found).

10. **The language guard is only covered by a reducer test** (`src/lib/review-navigation.test.ts`). Nothing tests saving/failed → disabled, saved/unmount → enabled, or the 409 case. Extracting a pure "does this state block switching?" function next to `assessmentReducer` would make fix 1 easy to test.

## Things to be ready to explain (not defects)

- **The guard only covers the selector.** Sidebar, related and back links unmount the question and release `pending` (`QuestionPractice.tsx:41`). That drops the retry identity, after which the language can be switched. This behaviour existed before the feature and is documented (README:101-104, ADR "not an offline queue").
- **Parity validation has a limit** (`src/lib/content.ts:129-162`). It catches removed or changed placeholders, but not a number *added* elsewhere in the text (for example, "migrated 40 jobs" with the placeholders left intact).
  - I compared all six pairs by hand and found no invented metrics.
  - An optional hardening would compare the digit sequences in each language pair. By my reading, current content would pass.
- **Smaller observations:**
  - With JavaScript off, localized pages have no way to switch language. That matches spec line 20.
  - In the sidebar, `pathname === home` (`Sidebar.tsx:42`) isn't trailing-slash-normalized, unlike the concept check at `:57-59`. Harmless with `trailingSlash: true`.

## Verified sound
- **Locale resolution and storage** (`locale.ts`):
  - Handles regional and mixed-case tags (`es-PE`, `es-419`, `EN-gb`), skips malformed tags, takes the first supported language, and lets a saved preference win.
  - Storage errors, including a `localStorage` access that throws, are caught because every access sits inside the try-wrapped callbacks (`LocaleEntry.tsx:8`, `LanguageSelector.tsx:30`).
  - `localeHref` rejects non-local paths and removes any existing locale prefix.
- **Routes and links:**
  - Explicit `/es/` and `/en/` routes set `<html lang>` from the route, and no client code overrides it.
  - Static params are set at both levels with `dynamicParams = false`.
  - Legacy links resolve through Spanish IDs, which parity guarantees match the English ones.
  - A grep found no hard-coded unlocalized links.
- **Retry identity:** Each question registers per `useId`, releases on cleanup, and is checked both in `disabled` and inside `onChange`. Saved failure messages can't go stale because switching is blocked while they're shown.
- **Content:** All six pairs match on concept and question IDs (including order), status, section and interview line. Placeholders are byte-identical, and the English STAR text matches `CONTENT_SEED.md:489-499` exactly.
- **UI text:** No hard-coded interface text remains outside `messages.ts`, apart from the brand name and the language names.
- **Docs:** The AGENTS/SPEC language and ADR-012 wording match the implementation.

**Readiness:** Ready to merge after fixes 1, 3 and 5, each a one-line change. Items 4, 6 and 7 are Diego's decisions. Items 8 and 9 can wait until hosting is decided. Item 10 is optional test hardening.
