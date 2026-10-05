# Collection missions review and verification

Scope: four bilingual untimed collection missions, four imported seed concepts,
and executable tests for every complete fenced C# algorithm currently displayed.
Diego selected hints and per-pattern badges. Game rewards are in memory, separate
from explicit Go review attempts. No scheduler or other `[DIEGO]` implementation
was added.

## Independent review

Two read-only Claude Opus sessions reviewed the implementation and fixes. The first
identified a blocking session-lifetime bug; the follow-up reported no blocking
issues and four smaller findings. Both sessions inspected code without running
tests or operating a browser. Their reports are reproduced below; historical
findings and counts describe the revisions reviewed, not the final state.

| Finding | Resolution |
| --- | --- |
| Study navigation discarded game state | Moved the reducer into the locale layout's client provider. In-memory state survives concept navigation and resets on reload/language change. |
| Repeating a wrong answer produced identical feedback | Added a per-objective attempt counter to live feedback. Wrong answers still leave the board and rewards unchanged. |
| Generic feedback did not explain anagram decisions | Added reason-specific feedback for length, frequency, membership and comparison decisions. |
| Raw Markdown appeared in summaries | Removed formatting markers in the presentation layer; Spanish source wording remains unchanged. English counting summary now translates the seed literally. |
| Normalization test used identical strings | Added precomposed versus decomposed Unicode cases to both C# and TypeScript tests. |
| Star counts relied on an invalid span label | Added screen-reader-only text and kept decorative stars hidden from accessibility APIs. |
| C# extraction recognized only one fence spelling | Added a tested parser for supported C# aliases/fence styles and rejection of unclassified, unclosed or unsupported nested fences. |
| SPEC overstated snippet coverage | Specified complete fenced algorithms; inline syntax fragments remain prose. |
| Grouping fixture did not demonstrate repetition | Included a repeated action and verified the displayed list preserves both copies. |
| SDK selection and prerequisites were ambiguous | Pinned .NET 8.0.425 with patch roll-forward; documented the accepted 8.0.4xx range. |
| JavaScript requirement was unclear | Added a no-script explanation with readable study links. |
| Returning to a solved step stole focus | Focus now moves to Continue only when a newly answered step changes from unsolved to solved. |
| Attempt counter looked like a traversal count | Reset the counter on each objective/move and labeled it Attempt/Intento. |
| Unused feedback keys remained | Removed the unused keys. |

Optional follow-ups remain outside this slice: deep-linking a specific mission from
its concept invitation, a terminal no-duplicate visual step for a future fixture,
and further campaign copy/layout refinements. The current duplicate mission
contains a duplicate; its C# tests also cover the null result. Free hints are the
approved game behavior, and replay keeps each mission's earned maximum.

## Final verification

`make check DOTNET=/Users/diegocotrina/Library/Caches/interview-atlas/dotnet/dotnet`
passed after the final code changes:

- 99 Vitest tests, strict TypeScript checking and ESLint.
- Go unit tests and PostgreSQL integration tests with the race detector.
- 17 xUnit cases compiled from four Markdown-derived C# methods.
- Next.js static export with 39 generated pages and Go command builds.

Native browser checks covered desktop play, keyboard controls, visible focus,
400px mobile layout, both languages, repeated wrong answers, and the completed
counting, grouping, duplicate and anagram traces. Study navigation preserved the
earned star and solved step; returning no longer focused Continue automatically.
Changing language reset the session as documented.

With the progress API stopped, a mission remained playable and completed. After
the API was restarted, its health check passed and the prior review history was
unchanged. Game interactions submitted no self-assessments. Spanish seed body
integrity and exported locale HTML were checked separately. Accessibility labels
and feedback were inspected through the native accessibility tree; no full
VoiceOver session was performed.

## What changed and why

Untimed objectives turn collection choices into visible decisions.
Wrong answers explain the reasoning without advancing the traversal.
A locale-level provider preserves practice state while reading concepts.
Game rewards remain separate from persisted self-assessment.
Markdown-derived C# tests keep the displayed study code executable.

Interview sentence: "I separated interactive practice from persisted
self-assessment and tested the displayed C# directly from Markdown."

## Initial Claude report

# Collection missions review

I found one real bug that should be fixed before merge and a handful of smaller bugs. The core logic is sound: I checked the reducer, all four traces and the C# test pipeline, and they behave as specified.

## Should fix

**1. Stars are lost on any page change, not only on reload or language switch** (Important)
- **Where:** `src/components/CollectionGame.tsx:126`, `src/lib/game-copy.ts:22` and `:54`, `README.md:71-73`.
- **Problem:** `useReducer` keeps the game state inside the play page. `next.config.ts` doesn't turn on any feature that keeps a page's state after you leave it. So following the in-game "Read the concept" link, a sidebar link, or the concept page's invitation unmounts the game, and coming back starts a new game with zero stars.
- **Why it matters:** the on-screen note says only reloading or changing language resets the game. The README even tells users to follow "Read the concept", which is exactly the flow that wipes their stars.
- **Fix:** move the reducer into a client provider in `src/app/[locale]/layout.tsx`, next to `ReviewNavigationProvider`. State would still be in memory only, survive moving between pages, and still reset on reload and on language switch (the language selector does a full page load). That matches the approved design. Don't use sessionStorage: it survives reloads, which contradicts the note.

## Minor bugs

**2. A second identical wrong answer gives no feedback** — `CollectionGame.tsx:114`
The reducer sets `verdict: "wrong"` again, but the message text doesn't change. Screen readers announce nothing, and sighted users can't tell the second click registered. The spec requires feedback to be announced. Fix: include a counter as the element's key, or the chosen option in the message.

**3. Some wrong-answer messages don't fit the decision** — `game-copy.ts:27` and `:59`, used at `CollectionGame.tsx:35`
One generic message ("Is the key new, already present, or ready to compare?") is used for every step. It doesn't explain a wrong choice at the anagram length check (continue vs. reject), or a wrong match/mismatch at the comparison step. The spec says wrong answers "explain the mistake". Fix: write a wrong-answer message for each reason.

**4. Spanish counting summary shows raw `**`, and the English summary isn't a literal translation** — `content/es/patterns/dictionary-counting.md:7`, `content/en/patterns/dictionary-counting.md:7`
- The catalog (`ConceptCatalog.tsx:90`) and the page's `<meta description>` render the summary as plain text, so `**tiene memoria**` appears with its asterisks.
- Other pages strip bold from summaries (e.g. `es/fundamentals/big-o.md:7`).
- The English summary drops the "Why it is O(n):" lead, which AGENTS.md's literal-translation rule doesn't allow.
- Per AGENTS.md, propose the wording change to Diego rather than editing it yourself.

**5. The normalization test doesn't test normalization** — `samples/InterviewAtlas.Samples.Tests/StudySamplesTests.cs:53`
`("é", "é", true)` uses the same precomposed character on both sides, so the two strings are identical. To show "no normalization", use something like `("é", "e\u0301", false)`. Add the same case to `collection-traces.test.ts`.

**6. Per-mission star counts may not reach screen readers** — `CollectionGame.tsx:62`
`aria-label` sits on a plain `<span>`, where ARIA doesn't allow it; screen readers may ignore it and axe flags it. The visible stars are `aria-hidden`. Use visually hidden text instead.

**7. The snippet guard only catches one fence spelling** — `scripts/generate-csharp-samples.mjs:15`
It only matches lines starting exactly with ```` ```csharp ````. A future block written as ```` ```cs ````, ```` ```c# ````, `~~~csharp`, an indented fence, or with extra text after the language name would be shown on the site but never compiled. That breaks the README claim that unregistered snippets are rejected. Fix: match any C# fence name, and fail on any fence the script can't classify.

**8. SPEC overstates the C# test coverage** — `docs/SPEC.md:91-92`, related to `:110`
The task is checked as "every C# snippet shown on the site". In practice only fenced blocks compile. Inline C# such as the counting page's `conteo[c] = conteo.GetValueOrDefault(c) + 1;` and the hidden-loop example are not compiled. The README wording ("displayed fenced C# algorithms") is accurate; SPEC should say the same.

## Optional improvements

- **Hints give away answers:** in the cost phase the hint is the same text as the correct-answer explanation (`CollectionGame.tsx:123`). In the collection-choice phase, the first-duplicate hint ("Check membership BEFORE adding") is about stepping through, not choosing a collection. Since hints are free by design, this is a content choice.
- **Grouping mission data:** the input at `collection-game.ts:15` has no repeated action within a group. The goal promises to "keep repeated actions", and the seed's lesson about using a List rather than a HashSet as the value never comes up. A second `Ada: scan` would fix that.
- **Clicking the current mission restarts it:** the button at `CollectionGame.tsx:60` is marked `aria-pressed`, yet pressing it again silently resets that mission's progress (stars are kept). `aria-current` would describe it more accurately.
- **CI may build with a newer SDK:** there's no `global.json`. setup-dotnet then builds with the newest SDK on the runner, which may be newer than .NET 8. Combined with warnings-as-errors, CI could fail where local builds pass. I also couldn't confirm that the `actions/setup-dotnet@v6.0.0` tag exists; the first CI run will show it (`ci.yml:31`).
- **No JavaScript:** the play page shows answer buttons that do nothing. The `<noscript>` block adds links but doesn't say the game needs JavaScript.
- **Invitation always opens mission 1:** the compact invitation on, say, the anagrams page starts the counting mission.
- **Traces:**
  - `duplicateTrace` has no final `return null` step when there are no duplicates (no mission hits this).
  - The anagram counting steps ask "create vs. increment", but the C# shown is a single `GetValueOrDefault(c) + 1` with no branch.
- **Small cleanups:**
  - the `choose` text key is unused;
  - `12` is hard-coded twice;
  - the generated `// Source:` comment hard-codes the `patterns/` folder (`generate-csharp-samples.mjs:41`);
  - the plan document's checkboxes are still unchecked.

## Checked and correct

- **Traces vs. C#:** they follow the C# exactly:
  - the duplicate check happens before adding;
  - the scan stops at the earliest second occurrence (`A,B,B,A → B`);
  - unequal lengths are rejected in both directions;
  - the comparison stops at the first mismatch;
  - empty input finishes;
  - characters are counted per UTF-16 unit.
- **Reducer:** a wrong answer leaves the board and stars unchanged, and "next" can't advance an unsolved step. Answers that don't belong to the current step are ignored. Stars only go up and cap at 3, and replaying or switching missions keeps them.
- **Cost questions:** each one has exactly one correct option. O(n)/O(k) is left out of first-duplicate and O(n)/O(n) out of counting, and every mission defines n and k.
- **Persistence:** no game code calls the API, and the Go self-assessment code is untouched.
- **Content:**
  - the Spanish code and text match the seed;
  - the English code is identical;
  - IDs and interview lines match across languages;
  - the counts (ten concepts, sixteen questions, 16 xUnit cases) are consistent.
- **Wiring:** the CI step order (Node before `dotnet test`) and the Make target are correct.

## Readiness

Not ready to merge until #1 is fixed, because it contradicts the session behaviour the UI and README promise. #2–#8 are small and could go in this branch or a quick follow-up. #4 needs Diego's sign-off since it changes study wording. I couldn't open a browser, so the 400px and laptop layouts and the actual screen-reader output still need a manual check.

## Follow-up Claude report

No blocking issues remain. The fixes address the original findings. I found two minor regressions introduced by the fixes, one low-severity SDK wording gap and one nit. I only read code; I didn't run any builds or tests.

## Findings

**1. Minor: coming back to the game moves focus to Continue.** `src/components/CollectionGame.tsx:27-32`
- The focus effect also runs when the game mounts. `previousLocation` starts equal to `location`, so if `state.solved` is true it calls `continueButton.current?.focus()`.
- Before the fix this couldn't happen, because every mount started with a fresh, unsolved game. Now the state outlives the page, so returning to `/play/` after solving a step moves focus to Continue and scrolls the page to it. Your Safari test (step solved, one star, Read the concept, then Start playing) is exactly this path.
- On a 400px phone, Continue is probably below the fold, so the page will jump.
- Fix: only focus Continue when `solved` changes from false to true. Keep the previous `solved` value in a ref, the same way `previousLocation` is kept.

**2. Minor: the "Decision N" counter runs across the whole mission.** `src/lib/collection-game.ts:44`
- `next` doesn't reset `feedbackSequence`, so the number counts every answer since the mission started.
- If you answer everything right the first time, the first move shows "Move 1 / 5" next to "Good move. Decision 2.", and the numbers drift apart from there.
- The fix for repeated wrong answers does work: the counter changes, so the message is announced again.
- Fix: set `feedbackSequence: 0` in `next`. The copy key is already named `attempt`, so the text "Attempt" / "Intento" would describe it better than "Decision".

**3. Low: README doesn't match the SDK pin.** `README.md:10`, `global.json`
- `8.0.425` with `latestPatch` only accepts 8.0.4xx SDKs at patch .425 or later. The README only says ".NET 8 SDK".
- A machine with an 8.0.1xx SDK (for example Ubuntu's packaged one) or an older 8.0.4xx will fail `make check` with "compatible SDK not found". Passing `DOTNET=` doesn't get around it.
- CI is fine: setup-dotnet's `8.0.x` installs the newest 8.0 SDK, which is in the 4xx band, and `dotnet test` runs from the repo root, so `global.json` applies. This assumes the newest 8.0 SDK is .425 or later, which matches the release metadata you checked.
- Fix: state the version range in the README, or use `8.0.100` with `latestFeature` if any .NET 8 SDK should be accepted.

**4. Nit:** `wrongTrace` in `src/lib/game-copy.ts:11`, `:28` and `:67` is no longer used, like `choose` before it.

## Checked and correct

- **Provider lifetime:**
  - The only page that renders `CollectionGame` is `[locale]/play`, which is inside the provider.
  - `(entry)/play` only renders `LocaleEntry`, so there's no runtime error from a missing provider.
  - Switching language replaces the locale layout, so the session resets as the note says.
  - The SSR test is wrapped in the provider.
- **Feedback text:**
  - Every move offers exactly two choices, so the step-specific wrong message always explains the only wrong option.
  - The accessible star count uses the existing `.sr-only` class.
  - `plainSummary` also strips the single-asterisk italics in the problem-framing summary, which is intended. No summary contains a stray `*`.
- **Strict build guard:**
  - It rejects unlabelled, unknown, unclosed and nested or deeply indented fences.
  - It handles tilde fences, fences indented up to 3 spaces, and extra text after the language name, and removes the opening fence's indentation from the code correctly.
  - Summaries and drill answers are scanned too. `content.ts` requires every drill answer to be a string, so the scan can't crash on a missing one.
  - Current content has exactly 8 top-level `csharp` fences and none in frontmatter.
  - One known gap: 4-space indented code blocks without a fence aren't detected. That's consistent with SPEC's "complete fenced C# algorithm" wording, and no current content uses them.
- **CI wiring:**
  - The step order (Node, then `dotnet test`) and the MSBuild generation target are unchanged.
  - `tsconfig` has `allowJs`, so the test can import the `.mjs` fence parser.
