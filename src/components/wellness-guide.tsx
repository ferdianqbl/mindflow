"use client";

import { Droplet, Eye, Heart, Shield } from "lucide-react";
import { useEffect, useState } from "react";

export default function WellnessGuide() {
  const [breathingText, setBreathingText] = useState("Breathe In");

  // Synchronize inhale/exhale text on an 8-second cycle (4s inhale, 4s exhale)
  useEffect(() => {
    const textInterval = setInterval(() => {
      setBreathingText((prev) =>
        prev === "Breathe In" ? "Breathe Out" : "Breathe In",
      );
    }, 4000);

    return () => clearInterval(textInterval);
  }, []);

  const wellnessTips = [
    {
      id: "eyes",
      name: "20-20-20 Rule",
      icon: Eye,
      desc: "Look at something 20 feet away for 20 seconds to rest your eyes.",
      color: "text-cyan-400",
    },
    {
      id: "posture",
      name: "Posture Check",
      icon: Shield,
      desc: "Align your spine, roll your shoulders back, and release neck tension.",
      color: "text-violet-400",
    },
    {
      id: "hydrate",
      name: "Hydration",
      icon: Droplet,
      desc: "Take a quick sip of water to stay hydrated and clear-headed.",
      color: "text-blue-400",
    },
    {
      id: "stretch",
      name: "Stand Up",
      icon: Heart,
      desc: "Stand up, stretch your back, and let blood circulate through your legs.",
      color: "text-rose-400",
    },
  ];

  return (
    <div className="flex w-full flex-col items-center justify-center rounded-[32px] border border-violet-500/20 bg-[rgba(13,20,38,0.45)] p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 shadow-violet-500/5">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-lg font-semibold text-slate-100">
          Wellness & Recovery Break
        </h2>
        <p className="text-xs text-slate-400">
          Take a moment to recharge before your next sprint
        </p>
      </div>

      {/* Animated Breathing Bubble */}
      <div className="relative mb-10 flex h-48 w-48 items-center justify-center">
        {/* Glowing Pulsing Outer Ring */}
        <div
          className={`absolute rounded-full bg-violet-500/5 blur-xl transition-all duration-[4000] ease-in-out ${
            breathingText === "Breathe In"
              ? "h-44 w-44 opacity-80 scale-125"
              : "h-28 w-28 opacity-40 scale-100"
          }`}
        />

        {/* Morphing Bubble */}
        <div
          className={`flex items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 shadow-lg shadow-violet-500/10 transition-all duration-[4000] ease-in-out ${
            breathingText === "Breathe In"
              ? "h-36 w-36 scale-110"
              : "h-24 w-24 scale-95"
          }`}
        >
          <span className="text-sm font-semibold tracking-wide text-violet-300 transition-opacity duration-500">
            {breathingText}
          </span>
        </div>
      </div>

      {/* Wellness Reminders Grid */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {wellnessTips.map((tip) => {
          const TipIcon = tip.icon;
          return (
            <div
              key={tip.id}
              className="flex items-start space-x-3 rounded-2xl border border-white/2 bg-slate-950/20 p-4 transition-colors duration-200 hover:border-white/5 hover:bg-slate-950/40"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ${tip.color}`}
              >
                <TipIcon className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-slate-200">
                  {tip.name}
                </h4>
                <p className="mt-1 text-[11px] leading-5 text-slate-400">
                  {tip.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
