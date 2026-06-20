"use client";

import { ClipboardList, History, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Components & Hooks import
import CoWorkingLounge from "@/components/co-working-lounge";
import DashboardStats from "@/components/dashboard-stats";
import JournalModal, { WorkCategory } from "@/components/journal-modal";
import PlanModal from "@/components/plan-modal";
import StandupPanel from "@/components/standup-panel";
import Timeline, { FocusLogItem } from "@/components/timeline";
import Timer from "@/components/timer";
import ValidateModal from "@/components/validate-modal";
import WellnessGuide from "@/components/wellness-guide";

import { useRealtimeLounge } from "@/hooks/use-realtime-lounge";
import { useMindflowStore } from "@/store/use-mindflow-store";

interface DashboardClientProps {
  user: { id: string; email: string };
  initialLogs: FocusLogItem[];
}

export default function DashboardClient({
  user,
  initialLogs,
}: DashboardClientProps) {
  const router = useRouter();

  // 1. Zustand Store State & Actions
  const mode = useMindflowStore((s) => s.mode);
  const breakDuration = useMindflowStore((s) => s.breakDuration);
  const logs = useMindflowStore((s) => s.logs);
  const loadingLogs = useMindflowStore((s) => s.loadingLogs);

  const isJournalOpen = useMindflowStore((s) => s.isJournalOpen);
  const isPlanModalOpen = useMindflowStore((s) => s.isPlanModalOpen);
  const isValidateModalOpen = useMindflowStore((s) => s.isValidateModalOpen);
  const rightPanelTab = useMindflowStore((s) => s.rightPanelTab);

  const setMode = useMindflowStore((s) => s.setMode);
  const setSecondsLeft = useMindflowStore((s) => s.setSecondsLeft);
  const setIsRunning = useMindflowStore((s) => s.setIsRunning);
  const setLogs = useMindflowStore((s) => s.setLogs);
  const setJournalOpen = useMindflowStore((s) => s.setJournalOpen);
  const setPlanModalOpen = useMindflowStore((s) => s.setPlanModalOpen);
  const setValidateModalOpen = useMindflowStore((s) => s.setValidateModalOpen);
  const setRightPanelTab = useMindflowStore((s) => s.setRightPanelTab);

  const refreshLogs = useMindflowStore((s) => s.refreshLogs);
  const submitLog = useMindflowStore((s) => s.submitLog);
  const startSession = useMindflowStore((s) => s.startSession);

  // Initialize initial logs loaded from server
  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs, setLogs]);

  // 2. Real-time Co-working Presence Hook
  const { coWorkers } = useRealtimeLounge(user.id, user.email);

  // 3. Modal Callback Handlers
  const handleValidationComplete = async () => {
    await refreshLogs();
    setMode("break");
    setSecondsLeft(breakDuration);
    setIsRunning(true);
  };

  const handleSkipValidation = () => {
    setValidateModalOpen(false);
    setMode("break");
    setSecondsLeft(breakDuration);
    setIsRunning(true);
  };

  const handleSkipLogging = () => {
    setJournalOpen(false);
    setMode("break");
    setSecondsLeft(breakDuration);
    setIsRunning(true);
  };

  const handleSubmitLog = async (data: {
    category: WorkCategory;
    description: string;
  }) => {
    await submitLog(data.category, data.description);
    setJournalOpen(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
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
            <span className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-linear-to-br from-cyan-400 to-blue-500 text-slate-950 font-bold text-base shadow-lg shadow-cyan-500/10">
              M
            </span>
            <span className="font-sans text-lg font-bold tracking-tight bg-linear-to-r from-cyan-200 to-slate-200 bg-clip-text text-transparent">
              Mindflow
            </span>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Account
              </span>
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
            <Timer />

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
                    {rightPanelTab === "timeline"
                      ? "Accomplishment History"
                      : "Standup Report Compiler"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {rightPanelTab === "timeline"
                      ? "Chronological log of completed sessions"
                      : "Compile logged milestones into text updates"}
                  </p>
                </div>

                {/* Tab select buttons and Log Accomplishment Button */}
                <div className="flex items-center space-x-3 self-start">
                  <button
                    onClick={() => setJournalOpen(true)}
                    className="flex items-center space-x-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-400 outline-none transition-all duration-300 hover:bg-cyan-500/20 active:scale-95"
                  >
                    <span>+ Log Accomplishment</span>
                  </button>

                  <div className="flex space-x-1 rounded-lg bg-slate-950/40 p-1 border border-white/5">
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
        onClose={() => setJournalOpen(false)}
        onSubmit={handleSubmitLog}
        onSkip={handleSkipLogging}
      />

      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setPlanModalOpen(false)}
        onStartSession={startSession}
      />

      <ValidateModal
        isOpen={isValidateModalOpen}
        onClose={() => setValidateModalOpen(false)}
        onSubmitValidation={handleValidationComplete}
        onSkip={handleSkipValidation}
      />
    </div>
  );
}
