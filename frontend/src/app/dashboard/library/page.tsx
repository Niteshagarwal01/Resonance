"use client";

import { Library as LibraryIcon, Play, Heart, Clock, Download, Music } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { searchMusic, Track } from "@/lib/api";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LibraryPage() {
  const { playTrack } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch Taste DNA Top Songs (Liked Songs)
        const { data: dna } = await supabase.from("taste_dna").select("top_songs").eq("user_id", session.user.id).single();
        if (dna && dna.top_songs && dna.top_songs.length > 0) {
          const results = await Promise.all(
            dna.top_songs.map((s: any) => searchMusic(`${s.title} ${s.artist}`).then(r => r[0]).catch(() => null))
          );
          setLikedSongs(results.filter(Boolean));
        }

        // Fetch Listening History
        const { data: historyData, error: historyError } = await supabase
          .from("listening_history")
          .select("*")
          .eq("user_id", session.user.id)
          .order("played_at", { ascending: false })
          .limit(50);
        
        if (!historyError && historyData) {
          // Deduplicate by track_id
          const seen = new Set();
          const uniqueHistory: Track[] = [];
          for (const row of historyData) {
            if (!seen.has(row.track_id)) {
              seen.add(row.track_id);
              uniqueHistory.push({
                id: row.track_id,
                title: row.track_title,
                artist: row.track_artist,
                thumbnail: row.track_thumbnail,
              });
            }
          }
          setHistory(uniqueHistory);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  return (
    <div className="p-8 pb-32 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="mb-12 flex items-end justify-between">
        <div>
          <h1 className="text-5xl font-black text-[#1A1A1A] mb-4 flex items-center gap-4">
            Your Library <LibraryIcon className="text-indigo-500" size={40} />
          </h1>
          <p className="text-gray-500 text-lg">
            Everything you've saved, liked, and curated.
          </p>
        </div>
        
        {/* Filter Pills */}
        <div className="flex gap-2">
          {["Playlists", "Albums", "Artists", "Podcasts"].map(filter => (
            <button key={filter} className="px-5 py-2 rounded-full border border-gray-200 bg-white font-bold text-sm text-gray-600 hover:border-[#FFB703] transition-colors">
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Liked Songs Hero Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-700 w-full rounded-3xl p-10 text-white mb-12 shadow-xl relative overflow-hidden group cursor-pointer">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
          <Heart size={300} fill="currentColor" />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-between min-h-[200px]">
          <div>
            <h2 className="text-4xl font-black mb-2">Liked Songs</h2>
            <p className="text-indigo-100 font-medium">{likedSongs.length} tracks</p>
          </div>
          <button 
            className="bg-white text-indigo-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            onClick={() => likedSongs.length > 0 && playTrack(likedSongs[0], likedSongs)}
          >
            <Play fill="currentColor" size={24} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Recent Adds (List View) */}
      <div>
        <h2 className="text-2xl font-black text-[#1A1A1A] mb-6 flex items-center gap-2">
          <Clock size={24} className="text-gray-400"/> Recently Played
        </h2>

        {loading ? (
          <div className="w-full flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-[#1A1A1A] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 p-4 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <div className="w-12 text-center">#</div>
              <div>Title</div>
              <div>Album</div>
              <div className="w-24 text-right pr-4">Duration</div>
            </div>

            {/* Track Rows */}
            <div className="flex flex-col">
              {history.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No recent tracks found. Start listening! (Note: make sure to run the SQL migration)</div>
              ) : history.map((track, idx) => (
                <div 
                  key={`${track.id}-${idx}`} 
                  onClick={() => playTrack(track, history)}
                  className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 p-3 items-center hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="w-12 text-center text-gray-400 font-medium group-hover:hidden">{idx + 1}</div>
                  <div className="w-12 text-center hidden group-hover:flex justify-center text-[#FFB703]">
                    <Play size={16} fill="currentColor" />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {track.thumbnail ? (
                      <img src={track.thumbnail} alt={track.title} className="w-10 h-10 rounded shadow-sm object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center"><Music size={16} className="text-gray-400"/></div>
                    )}
                    <div className="truncate">
                      <div className="font-bold text-[#1A1A1A] truncate group-hover:text-[#FFB703] transition-colors">{track.title}</div>
                      <div className="text-sm text-gray-500 truncate">{track.artist}</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 truncate">{track.album || "Unknown Album"}</div>

                  <div className="w-24 flex items-center justify-end gap-4 pr-4">
                    <Heart size={16} className="text-red-500 opacity-100 transition-all" fill="currentColor" />
                    <span className="text-sm text-gray-400">{track.duration || track.length || "3:00"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
