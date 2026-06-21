"use client";

import { usePlayer } from "@/context/PlayerContext";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { ListMusic, Play, Disc3, Clock, Shuffle, ChevronDown } from "lucide-react";
import Image from "next/image";

interface HistoryRow {
  id: string;
  title: string;
  artist: string;
  thumbnail?: string;
  played_at?: string;
}

export default function QueuePage() {
  const { queue, currentTrack, playTrack, isPlaying, toggleShuffle, isShuffle } = usePlayer();
  const [dbHistory, setDbHistory] = useState<HistoryRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const supabase = createClient();

  // Fetch real listening history from Supabase
  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data, error } = await supabase
          .from("listening_history")
          .select("*")
          .eq("user_id", session.user.id)
          .order("played_at", { ascending: false })
          .limit(30);
        if (!error && data) {
          const seen = new Set<string>();
          const unique: HistoryRow[] = [];
          for (const row of data) {
            if (!seen.has(row.track_id)) {
              seen.add(row.track_id);
              unique.push({
                id: row.track_id,
                title: row.track_title,
                artist: row.track_artist,
                thumbnail: row.track_thumbnail,
                played_at: row.played_at,
              });
            }
          }
          setDbHistory(unique);
        }
      } finally {
        setLoadingHistory(false);
      }
    }
    load();
  }, [supabase]);

  const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
  const upNext = currentIndex >= 0 ? queue.slice(currentIndex + 1) : queue;
  const queueHistory = currentIndex > 0 ? queue.slice(0, currentIndex) : [];

  // Use DB history if available, fallback to in-memory
  const historyToShow = dbHistory.length > 0 ? dbHistory.filter(h => h.id !== currentTrack?.id).slice(0, 10) : queueHistory;

  if (!currentTrack) {
    return (
      <div className="p-8 pb-32 flex flex-col items-center justify-center h-[calc(100vh-96px)]">
        <div className="w-24 h-24 rounded-full bg-[#FFB703]/10 flex items-center justify-center mb-6">
          <Disc3 size={48} className="text-[#FFB703] animate-spin" style={{ animationDuration: "4s" }} />
        </div>
        <h1 className="text-3xl font-black text-[#1A1A1A] mb-2">Nothing playing yet</h1>
        <p className="text-gray-500 text-center max-w-xs">Head to Home or Discover and play a track to fill your queue.</p>
      </div>
    );
  }

  return (
    <div className="pb-32 min-h-screen">
      {/* Page Header */}
      <div className="sticky top-0 z-20 bg-[#FDFBF7]/80 backdrop-blur-xl border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ListMusic size={22} className="text-[#FFB703]" />
          <h1 className="text-xl font-black text-[#1A1A1A]">Queue</h1>
          <span className="text-sm text-gray-400 font-medium">{upNext.length} up next</span>
        </div>
        <button
          onClick={toggleShuffle}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
            isShuffle
              ? "bg-[#FFB703] text-[#1A1A1A] border-[#FFB703] shadow-md shadow-[#FFB703]/30"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
          }`}
        >
          <Shuffle size={16} /> Shuffle
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-0">
        {/* LEFT: Now Playing Card */}
        <div className="lg:w-[340px] shrink-0 p-8 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px-96px)] lg:overflow-y-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Now Playing</p>

          <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl mb-6">
            {currentTrack.thumbnail && (
              <Image src={currentTrack.thumbnail} alt={currentTrack.title} fill className="object-cover" unoptimized />
            )}
            {/* Animated playing bars overlay */}
            {isPlaying && (
              <div className="absolute bottom-4 right-4 flex items-end gap-0.5 bg-black/40 backdrop-blur-md p-2 rounded-lg">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="w-1 bg-[#FFB703] rounded-full animate-bounce"
                    style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s`, animationDuration: "0.8s" }}
                  />
                ))}
              </div>
            )}
          </div>

          <h2 className="text-2xl font-black text-[#1A1A1A] truncate mb-1">{currentTrack.title}</h2>
          <p className="text-gray-500 font-semibold truncate">{currentTrack.artist}</p>

          {/* Queue progress */}
          <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
            <Clock size={12} />
            <span>Track {currentIndex + 1} of {queue.length}</span>
          </div>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFB703] rounded-full transition-all duration-500"
              style={{ width: `${queue.length > 0 ? ((currentIndex + 1) / queue.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* RIGHT: Track lists */}
        <div className="flex-1 min-w-0 border-l border-gray-100">
          {/* Up Next section */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#FFB703]" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Up Next</p>
            </div>

            {upNext.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-gray-400 font-medium">That's the end of the queue.</p>
                <p className="text-gray-400 text-sm mt-1">Enable Magic Shuffle (✨) to keep playing automatically.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {upNext.map((track, idx) => (
                  <div
                    key={`next-${track.id}-${idx}`}
                    onClick={() => playTrack(track, queue)}
                    className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100"
                  >
                    <span className="text-sm font-bold text-gray-300 w-5 text-center group-hover:hidden tabular-nums">{idx + 1}</span>
                    <Play size={14} fill="#FFB703" className="text-[#FFB703] hidden group-hover:block shrink-0" />
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                      <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                      {track.isMagic && (
                        <p className="text-[10px] font-bold text-[#FFB703] mt-1 uppercase tracking-wider flex items-center gap-1">
                          ✨ Recommended by Magic Shuffle
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-medium shrink-0 tabular-nums">{track.duration || "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          {historyToShow.length > 0 && (
            <div className="border-t border-gray-100 mx-6 my-2" />
          )}

          {/* Recently Played section */}
          {historyToShow.length > 0 && (
            <div className="px-6 pb-6">
              <div className="flex items-center gap-2 mb-4 mt-4">
                <ChevronDown size={14} className="text-gray-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Recently Played</p>
              </div>
              <div className="space-y-1 opacity-70">
                {historyToShow.map((track, idx) => (
                  <div
                    key={`hist-${track.id}-${idx}`}
                    onClick={() => playTrack({ id: track.id, title: track.title, artist: track.artist, thumbnail: track.thumbnail }, queue.length > 0 ? queue : [{ id: track.id, title: track.title, artist: track.artist, thumbnail: track.thumbnail }])}
                    className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100 hover:opacity-100"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      {track.thumbnail && (
                        <Image src={track.thumbnail} alt={track.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all" unoptimized />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                      <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                    </div>
                    <Play size={14} fill="#FFB703" className="text-[#FFB703] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
