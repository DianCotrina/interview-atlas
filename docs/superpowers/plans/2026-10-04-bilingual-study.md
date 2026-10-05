# Bilingual Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver complete English/Spanish selection with static localized reading and shared progress.

**Architecture:** Static `/es/` and `/en/` routes consume parallel validated Markdown and typed UI dictionaries. Entry pages resolve browser/saved preferences; review identity remains locale-independent.

**Tech Stack:** Existing Next.js, TypeScript, React, Markdown, Go and PostgreSQL; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-04-bilingual-study-design.md`

## Global Constraints

- Only `es` and `en`; Spanish fallback; explicit localized route wins.
- Preserve placeholder tokens, original study meaning and stable IDs. No invented metrics.
- Static export; localized HTML/metadata; no progress API dependency for reading.
- No changes to Go, database, scheduler or deployment topology.
- Strict TypeScript, visible focus, keyboard controls and responsive selector.

## Review Focus

- Regional or unsupported browser preferences and blocked/invalid storage must resolve safely.
- Direct links must not switch language because of a stored preference.
- A missing translation or changed question identity must fail the build.
- Switching during an unconfirmed save must not lose its retry identity.
- Legacy links, unknown routes and JS-disabled reading must remain understandable.

### Task 1: Locale resolution and bilingual content

**Files:** Create `src/lib/locale.ts`, `src/lib/locale.test.ts`, `src/lib/messages.ts`, `src/lib/localized-content.test.ts`, `content/en/**/*.md`; move Spanish Markdown to `content/es/`; modify `src/lib/content.ts`.

**Interfaces:** Produce `Locale`, `isLocale`, `resolveLocale`, `getPreferredLocale`, `rememberLocale`, `localeHref`, `messages` and `loadLocalizedConcepts(locale, root?)`; retain existing concept/question types and `loadConcepts(directory?)`.

- [ ] Write regional preference/storage/path and translation parity tests; run `npm test` and observe missing feature failures.
- [ ] Implement pure locale helpers, typed dictionaries and locale-aware content loading.
- [ ] Add literal translations, retaining IDs/interview sentences/placeholders; translate the English STAR source to Spanish without adding facts.
- [ ] Run `npm test` and `npm run typecheck`. Expected: all tests pass and no type errors.
- [ ] Commit `feat: add validated bilingual study content`.

### Task 2: Localized routes and selector

**Files:** Create `src/app/(entry)/` entry/legacy pages and layout, `src/app/[locale]/` catalog/concept pages and layout, `src/components/LocaleEntry.tsx`, `src/components/LanguageSelector.tsx`, `src/components/ReviewNavigation.tsx`; modify existing study components, CSS and progress labels.

**Interfaces:** Consume Task 1 locales/content/messages. Pass `locale: Locale` to study components. A provider exposes pending-review registration for the selector; network payloads retain existing identities.

- [ ] Add English Markdown tooltip/render coverage and observe the localization failure.
- [ ] Implement static localized root layout, catalog/concept routes, locale-safe navigation and bilingual legacy entry pages.
- [ ] Add selector and resilient stored preference, with review guard; localize all user-visible component text and plural forms.
- [ ] Run `npm test`, typecheck, lint and build. Expected: exported ES/EN catalogs, twelve concepts and legacy entry pages.
- [ ] Inspect export language, title, content/navigation, placeholders and missing-route behavior; browser-check selector, keyboard, preference and shared history.
- [ ] Commit `feat: add English and Spanish page selection`.

### Task 3: Review and delivery

**Files:** Update README, SPEC and AGENTS language conventions; create durable review evidence under `docs/reviews/`.

**Interfaces:** Consume the completed localized surface and unchanged progress service.

- [ ] Update feature/setup docs and write the interview explanation; keep later phase tasks open.
- [ ] Run `make check`. Expected: full frontend/Go/DB checks and both builds pass.
- [ ] Request a read-only Claude review; validate findings, fix material defects with failing regression coverage, and rerun checks.
- [ ] Fast-forward clean main using existing delivery authorization, verify integrated tree, push and observe matching GitHub CI success.
- [ ] Preserve durable evidence, clean only this plan's scratch workspace, and report local ES/EN links plus limitations.
