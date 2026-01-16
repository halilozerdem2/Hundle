# News Pulse Monorepo

A Turborepo-powered MVP for a news notification system. Users pick interests, fetch curated headlines, and (if their device allows it) subscribe to Web Push notifications. News data and subscriptions now live in Supabase so that any external worker/cron (deployed outside this repo) can refresh the pool and dispatch push notifications while the Next.js client keeps the PWA/service-worker experience aligned with platform restrictions.

## Repository structure
```
.
├── apps/
│   └── web/        # Next.js 14 App Router UI + API routes + PWA/service worker
├── packages/
│   ├── shared/     # Types, constants, Supabase helpers shared across apps
│   ├── news-core/  # News fetching & normalization logic (used by the UI and external jobs)
│   └── push-core/  # Web Push helpers, VAPID configuration for external jobs
├── news_pool.csv   # Optional Supabase seed for `news_pool`
├── subscriptions.csv # Optional Supabase seed for `subscriptions`
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
2. Copy `.env.example` to `.env` and provide VAPID keys (`web-push` compatible), your Supabase URL, and API keys (anon + service role).
3. Run the Next.js dev server via Turborepo:
   ```bash
   pnpm dev
   ```
   - `apps/web`: served at `http://localhost:3000`, includes the manifest (`public/manifest.json`) and `sw.js` service worker.
   - A separate worker/cron should live in its own deployment and consume `@news/news-core` + `@news/push-core` alongside the Supabase tables.

### Targeted scripts
- `pnpm --filter web dev` – run only the Next.js app
- `pnpm build` – build every package/app

## Push & scheduling flow
1. The frontend calls `POST /api/news` to fetch articles from Supabase (`news_pool` table) via `@news/news-core`.
2. If the platform allows Web Push, the UI requests permission, registers `/sw.js`, and posts to `POST /api/subscribe` with the push subscription, categories, frequency, and platform (`android`, `ios-pwa`, or `desktop`).
3. `@news/shared` stores subscriptions (and their categories/frequency) inside Supabase (`subscriptions` table). Both tables can be seeded using the CSV files in the repo root.
4. An **external worker/cron job** (not part of this repo) should run on your preferred platform, use `@news/news-core` to refresh Supabase, and `@news/push-core` to deliver pushes according to `subscriptions.frequency` (e.g. Vercel Scheduled Functions, GitHub Actions, Fly.io, etc.).

This repository now focuses on the Next.js frontend/API plus shared packages. Bring your own worker deployment to keep Supabase synchronized and to deliver push notifications.

## Environment variables
Create a `.env` file from `.env.example` and populate the following:

| Name | Scope | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_VAPID_KEY` | client | Public VAPID key used by the browser to subscribe (must match the server’s public key). |
| `SUPABASE_URL` | server | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Service role key used on the backend (keep secret). |
| `SUPABASE_ANON_KEY` | server | Optional anon key for backend fallbacks (also set the `NEXT_PUBLIC_…` variants below). |
| `NEXT_PUBLIC_SUPABASE_URL` | client | Supabase URL exposed to the browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | Anon key exposed to the browser (read-only operations). |
| `PUSH_PUBLIC_KEY` | server | Public key for the Web Push API (same as below but referenced on the backend). |
| `PUSH_PRIVATE_KEY` | server | Private VAPID key used by `web-push`. |
| `PUSH_SUBJECT` | server | Contact string for VAPID (e.g. `mailto:admin@example.com`). |
| `NEXT_PUBLIC_VAPID_KEY` | client | VAPID public key exposed to the browser when requesting notifications. |
| `GNEWS_API_KEY` | server | API key for gnews.io used by your external worker to sync the news pool. |

## Deploying to Vercel
Only the Next.js app (`apps/web`) is deployed through Vercel; your worker/cron should live elsewhere (or as a separate Scheduled Function) and point to the same Supabase instance.

1. Push this repository to GitHub/GitLab and import it in Vercel.
2. When prompted for settings set:
   - **Framework Preset:** Next.js
   - **Root directory:** repository root (Vercel reads `vercel.json` and builds only `apps/web`).
   - **Build command:** `pnpm turbo run build --filter=web...` (pre-filled from `vercel.json`).
   - **Install command:** `pnpm install`
   - **Output directory:** `apps/web/.next`
3. Configure the environment variables listed above inside Vercel (Supabase credentials, VAPID keys, etc.).
4. Deploy. Vercel will produce an HTTPS subdomain suitable for iOS Safari PWA testing (Add to Home Screen to enable push).

> **Note:** To keep `news_pool` fresh and send pushes in production, deploy the worker logic (news sync + push dispatch) as a separate service or scheduled job that imports `@news/news-core` and `@news/push-core` and points to the same Supabase project.
