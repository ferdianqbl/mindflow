# Product Requirements Document (PRD) - Mindflow (Co-Working Edition)

## 1. Product Overview
**Mindflow (Co-Working Edition)** is a premium full-stack web dashboard that combines an ambient Pomodoro focus timer with prompt-based micro-journaling and collaborative co-working features. 

Unlike passive focus timers, Mindflow prompts users to log a 1-sentence achievement immediately upon session completion, storing logs in a persistent database. It compiles these achievements into professional, copyable standup updates (Slack, Discord, Markdown). Additionally, it features a **Co-Focusing Lounge** where users can see other active members working in real-time, boosting motivation through accountability.

---

## 2. Core User Journeys

*   **User Registration & Authentication**:
    *   A user signs up or logs in securely via email and password using **Supabase Auth**.
    *   They are redirected to their personalized dashboard, restoring all historical focus records.
*   **Ambient Focus Session**:
    *   The user starts a focus block (25 minutes). Ambient audio loops in the background (Rain, Lofi Cafe, synthesized Brown Noise).
    *   During focus, their co-working status shifts to `Focusing` with their live countdown timer synced to the co-working channel.
*   **Accomplishment Logging**:
    *   At the end of the focus block, a glassmorphic journal modal slides in. The user tags a category (Coding, Debugging, Design, etc.) and writes a 1-sentence log (max 140 chars).
    *   Submitting the log saves it to the **Supabase PostgreSQL** database via **Prisma ORM**.
*   **Rest & Ergonomics Guide**:
    *   A 5-minute break starts automatically. Their status changes to `Resting`.
    *   A smooth breathing SVG bubble guides them through micro-breaks.
*   **Analytics Dashboard**:
    *   The user reviews their focus analytics: total sessions, time focused, category breakdown charts, and progress timeline.
    *   They can export their daily logs into formatted text (Slack, Markdown) with a copy success alert.
*   **Co-Focusing Lounge**:
    *   The user joins a real-time lobby where they see active cards of other online users, their current status (`Focusing`, `Resting`, `Idle`), and how many minutes remain in their session.

---

## 3. Functional Requirements

### User Authentication (Supabase Auth)
*   Email and password sign-up, sign-in, and sign-out.
*   Protected route guarding (anonymous users redirected to `/login`).

### Database Logging (Prisma + PostgreSQL)
*   Every completed session creates a row in the `FocusLog` table:
    *   `id`: Primary key (UUID).
    *   `userId`: Foreign key mapping to user auth.
    *   `category`: String tag enum (Coding, Debugging, UI/UX, Learning, Meeting, Operations).
    *   `description`: String, max 140 chars.
    *   `durationMinutes`: Integer (default 25).
    *   `createdAt`: Timestamp.

### Analytics Dashboard
*   Fetch and aggregate historical logs:
    *   Total focused hours and completed sessions.
    *   Categorized percentage chart (SVG-based or light canvas chart).
    *   Daily timeline feed of logs.
*   Export standup text with Slack-styled emoji grouping and Markdown.

### Real-Time Co-Working Lounge
*   Uses **Supabase Realtime (Presence & Broadcast)** to track connected client states.
*   Each user broadcasts their profile username, current state (`focus` | `break` | `idle`), and `secondsLeft` on their timer.
*   Online user listing updates dynamically (users who close the tab disappear from the list).
