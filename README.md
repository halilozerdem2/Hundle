# News Pulse Monorepo

A Turborepo-powered MVP for a news notification system. Users pick interests, fetch curated headlines, and (if their device allows it) subscribe to Web Push notifications delivered by a cron-powered worker. The implementation intentionally mirrors platform restrictions: Android browsers can subscribe directly while iOS users must install the Safari PWA first.

## Repository structure
```
.
├── apps/
│   ├── web/        # Next.js 14 App Router UI + API routes + PWA/service worker
│   └── worker/     # Node.js cron worker that sends push notifications
├── packages/
│   ├── shared/     # Types, constants, storage helpers shared across apps
│   ├── news-core/  # Mocked news fetching & normalization logic
│   └── push-core/  # Web Push helpers, VAPID configuration
├── data/           # JSON persistence for subscriptions (MVP storage)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Platform behavior
- **Android browsers (Chrome, Firefox, Edge, Samsung Internet):** Supported. The UI offers notification opt-in immediately after headlines load.
- **iOS Safari (not installed):** The UI blocks subscription and explains the required flow: Share → Add to Home Screen. No permission prompt fires until the PWA runs standalone.
- **iOS Safari (PWA / standalone):** Treated as `ios-pwa` and fully supported.
- **iOS Chrome / Firefox / Edge:** Not supported. The UI shows an informational banner clarifying that Apple only enables push for Safari PWAs.
- **Desktop browsers (Chrome, Edge, Firefox, Safari):** Fully supported for push so long as the browser exposes the Push API and service workers.

## Getting started
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Copy `.env.example` to `.env` and provide VAPID keys (`web-push` compatible) plus an optional path for the JSON subscription store.
3. Run everything via Turborepo:
   ```bash
   pnpm dev
   ```
   - `apps/web`: served at `http://localhost:3000`, includes the manifest (`public/manifest.json`) and `sw.js` service worker.
   - `apps/worker`: Node.js cron process that logs to the terminal while dispatching push payloads.

### Targeted scripts
- `pnpm --filter web dev` – run only the Next.js app
- `pnpm --filter worker dev` – run the worker in watch mode via `tsx`
- `pnpm build` – build every package/app

## Push & scheduling flow
1. The frontend calls `POST /api/news` to fetch mocked articles from `@news/news-core`.
2. If the platform allows Web Push, the UI requests permission, registers `/sw.js`, and posts to `POST /api/subscribe` with the push subscription, categories, frequency, and platform (`android` or `ios-pwa`).
3. `@news/shared` stores subscriptions inside `data/subscriptions.json` (overridable via `SUBSCRIPTIONS_FILE`).
4. The worker runs cron jobs per frequency (`30m`, `1h`, `3h`, `1d`), fetches fresh headlines, and leverages `@news/push-core` to send payloads via the Web Push API.

This baseline is optimized for local development but mirrors the production topology: a Next.js frontend/API, a Node.js worker, and shared packages ready for deployment with minimal changes.

## Environment variables
Create a `.env` file from `.env.example` and populate the following:

| Name | Scope | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_VAPID_KEY` | client | Public VAPID key used by the browser to subscribe (must match the server’s public key). |
| `PUSH_PUBLIC_KEY` | server | Public key for the Web Push API (same as above but referenced on the backend). |
| `PUSH_PRIVATE_KEY` | server | Private VAPID key used by `web-push`. |
| `PUSH_SUBJECT` | server | Contact string for VAPID (e.g. `mailto:admin@example.com`). |
| `SUBSCRIPTIONS_FILE` | server | JSON storage path for subscriptions (default `./data/subscriptions.json`). |

## Deploying to Vercel
Only the Next.js app (`apps/web`) is deployed; the worker remains a local/background process.

1. Push this repository to GitHub/GitLab and import it in Vercel.
2. When prompted for settings set:
   - **Framework Preset:** Next.js
   - **Root directory:** repository root (Vercel reads `vercel.json` and builds only `apps/web`).
   - **Build command:** `pnpm turbo run build --filter=web...` (pre-filled from `vercel.json`).
   - **Install command:** `pnpm install`
   - **Output directory:** `apps/web/.next`
3. Configure the environment variables listed above inside Vercel (at minimum `NEXT_PUBLIC_VAPID_KEY`, `PUSH_PUBLIC_KEY`, `PUSH_PRIVATE_KEY`, `PUSH_SUBJECT`).
4. Deploy. Vercel will produce an HTTPS subdomain suitable for iOS Safari PWA testing (Add to Home Screen to enable push).

> **Note:** The `apps/worker` cron service is not deployed on Vercel. Run it separately (e.g. `pnpm --filter worker dev`) on your own infrastructure if you need scheduled push notifications in production.
