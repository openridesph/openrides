# Development Environment Deep-Dive

This document is the detailed companion to the root [`README.md`](./README.md).
Use README for first-time setup, then use this guide when local/dev-device setup needs extra tuning.

## Scope

This guide focuses on:
- Convex deployment and environment validation
- Better Auth runtime setup details
- Expo device connectivity troubleshooting
- Common command and script references

## Environment Variables Reference

### Web (`apps/web/.env`)

Required:

```env
VITE_CONVEX_URL=https://<your-convex-deployment>
VITE_CONVEX_SITE_URL=https://<your-convex-site-url>
```

### Native (`apps/native/.env`)

Required:

```env
EXPO_PUBLIC_CONVEX_URL=https://<your-convex-deployment>
EXPO_PUBLIC_CONVEX_SITE_URL=https://<your-convex-site-url>
```

### Convex deployment env (`packages/backend`)

Required keys:
- `BETTER_AUTH_SECRET`
- `SITE_URL`
- `ENVIRONMENT`

Optional:
- `NATIVE_APP_URL`

Set and inspect with:

```powershell
cd packages/backend
bun convex env set BETTER_AUTH_SECRET "<your-random-secret>"
bun convex env set SITE_URL http://localhost:3001
bun convex env set ENVIRONMENT development
bun convex env list
```

## Convex Setup and Verification

Run initial configure flow from repo root:

```bash
bun run dev:setup
```

This maps to backend script `convex dev --configure --until-success`.

Sanity checks:
- `packages/backend/.env.local` exists after setup
- `apps/web/.env` and `apps/native/.env` are synced from backend env
- `bun run dev:server` starts without missing env variable errors

## Native Connectivity (Expo)

If physical-device auth/network calls fail:

1. Confirm phone and dev machine are on the same network.
2. Use machine LAN IP where needed instead of `localhost`.
3. Check Expo connection mode and firewall/VPN behavior.
4. Confirm Convex URLs in `apps/native/.env` are valid and reachable.

Find LAN IP:
- macOS/Linux: `ifconfig` or `ip addr`
- Windows: `ipconfig`

## Better Auth Notes

- Backend auth setup reads `SITE_URL` and optionally `NATIVE_APP_URL`.
- In development, trusted origins include `SITE_URL` plus Expo development origins.
- Missing `SITE_URL` or `BETTER_AUTH_SECRET` causes backend startup failure.

## Script Reference

From repo root:

| Command | Purpose |
| --- | --- |
| `bun run dev` | Run all workspace dev tasks via Turborepo |
| `bun run dev:web` | Run web app only |
| `bun run dev:native` | Run native app only |
| `bun run dev:server` | Run Convex backend dev server only |
| `bun run dev:setup` | Run Convex setup/configure flow |
| `bun run build` | Build all workspaces |
| `bun run check-types` | Type-check all workspaces |
| `bun run check` | Run Ultracite checks |
| `bun run fix` | Run Ultracite autofix |
| `bun run prepare` | Install Husky hooks |

Docs app:

```bash
cd apps/docs
bun run dev
bun run build
```

## Troubleshooting Checklist

- Convex query fails:
  - Validate `VITE_CONVEX_URL` and `EXPO_PUBLIC_CONVEX_URL` formats.
  - Ensure `bun run dev:server` is active.
- Auth endpoints fail:
  - Validate Convex env values with `bun convex env list`.
  - Re-check `SITE_URL` for current local web origin.
- Native sign-in redirect issues:
  - Verify `NATIVE_APP_URL` and app scheme compatibility.
- Web or native app reads old env values:
  - Restart dev servers after env edits.
