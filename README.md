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

*   *Standup Compilation Timing (Our Main Goal)*: I wasn't sure when the best time to capture work details was without disrupting the user's focus. I assumed that prompting reflection *only* when the timer ends is the sweet spot: the user's memory is freshest, they are entering a natural break state, and it prevents them from having to recall details at the end of the day.
*   *Carry-Over Mechanics (Main Feature)*: I assumed that users often underestimate how long a task will take and would feel frustrated if incomplete tasks disappeared. I assumed that automatically carrying over unfinished session plans to the next Pomodoro block keeps their momentum going and minimizes planning fatigue.
*   *Lounge Accountability (Main Feature)*: I assumed that users want peer motivation to stay focused but do not want active social distractions (like group chats) during focus blocks. I assumed that showing high-level status cards (`Focusing`, `Resting`, `Idle`) and live countdowns is sufficient to drive mutual accountability.

### 7. Three questions you'd ask a real user before building more

1.  _"Does estimated task duration in the session planner help you budget focus time, or would you prefer a simple check-off list without minute limits?"_
2.  _"How does seeing other users' status (Focusing/Resting/Idle) in the co-working lounge affect your focus? Would you want collaborative targets or group blocks?"_
3.  _"Does the standup compiler output match your team's standup format, and would you want direct integration like sending reports to Slack/Jira channels?"_

### 8. How you'd know it's working, and what you'd do next

*   **Indicators of Success**:
    *   *Daily Standup Copies*: Users copying their compiled report text on average 4.5 times a week.
        *   *Reason*: Actively using the compiler daily proves that the tool successfully removes their manual standup friction, saving them significant administrative overhead.
    *   *Focus Streaks of 3+ Days*: Users maintaining focus streaks of consecutive working days.
        *   *Reason*: Streak consistency demonstrates that the peer lounge and planning mechanics are working to build focus habits and drive developer accountability.
*   **Next Steps**:
    *   *Weekly & Monthly Planning Boards*: Expand the task planner to support setting high-level weekly and monthly goals.
        *   *Reason*: Helps users align their immediate 25-minute Pomodoro sessions with their long-term weekly milestones and monthly project deliverables directly inside the dashboard.
    *   *Retroactive Log Calendar & Editor*: Build a calendar-based log editor directly inside the dashboard.
        *   *Reason*: Allows users to retroactively add, delete, or adjust historical focus sessions and task categories in-app if they made mistakes or forgot to track a session.
    *   *Focus Streak Achievements & Milestones*: Build a gamified leveling and badging dashboard panel.
        *   *Reason*: Increases long-term user retention and engagement directly within the app by rewarding streaks with visual milestones and level-ups.
    *   *Direct Slack/Discord Webhooks integration*: Add a simple webhook configurator inside settings to send standup logs.
        *   *Reason*: Closes the reporting feedback loop by publishing completed standup updates directly to Slack with a single click from the dashboard.
