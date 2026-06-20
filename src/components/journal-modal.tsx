"use client";

import React, { useState } from "react";
import { Flame, CloudRain, Headphones, Code, Bug, Palette, BookOpen, Users, Settings, X } from "lucide-react";

export type WorkCategory = "coding" | "debugging" | "design" | "learning" | "meeting" | "operations";

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { category: WorkCategory; description: string }) => Promise<void>;
  onSkip: () => void;
}

export default function JournalModal({ isOpen, onClose, onSubmit, onSkip }: JournalModalProps) {
  const [category, setCategory] = useState<WorkCategory | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const categories = [
    { id: "coding" as WorkCategory, name: "Coding", icon: Code, style: "border-cyan-500/20 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 focus:ring-cyan-500/30" },
    { id: "debugging" as WorkCategory, name: "Debugging", icon: Bug, style: "border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 focus:ring-red-500/30" },
    { id: "design" as WorkCategory, name: "UI/UX Design", icon: Palette, style: "border-pink-500/20 text-pink-400 bg-pink-500/5 hover:bg-pink-500/10 focus:ring-pink-500/30" },
    { id: "learning" as WorkCategory, name: "Learning", icon: BookOpen, style: "border-amber-500/20 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 focus:ring-amber-500/30" },
    { id: "meeting" as WorkCategory, name: "Meeting", icon: Users, style: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 focus:ring-indigo-500/30" },
    { id: "operations" as WorkCategory, name: "Operations", icon: Settings, style: "border-slate-500/20 text-slate-400 bg-slate-500/5 hover:bg-slate-500/10 focus:ring-slate-500/30" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!category) {
      setErrorMsg("Please select a work category.");
      return;
    }

    if (!description.trim()) {
      setErrorMsg("Please enter an accomplishment log.");
      return;
    }

    if (description.length > 140) {
      setErrorMsg("Log description must not exceed 140 characters.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ category, description: description.trim() });
      // Reset state and close modal
      setCategory(null);
      setDescription("");
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to log accomplishment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Translucent Backdrop blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onSkip} // Close/skip if clicking outside
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-lg transform rounded-[28px] border border-white/10 bg-[#0d1325]/90 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 scale-100 translateY-0">
        
        {/* Close Button */}
        <button 
          onClick={onSkip}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 outline-none transition-colors duration-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 mt-2">
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Focus Session Completed!
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Log what you accomplished in this block to build your daily report.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm font-medium text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Category Select Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Category
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map((cat) => {
                const CatIcon = cat.icon;
                const isSelected = category === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center space-x-2 rounded-xl border px-3 py-2.5 text-xs font-medium outline-none transition-all duration-200 focus:ring-1 active:scale-95 ${
                      isSelected 
                        ? cat.style.replace("bg-", "bg-selected-").replace("border-", "border-selected-") + " border-white/20 bg-white/10 ring-1 ring-white/20 text-slate-100"
                        : cat.style
                    }`}
                  >
                    <CatIcon className="h-4 w-4" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                What did you achieve?
              </label>
              <span 
                className={`text-xs font-semibold tabular-nums ${
                  description.length > 125 
                    ? description.length > 140 
                      ? "text-red-400" 
                      : "text-amber-400" 
                    : "text-slate-500"
                }`}
              >
                {description.length} / 140
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Refined the API database schema connection and updated tests..."
              disabled={loading}
              className="w-full resize-none rounded-xl border border-white/5 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-cyan-500/30 focus:bg-slate-950/60 focus:ring-1 focus:ring-cyan-500/30"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onSkip}
              disabled={loading}
              className="rounded-xl border border-transparent px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 outline-none transition-all duration-200 active:scale-95"
            >
              Skip Session
            </button>
            <button
              type="submit"
              disabled={loading || !category || !description.trim() || description.length > 140}
              className="flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/15 outline-none transition-all duration-200 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-400/25 active:scale-[0.98] disabled:scale-100 disabled:opacity-30"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
              ) : (
                "Save Accomplishment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
