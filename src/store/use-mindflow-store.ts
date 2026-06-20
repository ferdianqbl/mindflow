import { create } from "zustand";
import { TimerMode } from "@/components/timer";
import { FocusLogItem } from "@/components/timeline";
import { LoungeUser } from "@/hooks/use-realtime-lounge";
import { WorkCategory } from "@/components/journal-modal";

export const FOCUS_DURATION = 25 * 60; // 25 minutes
export const BREAK_DURATION = 5 * 60;  // 5 minutes

interface MindflowState {
  // Timer States
  mode: TimerMode;
  focusDuration: number;
  breakDuration: number;
  secondsLeft: number;
  isRunning: boolean;

  // Logs States
  logs: FocusLogItem[];
  loadingLogs: boolean;

  // UI Modals & Tabs
  isPlanModalOpen: boolean;
  isValidateModalOpen: boolean;
  isJournalOpen: boolean;
  rightPanelTab: "timeline" | "standup";

  // Lounge States
  coWorkers: LoungeUser[];

  // Actions
  setMode: (mode: TimerMode) => void;
  setFocusDuration: (dur: number) => void;
  setBreakDuration: (dur: number) => void;
  setSecondsLeft: (sec: number) => void;
  setIsRunning: (running: boolean) => void;
  setLogs: (logs: FocusLogItem[]) => void;
  setLoadingLogs: (loading: boolean) => void;
  setPlanModalOpen: (open: boolean) => void;
  setValidateModalOpen: (open: boolean) => void;
  setJournalOpen: (open: boolean) => void;
  setRightPanelTab: (tab: "timeline" | "standup") => void;
  setCoWorkers: (workers: LoungeUser[]) => void;

  // Timer Handlers
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  tick: () => void;
  updateDurations: (focusSecs: number, breakSecs: number) => void;

  // API Log Handlers
  refreshLogs: () => Promise<void>;
  submitLog: (category: WorkCategory, description: string) => Promise<void>;

  // Session Plan Handlers
  startSession: (plans: Array<{ title: string; category: string; durationMin: number }>) => Promise<void>;
  validateSession: (completedIds: string[]) => Promise<void>;
}

export const useMindflowStore = create<MindflowState>((set, get) => ({
  // Initial States
  mode: "idle",
  focusDuration: FOCUS_DURATION,
  breakDuration: BREAK_DURATION,
  secondsLeft: FOCUS_DURATION,
  isRunning: false,
  logs: [],
  loadingLogs: false,
  isPlanModalOpen: false,
  isValidateModalOpen: false,
  isJournalOpen: false,
  rightPanelTab: "timeline",
  coWorkers: [],

  // Direct State Setters
  setMode: (mode) => set({ mode }),
  setFocusDuration: (focusDuration) => set({ focusDuration }),
  setBreakDuration: (breakDuration) => set({ breakDuration }),
  setSecondsLeft: (secondsLeft) => set({ secondsLeft }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setLogs: (logs) => set({ logs }),
  setLoadingLogs: (loadingLogs) => set({ loadingLogs }),
  setPlanModalOpen: (isPlanModalOpen) => set({ isPlanModalOpen }),
  setValidateModalOpen: (isValidateModalOpen) => set({ isValidateModalOpen }),
  setJournalOpen: (isJournalOpen) => set({ isJournalOpen }),
  setRightPanelTab: (rightPanelTab) => set({ rightPanelTab }),
  setCoWorkers: (coWorkers) => set({ coWorkers }),

  // Timer Handlers
  start: () => {
    const { mode, isRunning } = get();
    if (mode === "idle") {
      set({ isPlanModalOpen: true });
      return;
    }
    set({ isRunning: true });
  },

  pause: () => set({ isRunning: false }),

  reset: () => {
    const { mode, focusDuration, breakDuration } = get();
    set({ isRunning: false });
    if (mode === "break") {
      set({ secondsLeft: breakDuration });
    } else {
      set({ mode: "idle", secondsLeft: focusDuration });
    }
  },

  skip: () => {
    const { mode, focusDuration, breakDuration } = get();
    set({ isRunning: false });
    if (mode === "focus") {
      set({ mode: "break", secondsLeft: breakDuration });
    } else {
      set({ mode: "idle", secondsLeft: focusDuration });
    }
  },

  tick: () => {
    const { secondsLeft, mode, breakDuration, focusDuration } = get();
    if (secondsLeft <= 1) {
      set({ isRunning: false, secondsLeft: 0 });
      if (mode === "focus") {
        set({ isValidateModalOpen: true });
      } else {
        set({ mode: "idle", secondsLeft: focusDuration });
      }
    } else {
      set({ secondsLeft: secondsLeft - 1 });
    }
  },

  updateDurations: (focusSecs, breakSecs) => {
    const { isRunning, mode } = get();
    set({ focusDuration: focusSecs, breakDuration: breakSecs });
    if (!isRunning) {
      if (mode === "break") {
        set({ secondsLeft: breakSecs });
      } else if (mode === "idle" || mode === "focus") {
        set({ secondsLeft: focusSecs });
      }
    }
  },

  // API Accomplishments Handlers
  refreshLogs: async () => {
    set({ loadingLogs: true });
    try {
      const response = await fetch("/api/logs");
      if (response.ok) {
        const json = await response.json();
        set({ logs: json.logs });
      }
    } catch (e) {
      console.error("Failed to refresh logs:", e);
    } finally {
      set({ loadingLogs: false });
    }
  },

  submitLog: async (category, description) => {
    const { focusDuration, refreshLogs, breakDuration } = get();
    try {
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          description,
          durationMinutes: Math.round(focusDuration / 60),
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to save log");
      }

      await refreshLogs();

      // Automatically transition user into a break
      set({
        mode: "break",
        secondsLeft: breakDuration,
        isRunning: true,
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  // API Session Plan Handlers
  startSession: async (plans) => {
    const response = await fetch("/api/plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plans }),
    });

    if (!response.ok) {
      const errJson = await response.json();
      throw new Error(errJson.error || "Failed to save session plans");
    }

    const totalMinutes = plans.reduce((acc, curr) => acc + curr.durationMin, 0);
    const totalSeconds = totalMinutes * 60;

    set({
      focusDuration: totalSeconds,
      secondsLeft: totalSeconds,
      mode: "focus",
      isRunning: true,
    });
  },

  validateSession: async (completedIds) => {
    const { refreshLogs, breakDuration } = get();
    const res = await fetch("/api/plans/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completedPlanIds: completedIds,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json();
      throw new Error(errJson.error || "Failed to submit validations");
    }

    await refreshLogs();

    set({
      mode: "break",
      secondsLeft: breakDuration,
      isRunning: true,
    });
  },
}));
