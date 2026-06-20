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
*   [ ] Initialize a Next.js (App Router, TypeScript) boilerplate inside the `/mindflow` folder.
*   [ ] Set up global configuration files (`tsconfig.json`, `package.json`, `.gitignore`).
*   [ ] Initialize Prisma: `npx prisma init`. Write schema models (`User`, `FocusLog`).
*   [ ] Set up google fonts and css variables in `globals.css`.

### Phase 2: Database Setup & Connections
*   [ ] Provision a free PostgreSQL database on Supabase.
*   [ ] Set up local `.env` and `.env.local` containing Supabase URL, Anon Key, and Database connection strings.
*   [ ] Execute database push: `npx prisma db push` to generate tables.
*   [ ] Verify Prisma connection pool by running a test script or launching Next.js locally.

### Phase 3: Supabase Authentication
*   [ ] Setup Supabase Client library helper.
*   [ ] Build Login and Registration pages (`login/page.tsx` and `register/page.tsx`).
*   [ ] Implement a root auth listener syncing sessions and redirecting unauthorized visitors to `/login`.
*   [ ] Build a Sign-out button on the main dashboard.

### Phase 4: Focus Timer & Web Audio Synth
*   [ ] Build the circular SVG timer component (`Timer.tsx`) and hooks.
*   [ ] Implement Web Audio API synthesizers (`noiseGenerator.ts`) to produce brown focus noise.
*   [ ] Add loop audio players for lofi beats and rain sounds.
*   [ ] Build the `AudioMixer.tsx` with gain volume sliders.

### Phase 5: Accomplishment Logs & API Writing
*   [ ] Create Next.js API route (`api/logs/route.ts`) to write logs to PostgreSQL using Prisma.
*   [ ] Build the journal overlay modal (`JournalModal.tsx`) triggering automatically when the timer reaches zero.
*   [ ] Implement character validation (140 chars max) and category tagging.
*   [ ] Save focus log upon submission and refresh local dashboard states.

### Phase 6: Timeline & Standup Generator
*   [ ] Build `Timeline.tsx` displaying the user's completed focus logs chronologically.
*   [ ] Write text compilers (`formatters.ts`) for Slack emoji lists, Markdown list, and YTB templates.
*   [ ] Create `StandupPanel.tsx` displaying output previews and click-to-copy button.
*   [ ] Mount `canvas-confetti` success triggers.

### Phase 7: Co-Focusing Lounge (Real-Time Presence)
*   [ ] Setup Supabase Realtime channel subscriptions on mount.
*   [ ] Track local presence state: broadcast username, status (`focus` | `break` | `idle`), and timer `secondsLeft`.
*   [ ] Listen to state updates from other connected clients and display them dynamically in `CoWorkingLounge.tsx`.

### Phase 8: Analytics & SVG Heatmaps
*   [ ] Create dashboard stats panel (`DashboardStats.tsx`).
*   [ ] Render custom responsive SVG donut charts for categories and cell grid maps for daily heatmaps.
*   [ ] Conduct responsive design auditing and deploy to Vercel.
