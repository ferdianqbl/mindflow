# System Architecture - Mindflow (Co-Working Edition)

This document provides a detailed breakdown of the technology stack, database schemas, folder structures, and third-party integrations for **Mindflow**.

---

## 1. Stack Selection & Rationale

We implement Mindflow as a full-stack web application using a modern, serverless-friendly framework:

*   **Framework**: **Next.js (App Router)**
    *   *Rationale*: Combines a React frontend with serverless API endpoints. Hosted on Vercel, it spins up instantly, eliminating container "cold-starts".
*   **Database**: **PostgreSQL (via Supabase)**
    *   *Rationale*: Generous free tier, reliable managed SQL database, and support for high-concurrency client connections.
*   **Database ORM**: **Prisma**
    *   *Rationale*: Type-safe client queries and automated schema migration workflows.
*   **User Authentication**: **Supabase Auth**
    *   *Rationale*: Offloads password hashing, email verification, and session token storage, keeping the app secure and lightweight.
*   **Real-time Syncer**: **Supabase Realtime (Presence & Broadcast)**
    *   *Rationale*: Connects online users on a shared WebSocket channel to sync Pomodoro states and presence dynamically.

---

## 2. Database Schema (Prisma Models)

The schema defines two tables: `User` (linked to Supabase Auth UUID) and `FocusLog` (storing accomplishment records).

```prisma
// prisma/schema.prisma

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Used for migrations bypassing pgBouncer
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String     @id // Maps to Supabase auth.users.id (UUID string)
  email     String     @unique
  createdAt DateTime   @default(now())
  logs      FocusLog[]

  @@map("users")
}

model FocusLog {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category        String   // e.g. "coding" | "debugging" | "design" | "learning" | "meeting" | "operations"
  description     String   // Max 140 characters
  durationMinutes Int      @default(25)
  createdAt       DateTime @default(now())

  @@map("focus_logs")
}
```

---

## 3. Directory Layout

All filenames and folders are structured in **kebab-case** to maintain project consistency:

```
mindflow/
├── package.json                # NPM dependency configurations
├── tsconfig.json               # strict TypeScript configurations
├── next.config.ts              # Next.js configurations
├── prisma/
│   ├── schema.prisma           # Database schema definition
│   └── migrations/             # Generated SQL migration history files
├── public/
│   └── sounds/                 # Sound effects & loops
└── src/
    ├── app/                    # Next.js Page Router
    │   ├── layout.tsx          # Root shell mapping CSS, fonts, auth listeners
    │   ├── globals.css         # Tailwind v4 & theme properties
    │   ├── page.tsx            # Protected dashboard view (guards auth)
    │   ├── login/
    │   │   └── page.tsx        # Login layout
    │   ├── register/
    │   │   └── page.tsx        # Registration layout
    │   └── api/                # API routes
    │       └── logs/
    │           └── route.ts    # GET (fetch user logs) & POST (write log)
    ├── components/             # Kebab-case filenames
    │   ├── timer.tsx           # Countdown circular SVG timer
    │   ├── audio-mixer.tsx     # Soundboard volume dials
    │   ├── journal-modal.tsx   # Slide-in accomplishment journal form
    │   ├── timeline.tsx        # Chronicled timeline of focus blocks
    │   ├── standup-panel.tsx   # Copy standup format selectors
    │   ├── wellness-guide.tsx  # Breathing circle guide for breaks
    │   ├── dashboard-stats.tsx # Heatmaps & percentage donut charts
    │   └── co-working-lounge.tsx # Real-time lobby list of online users
    ├── hooks/
    │   ├── use-audio.ts        # Handles noise synth and lofi loops
    │   └── use-realtime-lounge.ts # Handles Supabase Realtime channel presence
    └── utils/
        ├── formatters.ts       # Standup text compilers (Slack, YTB, Markdown)
        ├── noise-generator.ts  # Synthesizes brown frequency noise
        ├── prisma.ts           # Shared PrismaClient instance helper
        └── supabase.ts         # Supabase client initializer for Auth & Realtime
```

---

## 4. Deployment Topology

*   **Hosting Platform**: Vercel (Frontend & Serverless API routes).
*   **Database Host**: Supabase (AWS / PostgreSQL instance).
*   **State Sync**: Next.js serverless functions query Prisma/PostgreSQL for logs, while browser-side Supabase Clients connect to WebSockets directly for Auth and Realtime Presence.
