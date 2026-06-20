# Project Planning & Roadmap - Mindflow (Co-Working Edition)

This document indexes all documentation files for the full-stack edition of **Mindflow** and lists the roadmap for incremental phase completions.

---

## 1. Document Index

- **Product Requirements**: Read functional and scope specs in [PRD.md](./PRD.md).
- **UI/UX Design**: Read color, typography, responsive guidelines, and styling setups in [DESIGN.md](./DESIGN.md).
- **System Architecture**: Read database models and file directories in [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md).
- **Verification Plan**: Read testing steps and criteria in [VALIDATION_RESULTS.md](./VALIDATION_RESULTS.md).

---

## 2. Development Roadmap

### Phase 1: Next.js & Prisma Bootstrap
*   [x] Initialize a Next.js (App Router, TypeScript) boilerplate inside the `/mindflow` folder.
*   [x] Set up global configuration files (`tsconfig.json`, `package.json`, `.gitignore`).
*   [x] Initialize Prisma: `npx prisma init`. Write schema models (`User`, `FocusLog`).
*   [x] Set up google fonts and css variables in `globals.css`.

### Phase 2: Database Setup & Connections
*   [x] Create Supabase project and get database connection strings.
*   [x] Configure environment files (`.env`, `.env.local`) containing Supabase URL, Anon Key, and Database connection strings.
*   [x] Execute database push: `npx prisma db push` to generate tables.
*   [x] Verify Prisma connection pool by running a test script or launching Next.js locally.

### Phase 3: Custom JWT Authentication & Security
*   [x] Build secure password hashing helpers using `bcryptjs` and session tokens helper using `jose`.
*   [x] Build Login and Registration pages (`login/page.tsx` and `register/page.tsx`) and API auth routes (`/api/auth/login`, `/api/auth/register`, `/api/auth/logout`).
*   [x] Implement a middleware route guarding proxy checking session cookies to redirect unauthorized visitors to `/login`.
*   [x] Build a Sign-out button on the main dashboard.

### Phase 4: Focus Timer (Legacy: Web Audio Synth Removed)
*   [x] Build the circular SVG timer component (`timer.tsx`) and hooks.
*   [x] (Legacy - Removed) Implement Web Audio API synthesizers (`noise-generator.ts`) to produce brown focus noise.
*   [x] (Legacy - Removed) Add loop audio players for lofi beats and rain sounds.
*   [x] (Legacy - Removed) Build the `audio-mixer.tsx` with gain volume sliders.

### Phase 5: Accomplishment Logs & API Writing
*   [x] Create Next.js API route (`api/logs/route.ts`) to write logs to PostgreSQL using Prisma.
*   [x] Build the journal overlay modal (`journal-modal.tsx`) for manual logs and quick submissions.
*   [x] Implement character validation (140 chars max) and category tagging.
*   [x] Save focus log upon submission and refresh local dashboard states.

### Phase 6: Timeline & Standup Generator
*   [x] Build `timeline.tsx` displaying the user's completed focus logs chronologically.
*   [x] Write text compilers (`formatters.ts`) for Slack emoji lists, Markdown list, and YTB templates.
*   [x] Create `standup-panel.tsx` displaying output previews and click-to-copy button.
*   [x] Mount `canvas-confetti` success triggers.

### Phase 7: Co-Focusing Lounge (Real-Time Presence)
*   [x] Setup Supabase Realtime channel subscriptions on mount.
*   [x] Track local presence state: broadcast username, status (`focus` | `break` | `idle`), and timer `secondsLeft`.
*   [x] Listen to state updates from other connected clients and display them dynamically in `co-working-lounge.tsx`.

### Phase 8: Analytics & SVG Heatmaps
*   [x] Create dashboard stats panel (`dashboard-stats.tsx`).
*   [x] Render custom responsive SVG donut charts for categories and cell grid maps for daily heatmaps.
*   [x] Conduct responsive design auditing and deploy to Vercel.

### Phase 9: Structured Focus Session Planning & Task Validation
*   [x] Create `TaskPlan` Prisma schema and sync with Postgres database using `npx prisma db push`.
*   [x] Implement `/api/plans` and `/api/plans/validate` handlers to fetch, sync, and check off task plans.
*   [x] Build `PlanModal` and `ValidateModal` components.
*   [x] Refactor dashboard client and timer control flows to require planning and validation.
