"use client";

import {
  BookOpen,
  Bug,
  Clock,
  Code,
  Palette,
  Play,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { WorkCategory } from "./journal-modal";

interface LocalPlanItem {
  id: string;
  title: string;
  category: WorkCategory;
  durationMin: number;
}

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (plans: Omit<LocalPlanItem, "id">[]) => Promise<void>;
}

export default function PlanModal({
  isOpen,
  onClose,
  onStartSession,
}: PlanModalProps) {
  const [plans, setPlans] = useState<LocalPlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Reset state on open transition before rendering/committing
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setErrorMsg("");
      setLoading(true);
    }
  }

  interface ApiPlanItem {
    id: string;
    title: string;
    category: string;
    durationMin: number;
  }

  // Fetch carry-over incomplete plans on open
  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans && data.plans.length > 0) {
          setPlans(
            data.plans.map((p: ApiPlanItem) => ({
              id: p.id,
              title: p.title,
              category: p.category as WorkCategory,
              durationMin: p.durationMin,
            })),
          );
        } else {
          // Default first plan item if no carry-over plans exist
          setPlans([
            {
              id: Math.random().toString(),
              title: "",
              category: "coding",
              durationMin: 25,
            },
          ]);
        }
      })
      .catch((err) => {
        console.error("Failed to load plans", err);
        setErrorMsg("Failed to load carry-over plans");
        // Fallback to one empty plan item
        setPlans([
          {
            id: Math.random().toString(),
            title: "",
            category: "coding",
            durationMin: 25,
          },
        ]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddPlan = () => {
    setPlans([
      ...plans,
      {
        id: Math.random().toString(),
        title: "",
        category: "coding",
        durationMin: 25,
      },
    ]);
  };

  const handleRemovePlan = (id: string) => {
    // Keep at least one plan item
    if (plans.length === 1) {
      setErrorMsg("You must have at least one task plan for the session.");
      return;
    }
    setPlans(plans.filter((p) => p.id !== id));
  };

  const handleUpdatePlan = (
    id: string,
    field: keyof LocalPlanItem,
    value: string | number,
  ) => {
    setErrorMsg("");
    setPlans(
      plans.map((p) => {
        if (p.id === id) {
          if (field === "durationMin") {
            const num = typeof value === "number" ? value : parseInt(value, 10);
            return { ...p, durationMin: isNaN(num) ? 0 : num };
          }
          return { ...p, [field]: value };
        }
        return p;
      }),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validation
    for (const plan of plans) {
      if (!plan.title.trim()) {
        setErrorMsg("Task descriptions cannot be empty.");
        return;
      }
      if (plan.title.length > 140) {
        setErrorMsg("Task description must not exceed 140 characters.");
        return;
      }
      if (plan.durationMin <= 0 || plan.durationMin > 180) {
        setErrorMsg("Task duration must be between 1 and 180 minutes.");
        return;
      }
    }

    setLoading(true);
    try {
      // Call parent handler to sync with API and trigger timer start
      const formattedPlans = plans.map(({ title, category, durationMin }) => ({
        title: title.trim(),
        category,
        durationMin,
      }));
      await onStartSession(formattedPlans);
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to start session.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const totalDuration = plans.reduce((acc, curr) => acc + curr.durationMin, 0);

  const categories = [
    { id: "coding" as WorkCategory, name: "Coding", icon: Code },
    { id: "debugging" as WorkCategory, name: "Debugging", icon: Bug },
    { id: "design" as WorkCategory, name: "Design", icon: Palette },
    { id: "learning" as WorkCategory, name: "Learning", icon: BookOpen },
    { id: "meeting" as WorkCategory, name: "Meeting", icon: Users },
    { id: "operations" as WorkCategory, name: "Operations", icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Translucent Backdrop blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-2xl transform rounded-[28px] border border-white/10 bg-[#0d1325]/90 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 scale-100 max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 outline-none transition-colors duration-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 mt-2 shrink-0">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold bg-linear-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Plan Your Focus Session
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            List the tasks you plan to accomplish during this focus block.
            Unfinished tasks will carry over.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs font-semibold text-red-400 shrink-0">
            {errorMsg}
          </div>
        )}

        {/* Form Container (Scrollable) */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {loading && plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                <span className="text-xs text-slate-500">Loading plans...</span>
              </div>
            ) : (
              plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className="group relative flex flex-col md:flex-row items-stretch md:items-center space-y-3 md:space-y-0 md:space-x-3 rounded-2xl border border-white/5 bg-white/2 p-4 transition-all duration-300 hover:border-white/10"
                >
                  {/* Task Count Label */}
                  <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 border border-white/5">
                    {index + 1}
                  </span>

                  {/* Task Description Title Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="What are you working on?"
                      value={plan.title}
                      onChange={(e) =>
                        handleUpdatePlan(plan.id, "title", e.target.value)
                      }
                      className="w-full rounded-xl border border-white/5 bg-slate-950/40 px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 focus:border-cyan-500/30"
                    />
                  </div>

                  {/* Category Selection Dropdown */}
                  <div className="w-full md:w-44">
                    <select
                      value={plan.category}
                      onChange={(e) =>
                        handleUpdatePlan(
                          plan.id,
                          "category",
                          e.target.value as WorkCategory,
                        )
                      }
                      className="w-full rounded-xl border border-white/5 bg-slate-950/40 px-3.5 py-2.5 text-xs text-slate-300 outline-none transition-all duration-200 focus:border-cyan-500/30 cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option
                          key={cat.id}
                          value={cat.id}
                          className="bg-[#0f172a] text-slate-300"
                        >
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration Input */}
                  <div className="flex items-center space-x-2 w-full md:w-28">
                    <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={plan.durationMin || ""}
                      onChange={(e) =>
                        handleUpdatePlan(plan.id, "durationMin", e.target.value)
                      }
                      className="w-full rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2.5 text-center text-xs text-slate-200 outline-none transition-all duration-200 focus:border-cyan-500/30"
                    />
                    <span className="text-[10px] text-slate-500 font-medium">
                      min
                    </span>
                  </div>

                  {/* Trash/Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemovePlan(plan.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/10 bg-red-500/5 text-red-400 outline-none transition-all duration-200 hover:bg-red-500/15 hover:text-red-300 active:scale-95 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Modal Footer */}
          <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 shrink-0">
            {/* Session Info */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                <Clock className="h-3.5 w-3.5" />
                <span>Total: {totalDuration} min</span>
              </div>
              <span className="text-[10px] text-slate-500">
                Focus duration automatically updates
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 justify-end">
              <button
                type="button"
                onClick={handleAddPlan}
                className="flex items-center space-x-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 outline-none transition-all duration-200 hover:bg-white/10 hover:text-slate-100 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </button>

              <button
                type="submit"
                disabled={loading || plans.length === 0}
                className="flex items-center space-x-1.5 rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-bold text-slate-900 shadow-lg shadow-cyan-400/10 outline-none transition-all duration-200 hover:bg-cyan-300 active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Start Session</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
