# Semantic releases

Diego selected automatic versioning from Conventional Commits for the first
Vercel deployment. Release Please prepares a release pull request; merging that
PR creates the GitHub release and immutable `vX.Y.Z` tag. No npm package is published.

## Version source and compatibility

`package.json` is the application version source. The sidebar reads it at build
time, so the deployed site displays the version of its source revision in either
language. `package-lock.json` and, after bootstrap, `.release-please-manifest.json`
must match it. `npm run check:version` validates strict SemVer and those copies;
`npm run build` runs that check automatically before producing the static export.

One release identifies the repository snapshot, including its static content and
Go code. It does not change the Go module path, database schema or API URLs.
Compatibility includes supported localized URLs, concept/question identities,
progress request/response shapes and retry semantics. The project remains in
initial development at `0.x`; no stable `1.0` API commitment is implied.

| Commit | Next version from 0.1.0 | Meaning |
| --- | --- | --- |
| `fix: correct duplicate feedback` | 0.1.1 | Compatible correction |
| `feat: add a collection mission` | 0.2.0 | Compatible feature |
| `feat!: change the attempt contract` | 0.2.0 | Incompatible change during initial development |
| `docs: clarify the setup guide` | No release by itself | Documentation only |

Once at `1.x`, an incompatible change increments the major version. Use `!` or a
`BREAKING CHANGE:` footer to identify it. Release Please chooses the highest bump
among accumulated changes and resets lower numbers. Read the generated changelog
for compatibility details; a number alone cannot distinguish features from
breaking changes while this project is below `1.0`.

## Workflow

1. Commit with the existing Conventional Commits convention and push to `main`.
2. The Release workflow creates or updates a release PR containing the next
   version, lockfile, manifest and changelog. It never auto-merges that PR.
3. It explicitly dispatches CI on the release branch using the built-in
   `GITHUB_TOKEN`. This avoids relying on bot-generated PR events to run checks
   unattended and needs no stored personal access token.
4. Review the generated changes and passing CI, then merge the release PR.
5. The next Release run creates the matching tag and GitHub release. Vercel's Git
   integration can build the merged revision using its normal project settings.

Only the Release job has write permissions: contents for branches/tags/releases,
issues and pull requests for release labels/PRs, and actions for CI dispatch.
Ordinary CI keeps read-only repository access. Repository Settings > Actions >
General must allow GitHub Actions to create pull requests. That setting also
permits approval, but this workflow neither approves nor merges PRs.

The first release starts at `0.1.0`. The initially empty manifest is the documented
Release Please bootstrap state; the first merged release PR populates it.
`bootstrap-sha` excludes already completed development history from automatic
release notes. It is ignored after the first release. Do not edit published tags,
increment versions manually, or auto-merge release PRs. Publish a new version for
a correction. The Release workflow also supports manual dispatch from `main` to
retry a failed run.

Vercel deployments and GitHub releases are separate events. A normal `main` push
can be deployed before a release PR merges, with the previous package version.
Use Vercel's commit SHA to distinguish such builds. This configuration does not
make Vercel deploy only tagged releases or gate production deployment on CI.

## Vercel setup

The repo now selects Node `24.x`, matching a documented Vercel runtime. Use the
Next.js framework preset, repository root and `npm run build`; the existing
`output: "export"` keeps the site static. The build needs Node and npm, without Go,
PostgreSQL or .NET. Full GitHub CI still validates those components independently.

This deploys the study frontend. The current Go API remains local and
unauthenticated. Reading, answer reveal and collection missions work without it;
hosted progress, authentication and database deployment remain Diego's decisions.
`NEXT_PUBLIC_PROGRESS_API_URL`, when eventually configured for a hosted service,
is a public build-time value, not a place for credentials.

## What changed and why

Conventional Commits drive release proposals and changelogs.
Reviewing the generated PR keeps compatibility changes visible.
One build-time package version identifies the deployed application.
The build rejects inconsistent version files before deployment.
Explicit CI dispatch checks bot-created release branches without a personal token.
Node 24 aligns local verification, GitHub CI and Vercel's documented runtime.

Interview sentence: "I automate version proposals from Conventional Commits,
validate release branches in CI, and embed the package version in the static build."

## References

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Release Please Action](https://github.com/googleapis/release-please-action)
- [Manifest bootstrap and version policy](https://github.com/googleapis/release-please/blob/main/docs/manifest-releaser.md)
- [GitHub workflow dispatch and bot event behavior](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)
- [Vercel Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
