"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, History, ClipboardList, Coffee } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

// Components & Hooks import
import Timer, { TimerMode, FOCUS_DURATION, BREAK_DURATION } from "@/components/timer";
import AudioMixer from "@/components/audio-mixer";
import JournalModal, { WorkCategory } from "@/components/journal-modal";
import Timeline, { FocusLogItem } from "@/components/timeline";
import StandupPanel from "@/components/standup-panel";
import WellnessGuide from "@/components/wellness-guide";
import DashboardStats from "@/components/dashboard-stats";
import CoWorkingLounge from "@/components/co-working-lounge";

import { useAudio } from "@/hooks/use-audio";
import { useRealtimeLounge } from "@/hooks/use-realtime-lounge";

interface DashboardClientProps {
  user: User;
  initialLogs: FocusLogItem[];
}

export default function DashboardClient({ user, initialLogs }: DashboardClientProps) {
  const router = useRouter();
  
  // 1. Core Timer and Logs State
  const [mode, setMode] = useState<TimerMode>("idle");
  const [secondsLeft, setSecondsLeft] = useState<number>(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<FocusLogItem[]>(initialLogs);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // 2. UI Modals & Tab State
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<"timeline" | "standup">("timeline");

  // 3. Ambient Audio Mixer Hook
  const audio = useAudio();

  // 4. Real-time Co-working Presence Hook
  const { coWorkers } = useRealtimeLounge(user.id, user.email, mode, secondsLeft, isRunning);

  // 5. Timer Control Actions
  const handleStart = () => {
    setIsRunning(true);
    // If starting a fresh session, set mode to focus
    if (mode === "idle") {
      setMode("focus");
      setSecondsLeft(FOCUS_DURATION);
    }
    // Play mixed background tracks
    audio.play();
  };

  const handlePause = () => {
    setIsRunning(false);
    audio.pause();
  };

  const handleReset = () => {
    setIsRunning(false);
    audio.pause();
    
    if (mode === "break") {
      setSecondsLeft(BREAK_DURATION);
    } else {
      setMode("idle");
      setSecondsLeft(FOCUS_DURATION);
    }
  };

  const handleSkip = () => {
    setIsRunning(false);
    audio.pause();

    if (mode === "focus") {
      // Skip work -> Start a break
      setMode("break");
      setSecondsLeft(BREAK_DURATION);
    } else {
      // Skip break/idle -> Go to focus idle
      setMode("idle");
      setSecondsLeft(FOCUS_DURATION);
    }
  };

  // Callback triggered when focus timer hits 0
  const handleFocusComplete = (durationMinutes: number) => {
    // Stop audio
    audio.pause();
    // Open accomplishment logging overlay
    setIsJournalOpen(true);
  };

  // Submit log to database via API
  const handleSubmitLog = async (data: { category: WorkCategory; description: string }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) throw new Error("No active authentication token found.");

      const response = await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: data.category,
          description: data.description,
          durationMinutes: 25, // Default Pomodoro length
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to save log");
      }

      // Refresh log timeline list
      await refreshLogs(token);

      // Automatically transition user into a 5-minute break
      setMode("break");
      setSecondsLeft(BREAK_DURATION);
      setIsRunning(true);
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  };

  // Fetch updated logs from API
  const refreshLogs = async (token: string) => {
    setLoadingLogs(true);
    try {
      const response = await fetch("/api/logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const json = await response.json();
        setLogs(json.logs);
      }
    } catch (e) {
      console.error("Failed to refresh logs:", e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSkipLogging = () => {
    setIsJournalOpen(false);
    // Transition to break even if they skip writing a note
    setMode("break");
    setSecondsLeft(BREAK_DURATION);
    setIsRunning(true);
  };

  const handleLogout = async () => {
    audio.pause();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#070a13] font-sans text-slate-100">
      {/* Background radial space gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0d1527_0%,#070a13_100%)]" />

      {/* Decorative ambient blurred backing shapes */}
      <div className="absolute top-20 left-1/4 h-80 w-80 rounded-full bg-cyan-500/5 blur-[80px]" />
      <div className="absolute bottom-20 right-1/4 h-80 w-80 rounded-full bg-violet-500/5 blur-[80px]" />

      {/* Top Navbar */}
      <nav className="relative z-10 border-b border-white/5 bg-[rgba(13,20,38,0.25)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2.5">
            <span className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 font-bold text-base shadow-lg shadow-cyan-500/10">
              M
            </span>
            <span className="font-sans text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-200 to-slate-200 bg-clip-text text-transparent">
              Mindflow
            </span>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Account</span>
              <span className="text-xs text-slate-200">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 outline-none transition-all duration-200 hover:bg-white/10 hover:text-slate-100 active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Grid */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          
          {/* Left Column (Width: 5/12 on Desktop) - Focus Utilities */}
          <div className="space-y-6 md:col-span-5">
            {/* Timer component */}
            <Timer
              mode={mode}
              secondsLeft={secondsLeft}
              isRunning={isRunning}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              onSkip={handleSkip}
              setSecondsLeft={setSecondsLeft}
              setMode={setMode}
              setIsRunning={setIsRunning}
              onFocusComplete={handleFocusComplete}
              fadeOutAudio={audio.fadeOut}
            />

            {/* Ambient Soundboard Mixer */}
            <AudioMixer
              isPlaying={audio.isPlaying}
              volumes={audio.volumes}
              play={audio.play}
              pause={audio.pause}
              setVolume={audio.setVolume}
            />

            {/* Real-time co-working lobby */}
            <CoWorkingLounge coWorkers={coWorkers} />
          </div>

          {/* Right Column (Width: 7/12 on Desktop) - Accomplishments & Metrics */}
          <div className="space-y-6 md:col-span-7">
            {/* Donut and Heatmap Analytics */}
            <DashboardStats logs={logs} />

            {/* Toggle header logs timeline vs standup generator */}
            <div className="rounded-[24px] border border-white/5 bg-[rgba(13,20,38,0.45)] p-6 backdrop-blur-xl">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    {rightPanelTab === "timeline" ? "Accomplishment History" : "Standup Report Compiler"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {rightPanelTab === "timeline" 
                      ? "Chronological log of completed sessions" 
                      : "Compile logged milestones into text updates"}
                  </p>
                </div>

                {/* Tab select buttons */}
                <div className="flex space-x-1 rounded-lg bg-slate-950/40 p-1 border border-white/5 self-start">
                  <button
                    onClick={() => setRightPanelTab("timeline")}
                    className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-semibold outline-none transition-all duration-300 ${
                      rightPanelTab === "timeline"
                        ? "bg-slate-800 text-slate-100 shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <History className="h-3.5 w-3.5" />
                    <span>Timeline</span>
                  </button>
                  <button
                    onClick={() => setRightPanelTab("standup")}
                    className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-semibold outline-none transition-all duration-300 ${
                      rightPanelTab === "standup"
                        ? "bg-slate-800 text-slate-100 shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    <span>Standup</span>
                  </button>
                </div>
              </div>

              {/* Display active tab sub-component */}
              {rightPanelTab === "timeline" ? (
                <Timeline logs={logs} loading={loadingLogs} />
              ) : (
                <StandupPanel logs={logs} />
              )}
            </div>

            {/* Breathing Recovery Guide (Rendered below stats when in break cycle) */}
            {mode === "break" && (
              <div className="animate-fade-in">
                <WellnessGuide />
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Slide-in Journal Modal Overlay */}
      <JournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        onSubmit={handleSubmitLog}
        onSkip={handleSkipLogging}
      />
    </div>
  );
}
