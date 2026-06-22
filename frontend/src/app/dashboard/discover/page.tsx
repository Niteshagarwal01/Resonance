"use client";

import { usePlayer } from "@/context/PlayerContext";
import { searchMusic, getCharts, getRadioQueue, Track } from "@/lib/api";
import { useEffect, useState } from "react";
import { Play, Compass, Globe, Zap, Flame, Radio, Sparkles } from "lucide-react";
import { SafeImage as Image } from "@/components/SafeImage";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { SongActions } from "@/components/SongActions";

const COLORS = [
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-orange-500 to-yellow-500",
  "from-purple-500 to-violet-600",
  "from-pink-500 to-rose-600"
];

function TrackCard({ track, queue, idx }: { track: any; queue: any[]; idx: number }) {
  const { playTrack } = usePlayer();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      onClick={() => playTrack(track, queue)}
      className="group cursor-pointer shrink-0 w-40"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-xl transition-all duration-300">
        {track.thumbnail ? (
          <Image src={track.thumbnail} alt={track.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Radio size={40} className="text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-end justify-end p-3 transition-colors">
          <div className="w-12 h-12 rounded-full bg-[#FFB703] flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Play size={18} fill="#1A1A1A" className="text-[#1A1A1A] ml-1" />
          </div>
        </div>
      </div>
      <div className="flex items-start justify-between gap-2 mt-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{track.artist}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
          <SongActions track={track} size="sm" />
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-2xl font-black text-[#1A1A1A] flex items-center gap-2">
          {icon} {title}
        </h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1 ml-8">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const { playTrack } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [freshFinds, setFreshFinds] = useState<Track[]>([]);
  const [globalCharts, setGlobalCharts] = useState<Track[]>([]);
  const [indiaCharts, setIndiaCharts] = useState<Track[]>([]);
  const [genreSections, setGenreSections] = useState<{ label: string; color: string; tracks: Track[] }[]>([]);
  const [error, setError] = useState(false);
  const [loadingMood, setLoadingMood] = useState<string | null>(null);
  const supabase = createClient();

  const handleMoodClick = async (mood: string, query: string) => {
    if (loadingMood) return;
    setLoadingMood(mood);
    try {
      const results = await searchMusic(query);
      if (results && results.length > 0) {
        playTrack(results[0], results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMood(null);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let userDna: any = null;
        if (session) {
          const { data } = await supabase.from("taste_dna").select("*").eq("user_id", session.user.id).single();
          userDna = data;
        }

        const genres = userDna?.top_genres || ["indie", "pop", "hip hop", "electronic"];
        const topArtists = userDna?.top_artists || ["Trending"];
        
        const dynamicSections = [
          { 
            label: `Because you love ${(typeof topArtists[0] === 'object' ? topArtists[0].name : topArtists[0]) || 'Good Music'}`, 
            query: `tracks similar to ${(typeof topArtists[0] === 'object' ? topArtists[0].name : topArtists[0]) || 'popular'}`, 
            artistId: typeof topArtists[0] === 'object' ? topArtists[0].id : null,
            color: COLORS[0] 
          },
          { label: `Trending ${genres[0] || 'Hits'}`, query: `trending popular ${genres[0] || 'pop'} songs`, color: COLORS[1] },
          { label: `Deep ${genres[1] || 'Vibes'}`, query: `underrated hidden ${genres[1] || 'indie'} tracks`, color: COLORS[2] },
        ];

        // Run all fetches in parallel, fail gracefully
        const fetches = [
          (typeof topArtists[0] === 'object' && topArtists[0]?.id) ? getRadioQueue(topArtists[0].id) : searchMusic(`songs by ${(typeof topArtists[0] === 'object' ? topArtists[0].name : topArtists[0]) || 'trending'}`), // Fresh Finds
          getCharts("ZZ"),
          getCharts("IN"),
          ...dynamicSections.map(s => s.artistId ? getRadioQueue(s.artistId) : searchMusic(s.query))
        ];
        
        const results = await Promise.allSettled(fetches);

        if (results[0].status === "fulfilled") setFreshFinds(results[0].value.slice(0, 10));

        if (results[1].status === "fulfilled") setGlobalCharts((results[1].value as any[]).slice(0, 10));
        if (results[2].status === "fulfilled") setIndiaCharts((results[2].value as any[]).slice(0, 10));

        const built: { label: string; color: string; tracks: Track[] }[] = [];
        dynamicSections.forEach((section, i) => {
          const result = results[3 + i];
          if (result?.status === "fulfilled" && (result.value as Track[]).length > 0) {
            built.push({ label: section.label, color: section.color, tracks: (result.value as Track[]).slice(0, 10) });
          }
        });
        setGenreSections(built);

      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  if (loading) {
    return (
      <div className="p-8 pb-32 space-y-10">
        <div className="h-10 w-48 bg-gray-100 rounded-full animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3 w-40 shrink-0">
              <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
              <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && freshFinds.length === 0 && globalCharts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Radio size={64} className="text-gray-200 mb-4" />
        <h2 className="text-2xl font-black text-[#1A1A1A] mb-2">Backend Offline</h2>
        <p className="text-gray-500">Start the Python backend to load discover content.</p>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* ── Hero Header ── */}
      <div className="px-8 pt-8 pb-6 mb-4">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-black text-[#1A1A1A] tracking-tight mb-2"
        >
          Discover<span className="text-[#FFB703]">.</span>
        </motion.h1>
        <p className="text-gray-500 text-sm font-medium max-w-lg">
          Explore dynamic contextual playlists and fresh tracks tailored exactly to your vibe.
        </p>
      </div>

      {/* ── Mood & Context Explorer ── */}
      <section className="px-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
                onClick={() => handleMoodClick("midnight", "midnight drive late night songs")}
                className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-purple-500/30">
                <span className={loadingMood === "midnight" ? "opacity-0" : "opacity-100 transition-opacity"}>Midnight Drive</span>
                {loadingMood === "midnight" && <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div></div>}
            </div>
            <div 
                onClick={() => handleMoodClick("morning", "morning energy upbeat pop songs")}
                className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-pink-500/30">
                <span className={loadingMood === "morning" ? "opacity-0" : "opacity-100 transition-opacity"}>Morning Energy</span>
                {loadingMood === "morning" && <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div></div>}
            </div>
            <div 
                onClick={() => handleMoodClick("focus", "deep focus lofi chill beats")}
                className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-teal-500/30">
                <span className={loadingMood === "focus" ? "opacity-0" : "opacity-100 transition-opacity"}>Deep Focus</span>
                {loadingMood === "focus" && <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div></div>}
            </div>
            <div 
                onClick={() => handleMoodClick("chill", "chill vibes relaxed acoustic songs")}
                className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-400 to-cyan-500 text-white font-bold cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-cyan-500/30">
                <span className={loadingMood === "chill" ? "opacity-0" : "opacity-100 transition-opacity"}>Chill Vibes</span>
                {loadingMood === "chill" && <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div></div>}
            </div>
        </div>
      </section>

      {/* ── Fresh Finds Carousel ── */}
      {freshFinds.length > 0 && (
        <section className="mb-12">
          <div className="px-8">
            <SectionHeader
              icon={<Sparkles className="text-[#FFB703]" size={22} />}
              title="Fresh Finds"
              subtitle="Brand new releases picked for you"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-8 pb-4" style={{ scrollSnapType: "x mandatory" }}>
            {freshFinds.map((track, idx) => (
              <div key={track.id + idx} style={{ scrollSnapAlign: "start" }}>
                <TrackCard track={track} queue={freshFinds} idx={idx} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Top 10 Showcase: Global & India ── */}
      <section className="px-8 mb-12 grid grid-cols-1 xl:grid-cols-2 gap-8">
        {indiaCharts.length > 0 && (
            <div>
              <SectionHeader
                icon={<Flame className="text-orange-500" size={22} />}
                title="Trending in India"
              />
              <div className="flex flex-col gap-2">
                {indiaCharts.slice(0, 5).map((track: any, idx: number) => (
                  <div
                    key={track.id + idx}
                    onClick={() => playTrack(track, indiaCharts)}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-[#FFB703]/40 hover:shadow-md transition-all cursor-pointer"
                  >
                    <span className="text-xl font-black text-gray-200 w-8 text-center tabular-nums leading-none">{idx + 1}</span>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                        <Play size={16} fill="white" className="text-white opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                      <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        )}
        
        {globalCharts.length > 0 && (
            <div>
              <SectionHeader
                icon={<Globe className="text-blue-500" size={22} />}
                title="Global Charts"
              />
              <div className="flex flex-col gap-2">
                {globalCharts.slice(0, 5).map((track: any, idx: number) => (
                  <div
                    key={track.id + idx}
                    onClick={() => playTrack(track, globalCharts)}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer"
                  >
                    <span className="text-xl font-black text-gray-200 w-8 text-center tabular-nums leading-none">{idx + 1}</span>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                        <Play size={16} fill="white" className="text-white opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-blue-500 transition-colors">{track.title}</p>
                      <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        )}
      </section>

      {/* ── Dynamic Genre & Artist Sections (Carousels) ── */}
      {genreSections.map((section) => (
        <section key={section.label} className="mb-12">
          <div className="px-8 flex items-center gap-3 mb-5">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${section.color}`} />
            <h2 className="text-xl font-black text-[#1A1A1A]">{section.label}</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-8 pb-4" style={{ scrollSnapType: "x mandatory" }}>
            {section.tracks.map((track, idx) => (
              <div key={track.id + idx} style={{ scrollSnapAlign: "start" }}>
                <TrackCard track={track} queue={section.tracks} idx={idx} />
              </div>
            ))}
          </div>
        </section>
      ))}

    </div>
  );
}
