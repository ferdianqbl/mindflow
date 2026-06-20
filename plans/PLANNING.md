# Project Planning & Roadmap - Mindflow

This document indexes all documentation files for **Mindflow** and lists the roadmap for incremental phase completions.

---

## 1. Document Index

- **Product Requirements**: Read functional and scope specs in [PRD.md](./PRD.md).
- **UI/UX Design**: Read color, typography, responsive guidelines, and styling setups in [DESIGN.md](./DESIGN.md).
- **System Architecture**: Read engineering stack choices and directory layouts in [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md).
- **Verification Plan**: Read testing steps and criteria in [VALIDATION_RESULTS.md](./VALIDATION_RESULTS.md).

---

## 2. Development Roadmap

### Phase 1: Foundation & Project Bootstrapping
*   [ ] Initialize a Vite + React + TypeScript app in the `/mindflow` folder.
*   [ ] Set up global configuration files (`tsconfig.json`, `package.json`, `.gitignore`).
*   [ ] Configure Google Fonts (`Outfit` and `Inter`) and load custom css variables inside `src/index.css`.
*   [ ] Set up basic app layout with a placeholder glassmorphic grid.

### Phase 2: Core Focus Timer & Persistence
*   [ ] Build the circular SVG timer component (`Timer.tsx`) with dynamic dash offsets.
*   [ ] Implement Pomodoro timer hooks tracking seconds, session modes (`focus`, `break`, `idle`).
*   [ ] Sync active timer states to `localStorage` to ensure reload resilience.
*   [ ] Add basic start, pause, reset, and skip triggers.

### Phase 3: Web Audio Synth & Audio Mixer
*   [ ] Implement Web Audio API generator in `noiseGenerator.ts` to synthesize brown/white focus noise.
*   [ ] Setup loop handlers for lofi beats and rain soundscape audio tracks.
*   [ ] Build `AudioMixer.tsx` with individual volume dials and play/pause controls.
*   [ ] Connect mixer volumes with the timer states (auto-fade sound on session end).

### Phase 4: Journaling Check-ins
*   [ ] Build the responsive modal popup (`JournalModal.tsx`) triggering automatically when the timer reaches zero.
*   [ ] Implement category tag selection controls (`Coding`, `Debugging`, `Design`, etc.).
*   [ ] Implement the 140-character text area with validation constraints.
*   [ ] Write logs array to `localStorage` and refresh the dashboard.

### Phase 5: Timeline & Standup Generator
*   [ ] Build a vertical scrollable timeline (`Timeline.tsx`) visualizer showing daily logs.
*   [ ] Implement text formatters (`formatters.ts`) compiling raw JSON logs into formatted templates (Slack emojis, Markdown, YTB).
*   [ ] Build the `StandupPanel.tsx` control panel with markdown preview blocks and one-click copy.
*   [ ] Hook up `canvas-confetti` success triggers upon clipboard copier actions.

### Phase 6: Wellness Break Guide
*   [ ] Create `WellnessGuide.tsx` which activates during break cycles.
*   [ ] Design a smooth SVG morphing breathing guide that expanding/shrinking dynamically on an 8-second breathing loop.
*   [ ] Add physical stretching prompt tags to encourage user ergonomics.

### Phase 7: Polish, Responsive Design & Deploy
*   [ ] Audit mobile layout responsiveness (<768px viewports).
*   * [ ] Clean up hover, focus, active states, range slider thumb visuals, and dialog overlays.
*   [ ] Deploy to Vercel/Netlify.
*   [ ] Create the project README.md guiding local runners and reviewers.

---

## 3. Git Commit Strategy

We will use conventional, clean, and granular commits to document our build steps in the Git history:
*   `feat(timer): build circular SVG pomodoro countdown and sync state to localStorage`
*   `feat(audio): integrate Web Audio API brown noise synthesizer and mixer panel`
*   `feat(journal): implement slide-in modal check-in and category tags`
*   `feat(standup): write standup preview formatters and copy-to-clipboard actions`
*   `style: design glassmorphic dark mode theme and dynamic glows`
*   `chore: set up project skeleton and documentation index`
