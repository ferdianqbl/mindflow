# System Architecture - Mindflow

This document details the software architecture, libraries, local state schemas, folder structure, and deployment strategies for **Mindflow**.

---

## 1. Stack Selection & Rationale

We implement Mindflow as a high-fidelity Client-Side Single Page Application (SPA). This guarantees 100% uptime for reviewers, loads instantly, and runs entirely in-browser without database delays or container startup overheads.

### Tech Stack Details

*   **Build Tool & Dev Environment**: **Vite (with TypeScript & React)**
    *   *Rationale*: Instant Hot Module Replacement (HMR) for fast iteration, and optimized static asset packaging.
*   **Styling**: **Vanilla CSS (Modern Custom Variables)**
    *   *Rationale*: Full control over glassmorphism filters, glowing border shaders, range sliders, and custom animation curves.
*   **Audio Engine**: **Native Browser Web Audio API & HTML5 Audio**
    *   *Web Audio Synthesis*: Synthesizes focus noise (Brown/White/Pink noise) directly on the client using the browser's audio nodes. This requires **zero bandwidth** and runs fully offline.
    *   *HTML5 Audio Hooks*: Loops relaxing soundscapes (Lofi, Rain) using royalty-free, compressed background tracks.
*   **State Persistence**: **Browser LocalStorage**
    *   *Rationale*: Stores timer state and daily logs locally. Session progress is completely safe from accidental tab reloads.

### Core Dependencies

We keep package overhead low to maintain speed and reliability:
*   `lucide-react`: High-quality SVG icons.
*   `canvas-confetti`: Celebratory animations when standup text is successfully generated and copied.

---

## 2. LocalStorage Schema Definitions

Mindflow uses two distinct local storage blocks to preserve state:

### A. Active Session State (`mindflow_session`)
Tracks the current running state of the Pomodoro timer.
```typescript
interface SessionState {
  mode: 'focus' | 'break' | 'idle';
  timeLeft: number;           // Remaining seconds
  isRunning: boolean;
  totalDuration: number;      // Target seconds (e.g. 1500)
  startedAt: string | null;   // ISO timestamp
}
```

### B. Accomplishment History (`mindflow_logs`)
Stores an array of completed daily log items.
```typescript
interface DailyLog {
  id: string;                 // UUID or timestamp
  timestamp: string;          // ISO completion time
  category: 'coding' | 'debugging' | 'design' | 'learning' | 'meeting' | 'operations';
  description: string;        // 140-char journal text
  durationMinutes: number;    // Length of focus block (e.g., 25)
}
```

---

## 3. Directory Layout

The codebase is organized modularly:

```
mindflow/
├── package.json              # Script configurations and package metadata
├── tsconfig.json             # Strict TypeScript settings
├── vite.config.ts            # Vite compile setups
├── index.html                # Entry document mounts fonts (Outfit/Inter)
├── public/
│   └── sounds/               # Copyright-free background MP3 loops
└── src/
    ├── main.tsx              # Application boots here
    ├── index.css             # Main styling, design tokens, glass effects
    ├── components/
    │   ├── Timer.tsx         # Circular SVG timer, actions (Start/Pause/Reset)
    │   ├── AudioMixer.tsx    # Volume dials, audio track select sliders
    │   ├── JournalModal.tsx  # Slide-in accomplishment journal form
    │   ├── StandupPanel.tsx  # Format toggles, preview text blocks, copy triggers
    │   ├── Timeline.tsx      # Vertical chronological list of logs
    │   └── WellnessGuide.tsx # Morphing breath cycle animation for break periods
    ├── hooks/
    │   ├── useAudio.ts       # Synth noise engine & background track player
    │   └── useLocalStorage.ts # Reactive hook syncing state to browser storage
    └── utils/
        ├── formatters.ts     # Standup text compilers (Slack, YTB, Markdown formats)
        └── noiseGenerator.ts # Web Audio API oscillator/buffer builder for brown noise
```

---

## 4. Deployment Strategy

*   **Hosting**: The application is deployed to **Vercel** or **Netlify** as a static project.
*   **CI/CD Pipeline**: Any push to the `main` branch of the GitHub repository triggers an automatic build and deploy.
*   **Redirects & Routes**: Since the app is a single-page app with no custom router, no specialized routing rules or rewrite rules are required, minimizing production failure modes.
