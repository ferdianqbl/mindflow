"use client";

import {
  Coffee,
  Flame,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Settings,
  SkipForward,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export type TimerMode = "focus" | "break" | "idle";

interface TimerProps {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  setSecondsLeft: React.Dispatch<React.SetStateAction<number>>;
  setMode: React.Dispatch<React.SetStateAction<TimerMode>>;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  onFocusComplete: (durationMinutes: number) => void;
  focusDuration: number;
  breakDuration: number;
  onUpdateDurations: (focus: number, breakDur: number) => void;
}

export const FOCUS_DURATION = 25 * 60; // 25 minutes
export const BREAK_DURATION = 5 * 60; // 5 minutes

export default function Timer({
  mode,
  secondsLeft,
  isRunning,
  onStart,
  onPause,
  onReset,
  onSkip,
  setSecondsLeft,
  setMode,
  setIsRunning,
  onFocusComplete,
  focusDuration,
  breakDuration,
  onUpdateDurations,
}: TimerProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [prevFocusDuration, setPrevFocusDuration] = useState(focusDuration);
  const [prevBreakDuration, setPrevBreakDuration] = useState(breakDuration);

  const [focusInput, setFocusInput] = useState(Math.round(focusDuration / 60));
  const [breakInput, setBreakInput] = useState(Math.round(breakDuration / 60));

  // Sync inputs during render if durations change from parent
  if (focusDuration !== prevFocusDuration) {
    setPrevFocusDuration(focusDuration);
    setFocusInput(Math.round(focusDuration / 60));
  }

  if (breakDuration !== prevBreakDuration) {
    setPrevBreakDuration(breakDuration);
    setBreakInput(Math.round(breakDuration / 60));
  }

  const handleBreakChange = (val: string) => {
    const min = parseInt(val, 10);
    if (!isNaN(min) && min >= 1 && min <= 60) {
      setBreakInput(min);
      onUpdateDurations(focusInput * 60, min * 60);
    } else if (val === "") {
      setBreakInput(0);
    }
  };

  const handleBreakBlur = () => {
    if (breakInput < 1) {
      setBreakInput(5);
      onUpdateDurations(focusInput * 60, 5 * 60);
    }
  };

  // SVG Circumference calculations for r=120
  const radius = 120;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius; // ~753.98
  const maxDuration =
    mode === "focus"
      ? focusDuration
      : mode === "break"
        ? breakDuration
        : focusDuration;
  const strokeDashoffset =
    circumference - (secondsLeft / maxDuration) * circumference;

  // Synthesize a gentle crystal chime notification sound on completion
  const playChime = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as unknown as Window & {
            webkitAudioContext: typeof AudioContext;
          }
        ).webkitAudioContext;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      // Note 1: E5 (Calm chime)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);

      // Note 2: A5 (Pitched slightly higher, starting later)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.0, now + 0.15); // A5
      gain2.gain.setValueAtTime(0, now + 0.15);
      gain2.gain.linearRampToValueAtTime(0.25, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 1.0);
    } catch (e) {
      console.warn("Failed to play synthesized chime:", e);
    }
  };

  // Timer Tick Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Timer Finished
            setIsRunning(false);
            playChime();

            if (mode === "focus") {
              // Trigger accomplishments log overlay callback
              onFocusComplete(Math.round(focusDuration / 60));
            } else {
              // Transition back from break to idle or focus
              setMode("idle");
              setSecondsLeft(focusDuration);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isRunning,
    mode,
    setSecondsLeft,
    setIsRunning,
    setMode,
    focusDuration,
    onFocusComplete,
  ]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // State configurations
  const themeColors = {
    focus: {
      accent: "text-cyan-400",
      glow: "shadow-cyan-500/10 border-cyan-500/20",
      stroke: "#00f2fe",
      bgGlow: "rgba(0, 242, 254, 0.04)",
      tag: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      text: "Focusing",
      icon: Flame,
    },
    break: {
      accent: "text-violet-400",
      glow: "shadow-violet-500/10 border-violet-500/20",
      stroke: "#d946ef",
      bgGlow: "rgba(217, 70, 239, 0.04)",
      tag: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      text: "Break Time",
      icon: Coffee,
    },
    idle: {
      accent: "text-slate-400",
      glow: "shadow-slate-500/5 border-white/5",
      stroke: "#94a3b8",
      bgGlow: "transparent",
      tag: "bg-slate-800/40 text-slate-400 border-slate-700/30",
      text: "Ready to Focus",
      icon: Moon,
    },
  };

  const activeTheme = themeColors[mode];
  const ActiveIcon = activeTheme.icon;

  return (
    <div
      className={`relative flex w-full flex-col items-center justify-center rounded-[32px] border bg-[rgba(13,20,38,0.45)] p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 ${activeTheme.glow}`}
    >
      {/* Settings Toggle Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-slate-400 outline-none transition-all duration-200 hover:bg-white/10 hover:text-slate-200 active:scale-95 z-20"
        title="Timer Settings"
      >
        <Settings className="h-4 w-4" />
      </button>

      {/* Mode Tag */}
      <div
        className={`mb-6 flex items-center space-x-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-500 ${activeTheme.tag}`}
      >
        <ActiveIcon className="h-3.5 w-3.5" />
        <span>{activeTheme.text}</span>
      </div>

      {/* Circle Dial Container */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing Backlight (active during focus) */}
        <div
          className={`absolute rounded-full transition-all duration-1000 ${
            isRunning && mode === "focus"
              ? "h-64 w-64 bg-cyan-500/5 blur-[32px] scale-110 animate-pulse"
              : isRunning && mode === "break"
                ? "h-64 w-64 bg-violet-500/5 blur-[32px] scale-110 animate-pulse"
                : "h-0 w-0 opacity-0"
          }`}
        />

        {/* SVG Progress Ring */}
        <svg className="h-[280px] w-[280px] -rotate-90 transform">
          {/* Background Track Circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="rgba(255, 255, 255, 0.02)"
            strokeWidth={stroke}
            fill="transparent"
          />
          {/* Active Progress Circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke={activeTheme.stroke}
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Clock Text Centered */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-sans text-5xl md:text-6xl font-medium tracking-tight text-slate-100 tabular-nums">
            {formatTime(secondsLeft)}
          </span>
          <span className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            {mode === "focus"
              ? "Work session"
              : mode === "break"
                ? "Rest phase"
                : "Paused"}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="mt-8 flex items-center space-x-4">
        {/* Reset Trigger */}
        <button
          onClick={onReset}
          title="Reset timer"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-slate-300 outline-none transition-all duration-200 hover:bg-white/10 hover:text-slate-100 active:scale-95"
        >
          <RotateCcw className="h-4.5 w-4.5" />
        </button>

        {/* Play/Pause Main Trigger */}
        <button
          onClick={isRunning ? onPause : onStart}
          className={`flex h-16 w-28 items-center justify-center rounded-2xl outline-none transition-all duration-300 active:scale-[0.97] ${
            isRunning
              ? "bg-slate-100 text-[#070a13] shadow-lg shadow-white/10 hover:bg-slate-200"
              : mode === "focus"
                ? "bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-400/20 hover:bg-cyan-300"
                : mode === "break"
                  ? "bg-violet-400 text-slate-900 shadow-lg shadow-violet-400/20 hover:bg-violet-300"
                  : "bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-400/20 hover:bg-cyan-300"
          }`}
        >
          {isRunning ? (
            <div className="flex items-center space-x-2">
              <Pause className="h-5 w-5 fill-current" />
              <span className="text-sm font-bold uppercase tracking-wider">
                Pause
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 fill-current" />
              <span className="text-sm font-bold uppercase tracking-wider">
                Start
              </span>
            </div>
          )}
        </button>

        {/* Skip Trigger */}
        <button
          onClick={onSkip}
          title="Skip session"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-slate-300 outline-none transition-all duration-200 hover:bg-white/10 hover:text-slate-100 active:scale-95"
        >
          <SkipForward className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-6 w-full max-w-[280px] rounded-2xl border border-white/5 bg-slate-950/40 p-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Focus (Min)
              </label>
              <input
                type="number"
                value={focusInput || ""}
                disabled
                className="w-full rounded-lg border border-white/5 bg-slate-900/40 px-3 py-1.5 text-xs text-slate-500 outline-none opacity-60"
                title="Focus duration is automatically calculated from task plans"
              />
              <span className="text-[8px] text-slate-500 block">
                Set by session plans
              </span>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Break (Min)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={breakInput || ""}
                onChange={(e) => handleBreakChange(e.target.value)}
                onBlur={handleBreakBlur}
                disabled={isRunning}
                className="w-full rounded-lg border border-white/5 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-violet-500/30 disabled:opacity-50"
              />
            </div>
          </div>
          {isRunning && (
            <p className="mt-2 text-center text-[9px] font-medium text-slate-500">
              Cannot edit settings while timer is running
            </p>
          )}
        </div>
      )}
    </div>
  );
}
