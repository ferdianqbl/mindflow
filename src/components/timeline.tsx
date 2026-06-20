"use client";

import React from "react";
import { Code, Bug, Palette, BookOpen, Users, Settings, Timer, type LucideIcon } from "lucide-react";
import { CATEGORY_EMOJIS, CATEGORY_LABELS } from "@/utils/formatters";
import { WorkCategory } from "@/components/journal-modal";

interface FocusLogItem {
  id: string;
  category: string;
  description: string;
  durationMinutes: number;
  createdAt: string | Date;
}

interface TimelineProps {
  logs: FocusLogItem[];
  loading: boolean;
}

export default function Timeline({ logs, loading }: TimelineProps) {
  const categoryConfig: Record<WorkCategory, { icon: LucideIcon; color: string; bg: string }> = {
    coding: { icon: Code, color: "text-cyan-400 border-cyan-500/20", bg: "bg-cyan-500/5" },
    debugging: { icon: Bug, color: "text-red-400 border-red-500/20", bg: "bg-red-500/5" },
    design: { icon: Palette, color: "text-pink-400 border-pink-500/20", bg: "bg-pink-500/5" },
    learning: { icon: BookOpen, color: "text-amber-400 border-amber-500/20", bg: "bg-amber-500/5" },
    meeting: { icon: Users, color: "text-indigo-400 border-indigo-500/20", bg: "bg-indigo-500/5" },
    operations: { icon: Settings, color: "text-slate-400 border-slate-500/20", bg: "bg-slate-500/5" },
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400" />
        <p className="text-sm text-slate-400">Loading your timeline...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/5 bg-slate-950/10 p-6 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-500">
          <Timer className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">Focus Timeline Empty</h3>
        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
          Start your first focus session and write an accomplishment log to populate your timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="relative max-h-[480px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
      {/* Vertical Timeline Guide Line */}
      <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-800" />

      {/* Logs Feed */}
      <div className="space-y-6">
        {logs.map((log) => {
          const cat = log.category.toLowerCase() as WorkCategory;
          const config = categoryConfig[cat] || { icon: Timer, color: "text-slate-400 border-slate-500/20", bg: "bg-slate-500/5" };
          const CatIcon = config.icon;
          const emoji = CATEGORY_EMOJIS[cat] || "📝";
          const label = CATEGORY_LABELS[cat] || log.category;

          const timestamp = new Date(log.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div key={log.id} className="relative flex items-start pl-14 group">
              {/* Timeline Bullet Node Icon */}
              <div className={`absolute left-2.5 flex h-7.5 w-7.5 items-center justify-center rounded-full border bg-[#070a13] shadow-lg transition-transform duration-200 group-hover:scale-105 ${config.color}`}>
                <CatIcon className="h-3.5 w-3.5" />
              </div>

              {/* Log Details Card */}
              <div className="w-full rounded-2xl border border-white/5 bg-slate-950/20 p-4 transition-all duration-300 hover:border-white/10 hover:bg-slate-950/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                  {/* Category Details */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[13px] font-semibold text-slate-200">{label}</span>
                  </div>
                  {/* Time and Duration badges */}
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-medium text-slate-400 tabular-nums">{timestamp}</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400 tabular-nums">
                      {log.durationMinutes}m focus
                    </span>
                  </div>
                </div>
                {/* Description Text */}
                <p className="text-sm leading-6 text-slate-300">
                  {log.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export type { FocusLogItem };
