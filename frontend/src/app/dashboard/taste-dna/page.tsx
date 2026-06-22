"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Activity, Disc3, Layers, Zap, Heart, Sparkles, Compass, Music, Mic2, Loader2, Play, Pause, Shuffle, RefreshCw, ListMusic } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { usePlayer } from "@/context/PlayerContext";
import { searchMusic, getRadioQueue } from "@/lib/api";
import Image from "next/image";
import { SongActions } from "@/components/SongActions";

const COLORS = [
  "bg-indigo-500", "bg-blue-500", "bg-pink-500",
  "bg-orange-400", "bg-green-500", "bg-purple-500"
];

export default function TasteDNAPage() {
  const supabase = createClient();
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [dna, setDna] = useState<any>(null);
  const [vibePlaylist, setVibePlaylist] = useState<any[]>([]);
  const [playlistLoading, setPlaylistLoading] = useState(false);

  const buildPersonalizedPlaylist = useCallback(async (dnaData: any, historyTracks: any[]) => {
    setPlaylistLoading(true);
    try {
      const sources: Promise<any[]>[] = [];

      // 1. From listening history (most personal)
      if (historyTracks.length > 0) {
        // Pick top 3 from history as seeds for radio
        const seeds = historyTracks.slice(0, 3);
        for (const seed of seeds) {
          sources.push(getRadioQueue(seed.id).catch(() => []));
        }
      }

      // 2. From favorite artists
      const artists: string[] = dnaData?.top_artists ?? [];
      for (const artist of artists.slice(0, 3)) {
        sources.push(searchMusic(`${artist} best songs`).catch(() => []));
      }

      // 3. From favorite genres
      const genres: string[] = dnaData?.top_genres ?? [];
      for (const genre of genres.slice(0, 2)) {
        sources.push(searchMusic(`${genre} hits 2024`).catch(() => []));
      }

      // 4. From core vibe
      if (dnaData?.core_vibe) {
        const vibe = dnaData.core_vibe.replace(/[^\w\s]/gi, '').trim();
        sources.push(searchMusic(`${vibe} music playlist`).catch(() => []));
      }

      const results = await Promise.all(sources);
      const allTracks = results.flat();

      // Deduplicate
      const seen = new Set<string>();
      const unique: any[] = [];
      for (const t of allTracks) {
        if (t && t.id && !seen.has(t.id)) {
          seen.add(t.id);
          unique.push(t);
        }
      }

      // Shuffle and cap at 40
      const shuffled = unique.sort(() => Math.random() - 0.5).slice(0, 40);
      setVibePlaylist(shuffled);
    } catch (e) {
      console.error("Failed to build playlist:", e);
    } finally {
      setPlaylistLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadDNA() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const [dnaRes, historyRes] = await Promise.all([
          supabase.from("taste_dna").select("*").eq("user_id", session.user.id).single(),
          supabase.from("listening_history").select("*").eq("user_id", session.user.id).order("played_at", { ascending: false }).limit(30),
        ]);

        const dnaData = dnaRes.data;
        setDna(dnaData);

        // Build history tracks array
        const history = historyRes.data ?? [];
        const seen = new Set<string>();
        const historyTracks: any[] = [];
        for (const row of history) {
          if (!seen.has(row.track_id)) {
            seen.add(row.track_id);
            historyTracks.push({ id: row.track_id, title: row.track_title, artist: row.track_artist, thumbnail: row.track_thumbnail });
          }
        }

        await buildPersonalizedPlaylist(dnaData, historyTracks);
      } catch (err) {
        console.error("Failed to load Taste DNA:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDNA();
  }, [supabase, buildPersonalizedPlaylist]);

  if (loading) return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-12 h-12 border-4 border-[#FFB703]/20 border-t-[#FFB703] rounded-full animate-spin" />
      <p className="text-gray-400 font-medium animate-pulse">Building your Taste DNA...</p>
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
  const totalGenres = genres.length || 1;

  return (
    <div className="pb-32">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden bg-[#1A1A1A] px-8 pt-8 pb-10 mb-0">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#FFB703] rounded-full blur-[120px] opacity-20" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-500 rounded-full blur-[120px] opacity-15" />
        
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[#FFB703] font-bold text-xs tracking-widest uppercase mb-2 flex items-center gap-1.5">
                <Activity size={12} /> Sonic Blueprint
              </p>
              <h1 className="text-4xl font-black text-white mb-2">
                Your Taste DNA
              </h1>
              <p className="text-gray-400 max-w-xl">
                Personalized playlist built from your listening history, favourite genres and artists.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-2xl font-black text-[#FFB703]">{genres.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Genres</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-black text-[#FFB703]">{artists.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Artists</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-black text-[#FFB703]">{vibePlaylist.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Songs</p>
              </div>
            </div>
          </div>

          {/* Genre pills */}
          <div className="flex flex-wrap gap-2">
            {genres.map((g, i) => (
              <span key={i} className={`px-3 py-1 rounded-full text-white text-xs font-bold ${COLORS[i % COLORS.length]} opacity-90`}>
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8">
        {/* ── Personalized Vibe Playlist ── */}
        <div className="mt-8 mb-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black text-[#1A1A1A] flex items-center gap-2.5">
                <Sparkles size={22} className="text-[#FFB703]" />
                Your Vibe Playlist
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {vibePlaylist.length} songs · Personalized from your history, artists & genres
              </p>
            </div>
            <div className="flex items-center gap-3">
              {vibePlaylist.length > 0 && (
                <>
                  <button
                    onClick={() => {
                      const idx = Math.floor(Math.random() * vibePlaylist.length);
                      playTrack(vibePlaylist[idx], vibePlaylist);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-600 text-sm font-bold hover:border-[#FFB703] hover:text-[#FFB703] transition-all"
                  >
                    <Shuffle size={16} /> Shuffle
                  </button>
                  <button
                    onClick={() => playTrack(vibePlaylist[0], vibePlaylist)}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#FFB703] text-[#1A1A1A] text-sm font-black hover:bg-[#ffc124] hover:scale-105 active:scale-95 transition-all shadow-md"
                  >
                    <Play size={16} fill="currentColor" /> Play All
                  </button>
                </>
              )}
              <button
                onClick={async () => {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) return;
                  const { data: hist } = await supabase.from("listening_history").select("*").eq("user_id", session.user.id).order("played_at", { ascending: false }).limit(30);
                  const seen = new Set<string>();
                  const ht: any[] = [];
                  for (const row of hist ?? []) {
                    if (!seen.has(row.track_id)) { seen.add(row.track_id); ht.push({ id: row.track_id, title: row.track_title, artist: row.track_artist, thumbnail: row.track_thumbnail }); }
                  }
                  buildPersonalizedPlaylist(dna, ht);
                }}
                className="p-2.5 rounded-full border border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:text-[#1A1A1A] transition-all"
                title="Refresh playlist"
              >
                <RefreshCw size={16} className={playlistLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Track List */}
          {playlistLoading ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-[#FFB703]/20 border-t-[#FFB703] rounded-full animate-spin" />
              <p className="text-gray-400 text-sm font-medium">Building your personalized playlist…</p>
              <p className="text-gray-300 text-xs text-center max-w-xs">Mixing your listening history, favourite artists and genres into the perfect blend.</p>
            </div>
          ) : vibePlaylist.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
              <ListMusic size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No songs generated yet.</p>
              <p className="text-gray-400 text-sm mt-1">Play some songs first to personalize your playlist, then hit refresh.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[2.5rem_1fr_auto] gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/80">
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">#</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Title</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 pr-2"></div>
              </div>
              <div className="divide-y divide-gray-50">
                {vibePlaylist.map((track, idx) => {
                  const isNowPlaying = currentTrack?.id === track.id && isPlaying;
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => playTrack(track, vibePlaylist)}
                      className="group grid grid-cols-[2.5rem_1fr_auto] gap-4 px-5 py-3 items-center hover:bg-gray-50/80 cursor-pointer transition-colors"
                    >
                      {/* Index / Playing indicator */}
                      <div className="text-center">
                        {isNowPlaying ? (
                          <div className="flex items-center justify-center gap-0.5">
                            {[1,2,3].map(i => (
                              <div key={i} className="w-0.5 bg-[#FFB703] rounded-full animate-bounce" style={{ height: `${6+i*3}px`, animationDelay: `${i*0.15}s` }} />
                            ))}
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-bold text-gray-300 group-hover:hidden tabular-nums">{idx + 1}</span>
                            <Play size={14} fill="#FFB703" className="text-[#FFB703] hidden group-hover:block mx-auto" />
                          </>
                        )}
                      </div>

                      {/* Track info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                          {track.thumbnail ? (
                            <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Music size={16} className="text-gray-300" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold text-sm truncate transition-colors ${isNowPlaying ? "text-[#FFB703]" : "text-[#1A1A1A] group-hover:text-[#FFB703]"}`}>
                            {track.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
                        <SongActions track={track} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {/* Core Vibe */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                <Zap size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Core Vibe</span>
            </div>
            <h3 className="text-2xl font-black text-[#1A1A1A] capitalize mb-1">
              {dna.core_vibe ? dna.core_vibe.replace(/[🌙🧠💪☕💔✨📼🎉🌊🚗📚💕]/g, "").trim() : "Not set"}
            </h3>
            <p className="text-gray-400 text-sm">Your primary listening mood.</p>
          </div>

          {/* Energy */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                <Disc3 size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Energy Level</span>
            </div>
            <h3 className="text-2xl font-black text-[#1A1A1A] mb-2">{dna.energy_level ?? 0}%</h3>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${dna.energy_level ?? 0}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Discovery */}
          <div className="bg-[#1A1A1A] p-6 rounded-3xl shadow-xl text-white relative overflow-hidden hover:scale-[1.02] transition-transform">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#FFB703] blur-[50px] opacity-20 rounded-full" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-[#FFB703]">
                <Compass size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Discovery</span>
            </div>
            <h3 className="text-2xl font-black text-[#FFB703] mb-1 relative z-10">{dna.discovery_rate ?? 0}%</h3>
            <p className="text-gray-400 text-sm relative z-10">Music explorer score.</p>
          </div>
        </div>

        {/* ── Genre Bars + Artist Tags ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Genres */}
          <div>
            <h2 className="text-xl font-black text-[#1A1A1A] mb-5 flex items-center gap-2">
              <Layers size={20} className="text-indigo-500" /> Your Genres
            </h2>
            {genres.length === 0 ? (
              <p className="text-gray-400 text-sm">No genres saved yet.</p>
            ) : (
              <div className="space-y-3">
                {genres.map((g, i) => {
                  const pct = Math.round(100 - (i / totalGenres) * 60);
                  return (
                    <div key={g} className="bg-white p-3.5 rounded-2xl border border-gray-100 flex items-center gap-4">
                      <span className="font-bold text-gray-400 w-10 text-right text-sm tabular-nums">{pct}%</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className={`h-full ${COLORS[i % COLORS.length]} rounded-full`}
                        />
                      </div>
                      <span className="font-bold text-[#1A1A1A] text-sm w-32 truncate">{g}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Artists */}
          <div>
            <h2 className="text-xl font-black text-[#1A1A1A] mb-5 flex items-center gap-2">
              <Mic2 size={20} className="text-pink-500" /> Your Artists
            </h2>
            {artists.length === 0 ? (
              <p className="text-gray-400 text-sm">No artists saved yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {artists.map((a, i) => (
                  <span key={i} className="bg-white border border-gray-200 text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-full shadow-sm hover:border-[#FFB703] hover:text-[#FFB703] hover:shadow-md transition-all cursor-default">
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
