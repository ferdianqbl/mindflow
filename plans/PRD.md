# Product Requirements Document (PRD) - Mindflow

## 1. Product Overview
**Mindflow** is a sleek, ambient web dashboard that combines a Pomodoro focus timer with prompt-based micro-journaling. It is designed to solve a major daily pain point for remote builders (developers, designers, creators): **the friction of keeping track of what they did during the day for standups and daily logs.**

Instead of letting focus sessions be passive, Mindflow engages the user at the end of each session to write a 1-sentence accomplishment. At the end of the day, these micro-logs are aggregated and formatted into professional daily standup updates (Slack, Discord, Markdown) that can be copied with a single click.

---

## 2. Core User Journeys

*   **Focus Session Initiation**:
    *   The user arrives at the dashboard and sees a clean, minimalist countdown timer.
    *   They can select an ambient soundtrack (e.g., Rain, Lofi Beats, White Noise) and adjust its volume.
    *   They click "Start Focus" to begin a 25-minute focus session.
*   **Active Focusing**:
    *   The timer counts down with a smooth circular visual and a glowing pulsing breath animation.
    *   Ambient audio loops smoothly in the background to mask distractions.
*   **Micro-Journaling Check-in**:
    *   When the timer hits zero, a gentle notification sound plays, and a glassmorphic modal overlay slides in: *"What did you achieve in this focus block?"*
    *   The user tags the work category (e.g., `💻 Coding`, `🐛 Debugging`, `🎨 UI/UX`, `📚 Learning`, `🤝 Meeting`).
    *   They type a quick summary (max 140 characters) and submit.
*   **Rest & Transition**:
    *   A 5-minute break timer starts automatically.
    *   The user is encouraged to stretch or do a quick breathing exercise (animated visual guide provided).
*   **Standup Export & Review**:
    *   Below the timer, a vertical daily timeline displays all completed blocks.
    *   At the end of the day, the user clicks "Export Standup".
    *   They select their template (Slack list, Markdown, or Standard Yesterday/Today/Blocker), preview the text, and copy it to their clipboard with a satisfying completion feedback.

---

## 3. Functional Requirements

### Focus Timer & Ambient Sounds
*   Standard 25-minute Focus and 5-minute Break cycle.
*   Ability to pause, reset, or skip the timer.
*   An audio mixer with multiple ambient channels:
    *   *Lofi Cafe* (music track)
    *   *Heavy Rain* (sound effect)
    *   *Cosmic Synth* (slow synth pads)
    *   *White/Brown Noise* (steady frequency)
*   Independent volume sliders and play/pause controls.

### Micro-Journaling
*   Overlay popup that locks the dashboard until a log is entered or explicitly skipped.
*   Predefined tag selection buttons: Coding, Debugging, UI/UX, Learning, Meeting, Operations.
*   Textarea input restricted to 140 characters with a live character countdown.

### Daily Standup Generator
*   A vertical timeline visualizing each block: timestamp, tag, log text, and status.
*   A generator panel that aggregates all logs of the current day.
*   Multiple formatting templates:
    *   **Slack Format**: Category-grouped list with emojis.
    *   **Yesterday-Today-Blockers (YTB)**: Splits completed tasks into a clean layout.
    *   **Bullet Journal**: Raw markdown list with bullet checkmarks.
*   Single-button click-to-copy to clipboard.

### Data Persistence & Integrity
*   All data must persist across browser refreshes via `localStorage`.
*   Ability to reset the dashboard (clear daily progress) to start a new day.
