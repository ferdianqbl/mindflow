# UI/UX Design System Specification - Mindflow (Co-Working Edition)

This document defines the visual system, glassmorphism UI variables, page layouts (including authentication, session planning, validation, and co-working modules), and state transitions for the full-stack edition of **Mindflow**.

---

## 1. Design System Tokens (CSS Custom Properties)

We define a custom theme with cosmic gradients, glowing highlight borders, and state indicators:

```css
:root {
  /* Backgrounds & Canvas */
  --bg-primary: #070a13;                 /* Deep space obsidian */
  --bg-radial: radial-gradient(circle at 50% 50%, #0d1527 0%, #070a13 100%);
  
  /* Glassmorphism Surface Tokens */
  --card-surface: rgba(13, 20, 38, 0.45);    /* Semi-transparent slate card */
  --card-border: rgba(255, 255, 255, 0.06);   /* Standard glass edge */
  --card-border-active: rgba(0, 242, 254, 0.25);  /* Glowing focus edge */

  /* Co-Working Presence Status Colors */
  --color-focus: #00f2fe;                /* Active Focus (Cyan glow) */
  --color-break: #d946ef;                /* Break Time (Orchid purple glow) */
  --color-idle: #94a3b8;                 /* Idle state (Muted cool gray) */
  
  /* Feedback Colors */
  --color-success: #10b981;              /* Success tags & completed markers */
  --color-danger: #ef4444;               /* Validation error glows */
  --color-amber: #f59e0b;                /* Modal notifications */

  /* Typography */
  --text-primary: #f8fafc;               /* White text */
  --text-secondary: #94a3b8;             /* Cool gray text */
  --text-muted: #64748b;                 /* Muted descriptive label text */

  /* Shadows & Radius */
  --radius-card: 20px;
  --radius-button: 12px;
  --shadow-glow-focus: 0 0 20px rgba(0, 242, 254, 0.15);
  --shadow-glow-break: 0 0 20px rgba(217, 70, 239, 0.15);
}
```

---

## 2. Page Layout Architectures

The full-stack application includes three core page views:

### A. Authentication Shell (`/login` & `/register`)
*   **Aesthetics**: A centered glassmorphic card (`max-w-md`) with high blur background and a thin glowing border, placed over a slowly spinning background radial gradient.
*   **Controls**: Input fields use dark, translucent backgrounds with cyan borders on focus. Validation errors trigger a soft red pulse.

### B. Core Dashboard (`/`)
A responsive multi-column layout optimized for widescreen and mobile:
*   **Left Section (Timer & Audio Mixer)**: 
    *   Features the large circular Pomodoro progress ring. The focus time input in the timer settings is disabled, displaying a helper tag noting it is automatically calculated from task plans.
    *   Audio mixer sliders with glowing track fills.
    *   Status header displaying the user's active session mode.
*   **Right Section (Standup & Timeline)**:
    *   Toggle layout to switch between **Logs Timeline** and **Standup Generator**.
    *   Translucent timeline cards displaying accomplishment logs.
    *   A premium `+ Log Accomplishment` button next to the tabs for quick manual logs.

### C. Co-Working Lounge (`/lounge` or Dashboard Side-Panel)
*   **Grid layout**: Displays cards representing online co-workers.
*   **User Card Design**:
    *   Translucent card showing user avatar, username, and state tag.
    *   A pulsing status dot indicating their active state:
        *   `● Focusing` in glowing **Cyan** with their countdown timer ticking.
        *   `● Resting` in glowing **Orchid** with break timer countdown.
        *   `● Idle` in solid **Gray**.

---

## 3. Session Planning & Validation Modals

*   **PlanModal Layout**:
    *   Triggers when starting a new session from `idle` state.
    *   Glassmorphic grid list allowing task-by-task inputs: name, category dropdown, and duration.
    *   Displays real-time calculated total duration at the bottom.
*   **ValidateModal Layout**:
    *   Triggers automatically when the focus session timer reaches zero.
    *   Presents a checklist of the session's planned tasks. Clicking a task checks it off with a green glow.
    *   Submitting completes the review, logging accomplishments to the DB.

---

## 4. Custom Charts & Data Visuals
*   We use custom responsive SVGs for analytics to avoid heavy charting libraries:
    *   **Activity Heatmap**: A compact grid of squares indicating focus sessions completed per day.
    *   **Category Ring**: An SVG donut chart showing percentage distribution of work categories (Coding, Debugging, Design, etc.) with custom hover slices.

---

## 5. UI Animations & Micro-Interactions
*   **Pulsing Status Dots**: Active co-workers' status indicators use CSS keyframe animations:
    ```css
    @keyframes status-pulse {
      0% { box-shadow: 0 0 0 0 rgba(0, 242, 254, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(0, 242, 254, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 242, 254, 0); }
    }
    .pulse-focus {
      animation: status-pulse 2s infinite;
    }
    ```
*   **Confetti Action**: Copying the standup or completing a session task review triggers a satisfying `canvas-confetti` explosion over the dashboard.
