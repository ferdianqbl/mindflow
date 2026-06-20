"use client";

import React, { useEffect, useState } from "react";
import { Users, Flame, Coffee, Moon } from "lucide-react";
import { LoungeUser } from "@/hooks/use-realtime-lounge";

interface CoWorkingLoungeProps {
  coWorkers: LoungeUser[];
}

export default function CoWorkingLounge({ coWorkers }: CoWorkingLoungeProps) {
  return (
    <div className="w-full rounded-[24px] border border-white/5 bg-[rgba(13,20,38,0.45)] p-6 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="mb-6 flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Co-Working Lounge</h2>
          <p className="text-xs text-slate-400">See who is focusing in real-time</p>
        </div>
      </div>

      {/* Online Users List */}
      {coWorkers.length === 0 ? (
        <div className="flex h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-white/5 bg-slate-950/10 p-4 text-center">
          <p className="text-xs text-slate-500 font-medium">No other co-workers online</p>
          <p className="mt-1 text-[10px] text-slate-600">Open this app in another window/device to see active syncs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {coWorkers.map((worker) => (
            <CoWorkerCard key={worker.userId} worker={worker} />
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-component to manage its own tick interval for other users' timers
function CoWorkerCard({ worker }: { worker: LoungeUser }) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (!worker.endTime) {
      setSecondsLeft(0);
      return;
    }

    const calculateTime = () => {
      const diff = Math.max(0, Math.round((worker.endTime! - Date.now()) / 1000));
      setSecondsLeft(diff);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [worker.endTime]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rSecs = secs % 60;
    return `${mins}:${rSecs.toString().padStart(2, "0")}`;
  };

  const statusConfigs = {
    focus: {
      color: "border-cyan-500/10 bg-cyan-500/5",
      dot: "bg-cyan-400 shadow-[0_0_10px_rgba(0,242,254,0.4)]",
      pulse: "animate-ping bg-cyan-400",
      text: "Focusing",
      icon: Flame,
      textColor: "text-cyan-400",
    },
    break: {
      color: "border-violet-500/10 bg-violet-500/5",
      dot: "bg-violet-400 shadow-[0_0_10px_rgba(217,70,239,0.4)]",
      pulse: "animate-ping bg-violet-400",
      text: "Break",
      icon: Coffee,
      textColor: "text-violet-400",
    },
    idle: {
      color: "border-slate-800/40 bg-slate-900/10",
      dot: "bg-slate-500",
      pulse: "hidden",
      text: "Idle",
      icon: Moon,
      textColor: "text-slate-400",
    },
  };

  // Determine active display mode
  const activeMode = secondsLeft > 0 ? worker.mode : "idle";
  const config = statusConfigs[activeMode];
  const StatusIcon = config.icon;

  return (
    <div className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 transition-all duration-300 hover:border-white/10 ${config.color}`}>
      
      {/* User Info & State */}
      <div className="flex items-center space-x-3.5">
        {/* Glowing Pulse status dot */}
        <div className="relative flex h-2.5 w-2.5">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pulse}`} />
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${config.dot}`} />
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-slate-200 capitalize">{worker.username}</h4>
          <div className={`mt-0.5 flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider ${config.textColor}`}>
            <StatusIcon className="h-3 w-3" />
            <span>{config.text}</span>
          </div>
        </div>
      </div>

      {/* Localized Timer Countdown */}
      {secondsLeft > 0 && (
        <div className="rounded-lg bg-slate-950/40 px-2.5 py-1 font-mono text-xs font-semibold text-slate-300 tabular-nums shadow-inner border border-white/[0.02]">
          {formatTime(secondsLeft)}
        </div>
      )}
    </div>
  );
}
