"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Sparkles, Compass, Music, Mic2, Loader2, Play, Pause, Shuffle, RefreshCw, Layers } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { usePlayer } from "@/context/PlayerContext";
import { searchMusic, getRadioQueue, getArtistProfile } from "@/lib/api";
import { generateLiveVibe, computeEvolvedDNA } from "@/lib/vibeGenerator";
import { SafeImage as Image } from "@/components/SafeImage";
import { SongActions } from "@/components/SongActions";

const COLORS = [
  "from-indigo-500 to-purple-500", 
  "from-blue-500 to-cyan-500", 
  "from-pink-500 to-rose-500",
  "from-orange-400 to-amber-500", 
  "from-emerald-400 to-teal-500", 
  "from-violet-500 to-fuchsia-500"
];

export default function TasteDNAPage() {
  const supabase = createClient();
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [baseDna, setBaseDna] = useState<any>(null);
  const [historyTracks, setHistoryTracks] = useState<any[]>([]);
  const [vibePlaylist, setVibePlaylist] = useState<any[]>([]);
  const [playlistLoading, setPlaylistLoading] = useState(false);

  // Evolved DNA State
  const { evolvedArtists, evolvedGenres } = useMemo(() => {
    return computeEvolvedDNA(baseDna, historyTracks);
  }, [baseDna, historyTracks]);

  const buildPersonalizedPlaylist = useCallback(async (dnaData: any, hTracks: any[], eArtists: any[], eGenres: string[]) => {
    setPlaylistLoading(true);
    try {
      const playlist = await generateLiveVibe(dnaData, hTracks, eArtists, eGenres);
      setVibePlaylist(playlist);
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

        const [dnaRes, likedRes] = await Promise.all([
          supabase.from("taste_dna").select("*").eq("user_id", session.user.id).single(),
          supabase.from("liked_songs").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(50),
        ]);

        const dnaData = dnaRes.data;
        setBaseDna(dnaData);

        const likedData = likedRes.data ?? [];
        const hTracks: any[] = [];
        for (const row of likedData) {
          hTracks.push({ id: row.track_id, title: row.track_title, artist: row.track_artist, thumbnail: row.track_thumbnail });
        }
        setHistoryTracks(hTracks); // We still store in historyTracks state, but it is pure liked data now

      } catch (err) {
        console.error("Failed to load Taste DNA:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDNA();
  }, [supabase]);

  // Trigger playlist build when dependencies are ready
  useEffect(() => {
    if (baseDna && evolvedArtists.length > 0 && vibePlaylist.length === 0 && !playlistLoading) {
      buildPersonalizedPlaylist(baseDna, historyTracks, evolvedArtists, evolvedGenres);
    }
  }, [baseDna, evolvedArtists, evolvedGenres, historyTracks, vibePlaylist.length, playlistLoading, buildPersonalizedPlaylist]);


  if (loading) return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-6 p-8 bg-[#FDFBF7]">
      <div className="relative">
        <div className="absolute inset-0 bg-[#FFB703] blur-xl opacity-30 rounded-full animate-pulse" />
        <div className="w-16 h-16 bg-white shadow-xl rounded-full flex items-center justify-center relative z-10">
          <Activity size={32} className="text-[#FFB703] animate-pulse" />
        </div>
      </div>
      <p className="text-[#1A1A1A] font-black text-xl tracking-tight">Evolving your Taste DNA...</p>
    </div>
  );

  if (!baseDna) return (
    <div className="p-8 pb-32 flex flex-col items-center justify-center gap-6 text-center h-screen bg-[#FDFBF7]">
      <div className="w-24 h-24 bg-white shadow-xl rounded-full flex items-center justify-center">
        <Activity size={40} className="text-[#FFB703]" />
      </div>
      <h2 className="text-4xl font-black text-[#1A1A1A]">No Taste DNA yet</h2>
      <p className="text-gray-500 max-w-md font-medium">Complete the onboarding wizard to generate your sonic identity.</p>
    </div>
  );

  return (
    <div className="pb-32 bg-[#FDFBF7] min-h-screen selection:bg-[#FFB703] selection:text-white">
      {/* ── Premium Evolving Hero ── */}
      <div className="relative overflow-hidden bg-[#1A1A1A] px-8 pt-16 pb-20 mb-8 rounded-b-[3rem] shadow-2xl">
        {/* Animated DNA Blobs */}
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-[#FFB703] to-orange-500 rounded-full blur-[140px] opacity-40 mix-blend-screen pointer-events-none" 
        />
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.2, 1] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-full blur-[140px] opacity-40 mix-blend-screen pointer-events-none" 
        />
        
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 text-center md:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="text-[#FFB703] font-black text-sm tracking-[0.2em] uppercase mb-4 flex items-center justify-center md:justify-start gap-2">
                <Sparkles size={16} /> Evolving Sonic Identity
              </p>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tighter drop-shadow-lg">
                Your Taste DNA
              </h1>
              <p className="text-xl text-gray-300 max-w-xl font-medium leading-relaxed drop-shadow">
                Constantly learning and adapting to your vibe. Based on your {historyTracks.length > 0 ? "recent listening history" : "initial choices"}.
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col gap-6 w-full md:w-auto"
          >
            {/* Stats Glass Card */}
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2rem] shadow-2xl flex gap-8 justify-center">
              <div className="text-center px-4">
                <p className="text-4xl font-black text-white drop-shadow-md">{evolvedGenres.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mt-1">Genres</p>
              </div>
              <div className="w-px h-16 bg-white/10" />
              <div className="text-center px-4">
                <p className="text-4xl font-black text-white drop-shadow-md">{evolvedArtists.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mt-1">Artists</p>
              </div>
              <div className="w-px h-16 bg-white/10" />
              <div className="text-center px-4">
                <p className="text-4xl font-black text-[#FFB703] drop-shadow-md">{vibePlaylist.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mt-1">Mix Size</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8">
        
        {/* ── Evolved DNA Breakdown ── */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Top Artists Evolution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Mic2 size={120} />
            </div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-2xl font-black text-[#1A1A1A] flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                  <Mic2 size={20} />
                </span>
                Your Top Artists
              </h3>
              <a href="/dashboard/profile" className="text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                Edit DNA
              </a>
            </div>
            <div className="flex flex-wrap gap-3 relative z-10">
              {evolvedArtists.map((artist, i) => (
                <span key={i} className="px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold shadow-sm hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-all cursor-default">
                  {artist.name}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Top Genres Evolution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Layers size={120} />
            </div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-2xl font-black text-[#1A1A1A] flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Layers size={20} />
                </span>
                Core Genres
              </h3>
              <a href="/dashboard/profile" className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                Edit DNA
              </a>
            </div>
            <div className="flex flex-wrap gap-3 relative z-10">
              {evolvedGenres.map((g: string, i: number) => (
                <span key={i} className={`px-4 py-2 rounded-full bg-gradient-to-r ${COLORS[i % COLORS.length]} text-white text-sm font-bold shadow-md hover:scale-105 transition-transform cursor-default`}>
                  {g}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Personalized Vibe Playlist ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-4xl font-black text-[#1A1A1A] flex items-center gap-3 tracking-tight">
                <span className="w-12 h-12 rounded-full bg-[#FFB703]/20 text-[#FFB703] flex items-center justify-center shrink-0">
                  <Sparkles size={24} className="animate-pulse" />
                </span>
                The Vibe Mix
              </h2>
              <p className="text-gray-500 font-medium mt-2 max-w-xl">
                A hyper-personalized, auto-generated {vibePlaylist.length}-song playlist algorithmically blended from your evolving DNA.
              </p>
            </div>
            
            <div className="flex items-center gap-4 shrink-0">
              <button 
                onClick={() => buildPersonalizedPlaylist(baseDna, historyTracks, evolvedArtists, evolvedGenres)}
                disabled={playlistLoading}
                className="w-14 h-14 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 hover:text-[#1A1A1A] transition-all shadow-sm disabled:opacity-50"
                title="Regenerate Mix"
              >
                <RefreshCw size={24} className={playlistLoading ? "animate-spin" : ""} />
              </button>
              <button 
                onClick={() => vibePlaylist.length > 0 && playTrack(vibePlaylist[0], vibePlaylist)}
                disabled={playlistLoading || vibePlaylist.length === 0}
                className="px-8 h-14 bg-[#FFB703] text-[#1A1A1A] rounded-full flex items-center gap-3 font-black text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:-translate-y-0"
              >
                <Play fill="currentColor" size={24} /> Play Mix
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden relative min-h-[400px]">
            {playlistLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                <div className="w-16 h-16 border-4 border-[#FFB703]/20 border-t-[#FFB703] rounded-full animate-spin mb-4" />
                <p className="font-bold text-gray-500 animate-pulse">Synthesizing tracks...</p>
              </div>
            ) : null}

            <div className="grid grid-cols-[3rem_1fr_1fr_auto_auto] gap-4 px-8 py-4 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50/80 sticky top-0 z-10 backdrop-blur-md">
              <div className="text-center">#</div>
              <div>Title</div>
              <div className="hidden md:block">Artist</div>
              <div></div>
            </div>

            <div className="p-2">
              <AnimatePresence>
                {vibePlaylist.map((track, idx) => {
                  const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                      key={`${track.id}-${idx}`} 
                      onClick={() => playTrack(track, vibePlaylist)}
                      className="group grid grid-cols-[3rem_1fr_1fr_auto_auto] gap-4 px-6 py-3.5 items-center hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer"
                    >
                      <div className="text-center">
                        {isCurrentlyPlaying ? (
                          <div className="flex items-center justify-center gap-0.5">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-1 bg-[#FFB703] rounded-full animate-bounce" style={{ height: `${6 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />
                            ))}
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-bold text-gray-300 group-hover:hidden tabular-nums">{idx + 1}</span>
                            <Play size={16} fill="#FFB703" className="text-[#FFB703] hidden group-hover:block mx-auto" />
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                          <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold text-base truncate transition-colors ${isCurrentlyPlaying ? "text-[#FFB703]" : "text-[#1A1A1A] group-hover:text-[#FFB703]"}`}>
                            {track.title}
                          </p>
                          <p className="text-xs text-gray-500 font-medium truncate mt-0.5 md:hidden">{track.artist}</p>
                        </div>
                      </div>

                      <div className="hidden md:block min-w-0">
                        <p className="text-sm text-gray-600 font-medium truncate group-hover:text-[#1A1A1A] transition-colors">{track.artist}</p>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <SongActions track={track} />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
