"use client";

import { useEffect, useRef, useState } from "react";
import { createBrownNoiseNode } from "@/utils/noise-generator";

export interface AudioVolumes {
  noise: number;
  rain: number;
  lofi: number;
}

// Copyright-free, looping ambient assets hosted on high-availability CDNs
const AMBIENT_LINKS = {
  rain: "https://assets.mixkit.co/active_storage/sfx/2433/2433-500.wav", // Rain loop
  lofi: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Lofi song backup loop (public test track)
};

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volumes, setVolumes] = useState<AudioVolumes>({
    noise: 0.5,
    rain: 0.3,
    lofi: 0.2,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Audio nodes refs
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  
  const rainAudioRef = useRef<HTMLAudioElement | null>(null);
  const rainGainRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rainGainNodeRef = useRef<GainNode | null>(null);

  const lofiAudioRef = useRef<HTMLAudioElement | null>(null);
  const lofiGainRef = useRef<MediaElementAudioSourceNode | null>(null);
  const lofiGainNodeRef = useRef<GainNode | null>(null);

  // Initialize Audio Context lazily on user gesture
  const initAudio = () => {
    if (audioCtxRef.current) return;

    // 1. Create AudioContext
    const AudioContextClass = window.AudioContext || (window as unknown as Window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // 2. Initialize Brown Noise Node & Gain
    const noiseNode = createBrownNoiseNode(ctx);
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = volumes.noise;
    noiseNode.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSourceRef.current = noiseNode;
    noiseGainRef.current = noiseGain;

    // 3. Initialize Rain Audio Element & Gain
    const rainEl = new Audio(AMBIENT_LINKS.rain);
    rainEl.loop = true;
    rainEl.crossOrigin = "anonymous";
    const rainSource = ctx.createMediaElementSource(rainEl);
    const rainGainNode = ctx.createGain();
    rainGainNode.gain.value = volumes.rain;
    rainSource.connect(rainGainNode);
    rainGainNode.connect(ctx.destination);
    rainAudioRef.current = rainEl;
    rainGainRef.current = rainSource;
    rainGainNodeRef.current = rainGainNode;

    // 4. Initialize Lofi Audio Element & Gain
    const lofiEl = new Audio(AMBIENT_LINKS.lofi);
    lofiEl.loop = true;
    lofiEl.crossOrigin = "anonymous";
    const lofiSource = ctx.createMediaElementSource(lofiEl);
    const lofiGainNode = ctx.createGain();
    lofiGainNode.gain.value = volumes.lofi;
    lofiSource.connect(lofiGainNode);
    lofiGainNode.connect(ctx.destination);
    lofiAudioRef.current = lofiEl;
    lofiGainRef.current = lofiSource;
    lofiGainNodeRef.current = lofiGainNode;
  };

  // Synchronize gain volumes
  useEffect(() => {
    if (noiseGainRef.current) {
      noiseGainRef.current.gain.value = volumes.noise;
    }
    if (rainGainNodeRef.current) {
      rainGainNodeRef.current.gain.value = volumes.rain;
    }
    if (lofiGainNodeRef.current) {
      lofiGainNodeRef.current.gain.value = volumes.lofi;
    }
  }, [volumes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Pause audio players
      if (rainAudioRef.current) rainAudioRef.current.pause();
      if (lofiAudioRef.current) lofiAudioRef.current.pause();
      
      // Stop noise loop source
      try {
        if (noiseSourceRef.current) {
          noiseSourceRef.current.stop();
        }
      } catch (e) {}

      // Close Audio Context
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const play = async () => {
    initAudio();
    const ctx = audioCtxRef.current!;

    // Resume AudioContext if suspended (browser security block)
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    // Play synthesized noise
    try {
      if (noiseSourceRef.current) {
        // Start if it hasn't started yet
        noiseSourceRef.current.start(0);
      }
    } catch (e) {
      // If it already started, we need to re-create the buffer source node (Web Audio rules)
      const newNoise = createBrownNoiseNode(ctx);
      newNoise.connect(noiseGainRef.current!);
      newNoise.start(0);
      noiseSourceRef.current = newNoise;
    }

    // Restore volumes before playing
    if (noiseGainRef.current) noiseGainRef.current.gain.value = volumes.noise;
    if (rainGainNodeRef.current) rainGainNodeRef.current.gain.value = volumes.rain;
    if (lofiGainNodeRef.current) lofiGainNodeRef.current.gain.value = volumes.lofi;

    // Play streaming loops
    if (rainAudioRef.current) {
      rainAudioRef.current.play().catch(console.error);
    }
    if (lofiAudioRef.current) {
      lofiAudioRef.current.play().catch(console.error);
    }

    setIsPlaying(true);
  };

  const pause = () => {
    if (!audioCtxRef.current) return;

    // Pause streaming loops
    if (rainAudioRef.current) rainAudioRef.current.pause();
    if (lofiAudioRef.current) lofiAudioRef.current.pause();

    // Mute noise
    if (noiseGainRef.current) {
      noiseGainRef.current.gain.value = 0;
    }

    setIsPlaying(false);
  };

  // Smooth fade out over 1.5 seconds (used when a focus session finishes)
  const fadeOut = () => {
    if (!audioCtxRef.current || !isPlaying) return;
    const ctx = audioCtxRef.current;
    const fadeTime = ctx.currentTime + 1.5;

    // Ramp all gains down exponentially
    if (noiseGainRef.current) {
      noiseGainRef.current.gain.exponentialRampToValueAtTime(0.001, fadeTime);
    }
    if (rainGainNodeRef.current) {
      rainGainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, fadeTime);
    }
    if (lofiGainNodeRef.current) {
      lofiGainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, fadeTime);
    }

    // Set pause timeout
    setTimeout(() => {
      pause();
    }, 1500);
  };

  const setVolume = (channel: keyof AudioVolumes, value: number) => {
    setVolumes((prev) => ({
      ...prev,
      [channel]: value,
    }));
  };

  return {
    isPlaying,
    volumes,
    play,
    pause,
    fadeOut,
    setVolume,
  };
}
