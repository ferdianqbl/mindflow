"use client";

import React from "react";
import { Volume2, VolumeX, CloudRain, Headphones, Flame, Play, Pause } from "lucide-react";
import { AudioVolumes } from "@/hooks/use-audio";

interface AudioMixerProps {
  isPlaying: boolean;
  volumes: AudioVolumes;
  play: () => void;
  pause: () => void;
  setVolume: (channel: keyof AudioVolumes, value: number) => void;
}

export default function AudioMixer({
  isPlaying,
  volumes,
  play,
  pause,
  setVolume,
}: AudioMixerProps) {
  const channels = [
    {
      id: "noise" as keyof AudioVolumes,
      name: "Focus Noise",
      icon: Flame,
      color: "text-amber-400",
      description: "Synthesized Brown Noise",
    },
    {
      id: "rain" as keyof AudioVolumes,
      name: "Heavy Rain",
      icon: CloudRain,
      color: "text-cyan-400",
      description: "Masking ambient loop",
    },
    {
      id: "lofi" as keyof AudioVolumes,
      name: "Lofi Beats",
      icon: Headphones,
      color: "text-violet-400",
      description: "Relaxing focus beats",
    },
  ];

  return (
    <div className="w-full rounded-[24px] border border-white/5 bg-[rgba(13,20,38,0.45)] p-6 shadow-2xl backdrop-blur-xl">
      {/* Title & Master Control */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Ambient Soundscapes</h2>
          <p className="text-xs text-slate-400">Mix background noise to enhance concentration</p>
        </div>
        <button
          onClick={isPlaying ? pause : play}
          className={`flex h-12 w-12 items-center justify-center rounded-full outline-none transition-all duration-300 active:scale-95 ${
            isPlaying
              ? "bg-violet-500/20 text-violet-400 border border-violet-500/30 shadow-lg shadow-violet-500/10 hover:bg-violet-500/30"
              : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 hover:bg-cyan-500/30"
          }`}
        >
          {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-5">
        {channels.map((channel) => {
          const Icon = channel.icon;
          const volValue = volumes[channel.id];
          const isChannelMuted = volValue === 0;

          return (
            <div
              key={channel.id}
              className="group flex flex-col space-y-2 rounded-xl border border-white/[0.02] bg-slate-950/20 p-3 transition-colors duration-200 hover:border-white/5 hover:bg-slate-950/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition-colors duration-200 group-hover:bg-white/10 ${channel.color}`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-200">{channel.name}</span>
                    <span className="hidden sm:block text-[10px] text-slate-400">{channel.description}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setVolume(channel.id, volValue > 0 ? 0 : 0.5)}
                    className="text-slate-400 transition-colors duration-200 hover:text-slate-200"
                  >
                    {isChannelMuted ? (
                      <VolumeX className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                  <span className="w-8 text-right text-xs font-semibold text-slate-400 tabular-nums">
                    {Math.round(volValue * 100)}%
                  </span>
                </div>
              </div>

              {/* Slider Track */}
              <div className="flex items-center pt-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volValue}
                  onChange={(e) => setVolume(channel.id, parseFloat(e.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 outline-none accent-cyan-400 transition-all duration-200 hover:bg-slate-700"
                  style={{
                    background: `linear-gradient(to right, #00f2fe 0%, #00f2fe ${volValue * 100}%, #1e293b ${volValue * 100}%, #1e293b 100%)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
