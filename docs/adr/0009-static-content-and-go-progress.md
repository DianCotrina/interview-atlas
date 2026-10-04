# ADR-009: Static Next.js content and Go progress API

- **Status:** proposed (Diego selected the approach; written review is outstanding)
- **Date:** 2026-10-04
- **Decider:** Diego

## Context

- The app is both a useful interview study tool and an explainable portfolio project.
- Diego requested Go, TypeScript, and Next.js for practice.
- Markdown is the content source of truth; existing .NET study material remains.
- Reading concepts should keep working if the progress API is unavailable.

## Options considered

1. **Static Next.js first, Go in Phase 2** — faster initial delivery; delays Go practice.
2. **Go serves concept content from Phase 1** — immediate full-stack integration;
   reading depends on API availability.
3. **Static Next.js content, Go stores progress from Phase 1** — immediate Go practice
   while reading stays independent; adds service integration work immediately.

## Decision

Diego selected **Option 3**: Next.js builds concept pages from Markdown and Go stores
study progress. This applies his requested learning stack from the first version.

## Consequences

- Good: concept reading does not depend on Go or database availability.
- Accepted downside: an API, database, and frontend integration increase initial work.
- Revisit if: maintenance costs outweigh the learning benefit or content must become
  dynamically editable outside Git.

## Pushback and my answer

> What justifies adding a progress service immediately to a one-user study tool?

Diego's answer has not been supplied yet; do not treat an agent's explanation as his
interview answer.

## Say it in the interview (30 seconds)

Proposed wording for Diego to review: "I build concept pages statically so reading is
independent of the progress API. I use Go for progress to practice a new backend stack;
the trade-off is more integration and operational work from the start."
