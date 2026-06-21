"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Activity, Disc3, Layers, Zap, Heart, Sparkles, Compass, Music, Mic2, Loader2, Play } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { usePlayer } from "@/context/PlayerContext";
import { searchMusic } from "@/lib/api";

const COLORS = [
  "bg-indigo-500", "bg-blue-500", "bg-pink-500",
  "bg-orange-400", "bg-green-500", "bg-purple-500"
];

export default function TasteDNAPage() {
  const supabase = createClient();
  const { playTrack } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [dna, setDna] = useState<any>(null);
  const [topSongTracks, setTopSongTracks] = useState<any[]>([]);
  const [songsLoading, setSongsLoading] = useState(false);

  useEffect(() => {
    async function loadDNA() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data } = await supabase
          .from("taste_dna")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        setDna(data);

        // Fetch real tracks for top songs
        if (data?.top_songs?.length > 0) {
          setSongsLoading(true);
          const results = await Promise.all(
            data.top_songs.map((s: any) =>
              searchMusic(`${s.title} ${s.artist}`).then(r => r[0]).catch(() => null)
            )
          );
          setTopSongTracks(results.filter(Boolean));
          setSongsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load Taste DNA:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDNA();
  }, [supabase]);

  if (loading) return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-12 h-12 border-4 border-[#FFB703]/20 border-t-[#FFB703] rounded-full animate-spin" />
      <p className="text-gray-400 font-medium animate-pulse">Loading your Taste DNA...</p>
    </div>
  );

  if (!dna) return (
    <div className="p-8 pb-32 flex flex-col items-center justify-center gap-6 text-center">
      <div className="w-24 h-24 bg-[#FFB703]/10 rounded-full flex items-center justify-center">
        <Activity size={40} className="text-[#FFB703]" />
      </div>
      <h2 className="text-3xl font-black text-[#1A1A1A]">No Taste DNA yet</h2>
      <p className="text-gray-500 max-w-md">Complete the onboarding wizard to generate your sonic identity.</p>
    </div>
  );

  const genres: string[] = dna.top_genres ?? [];
  const artists: string[] = dna.top_artists ?? [];
  const topSongs: any[] = dna.top_songs ?? [];
  const totalGenres = genres.length || 1;

  return (
    <div className="p-8 pb-32 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-black text-[#1A1A1A] mb-4 flex items-center gap-4">
          Taste DNA <Activity className="text-[#FFB703]" size={40} />
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl">
          Your personal sonic blueprint — built from your genres, artists, songs and vibes.
        </p>
      </div>

      {/* Primary DNA Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

        {/* Vibe */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
              <Zap size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Core Vibe</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#1A1A1A] mb-2 capitalize">
              {dna.core_vibe ? dna.core_vibe.replace(/[🌙🧠💪☕💔✨📼🎉🌊🚗📚💕]/g, "").trim() : "Not set"}
            </h3>
            <p className="text-gray-500">Your primary listening mood, set during onboarding.</p>
          </div>
        </div>

        {/* Energy */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
              <Disc3 size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Energy Level</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#1A1A1A] mb-2">{dna.energy_level ?? 0}%</h3>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${dna.energy_level ?? 0}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>

        {/* Top Genre */}
        <div className="bg-[#1A1A1A] p-8 rounded-3xl shadow-xl flex flex-col justify-between text-white relative overflow-hidden hover:scale-[1.02] transition-transform">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#FFB703] blur-[60px] opacity-20 rounded-full" />
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-[#FFB703]">
              <Sparkles size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Top Genre</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-2 text-[#FFB703]">{genres[0] ?? "—"}</h3>
            <p className="text-gray-400">Your #1 genre from your Taste DNA profile.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

        {/* Your Genres */}
        <div>
          <h2 className="text-2xl font-black text-[#1A1A1A] mb-6 flex items-center gap-2">
            <Layers size={24} className="text-indigo-500" /> Your Genres
          </h2>
          {genres.length === 0 ? (
            <p className="text-gray-400">No genres saved yet.</p>
          ) : (
            <div className="space-y-4">
              {genres.map((g, i) => {
                const pct = Math.round(100 - (i / totalGenres) * 60);
                return (
                  <div key={g} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                    <span className="font-bold text-gray-400 w-12 text-right">{pct}%</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className={`h-full ${COLORS[i % COLORS.length]}`}
                      />
                    </div>
                    <span className="font-bold text-[#1A1A1A] w-36 truncate">{g}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Your Artists */}
        <div>
          <h2 className="text-2xl font-black text-[#1A1A1A] mb-6 flex items-center gap-2">
            <Mic2 size={24} className="text-pink-500" /> Your Artists
          </h2>
          {artists.length === 0 ? (
            <p className="text-gray-400">No artists saved yet.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {artists.map((a, i) => (
                <span key={i} className="bg-white border border-gray-200 text-[#1A1A1A] font-bold text-sm px-5 py-2.5 rounded-full shadow-sm hover:border-[#FFB703] hover:shadow-md transition-all cursor-default">
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Songs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-[#1A1A1A] flex items-center gap-2">
            <Heart size={24} className="text-red-500" fill="currentColor" /> Your Favourite Songs
          </h2>
          {topSongTracks.length > 0 && (
            <button 
              onClick={() => playTrack(topSongTracks[0], topSongTracks)}
              className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
            >
              <Play size={16} fill="currentColor" /> Play All
            </button>
          )}
        </div>

        {topSongs.length === 0 ? (
          <p className="text-gray-400">No favourite songs saved yet.</p>
        ) : songsLoading ? (
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 size={18} className="animate-spin" /> Loading your songs...
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {topSongTracks.length > 0 ? topSongTracks.map((track, idx) => (
              <div
                key={track.id}
                onClick={() => playTrack(track, topSongTracks)}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer group border-b border-gray-50 last:border-0 transition-colors"
              >
                <span className="text-gray-300 font-bold w-6 text-center text-sm">{idx + 1}</span>
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  {track.thumbnail
                    ? <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300"><Music size={20} /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1A1A1A] truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                  <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                </div>
              </div>
            )) : (
              // Fallback: show names only if backend didn't resolve tracks
              topSongs.map((s: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0">
                  <span className="text-gray-300 font-bold w-6 text-center text-sm">{idx + 1}</span>
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300"><Music size={20} /></div>
                  <div>
                    <p className="font-bold text-[#1A1A1A]">{s.title}</p>
                    <p className="text-sm text-gray-400">{s.artist}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* DNA Stats Footer */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Genres", value: genres.length, icon: <Layers size={18} />, color: "text-indigo-500" },
          { label: "Artists", value: artists.length, icon: <Mic2 size={18} />, color: "text-pink-500" },
          { label: "Songs", value: topSongs.length, icon: <Heart size={18} />, color: "text-red-500" },
          { label: "Discovery", value: `${dna.discovery_rate ?? 0}%`, icon: <Compass size={18} />, color: "text-green-500" },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-2xl font-black text-[#1A1A1A]">{stat.value}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
