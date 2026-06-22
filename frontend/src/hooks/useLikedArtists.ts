import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export interface LikedArtist {
  artist_id: string;
  artist_name: string;
  artist_image: string | null;
}

export function useLikedArtists() {
  const supabase = createClient();
  const [likedArtists, setLikedArtists] = useState<LikedArtist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLikedArtists = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase
        .from("liked_artists")
        .select("*")
        .eq("user_id", session.user.id);
      
      if (error) throw error;
      setLikedArtists(data || []);
    } catch (err) {
      console.error("Error fetching liked artists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedArtists();
  }, []);

  const isLiked = (artistId: string) => {
    return likedArtists.some((a) => a.artist_id === artistId);
  };

  const toggleLikedArtist = async (artist: { id: string; name: string; image: string | null }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const currentlyLiked = isLiked(artist.id);

      if (currentlyLiked) {
        // Optimistic update
        setLikedArtists((prev) => prev.filter((a) => a.artist_id !== artist.id));
        await supabase
          .from("liked_artists")
          .delete()
          .eq("user_id", session.user.id)
          .eq("artist_id", artist.id);
      } else {
        // Optimistic update
        setLikedArtists((prev) => [
          ...prev, 
          { artist_id: artist.id, artist_name: artist.name, artist_image: artist.image }
        ]);
        await supabase
          .from("liked_artists")
          .insert({
            user_id: session.user.id,
            artist_id: artist.id,
            artist_name: artist.name,
            artist_image: artist.image
          });
      }
    } catch (err) {
      console.error("Error toggling liked artist:", err);
      fetchLikedArtists(); // revert optimistic update
    }
  };

  return { likedArtists, loading, isLiked, toggleLikedArtist, refresh: fetchLikedArtists };
}
