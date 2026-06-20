# Mindflow — Co-Working Pomodoro Timer & Standup Generator

Mindflow is a premium full-stack web dashboard that combines an ambient Pomodoro timer with prompt-based micro-journaling and collaborative co-working features.

---

## 🚀 How to Run It Locally

### Prerequisites
*   Node.js (LTS version)
*   A Supabase project (providing a PostgreSQL database and Realtime presence)

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

## 📝 Product Specification Questions ( Owen / Pixel8Labs )

### 1. What it is, and how to run it
Mindflow is an ambient Pomodoro timer and logging tool that automatically compiles your completed focus sessions into Slack-ready daily standup reports. See local launch commands above.

### 2. Who it's for, and the one job it has to do well
It's built for remote developers, designers, and creators who hate writing daily standups or logging hours at the end of the day. The **one job** it must do well is taking all friction out of tracking achievements by prompting a 1-sentence log *only* when a timer completes, then auto-formatting logs into copy-pasteable reports.

### 3. Why this problem, and how you know it's worth solving
Remote builders suffer from context-switching and forget their daily accomplishments by 5:00 PM. Scrambling through Git commits or Slack logs to write a daily update wastes 10-15 minutes of cognitive overhead. Habit-building focus timers are valuable but usually passive; linking reflection directly with timer milestones creates a self-reporting mechanism.

### 4. What's already out there for it, and why you built this anyway
Standard Pomodoro apps exist, but they are passive and don't record outcomes. Heavy project tools (Trello, Jira) track project states, not personal time blocks or reflections. Notes apps require manual formatting. We built Mindflow to combine focus acoustics, active reflection prompts, and automated markdown compilation into a single, cohesive interface.

### 5. What you put in scope, what you left out, and why
*   **In Scope**: Glassmorphic dark UI, self-hosted Custom JWT Cookie Authentication (`bcryptjs` + `jose`), database logging (Prisma + Postgres), a real-time Co-working presence lounge, Zustand centralized global state management, and Slack/YTB/Markdown formatters.
*   **Left Out**: OAuth integrations (Google/GitHub login) to avoid API keys setup friction for local review, and calendar synced timelines.

### 6. Where you didn't have answers, what you assumed
*   *Assumption*: Assumed co-working users only need to see active states (`Focusing`, `Resting`, `Idle`) and countdowns for motivational peer pressure.
*   *Solution*: Implemented an absolute epoch timestamp sync system: instead of broadcasting websocket events every second (which hits free-tier rate limits), clients only broadcast when their timer state shifts, and observers calculate active ticks locally.

### 7. Three questions you'd ask a real user before building more
1.  *"Would you prefer to sync your logs with local Git commits automatically so you don't even have to type?"*
2.  *"Would a browser extension or IDE widget be more useful than a web page to keep the timer visible while coding?"*
3.  *"Do you want to see team-level statistics and aggregated analytics, or is solo-reporting privacy a priority?"*

### 8. How you'd know it's working, and what you'd do next
*   *Indicator of success*: Users copy their standup compiled text on average 4.5 times a week, and maintain focus streaks of 3+ days.
*   *Next Steps*: Implement integrations with Slack/Discord webhooks so logs are sent directly to channels upon clicking "Copy".
