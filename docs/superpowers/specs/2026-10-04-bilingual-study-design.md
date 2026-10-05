# Bilingual study pages

Diego requested English/Spanish selection and approved the recommended Option A:
locale-specific static routes, browser-language initialization and saved selection.
ADR-012 records the options and consequences. This document specifies that approved
feature for implementation, without reopening the progress or deployment decisions.

## Behavior

- `/es/` and `/en/` contain localized catalog pages; both contain all six concepts
  and the same eleven question identities.
- `/es/concepts/<id>/` and `/en/concepts/<id>/` render localized titles, summaries,
  bodies, questions, answers, navigation, statuses, history and error messages.
- Interview phrasing stays English in both languages. Existing placeholder tokens
  remain visible and highlighted, with localized explanatory tooltips.
- A compact, labeled native select offers `Español` and `English`, stays visible on
  desktop/mobile, and retains the current concept when switching.
- Explicit localized routes render their language immediately, irrespective of
  storage/browser preferences; `<html lang>` and metadata match the route.
- `/` and legacy `/concepts/<id>/` provide bilingual destination links without JS.
  With JS, they replace the entry URL using a saved valid manual preference, then
  the first supported browser language (including regional tags), then Spanish.
- Switching writes a namespaced localStorage preference. Read/write failures are
  tolerated. No IP lookup, country dropdown, middleware, or new dependency.
- During saving or a retryable failed/unconfirmed review, disable the language selector and
  explain that the current review needs confirmation. Do not replace or resend it.
- Unsupported locale routes and unknown concepts are not generated and return 404.

## Structure and contracts

- `src/lib/locale.ts`: locale validation, browser preference resolution, storage
  resilience and local route construction; no content or network dependencies.
- `src/lib/messages.ts`: typed ES/EN interface dictionaries, including plural forms.
- `content/es/` and `content/en/`: parallel Markdown variants. The Spanish material
  is preserved except literal Spanish translation of the already-English STAR story.
  English variants translate the existing study wording without new examples/facts.
- `src/lib/content.ts`: keep `loadConcepts(directory?)` for validated Markdown loading;
  add locale-specific loading with identity/status/section/interview/placeholder parity.
- Entry route group has a minimal bilingual layout. The localized dynamic root
  layout owns correct HTML language and the study shell. Both use static exports.
- A small review-navigation context tracks unconfirmed question sessions for the
  selector. Go payloads and PostgreSQL schema stay unchanged.

## Validation

- Unit tests: regional language tags, unsupported languages, saved overrides,
  malformed preferences, blocked storage, locale switching paths and unsafe paths.
- Content tests: both catalogs, actual English searches, missing/extra translations,
  question identity changes, modified status/interview line or removed placeholders.
- Render tests: English content/tooltip and preserved placeholders; no active HTML.
- Full `make check`, static export inspection (all 14 localized pages, correct lang,
  localized navigation and metadata), legacy entry routes and unknown route 404.
- Browser: desktop/mobile selector, same-concept switching, saved preference/reload,
  keyboard access, shared history and disabled selection on unconfirmed save.
- Claude read-only final review, correction of material findings, GitHub CI after push.

## What changed and why

Language is encoded in static URLs, so shared links select the intended language.
Both translations use the same study identities, keeping stored history continuous.
Browser preferences initialize only unlocalized entry pages; manual selection is remembered.
Build validation guards translation structure and visible unknown experience metrics.
