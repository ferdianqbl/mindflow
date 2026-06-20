"use client";

import React, { useEffect, useState } from "react";
import { X, CheckSquare, Square, Check, ClipboardCheck, Sparkles, Clock } from "lucide-react";
import confetti from "canvas-confetti";
import { WorkCategory } from "./journal-modal";
import { CATEGORY_EMOJIS, CATEGORY_LABELS } from "@/utils/formatters";

interface PlanItem {
  id: string;
  title: string;
  category: WorkCategory;
  durationMin: number;
}

interface ValidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitValidation: (completedCount: number) => Promise<void>;
  onSkip: () => void;
}

export default function ValidateModal({
  isOpen,
  onClose,
  onSubmitValidation,
  onSkip,
}: ValidateModalProps) {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load incomplete plans to validate
  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setLoading(true);
      fetch("/api/plans")
        .then((res) => res.json())
        .then((data) => {
          if (data.plans) {
            setPlans(
              data.plans.map((p: any) => ({
                id: p.id,
                title: p.title,
                category: p.category as WorkCategory,
                durationMin: p.durationMin,
              }))
            );
            // Default to marking all tasks completed
            setCompletedIds(data.plans.map((p: any) => p.id));
          }
        })
        .catch((err) => {
          console.error("Failed to load plans for validation:", err);
          setErrorMsg("Could not fetch active tasks to review.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleComplete = (id: string) => {
    if (completedIds.includes(id)) {
      setCompletedIds(completedIds.filter((item) => item !== id));
    } else {
      setCompletedIds([...completedIds, id]);
    }
  };

  const handleSelectAll = () => {
    setCompletedIds(plans.map((p) => p.id));
  };

  const handleClearAll = () => {
    setCompletedIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // Validate tasks via API
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

      // Satisfying particle confetti burst!
      if (completedIds.length > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.7 },
          colors: ["#00f2fe", "#d946ef", "#10b981"],
        });
      }

      // Notify parent to refresh list, set break phase, etc.
      await onSubmitValidation(completedIds.length);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to log accomplishments.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Translucent Backdrop blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" onClick={onSkip} />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-xl transform rounded-[28px] border border-white/10 bg-[#0d1325]/90 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 scale-100 max-h-[80vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 outline-none transition-colors duration-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 mt-2 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="h-5 w-5 text-violet-400" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Focus Review & Accomplishments
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Great work completing your focus sprint! Check off the tasks that you finished.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs font-semibold text-red-400 flex-shrink-0">
            {errorMsg}
          </div>
        )}

        {/* Form Container (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Action links */}
          <div className="flex justify-between items-center mb-3 text-[10px] text-slate-500 flex-shrink-0">
            <span>Select completed items:</span>
            <div className="space-x-3">
              <button type="button" onClick={handleSelectAll} className="hover:text-cyan-400 outline-none transition-colors">
                Select All
              </button>
              <button type="button" onClick={handleClearAll} className="hover:text-cyan-400 outline-none transition-colors">
                Clear All
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {loading && plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                <span className="text-xs text-slate-500">Loading your plans...</span>
              </div>
            ) : plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-1">
                <span className="text-xs">No active plans found for this session.</span>
                <span className="text-[10px] text-slate-600">You can skip this review.</span>
              </div>
            ) : (
              plans.map((plan) => {
                const isDone = completedIds.includes(plan.id);
                const emoji = CATEGORY_EMOJIS[plan.category] || "📝";
                const label = CATEGORY_LABELS[plan.category] || plan.category;

                return (
                  <div
                    key={plan.id}
                    onClick={() => toggleComplete(plan.id)}
                    className={`flex items-center space-x-4 rounded-xl border p-3.5 transition-all duration-300 cursor-pointer select-none ${
                      isDone
                        ? "border-cyan-500/20 bg-cyan-500/5 shadow-inner"
                        : "border-white/5 bg-white/2 hover:border-white/10"
                    }`}
                  >
                    {/* Checkbox Icon */}
                    <div className="flex-shrink-0 outline-none text-slate-400">
                      {isDone ? (
                        <CheckSquare className="h-5 w-5 text-cyan-400 fill-cyan-400/5" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-600" />
                      )}
                    </div>

                    {/* Task Title & Meta */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isDone ? "text-slate-200 line-through opacity-75" : "text-slate-300"}`}>
                        {plan.title}
                      </p>
                      <div className="mt-1 flex items-center space-x-2 text-[10px] text-slate-500">
                        <span>
                          {emoji} {label}
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{plan.durationMin}m</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Modal Footer */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between flex-shrink-0">
            <button
              type="button"
              onClick={onSkip}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 outline-none transition-colors"
            >
              Skip & Continue
            </button>

            <button
              type="submit"
              disabled={loading || plans.length === 0}
              className="flex items-center space-x-1.5 rounded-xl bg-violet-400 px-5 py-2.5 text-xs font-bold text-slate-900 shadow-lg shadow-violet-400/10 outline-none transition-all duration-200 hover:bg-violet-300 active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              <Check className="h-4 w-4 stroke-[3px]" />
              <span>Submit Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export type { PlanItem };
