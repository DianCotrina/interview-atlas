# Collection missions

Diego requested the next collection-pattern study block to feel like a video game.
He selected untimed missions, hints, and one badge per completed pattern. Game
rewards belong to the current session; existing self-assessment history stays in Go.

## Scope

Import dictionary counting, grouping, first duplicate, and anagrams from
`docs/CONTENT_SEED.md` without editing the Spanish source explanations or algorithms.
Add literal English variants with identical concept/question identities. Where the
seed has no summary or interview sentence, add a short description of that algorithm,
without claims about Diego's experience.

Extend the current static Next.js frontend with `/es/play/` and `/en/play/`.
Each mission has three objectives: pick a collection, predict each traversal decision,
and identify time/space cost. Wrong answers leave the board unchanged and explain the
mistake. Correct decisions update a visible collection board. Users advance explicitly,
can replay or switch missions, and earn at most three stars per mission in a session.
Hints are available without penalty. There is no timer, online judge, automatic review
grade, scheduler, durable game storage, new API shape, or backend migration.

## Interface

A mission map and star meter lead into a light-blue game board, a dark collection
inventory, and large answer controls. Blue `#2c5bd7`, ink `#172c43`, paper `#ffffff`,
sky `#eaf2ff`, gold `#d4a127`, and teal `#177568` extend the current palette.
System sans-serif is for instructions; monospace is reserved for the collection and
its actual keys. Mission nodes are a sequence of learning objectives, not decorative
metrics. Interactive tiles respond to decisions; ambient animation and audio are absent.

All controls are native buttons with keyboard focus. Feedback is announced politely.
Mission changes and phase advances move focus to the new heading. Reduced-motion
disables tile/reward animation. Layout must work at 400px and on a laptop.
Switching language or reloading starts a new game session, visibly explained in the UI.
Study links remain available with JavaScript disabled and during an API outage.

## Correctness

TS tests cover counting/grouping snapshots, earliest second occurrence, anagram
mismatches/length rejection/empty input, and reward/state transitions. Hash costs
are described as average-case, with `n` and `k` defined for each mission.
Anagrams operate on case-sensitive C# UTF-16 chars without normalization.

The .NET 8 xUnit project compiles the exact fenced C# methods extracted from both
languages. Tests call those generated methods on hand-checked inputs. The generated
file is ignored; the Markdown remains the source of truth. CI regenerates and tests
it, rejecting translation code drift or an unregistered C# snippet. No Diego-owned
interval, sliding-window, scheduler, or Domain/Application exercise is implemented.

## What changed and why

- Missions turn collection selection and traversal into visible decisions.
- Rewards measure completed practice objectives, not inferred mastery.
- Session state keeps the game inside the approved frontend boundary.
- Markdown extraction prevents tested samples from drifting from displayed code.
- Existing Go reviews remain explicit learner self-assessments.

Interview phrasing: "I separated interactive practice from persisted self-assessment,
and compiled the displayed C# examples directly from their Markdown source."
