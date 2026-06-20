# UI/UX Design System Specification - Mindflow

This document defines the visual theme, design philosophy, color palette, custom CSS variables, layout strategy, and interactive animations for **Mindflow**.

---

## 1. Design Philosophy: Glassmorphic & Ambient

Mindflow is designed to keep users in a state of calm focus while minimizing work logging friction. We apply three core design principles:
1.  **Glassmorphism & Depth**: Translucent interfaces that blend with the background, giving a spacious, lightweight feel.
2.  **Color-Coded States**: The UI shifts subtle background glows and highlights based on the active state (Focus = Cyan/Ice Blue, Break = Purple/Violet, Journal = Amber/Orange).
3.  **Micro-Interactions**: Smooth SVG transitions, pulsing breath meters, and tactile animations that reward completing focus milestones.

---

## 2. Color Palette & Custom Theme (CSS Variables)

We define a custom color system in our main CSS file to achieve a futuristic, calming look:

```css
:root {
  /* Theme Backgrounds */
  --bg-primary: #070a13;                /* Deep cosmic obsidian */
  --bg-glow-focus: radial-gradient(circle at 10% 20%, rgba(0, 242, 254, 0.08) 0%, transparent 50%);
  --bg-glow-break: radial-gradient(circle at 10% 20%, rgba(217, 70, 239, 0.08) 0%, transparent 50%);

  /* Glassmorphic Surfaces */
  --card-surface: rgba(13, 20, 38, 0.45);   /* Translucent indigo slate */
  --card-border: rgba(255, 255, 255, 0.06);  /* Soft glowing edge border */
  --card-border-active: rgba(0, 242, 254, 0.25); /* Glowing cyan highlight edge */

  /* State Colors */
  --color-focus: #00f2fe;               /* Ice Cyan (Focus mode) */
  --color-break: #d946ef;               /* Vibrant Orchid (Break mode) */
  --color-journal: #f59e0b;             /* Warm Amber (Logging state) */
  --color-success: #10b981;             /* Emerald Green (Completed logs) */

  /* Typography Colors */
  --text-primary: #f8fafc;              /* Slate White */
  --text-secondary: #94a3b8;            /* Cool Gray */
  --text-muted: #64748b;                /* Dark Slate Gray */

  /* Layout Constants */
  --radius-card: 20px;
  --radius-button: 12px;
}
```

---

## 3. Typography & UI Accents

*   **Header / Timer Fonts**: `Space Grotesk` or `Outfit` (modern, geometric fonts that feel clean, crisp, and high-tech).
*   **Body / Controls Fonts**: `Inter` or standard UI sans-serif.
*   **Scale**:
    *   Countdown Timer: `font-medium tabular-nums text-6xl md:text-7xl`
    *   Section Headers: `font-semibold tracking-tight text-xl text-text-primary`
    *   Daily Stats / Standup Blocks: `font-medium text-sm`

---

## 4. Responsive Layout Strategy

The application layout shifts smoothly based on screen widths (Mobile-first design):

*   **Mobile Screens (< 768px)**:
    *   Single-column stack.
    *   The Timer sits prominently at the top.
    *   The Audio Mixer and Log Timeline are hidden inside collapsible glass accordions or stacked vertically to avoid scrolling fatigue.
    *   Input controls use large, touch-safe tap zones (minimum `44px` height).
*   **Desktop Screens (>= 768px)**:
    *   Two-column grid layout with a shared 1200px max-width wrapper.
    *   **Left Column (50%)**: Houses the interactive circular countdown timer, core operation buttons (Start, Pause, Reset), and the ambient audio mixer.
    *   **Right Column (50%)**: Displays the Daily standup formatter dashboard and the vertical timeline of completed focus logs.

---

## 5. UI Elements & Styling

*   **Translucent Cards**:
    ```css
    .glass-card {
      background: var(--card-surface);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-card);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    }
    ```
*   **Audio Mix Slider**: Custom styling for range input tracks to match the glowing glass aesthetics (thin cyan lines, glowing circular thumbs).
*   **Status Indicators**: Category tags (`Coding`, `Debugging`, etc.) have soft, desaturated background fills with vibrant borders and white text.

---

## 6. Animations & Micro-Interactions

*   **Breathing Glow**: The timer background glows with a gentle pulse (`transform: scale()`, opacity variation) synced to an 8-second breathing cycle during focus sessions to promote deep focus.
*   **Circular Progress Offset**: The countdown SVG ring uses CSS `stroke-dashoffset` for smooth frame-by-frame depletion as time passes:
    ```css
    .timer-ring-circle {
      transition: stroke-dashoffset 1s linear;
    }
    ```
*   **Modal Slide-In**: The micro-journal overlay animates with a spring-like slide-up and fade-in from the bottom of the screen (`transform: translateY(20px) -> 0`, `opacity: 0 -> 1`).
*   **Confetti Spark**: Copying the standup text triggers a brief, canvas-free SVG particle blast or CSS scaling animation on the copy button to signal success.
