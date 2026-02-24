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

## Branching and Pull Requests

- Branch from `main`.
- Keep each PR focused on one problem area.
- Use descriptive commit messages and PR titles.
- Open draft PRs early when you want feedback on direction.

Include in every PR:
- What changed
- Why it changed
- Testing/validation notes
- Screenshots or video for UI changes
- Explicit follow-ups (if anything is intentionally deferred)

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
