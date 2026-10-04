# ADR-011: Preserve review-attempt history

- **Status:** proposed (Diego selected history; schema and written review are outstanding)
- **Date:** 2026-10-04
- **Decider:** Diego

## Context

- The frontend records self-assessments for study material.
- Diego wants review history, rather than only the current study state.
- A timed-out HTTP request may have committed successfully before the client retries.
- The spaced-repetition scheduler remains a separate exercise owned by Diego.

## Options considered

1. **Current state, GET and PUT** — smaller model and naturally idempotent updates;
   loses previous assessment history.
2. **Attempt history, GET and POST** — keeps the history; requires deduplication and
   a decision about stable question/concept identity.

## Decision

Diego selected **Option 2, attempt history**. The first-slice design proposes stable
question IDs and client-generated attempt IDs for his review before implementation.

## Consequences

- Good: later scheduling and learning analysis can use recorded attempts.
- Accepted downside: more records, aggregation queries, and explicit retry handling.
- Revisit if: question-level history is unnecessary or retention requirements change.

## Pushback and my answer

> If insertion succeeds but the response is lost, how do you prevent the retry from
> recording a second assessment?

Diego's answer is outstanding. The proposed implementation uses one stable attempt ID
for retries and a PostgreSQL uniqueness constraint; that proposal is not his answer.

## Say it in the interview (30 seconds)

Proposed wording for Diego to review: "I retain review attempts instead of overwriting
progress, so history remains available. POST needs explicit retry deduplication; the
design proposes a stable attempt ID enforced by a database constraint."
