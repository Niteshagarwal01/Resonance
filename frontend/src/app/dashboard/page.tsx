"use client";

import { useState, useEffect, useRef } from "react";
import { getHomeFeed, getCharts, getHomeShelves, HomeShelf, Track, searchMusic } from "@/lib/api";
import { usePlayer } from "@/context/PlayerContext";
import Image from "next/image";
import { Play, Sparkles, TrendingUp, Radio, ChevronRight, Disc3, Clock, Music2 } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

// Horizontal scroll row with gradient fade edges
function ShelfRow({ shelf, onPlay }: { shelf: HomeShelf; onPlay: (track: Track, queue: Track[]) => void }) {
  const rowRef = useRef<HTMLDivElement>(null);

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-5 px-8">
        <h2 className="text-xl font-black text-[#1A1A1A]">{shelf.title}</h2>
        <button className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#FFB703] transition-colors flex items-center gap-1">
          Show All <ChevronRight size={14} />
        </button>
      </div>
      <div className="relative">
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-8 pb-2"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {shelf.items.map((item) => (
            <div
              key={item.id}
              className="group flex-shrink-0 w-44 cursor-pointer"
              style={{ scrollSnapAlign: "start" }}
              onClick={() => onPlay(item, shelf.items)}
            >
              <div className="relative w-44 h-44 rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-xl transition-all duration-300">
                {item.thumbnail ? (
                  <Image
                    src={item.thumbnail}
                    alt={item.title || ""}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Music2 size={40} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-end justify-end p-3">
                  <div className="w-12 h-12 rounded-full bg-[#FFB703] flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Play size={20} fill="#1A1A1A" className="text-[#1A1A1A] ml-1" />
                  </div>
                </div>
              </div>
              <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{item.title}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{item.artist || "Various Artists"}</p>
            </div>
          ))}
        </div>
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-[#FDFBF7] to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-[#FDFBF7] to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
}

// Compact trending row (numbered list like Spotify)
function TrendingSection({ tracks }: { tracks: Track[] }) {
  const { playTrack } = usePlayer();

  return (
    <section className="mb-12 px-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
          <TrendingUp size={20} className="text-[#FFB703]" /> Trending Now
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {tracks.map((track, idx) => (
          <div
            key={track.id}
            onClick={() => playTrack(track, tracks)}
            className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100"
          >
            <span className="text-sm font-black text-gray-300 w-6 text-center tabular-nums">{idx + 1}</span>
            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
              {track.thumbnail && (
                <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Play size={16} fill="white" className="text-white opacity-0 group-hover:opacity-100" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
              <p className="text-xs text-gray-500 truncate">{track.artist}</p>
            </div>
            {track.duration && (
              <span className="text-xs text-gray-400 font-medium shrink-0">{track.duration}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// Quick play card for Daily Mix
function DailyMixCard({ picks, dna }: { picks: Track[]; dna: any }) {
  const { playTrack } = usePlayer();
  const featured = picks[0];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="mb-10 mx-8 relative overflow-hidden rounded-[2rem] bg-[#1A1A1A] shadow-2xl"
    >
      {/* Background image blur */}
      {featured?.thumbnail && (
        <div className="absolute inset-0">
          <Image src={featured.thumbnail} alt="" fill className="object-cover opacity-20 blur-2xl scale-110" unoptimized />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/90 to-transparent" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FFB703] rounded-full mix-blend-screen filter blur-[120px] opacity-30 translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 flex items-center gap-8 p-8">
        {/* Album art grid collage */}
        <div className="hidden md:grid grid-cols-2 gap-1 w-32 h-32 shrink-0 rounded-2xl overflow-hidden shadow-2xl">
          {picks.slice(0, 4).map((t, i) => (
            <div key={i} className="relative">
              {t.thumbnail && <Image src={t.thumbnail} alt="" fill className="object-cover" unoptimized />}
            </div>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB703]/20 border border-[#FFB703]/30 text-[#FFB703] text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles size={12} /> Taste DNA Match
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2 capitalize">
            {dna?.core_vibe?.replace(/[🌙🧠💪☕💔✨📼🎉🌊🚗📚💕]/g, "").trim() || "Your"} Daily Mix
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md">
            Based on your love for <span className="text-white font-semibold">{dna?.top_genres?.[0] || "indie"}</span> and <span className="text-white font-semibold">{dna?.top_genres?.[1] || "electronic"}</span> — {picks.length} tracks · ~{Math.round(picks.length * 3.5 / 60)} hours
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => picks.length > 0 && playTrack(picks[0], picks)}
              className="flex items-center gap-3 bg-[#FFB703] text-[#1A1A1A] px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,183,3,0.4)]"
            >
              <Play size={18} fill="currentColor" /> Play Mix
            </button>
            <Link href="/dashboard/queue" className="text-gray-400 hover:text-white transition-colors text-sm font-semibold flex items-center gap-2 border border-white/10 hover:border-white/30 px-4 py-3 rounded-2xl">
              <Disc3 size={16} /> View Queue
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// The Daily Mix track list (Spotify playlist-style)
function DailyMixList({ picks }: { picks: Track[] }) {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? picks : picks.slice(0, 8);

  if (picks.length === 0) return null;

  return (
    <section className="mb-12 px-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
          <Radio size={20} className="text-[#FFB703]" /> Your Daily Mix
        </h2>
        <span className="text-sm text-gray-400 font-semibold">{picks.length} tracks</span>
      </div>

      {/* Track list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[2rem_1fr_auto] gap-4 px-4 py-3 border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <div className="text-center">#</div>
          <div>Title</div>
          <div className="flex items-center gap-1 pr-2"><Clock size={10} /></div>
        </div>

        {visible.map((track, idx) => {
          const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
          return (
            <div
              key={`${track.id}-${idx}`}
              onClick={() => playTrack(track, picks)}
              className="group grid grid-cols-[2rem_1fr_auto] gap-4 px-4 py-3 items-center hover:bg-[#FDFBF7] cursor-pointer transition-colors border-b border-gray-50/80 last:border-0"
            >
              <div className="text-center">
                {isCurrentlyPlaying ? (
                  <div className="flex items-center justify-center gap-0.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-0.5 bg-[#FFB703] rounded-full animate-bounce" style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.15}s` }} />
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
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                  {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />}
                </div>
                <div className="min-w-0">
                  <p className={`font-bold text-sm truncate transition-colors ${isCurrentlyPlaying ? "text-[#FFB703]" : "text-[#1A1A1A] group-hover:text-[#FFB703]"}`}>{track.title}</p>
                  <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                </div>
              </div>

              <div className="text-xs text-gray-400 font-medium pr-2 tabular-nums">
                {track.duration || "—"}
              </div>
            </div>
          );
        })}
      </div>

      {picks.length > 8 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-500 hover:text-[#1A1A1A] hover:shadow-sm transition-all"
        >
          {expanded ? "Show Less" : `Show all ${picks.length} tracks`}
        </button>
      )}
    </section>
  );
}

export default function DashboardHome() {
  const [dailyPicks, setDailyPicks] = useState<Track[]>([]);
  const [trending, setTrending] = useState<Track[]>([]);
  const [shelves, setShelves] = useState<HomeShelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);
  const [dna, setDna] = useState<any>(null);
  const { playTrack } = usePlayer();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let userDna = null;
        if (session) {
          const { data } = await supabase.from("taste_dna").select("*").eq("user_id", session.user.id).single();
          userDna = data;
          setDna(data);
        }

        const ids = userDna?.top_songs
          ?.map((s: any) => s.id || s.videoId)
          ?.filter(Boolean)
          ?.slice(0, 3)
          ?.join(",") || "4NRXx6U8ABQ,34Na4j8HLjc";

        const [picksResult, trendResult, shelvesResult] = await Promise.allSettled([
          getHomeFeed(ids),
          getCharts("IN"),
          getHomeShelves(),
        ]);

        const picks = picksResult.status === "fulfilled" ? picksResult.value : [];
        let trend = trendResult.status === "fulfilled" ? trendResult.value : [];

        // Fallback: if charts API fails, use search for trending
        if (trend.length === 0) {
          const fallback = await searchMusic("india trending songs 2024");
          trend = fallback;
        }

        const homeShelvesData = shelvesResult.status === "fulfilled" ? shelvesResult.value : [];

        if (picks.length === 0 && trend.length === 0) {
          setBackendError(true);
        } else {
          setDailyPicks(picks);
          setTrending(trend.slice(0, 10));
          setShelves(homeShelvesData);
        }
      } catch (error) {
        console.error("Failed to load initial tracks", error);
        setBackendError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase]);

  if (loading) {
    return (
      <div className="p-8 space-y-10">
        <div className="h-8 w-48 bg-gray-100 rounded-full animate-pulse" />
        <div className="mx-0 h-48 rounded-[2rem] bg-gray-100 animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-2 w-24 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (backendError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-24 h-24 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-6">
          <Radio size={40} />
        </div>
        <h2 className="text-3xl font-black text-[#1A1A1A] mb-4">Backend API Offline</h2>
        <p className="text-gray-500 max-w-md">
          Start the Python backend on port 8000 to stream real music.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-32 pt-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-8 mb-8"
      >
        <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A] mb-1">
          {getGreeting()}<span className="text-[#FFB703]">.</span>
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          Your Taste DNA is evolving. Here is your daily resonance.
        </p>
      </motion.div>

      {/* Hero Daily Mix Card */}
      <DailyMixCard picks={dailyPicks} dna={dna} />

      {/* Daily Mix Tracklist */}
      <DailyMixList picks={dailyPicks} />

      {/* Real YTMusic home shelves */}
      {shelves.map((shelf) => (
        <ShelfRow key={shelf.title} shelf={shelf} onPlay={playTrack} />
      ))}

      {/* Trending Now */}
      <TrendingSection tracks={trending} />
    </div>
  );
}
