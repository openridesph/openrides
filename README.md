# OpenRides

OpenRides is a donation-supported, bid-driven ride and delivery platform.
Passengers propose prices, riders can accept or negotiate, and both sides agree before a trip starts.

## Current Status

This repository currently contains a working full-stack foundation, not the full product scope yet.

Implemented today:
- Better Auth sign-up/sign-in flows on web and native
- Convex backend with health-check and authenticated/private query examples
- Todo demo flows on web and native backed by Convex
- Monorepo tooling (Bun + Turborepo + Ultracite + Husky)

Planned (tracked in masterplan):
- Passenger, Rider, Both-role, and Admin operational flows
- Bid negotiation lifecycle for ride/delivery requests
- Matching, trip tracking, moderation, and verification workflows

## Monorepo Structure

```text
openrides/
  apps/
    web/         TanStack Router + Vite web client
    native/      Expo Router mobile app (Uniwind + HeroUI Native)
    docs/        Astro Starlight documentation site
  packages/
    backend/     Convex functions, auth integration, schema
    env/         Shared runtime env validation for web/native
    config/      Shared TypeScript config package
  openrides-masterplan.md
```

## Tech Stack

- Runtime and workspace: Bun, Turborepo
- Language and quality: TypeScript, Ultracite (Biome), Husky
- Backend: Convex
- Auth: Better Auth + `@convex-dev/better-auth`
- Web: React 19, TanStack Router, Vite
- Native: Expo Router, React Native, Uniwind, HeroUI Native
- Docs: Astro + Starlight

## Quick Start

### 1. Prerequisites

- Bun `1.3.9+`
- Node.js LTS
- Expo Go (or simulator/emulator tooling) for native development

### 2. Install dependencies

```bash
bun install
```

### 3. Configure Convex deployment

```bash
bun run dev:setup
```

This runs Convex configure mode for `packages/backend` and creates backend env files.

### 4. Sync app environment files

Copy backend env values into app env files:

```bash
cp packages/backend/.env.local apps/web/.env
cp packages/backend/.env.local apps/native/.env
```

On Windows PowerShell:

```powershell
Copy-Item packages/backend/.env.local apps/web/.env
Copy-Item packages/backend/.env.local apps/native/.env
```

Required app env keys:
- Web: `VITE_CONVEX_URL`, `VITE_CONVEX_SITE_URL`
- Native: `EXPO_PUBLIC_CONVEX_URL`, `EXPO_PUBLIC_CONVEX_SITE_URL`

### 5. Configure Better Auth env in Convex

Run from `packages/backend`:

```powershell
bun convex env set BETTER_AUTH_SECRET "<your-random-secret>"
bun convex env set SITE_URL http://localhost:3001
bun convex env set ENVIRONMENT development
```

Optional for native deep links:

```powershell
bun convex env set NATIVE_APP_URL mybettertapp://
```

### 6. Start development

```bash
bun run dev
```

Common focused commands:

```bash
bun run dev:web
bun run dev:native
bun run dev:server
```

Default local URLs:
- Web app: `http://localhost:3001`
- Docs app: `http://localhost:4321` (when running docs dev server)

## Scripts

- `bun run dev`: Run all workspace dev tasks via Turborepo
- `bun run build`: Build all workspaces
- `bun run check-types`: Type-check all workspaces
- `bun run dev:web`: Run only web app
- `bun run dev:native`: Run only native app
- `bun run dev:server`: Run only backend Convex dev server
- `bun run dev:setup`: Run backend Convex setup/configuration flow
- `bun run check`: Run Ultracite checks
- `bun run fix`: Run Ultracite autofixes
- `bun run prepare`: Install Husky hooks

## Roadmap Snapshot

The roadmap is defined in [`openrides-masterplan.md`](./openrides-masterplan.md).

MVP direction:
- Multi-role accounts (Passenger, Rider, Both, Admin)
- Request creation and rider negotiation (accept/counter/reject)
- Service eligibility filters (service type and vehicle type)
- Verification and basic moderation flows

Future direction:
- SOS and emergency tools
- Trip sharing
- Offline support
- Smarter matching
- Donations/ads ecosystem maturity

## Community

- **Discord:** [Join the OpenRides community](https://discord.gg/aU8sJcqZ)

## Documentation

- Product roadmap: [`openrides-masterplan.md`](./openrides-masterplan.md)
- Setup deep-dive and troubleshooting: [`dev-env-setup.md`](./dev-env-setup.md)
- Contribution guide: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Community standards: [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
