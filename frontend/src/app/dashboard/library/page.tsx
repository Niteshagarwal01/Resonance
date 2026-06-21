"use client";

import { Library as LibraryIcon, Play, Heart, Clock, Music, Search, Shuffle } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { searchMusic, Track } from "@/lib/api";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

type Tab = "liked" | "history";

export default function LibraryPage() {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("liked");
  const [searchQuery, setSearchQuery] = useState("");
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
          .order("played_at", { ascending: false });
        
        if (!historyError && historyData) {
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

  const displayedTracks = activeTab === "liked" ? likedSongs : history;
  const filteredTracks = displayedTracks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto min-h-screen flex flex-col">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-[#1A1A1A] mb-4 flex items-center gap-4">
            Your Library <LibraryIcon className="text-indigo-500" size={40} />
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab("liked")}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === "liked" ? "bg-indigo-600 text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              Liked Songs
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === "history" ? "bg-[#1A1A1A] text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              Recently Played
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="w-full flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#FFB703]/20 border-t-[#FFB703] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          {/* Controls Bar */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => filteredTracks.length > 0 && playTrack(filteredTracks[0], filteredTracks)}
                className="w-14 h-14 bg-[#FFB703] text-[#1A1A1A] rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Play fill="currentColor" size={24} className="ml-1" />
              </button>
              <button 
                onClick={() => filteredTracks.length > 0 && playTrack(filteredTracks[Math.floor(Math.random() * filteredTracks.length)], filteredTracks)}
                className="text-gray-400 hover:text-[#1A1A1A] transition-colors p-3"
                title="Shuffle"
              >
                <Shuffle size={24} />
              </button>
              <div className="text-sm font-bold text-gray-500">
                {filteredTracks.length} tracks
              </div>
            </div>

            {/* Search */}
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Find in playlist" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-[#FFB703] focus:ring-2 focus:ring-[#FFB703]/20 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[2rem_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white sticky top-0 z-10">
            <div className="text-center">#</div>
            <div>Title</div>
            <div className="hidden md:block">Album</div>
            <div className="pr-2"><Clock size={12} /></div>
          </div>

          {/* Track Rows */}
          <div className="flex-1 overflow-y-auto">
            {filteredTracks.length === 0 ? (
              <div className="p-16 text-center text-gray-500 font-semibold flex flex-col items-center gap-4">
                <Music size={48} className="text-gray-200" />
                {searchQuery ? "No matches found in this list." : "No tracks found here yet."}
              </div>
            ) : filteredTracks.map((track, idx) => {
              const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
              return (
                <div 
                  key={`${track.id}-${idx}`} 
                  onClick={() => playTrack(track, filteredTracks)}
                  className="group grid grid-cols-[2rem_1fr_1fr_auto] gap-4 px-6 py-3 items-center hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                >
                  <div className="text-center">
                    {isCurrentlyPlaying ? (
                      <div className="flex items-center justify-center gap-0.5">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-0.5 bg-[#FFB703] rounded-full animate-bounce" style={{ height: `${5 + i * 3}px`, animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-bold text-gray-300 group-hover:hidden tabular-nums">{idx + 1}</span>
                        <Play size={14} fill="#FFB703" className="text-[#FFB703] hidden group-hover:block mx-auto" />
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 min-w-0">
                    {track.thumbnail ? (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Music size={16} className="text-gray-400"/></div>
                    )}
                    <div className="min-w-0">
                      <p className={`font-bold text-sm truncate transition-colors ${isCurrentlyPlaying ? "text-[#FFB703]" : "text-[#1A1A1A] group-hover:text-[#FFB703]"}`}>
                        {track.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="hidden md:block min-w-0">
                    <p className="text-xs text-gray-500 truncate group-hover:text-[#1A1A1A] transition-colors">{track.album || "Unknown Album"}</p>
                  </div>

                  <div className="flex items-center gap-4 pr-2 shrink-0">
                    <Heart size={14} className={activeTab === "liked" ? "text-red-500" : "text-gray-300 hover:text-pink-500 opacity-0 group-hover:opacity-100 transition-all"} fill={activeTab === "liked" ? "currentColor" : "none"} />
                    <span className="text-xs text-gray-400 tabular-nums">{track.duration || "—"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
