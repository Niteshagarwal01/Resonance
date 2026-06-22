import { useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Track } from "@/lib/api";

export function usePlayerTelemetry() {
  const supabase = createClient();
  const playStartTimeRef = useRef(0);
  const accumulatedPlayTimeRef = useRef(0);

  const startTracking = () => {
    accumulatedPlayTimeRef.current = 0;
    playStartTimeRef.current = Date.now();
  };

  const flushTracking = () => {
    if (playStartTimeRef.current > 0) {
      accumulatedPlayTimeRef.current += (Date.now() - playStartTimeRef.current) / 1000;
      playStartTimeRef.current = 0;
    }
  };

  const logTrackStart = useCallback((track: Track, parsedDuration: number) => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from("listening_history").insert({
          user_id: session.user.id,
          track_id: track.id,
          track_title: track.title,
          track_artist: track.artist,
          track_thumbnail: track.thumbnail || null,
          duration_played: 0,
          total_duration: parsedDuration > 0 ? parsedDuration : 1
        }).then(({error}) => { if (error) console.error("Telemetry error:", error) });
      }
    });
  }, [supabase]);

  return { startTracking, flushTracking, logTrackStart };
}
