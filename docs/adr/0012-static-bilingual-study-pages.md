# ADR-012: Static bilingual study pages

- **Status:** accepted (Diego approved Option A; his interview defense remains his own)
- **Date:** 2026-10-04
- **Decider:** Diego

## Context

- Diego wants a selector for English and Spanish across the interface and study material.
- The frontend must remain statically exported and readable during a progress API outage.
- Language changes must retain the current concept and the existing question history.
- Browser language preferences can include a region, but do not establish physical country.

## Options considered

1. **Option A** — static `/es/` and `/en/` routes, browser-language initialization and a saved manual preference. Shareable language-specific pages; translations must be kept in sync.
2. **Option B** — existing routes with translations selected in JavaScript. Fewer route changes; links cannot identify the language, and translated reading depends on JavaScript.
3. **Option C** — localized routes initialized from IP-based country detection. Country-based defaults; adds a network integration and may misidentify travelers or VPN users.

## Decision

We choose **Option A**, approved after presenting it as the recommended option.
Diego's personal rationale remains for him to write: ___.
Locale-specific Markdown and typed interface dictionaries produce both languages at build time; stable concept/question IDs keep progress independent of language.

## Consequences

- Good: localized pages, metadata and HTML language are available without the Go API or client-side translation.
- Accepted downside: two content variants need maintenance; build-time validation checks matching identities and preserved placeholders.
- Explicit links win over browser/storage preferences. Unlocalized entry pages use a valid saved preference, then the first supported browser language, then Spanish (the existing default).
- Manual selection saves only a language preference in localStorage; blocked storage does not prevent switching.
- The selector stays disabled while a review is saving or awaiting confirmation, so switching cannot discard its retry identity. This is not an offline attempt queue.
- Existing concept URLs offer a localized destination instead of breaking saved links.
- What would make us revisit this: more languages, a translation management workflow, or a genuinely country-dependent requirement.

## Pushback and my answer

> Two Markdown variants can drift. How will you prevent translations from splitting a question's history or fabricating a behavioral metric?

**Diego's answer:** ___.

**Implementation evidence (agent-written):** checks compare stable concept/question identities, section/status, interview phrasing and exact placeholder tokens across both variants.

## Say it in the interview (30 seconds)

**Proposed wording for Diego to review:**

"I generate English and Spanish pages statically, while concept and question IDs stay language-independent so switching languages preserves review history. The trade-off is maintaining two content variants, which I check for structural consistency at build time."

## References

- [Next.js internationalization and static rendering](https://nextjs.org/docs/app/guides/internationalization)
- [Browser language preferences](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages)
