"use client";

import React, { useState } from "react";
import { Copy, Check, MessageSquare, Clipboard, FileText } from "lucide-react";
import confetti from "canvas-confetti";
import { formatToSlack, formatToYTB, formatToMarkdown } from "@/utils/formatters";
import { FocusLogItem } from "./timeline";

interface StandupPanelProps {
  logs: FocusLogItem[];
}

type FormatTab = "slack" | "ytb" | "markdown";

export default function StandupPanel({ logs }: StandupPanelProps) {
  const [activeTab, setActiveTab] = useState<FormatTab>("slack");
  const [copied, setCopied] = useState(false);

  // Compile text based on the selected tab
  const getCompiledText = () => {
    switch (activeTab) {
      case "slack":
        return formatToSlack(logs);
      case "ytb":
        return formatToYTB(logs);
      case "markdown":
        return formatToMarkdown(logs);
      default:
        return "";
    }
  };

  const handleCopy = async () => {
    const text = getCompiledText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Log the copy event to database analytics asynchronously
      fetch("/api/logs/copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ format: activeTab }),
      }).catch((err) => {
        console.error("Failed to log copy event:", err);
      });

      // Trigger satisfying particle confetti explosion!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#00f2fe", "#d946ef", "#10b981"],
      });

      // Reset copied state
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (e) {
      console.error("Failed to copy standup text:", e);
    }
  };

  const tabs = [
    { id: "slack" as FormatTab, name: "Slack Format", icon: MessageSquare },
    { id: "ytb" as FormatTab, name: "YTB Standup", icon: FileText },
    { id: "markdown" as FormatTab, name: "Markdown Bullet", icon: Clipboard },
  ];

  return (
    <div className="flex flex-col space-y-4">
      {/* Format Toggle Tabs */}
      <div className="flex space-x-1 rounded-xl bg-slate-950/40 p-1 border border-white/5">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center space-x-2 rounded-lg py-2 text-xs font-semibold outline-none transition-all duration-300 ${
                isActive
                  ? "bg-slate-800 text-slate-100 shadow-md border border-white/5"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <TabIcon className="h-3.5 w-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Preview Container */}
      <div className="relative">
        <textarea
          readOnly
          value={getCompiledText()}
          rows={10}
          className="w-full select-all rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3.5 font-mono text-[11px] leading-6 text-slate-300 outline-none scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent focus:border-white/10"
        />

        {/* Copy Floating Button */}
        <button
          onClick={handleCopy}
          disabled={logs.length === 0}
          className={`absolute bottom-4 right-4 flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-lg transition-all duration-300 outline-none active:scale-95 disabled:scale-100 disabled:opacity-30 ${
            copied
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10"
              : "bg-cyan-400 text-slate-900 shadow-cyan-400/10 hover:bg-cyan-300"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 stroke-[3px]" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 stroke-[2.5px]" />
              <span>Copy Report</span>
            </>
          )}
        </button>
      </div>

      <p className="text-[10px] text-center text-slate-500">
        Aggregates focus accomplishments into structured templates ready for status updates.
      </p>
    </div>
  );
}
export type { FocusLogItem };
