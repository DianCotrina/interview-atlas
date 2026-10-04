# ADR-010: PostgreSQL for study attempts

- **Status:** proposed (Diego selected PostgreSQL; written review is outstanding)
- **Date:** 2026-10-04
- **Decider:** Diego

## Context

- The Go API needs persistent progress from Phase 1.
- The initial app serves one learner and runs locally.
- Diego chose review-attempt history, which requires retry deduplication.
- Storage is also an opportunity to practice production-style SQL and concurrency.

## Options considered

1. **SQLite** — durable local SQL without a separate service; requires a driver and
   migration management.
2. **JSON file** — smallest setup; concurrent writes and history queries need care.
3. **PostgreSQL** — transactions, SQL, and concurrency practice; adds a database
   service, credentials, and operational work.

## Decision

Diego selected **Option 3, PostgreSQL**. His recorded selection explicitly accepts the
separate service in exchange for production-style SQL and concurrency practice.

## Consequences

- Good: database constraints can protect concurrent retry deduplication.
- Accepted downside: local development and later hosting need a PostgreSQL service.
- Revisit if: the maintenance cost outweighs its learning value or serverless access
  patterns lead Diego to choose a different store in Phase 3.

## Pushback and my answer

> Why pay the operational cost of PostgreSQL when SQLite would serve one learner?

Diego's detailed defense has not been supplied yet. Record it after written review.

## Say it in the interview (30 seconds)

Proposed wording for Diego to review: "I selected PostgreSQL to practice SQL,
transactions, and concurrency on a real progress API. A separate database is more
operational work than SQLite; this choice prioritizes my learning goal."
