# Mindflow — Co-Working Pomodoro Timer & Standup Generator

Mindflow is a premium full-stack web dashboard that combines an ambient Pomodoro timer with prompt-based micro-journaling and collaborative co-working features.

---

## 🚀 How to Run It Locally

### Prerequisites

- Node.js (LTS version)
- A Supabase project (providing a PostgreSQL database and Realtime presence)

### 1. Clone & Install Dependencies

```bash
git clone git@github.com:ferdianqbl/mindflow.git
cd mindflow
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Database connection links
DATABASE_URL="postgresql://postgres.[ID]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[ID]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Supabase Web Auth/Realtime keys
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOi..."
```

### 3. Sync Database Tables & Compile Types

Sync our database models (`User` and `FocusLog`) directly to your Supabase PostgreSQL instance and generate compiled Prisma Client types:

```bash
npx prisma db push
npx prisma generate
```

### 4. Boot the Local Server

Launch the local Hot-Module-Replacement development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Design & Planning Documents

Detailed design, database schemas, planning roadmap, product specs, and validation criteria are documented in the following design plans:

- [Product Requirements Document (PRD)](./plans/PRD.md)
- [UI/UX Design Specification](./plans/DESIGN.md)
- [System Architecture Specification](./plans/SYSTEM_ARCHITECTURE.md)
- [Project Planning & Roadmap](./plans/PLANNING.md)
- [Verification & Validation Tracker](./plans/VALIDATION_RESULTS.md)

---

## 📝 Product Specification Questions

### 1. What it is, and how to run it

**Mindflow** is an interactive co-working dashboard that links your Pomodoro focus milestones directly to daily reflection, logging, and standup automation. Instead of just ticking down passively, it requires you to set session plans, checks off completed items upon session completion, and aggregates them into multi-format daily standup reports.

#### 🔄 User Flow Diagram

```mermaid
graph TD
    A[Start Session] --> B[Plan Session Tasks PlanModal]
    B --> C[Pomodoro Focus Countdown Timer]
    C -->|Timer Expires| D[Validate Tasks ValidateModal]
    D -->|Done| E[(Save to FocusLog DB)]
    D -->|Incomplete| F[(Retain in TaskPlan for Carry-over)]
    E --> G[Recalculate SVG Charts & Heatmaps]
    E --> H[Standup Report Compiler - Copy Slack/Markdown]
```

#### 🌟 Key Features & Visual Walkthrough

##### 📋 A. Structured Session Planning
Before the timer starts, you are prompted to build your session plan. Any unfinished tasks from previous blocks automatically carry over, allowing you to prioritize work and estimate total duration dynamically.

##### ⏱️ B. Centralized Pomodoro Timer
A glowing circular SVG dial countdowns the session. Timer mode status (`Focusing`, `Resting`, `Idle`) is stored in a centralized Zustand store and shared in real-time.

##### 🤝 C. Real-Time Co-Working Lounge
Displays online teammates working concurrently. Ticking updates and state shifts are calculated locally on other browsers based on absolute timestamps to avoid WebSocket flooding.

![Co-Working Lounge](./public/screenshots/co_working_lounge.png)

##### 📝 D. Session Validation & Accomplishment Logging
Upon timer completion, check off completed tasks. Finished items are saved as database achievements, while incomplete ones remain in the queue for the next session.

##### 📊 E. Analytics Dashboard & Range Filtering
View percentage donut charts (SVG) and consistency grids. Statistics can be filtered by **Daily**, **Weekly**, **Monthly**, and **YTD** ranges.

##### ✍️ F. Standup Report Compiler
Automatically aggregates completed logs into formatted text reports (Slack emoji format, YTB standup, or Markdown bullet points) with one-click copy.

![Standup Compiler](./public/screenshots/standup_compiler.png)

---

#### 🚀 How to Run it
See the [How to Run It Locally](#-how-to-run-it-locally) section above for direct clone, database sync, and local dev server setup instructions.

### 2. Who it's for, and the one job it has to do well

It's built for remote developers, designers, and creators who hate writing daily standups or logging hours at the end of the day. The **one job** it must do well is taking all friction out of tracking achievements by prompting a 1-sentence log _only_ when a timer completes, then auto-formatting logs into copy-pasteable reports.

### 3. Why this problem, and how you know it's worth solving

Remote builders suffer from context-switching and forget their daily accomplishments by 5:00 PM. Scrambling through Git commits or Slack logs to write a daily update wastes 10-15 minutes of cognitive overhead. Habit-building focus timers are valuable but usually passive; linking reflection directly with timer milestones creates a self-reporting mechanism.

### 4. What's already out there for it, and why you built this anyway

Standard Pomodoro apps exist, but they are passive and don't record outcomes. Heavy project tools (Trello, Jira) track project states, not personal time blocks or reflections. Notes apps require manual formatting. We built Mindflow to combine focus acoustics, active reflection prompts, and automated markdown compilation into a single, cohesive interface.

### 5. What you put in scope, what you left out, and why

*   **In Scope**: I prioritized the core workflow loop: structured task planning (making sure you work with intent), active Pomodoro countdowns, task validation check-offs upon session end, manual accomplishment logging, a co-working lobby to view teammate statuses, and the multi-template standup report compiler.
*   **Left Out**:
    *   *Third-Party Calendar & Task Sync (Jira/Google Calendar)*: I left this out to keep the user experience completely self-contained. I wanted users to be able to plan sessions and compile reports immediately without needing to go through complex setup or link external accounts.
    *   *Ambient Mixer Soundscapes*: I chose to focus on the core productivity loop and reporting metrics rather than complex audio mixers and sound loops.

### 6. Where you didn't have answers, what you assumed

*   *Co-Working Task Privacy*: I wasn't sure if users would feel comfortable showing the exact titles of their private work tasks to peers in the co-working lounge. I assumed that displaying only their high-level status (`Focusing`, `Resting`, `Idle`) and countdown timers would provide motivational peer accountability without exposing private project details.
*   *Time Filter Scopes*: I assumed that when users want to review their statistics, they need to compare their performance over different cycles. Therefore, I built the metrics panel to dynamically filter totals (hours and sessions) and category donut charts by Daily, Weekly, Monthly, and YTD scopes.

### 7. Three questions you'd ask a real user before building more

1.  _"Would you prefer to sync your logs with local Git commits automatically so you don't even have to type?"_
2.  _"Would a browser extension or IDE widget be more useful than a web page to keep the timer visible while coding?"_
3.  _"Do you want to see team-level statistics and aggregated analytics, or is solo-reporting privacy a priority?"_

### 8. How you'd know it's working, and what you'd do next

- _Indicator of success_: Users copy their standup compiled text on average 4.5 times a week, and maintain focus streaks of 3+ days.
- _Next Steps_: Implement integrations with Slack/Discord webhooks so logs are sent directly to channels upon clicking "Copy".
