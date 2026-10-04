# System Design Track

You learn system design here by making real decisions on a real system, then defending
them. Every ADR is a mini system-design interview. Do them out loud, **in English**.

## The ritual for every ADR (15–30 minutes)

1. **Clarify requirements out loud.** What must this do? What scale? What fails if it's
   wrong? Write 3–5 bullet requirements before anything else. (Your recurring habit is
   jumping to the solution — this step exists to break it.)
2. **Ask the agent for 2–3 options**, not a recommendation.
3. **Pick one and say why** in two sentences, naming the trade-off you accept.
4. **Let the agent push back** like an interviewer. Answer the pushback in writing.
5. **Write the ADR** with the template. The "Consequences" section must include at least
   one downside you're accepting.
6. **Add a drill question** about this decision to `content/` so it gets spaced review.

## The 5-step interview framework (what the ritual trains)

1. Clarify requirements → 2. High-level design → 3. Deep dive (where the interviewer
pushes) → 4. Trade-offs (scalability, consistency, availability, cost) → 5. Failure
modes and observability.

## Concept map — what each phase teaches

| Phase | Decision | Concepts you'll be able to explain |
|---|---|---|
| 1 | Content as files, progress in localStorage | Static vs dynamic, client state, why "no backend" is a valid choice |
| 2 | ADR-001 Move progress server-side | Source of truth, sync, offline-first trade-offs |
| 2 | ADR-002 Database + Clean Architecture | Dependency inversion, repository pattern, testability, swapping infrastructure |
| 2 | ADR-003 API shape | REST resources, status codes, idempotency keys, ProblemDetails, versioning |
| 3 | ADR-004 Lambda vs container | Serverless trade-offs, cold starts, scaling to zero, cost model |
| 3 | ADR-005 DynamoDB design | Access-pattern-first modeling, partition/sort keys, denormalization, no joins |
| 3 | ADR-006 Auth | AuthN vs AuthZ, least privilege, simplest-secure-enough |
| 3 | ADR-007 IaC | Reproducibility, drift, rollback |
| 3 | Runbook | Observability, logs/metrics/alerts, RCA |
| 4 | ADR-008 External AI dependency | Timeouts, retries with backoff, circuit breaker, fallbacks, rate limiting, cost caps |

## Questions to answer before each ADR

**ADR-002 (database + layers)**
- If I replace this database next year, which projects change? (Target answer: only
  Infrastructure.) Can I prove it with a test?
- Where does the scheduler logic live, and why not in the controller?

**ADR-003 (API)**
- If the client retries "record attempt" after a timeout, does the attempt get counted
  twice? How do I prevent it?
- Which errors are 400, 404, 409, 500? What does the client see for each?

**ADR-004 (compute)**
- What happens the first request after 20 minutes idle? Is that acceptable for a
  one-user study app? Would it be acceptable for a clinical app?

**ADR-005 (DynamoDB)** — the big one
- List every query the app runs. Which one is most frequent?
- What is the partition key, and does any single key get "hot"?
- What do I give up compared to SQL (joins, ad-hoc queries), and is that OK here?

**ADR-008 (AI dependency)**
- The AI API hangs for 30 seconds. What does my endpoint do? (Hint: async alone does
  not protect you — connections and resources still get exhausted.)
- The AI API is down for an hour. What does Diego see in drill mode?
- How do I stop a bug from spending $200 in API calls overnight?

## Practice prompts (whiteboard, no code)

Do one per week, 30 minutes, out loud in English, then compare with the agent's critique:

1. Put a modern REST API in front of a legacy SOAP/WCF backend that must keep serving
   its old clients. (This is your real project — your strongest answer.)
2. Design an alerting and escalation system that avoids alert fatigue.
3. Design multi-tenant storage for a SaaS app holding sensitive data.
4. Design an event-driven pipeline that processes uploaded files, with at-least-once
   delivery and no duplicate side effects.
5. Design an append-only audit log that never slows down the main transaction.
