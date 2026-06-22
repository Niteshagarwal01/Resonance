import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Track } from "@/lib/api";

export function useLikedSongs() {
  const supabase = createClient();
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLikedSongs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase
        .from("liked_songs")
        .select("*")
        .eq("user_id", session.user.id);
      
      if (error) throw error;
      
      const tracks: Track[] = (data || []).map(row => ({
        id: row.track_id,
        title: row.track_title,
        artist: row.track_artist,
        thumbnail: row.track_thumbnail,
        duration: row.track_duration
      }));
      
      setLikedSongs(tracks);
    } catch (err) {
      console.error("Error fetching liked songs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedSongs();
  }, []);

  const isLiked = (videoId: string) => {
    return likedSongs.some((s) => s.id === videoId);
  };

  const toggleLikedSong = async (track: Track) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const currentlyLiked = isLiked(track.id);

      if (currentlyLiked) {
        // Optimistic update
        setLikedSongs((prev) => prev.filter((s) => s.id !== track.id));
        await supabase
          .from("liked_songs")
          .delete()
          .eq("user_id", session.user.id)
          .eq("track_id", track.id);
      } else {
        // Optimistic update
        setLikedSongs((prev) => [...prev, track]);
        await supabase
          .from("liked_songs")
          .insert({
            user_id: session.user.id,
            track_id: track.id,
            track_title: track.title,
            track_artist: track.artist,
            track_thumbnail: track.thumbnail || null,
            track_duration: track.duration || null
          });
      }
    } catch (err) {
      console.error("Error toggling liked song:", err);
      fetchLikedSongs(); // revert optimistic update
    }
  };

  return { likedSongs, loading, isLiked, toggleLikedSong, refresh: fetchLikedSongs };
}
