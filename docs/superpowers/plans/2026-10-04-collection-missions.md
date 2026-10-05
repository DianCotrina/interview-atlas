# Collection missions implementation plan

Execution: native in this session, with a fresh read-only Claude review at the end.
Spec: `docs/superpowers/specs/2026-10-04-collection-missions-design.md`.

1. [ ] Import four seed pages in Spanish and English, retaining all existing material.
   Update catalog/parity expectations from six/eleven to ten/sixteen.
2. [ ] Add a Markdown-to-C# extraction script and .NET 8 xUnit sample project.
   Validate duplicates, anagram case/length/repetition, grouping order, empty inputs.
   Run `dotnet test` and add the same generation/test command to CI and Make.
3. [ ] Write failing trace/reducer tests for unchanged boards on wrong answers,
   earliest duplicate, unequal lengths, repeat rewards, and guarded phase advances.
   Implement pure trace builders and the mission reducer.
4. [ ] Build the bilingual mission board, map, hints, badges and entry links using
   current React/Next components. Verify keyboard, mobile, focus and API independence.
5. [ ] Run `make check`, review the branch with Claude, resolve real issues, record
   evidence, update scope docs, integrate and push to the authorized public repo.

Constraints: strict TypeScript; no new frontend dependencies; no automatic POSTs,
game persistence, timer, scheduler or new backend interface. Source placeholders and
prior Markdown remain unchanged. C# extraction and tests validate the code displayed,
not a manually maintained copy. Native buttons work without pointer-only actions.

Review focus: early-stop duplicates must preserve left-to-right order; empty inputs
must terminate; solved objectives cannot mint repeat stars; a wrong answer cannot
advance; reload/language selection must clearly communicate session reward loss.
