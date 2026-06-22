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
        id: row.video_id,
        title: row.title,
        artist: row.artist,
        album: row.album,
        thumbnail: row.thumbnail,
        duration: row.duration
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
          .eq("video_id", track.id);
      } else {
        // Optimistic update
        setLikedSongs((prev) => [...prev, track]);
        await supabase
          .from("liked_songs")
          .insert({
            user_id: session.user.id,
            video_id: track.id,
            title: track.title,
            artist: track.artist,
            album: track.album || null,
            thumbnail: track.thumbnail || null,
            duration: track.duration || null
          });
      }
    } catch (err) {
      console.error("Error toggling liked song:", err);
      fetchLikedSongs(); // revert optimistic update
    }
  };

  return { likedSongs, loading, isLiked, toggleLikedSong, refresh: fetchLikedSongs };
}
