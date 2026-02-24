# Contributing to OpenRides

Thank you for contributing. This project aims for clear, practical, and maintainable collaboration.

## Before You Start

- Read [`README.md`](./README.md) for setup and architecture.
- Read [`openrides-masterplan.md`](./openrides-masterplan.md) for product direction.
- For larger changes, open an issue first to align scope before implementation.

## Ways to Contribute

- Bug reports and reproducible issue writeups
- UX and accessibility improvements
- Documentation improvements
- Features or refactors aligned with roadmap and current architecture

## Local Development

```bash
bun install
bun run dev:setup
bun run dev
```

Useful focused commands:

```bash
bun run dev:web
bun run dev:native
bun run dev:server
```

## Development and PR Flow (Fork -> `dev`)

Follow this flow for all code contributions:

1. Fork the repository to your GitHub account.
2. Clone your fork locally.
3. Add the main repository as `upstream`.
4. Sync your local `dev` branch from `upstream/dev`.
5. Create a feature branch from local `dev`.
6. Implement changes and commit in focused units.
7. Push your feature branch to your fork.
8. Open a Pull Request from `your-fork/feature-branch` into `upstream/dev`.

Example commands:

```bash
git clone https://github.com/<your-username>/openrides.git
cd openrides
git remote add upstream https://github.com/<org-or-owner>/openrides.git
git fetch upstream
git checkout dev
git pull upstream dev
git checkout -b feat/<short-description>
```

Branch naming conventions:
- `feature/<short-description>` for new features
- `bugfix/<short-description>` for defect fixes
- `docs/<short-description>` for documentation-only changes
- `chore/<short-description>` for maintenance/tooling work

Examples:
- `feature/role-based-signup`
- `bugfix/native-auth-redirect`
- `docs/update-dev-setup`
- `chore/upgrade-convex-sdk`

Push and open PR:

```bash
git push -u origin feat/<short-description>
```

PR target rules:
- Base branch must be `dev` unless maintainers explicitly request another target.
- Keep each PR focused on one problem area.
- Use descriptive commit messages and PR titles.
- Open a draft PR early if you want feedback before final polish.

Include in every PR:
- What changed
- Why it changed
- Testing and validation notes
- Screenshots or video for UI changes
- Explicit follow-up items (if intentionally deferred)

After review feedback:
1. Push follow-up commits to the same branch.
2. Resolve review comments with clear notes.
3. Re-run checks before requesting re-review.

For larger PRs, include a short review guide to help reviewers navigate files in order.

## Code Quality and Validation

Run these before requesting review:

```bash
bun x ultracite check
bun x ultracite fix
bun run check-types
```

Expectations:
- Keep logic explicit and easy to follow.
- Avoid unrelated refactors in feature fixes.
- Maintain or improve type safety when touching domain logic.
- Remove debug-only logs and temporary scaffolding before merge.

If you cannot run a check locally, mention that clearly in the PR.

## Product and UX Guardrails

- Keep implementation aligned with current repo state and roadmap intent.
- Do not present planned features as already implemented.
- Preserve accessibility basics (labels, semantics, keyboard support where relevant).
- Keep role flows and permissions explicit as Passenger/Rider/Admin capabilities evolve.

## Security and Data Handling

- Never commit secrets or private credentials.
- Avoid logging sensitive personal data in production paths.
- Report potential vulnerabilities responsibly to maintainers.

## Community Expectations

All contributors are expected to follow [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).
Please keep review feedback specific, respectful, and actionable.
