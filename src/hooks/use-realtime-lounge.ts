"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { TimerMode } from "@/components/timer";

export interface LoungeUser {
  userId: string;
  email: string;
  username: string;
  mode: TimerMode;
  endTime: number | null; // Absolute epoch timestamp when the current session finishes
}

import { useMindflowStore } from "@/store/use-mindflow-store";

export function useRealtimeLounge(
  userId: string | undefined,
  userEmail: string | undefined
) {
  const mode = useMindflowStore((s) => s.mode);
  const secondsLeft = useMindflowStore((s) => s.secondsLeft);
  const isRunning = useMindflowStore((s) => s.isRunning);
  const setCoWorkers = useMindflowStore((s) => s.setCoWorkers);
  const coWorkers = useMindflowStore((s) => s.coWorkers);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const secondsLeftRef = useRef(secondsLeft);

  // Sync ref to avoid running sync effect every second
  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  // Sync our presence state whenever our timer parameters change
  useEffect(() => {
    if (!userId || !userEmail) return;

    // Initialize channel if it doesn't exist
    if (!channelRef.current) {
      const channel = supabase.channel("co-working-lounge", {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      // Listen to presence synchronization events
      channel
        .on("presence", { event: "sync" }, () => {
          const presenceState = channel.presenceState();
          const parsedUsers: LoungeUser[] = [];

          Object.keys(presenceState).forEach((key) => {
            const userPresences = presenceState[key];
            if (userPresences && userPresences.length > 0) {
              const info = userPresences[0] as unknown as { email: string; mode: TimerMode; endTime: number | null };
              parsedUsers.push({
                userId: key,
                email: info.email,
                username: info.email.split("@")[0],
                mode: info.mode,
                endTime: info.endTime,
              });
            }
          });

          // Filter out our own user card from the display list
          setCoWorkers(parsedUsers.filter((u) => u.userId !== userId));
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            // Calculate absolute end time if running
            const endTime = isRunning ? Date.now() + secondsLeftRef.current * 1000 : null;
            await channel.track({
              email: userEmail,
              mode: isRunning ? mode : "idle",
              endTime,
            });
          }
        });

      channelRef.current = channel;
    } else {
      // Channel already exists, track updated state
      const endTime = isRunning ? Date.now() + secondsLeftRef.current * 1000 : null;
      channelRef.current.track({
        email: userEmail,
        mode: isRunning ? mode : "idle",
        endTime,
      }).catch(console.error);
    }
  }, [userId, userEmail, mode, isRunning, setCoWorkers]);

  // Clean up channel on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current).catch(console.error);
        channelRef.current = null;
      }
    };
  }, []);

  return { coWorkers };
}
