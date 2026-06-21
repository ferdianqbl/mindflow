# Product Requirements Document (PRD) - Mindflow (Co-Working Edition)

## 1. Product Overview
**Mindflow (Co-Working Edition)** is a premium full-stack web dashboard that combines structured focus session planning, an ambient Pomodoro timer, task validation, micro-journaling, and collaborative co-working features.

Unlike passive focus timers, Mindflow requires users to build a session task plan before starting the timer. When the session ends, the user is prompted to check off completed tasks—which are automatically logged as accomplishments in a persistent database—while incomplete tasks carry over to the next session. These achievements can then be compiled into copyable daily standup updates (Slack, Discord, Markdown). Additionally, a **Co-Focusing Lounge** displays online members working in real-time to drive accountability.

---

## 2. Core User Journeys

*   **User Registration & Authentication**:
    *   A user signs up or logs in securely via email and password.
    *   Auth uses a custom, self-hosted JWT authentication flow (session tokens stored in HTTP-only cookies).
*   **Structured Focus Session Planning**:
    *   Before starting the timer, the user is presented with a **Plan Your Session** modal listing any carried-over incomplete tasks.
    *   The user reviews, adds, or edits tasks (assigning categories and estimated durations in minutes).
    *   Starting the session sets the timer countdown to the sum of the planned tasks.
*   **Ambient Focus Session**:
    *   The user focuses on their planned tasks during the Pomodoro countdown.
    *   Their status changes to `Focusing`, and their live timer countdown syncs to the co-working lounge.
*   **Task Validation & Accomplishment Logging**:
    *   At the end of the focus block, a **Session Review** modal slides in. The user checks off finished tasks.
    *   Completed tasks are written to the `FocusLog` accomplishments database via Prisma.
    *   Unfinished tasks are preserved in `TaskPlan` to automatically carry over to the next session.
*   **Rest & Ergonomics Guide**:
    *   A 5-minute break starts automatically. Their status changes to `Resting`.
    *   A smooth breathing SVG bubble guides them through micro-breaks.
*   **Analytics Dashboard**:
    *   The user reviews their focus analytics: total sessions, time focused, category breakdown charts, and progress timeline.
    *   They can export their daily logs into formatted text (Slack, Markdown) with a copy success alert.

---

## 3. Functional Requirements

### User Authentication (Custom JWT)
*   Email and password sign-up, sign-in, and sign-out.
*   Cryptographic password hashing using `bcryptjs` and session tokens signed using `jose`.
*   Protected route guarding (anonymous users redirected to `/login` via middleware/proxy).

### Database Logging (Prisma + PostgreSQL)
*   **TaskPlan** table tracks planned session tasks:
    *   `id`: Primary key (UUID).
    *   `userId`: Foreign key mapping to user.
    *   `category`: String tag enum (Coding, Debugging, UI/UX, Learning, Meeting, Operations).
    *   `title`: String, task description.
    *   `durationMin`: Integer, planned minutes.
    *   `isCompleted`: Boolean (default `false`).
    *   `createdAt`: Timestamp.
*   **FocusLog** table tracks completed accomplishments:
    *   `id`: Primary key (UUID).
    *   `userId`: Foreign key mapping to user.
    *   `category`: String tag enum.
    *   `description`: String, accomplishment description.
    *   `durationMinutes`: Integer, actual minutes spent.
    *   `createdAt`: Timestamp.
*   **CopyLog** table tracks clipboard copy actions for report compilation analytics:
    *   `id`: Primary key (UUID).
    *   `userId`: Foreign key mapping to user.
    *   `format`: String format type (Slack, YTB, Markdown).
    *   `createdAt`: Timestamp.

### Analytics Dashboard
*   Fetch and aggregate historical logs:
    *   Total focused hours and sessions.
    *   Categorized percentage chart (SVG-based donut chart).
    *   Daily timeline feed of logs.
    *   Filter statistics/donut charts by Daily (Today), Weekly, Monthly, and YTD (Year-to-Date) ranges.
*   Export standup text with Slack-styled emoji grouping and Markdown.

### Real-Time Co-Working Lounge
*   Uses **Supabase Realtime (Presence & Broadcast)** to track connected client states.
*   Each user broadcasts their profile username, current state (`focus` | `break` | `idle`), and `secondsLeft` on their timer.
*   Online user listing updates dynamically.

### Centralized State Management (Zustand)
*   State variables (timer mode, duration settings, active ticking countdown, modals visibilities, timeline accomplishments log feed, and active co-workers presence lounge list) are centralized in a single store.
*   Components read state reactively and dispatch store actions synchronously, ensuring high-frequency timer ticks and lobby updates remain performant and error-free.
