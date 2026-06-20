"use client";

import { WorkCategory } from "@/components/journal-modal";
import { CATEGORY_EMOJIS, CATEGORY_LABELS } from "@/utils/formatters";
import { CheckCircle2, Clock, Flame } from "lucide-react";
import { useMemo } from "react";
import { FocusLogItem } from "./timeline";

interface DashboardStatsProps {
  logs: FocusLogItem[];
}

export default function DashboardStats({ logs }: DashboardStatsProps) {
  // 1. Calculate Core Metrics
  const metrics = useMemo(() => {
    const totalSessions = logs.length;
    const totalMinutes = logs.reduce(
      (sum, log) => sum + log.durationMinutes,
      0,
    );
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Calculate Focus Streak (Consecutive days focusing, starting from today/yesterday)
    let currentStreak = 0;
    if (logs.length > 0) {
      const logDates = new Set(
        logs.map((log) => new Date(log.createdAt).toDateString()),
      );

      const checkDate = new Date();
      // Check if they focused today. If not, check if they focused yesterday to preserve the streak.
      if (!logDates.has(checkDate.toDateString())) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (logDates.has(checkDate.toDateString())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    return {
      totalSessions,
      totalHours,
      currentStreak,
    };
  }, [logs]);

  // 2. Calculate Category Ratios for Donut Chart
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach((log) => {
      counts[log.category] = (counts[log.category] || 0) + 1;
    });

    const total = logs.length || 1;
    const categoriesList = [
      "coding",
      "debugging",
      "design",
      "learning",
      "meeting",
      "operations",
    ];
    const colors: Record<string, string> = {
      coding: "#00f2fe", // Cyan
      debugging: "#ef4444", // Red
      design: "#f43f5e", // Pink
      learning: "#f59e0b", // Amber
      meeting: "#6366f1", // Indigo
      operations: "#94a3b8", // Slate
    };

    let accumulatedPercentage = 0;
    return categoriesList
      .map((catKey) => {
        const count = counts[catKey] || 0;
        const percentage = (count / total) * 100;
        const startAngle = (accumulatedPercentage / 100) * 360;
        accumulatedPercentage += percentage;

        return {
          id: catKey as WorkCategory,
          name: CATEGORY_LABELS[catKey as WorkCategory] || catKey,
          emoji: CATEGORY_EMOJIS[catKey as WorkCategory] || "📝",
          count,
          percentage: Math.round(percentage),
          color: colors[catKey] || "#94a3b8",
          startAngle,
        };
      })
      .filter((cat) => cat.count > 0);
  }, [logs]);

  // 3. Generate Github-style Heatmap for the past 30 days
  const heatmapData = useMemo(() => {
    const dates: { dateString: string; count: number; dayLabel: string }[] = [];
    const logCountsByDate: Record<string, number> = {};

    logs.forEach((log) => {
      const dateStr = new Date(log.createdAt).toDateString();
      logCountsByDate[dateStr] = (logCountsByDate[dateStr] || 0) + 1;
    });

    // Generate past 30 days chronologically
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toDateString();
      const count = logCountsByDate[dateString] || 0;
      const dayLabel = d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });

      dates.push({
        dateString,
        count,
        dayLabel,
      });
    }

    return dates;
  }, [logs]);

  // Circular SVG Donut Geometry parameters
  const size = 180;
  const radius = 65;
  const circumference = 2 * Math.PI * radius; // ~408.4

  return (
    <div className="space-y-6">
      {/* 3-Column Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Hours */}
        <div className="rounded-2xl border border-white/5 bg-slate-950/20 p-4 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <span className="mt-3 block text-2xl font-bold text-slate-100 tabular-nums">
            {metrics.totalHours}h
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Hours Focused
          </span>
        </div>

        {/* Sessions Completed */}
        <div className="rounded-2xl border border-white/5 bg-slate-950/20 p-4 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
          <span className="mt-3 block text-2xl font-bold text-slate-100 tabular-nums">
            {metrics.totalSessions}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Sessions
          </span>
        </div>

        {/* Focus Streak */}
        <div className="rounded-2xl border border-white/5 bg-slate-950/20 p-4 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
            <Flame className="h-4.5 w-4.5" />
          </div>
          <span className="mt-3 block text-2xl font-bold text-slate-100 tabular-nums">
            {metrics.currentStreak}d
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Focus Streak
          </span>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Category breakdown (SVG Donut Chart) */}
        <div className="rounded-[24px] border border-white/5 bg-[rgba(13,20,38,0.45)] p-5 backdrop-blur-xl">
          <h3 className="mb-4 text-sm font-semibold text-slate-200">
            Category Ratios
          </h3>

          {logs.length === 0 ? (
            <div className="flex h-36 items-center justify-center text-xs text-slate-500">
              Complete focus blocks to see ratio charts
            </div>
          ) : (
            <div className="flex items-center justify-center gap-6">
              {/* Donut SVG */}
              <div className="relative h-[150px] w-[150px]">
                <svg
                  className="h-full w-full -rotate-90"
                  viewBox={`0 0 ${size} ${size}`}
                >
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.02)"
                    strokeWidth="14"
                  />
                  {chartData.map((slice) => {
                    const strokeDashoffset =
                      circumference - (slice.percentage / 100) * circumference;
                    return (
                      <circle
                        key={slice.id}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="14"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(${slice.startAngle} ${size / 2} ${size / 2})`}
                        className="transition-all duration-500 hover:stroke-[16px] cursor-pointer"
                      />
                    );
                  })}
                </svg>
                {/* Centered label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-slate-200">
                    {metrics.totalSessions}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Blocks
                  </span>
                </div>
              </div>

              {/* Legends */}
              <div className="flex flex-col space-y-2">
                {chartData.map((slice) => (
                  <div key={slice.id} className="flex items-center space-x-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-[11px] font-medium text-slate-300">
                      {slice.emoji} {slice.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* GitHub-style Heatmap */}
        <div className="rounded-[24px] border border-white/5 bg-[rgba(13,20,38,0.45)] p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              Consistency Grid
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">
              Past 30 Days
            </span>
          </div>

          {/* Grid Cells */}
          <div className="flex flex-wrap gap-1.5 justify-center py-2">
            {heatmapData.map((day, idx) => {
              // Determine shade of green/cyan based on completion count
              let bgClass = "bg-slate-900 border-white/[0.01]"; // 0 logs
              let shadowClass = "";

              if (day.count === 1) {
                bgClass = "bg-cyan-950/60 border-cyan-800/20";
              } else if (day.count === 2) {
                bgClass = "bg-cyan-500/40 border-cyan-400/30";
              } else if (day.count >= 3) {
                bgClass = "bg-cyan-400 text-slate-950 border-cyan-300/40";
                shadowClass = "shadow-[0_0_8px_rgba(0,242,254,0.3)]";
              }

              return (
                <div
                  key={idx}
                  title={`${day.dayLabel}: ${day.count} sessions completed`}
                  className={`group relative h-6.5 w-6.5 rounded-md border flex items-center justify-center text-[10px] font-bold transition-all duration-200 hover:scale-108 cursor-pointer ${bgClass} ${shadowClass}`}
                >
                  <span
                    className={`transition-opacity duration-200 ${
                      day.count > 0
                        ? "opacity-100 text-slate-200"
                        : "opacity-0 group-hover:opacity-100 text-slate-600"
                    }`}
                  >
                    {day.count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Map guide */}
          <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500">
            <span>Less active</span>
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded border border-white/1 bg-slate-900" />
              <span className="h-3 w-3 rounded border border-cyan-800/20 bg-cyan-950/60" />
              <span className="h-3 w-3 rounded border border-cyan-400/30 bg-cyan-500/40" />
              <span className="h-3 w-3 rounded border border-cyan-300/40 bg-cyan-400" />
            </div>
            <span>More active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export type { FocusLogItem };
