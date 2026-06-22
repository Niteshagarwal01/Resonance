"use client";

import { usePlayer } from "@/context/PlayerContext";
import { searchMusic, getCharts, Track } from "@/lib/api";
import { useEffect, useState } from "react";
import { Play, Compass, Globe, Zap, TrendingUp, Music2, Flame, Radio } from "lucide-react";
import { SafeImage as Image } from "@/components/SafeImage";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { SongActions } from "@/components/SongActions";

const DISCOVER_GENRES = [
  { label: "Indie Underground", query: "indie underrated hidden gems", color: "from-emerald-500 to-teal-600" },
  { label: "Global Hits", query: "global trending songs", color: "from-blue-500 to-indigo-600" },
  { label: "Desi Beats", query: "bollywood hindi latest hits", color: "from-orange-500 to-yellow-500" },
  { label: "Lo-Fi Chill", query: "lofi hip hop chill beats", color: "from-purple-500 to-violet-600" },
];

function TrackCard({ track, queue, idx }: { track: any; queue: any[]; idx: number }) {
  const { playTrack } = usePlayer();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      onClick={() => playTrack(track, queue)}
      className="group cursor-pointer"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-xl transition-all duration-300">
        {track.thumbnail ? (
          <Image src={track.thumbnail} alt={track.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Music2 size={40} className="text-gray-300" />
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
  const [hiddenGems, setHiddenGems] = useState<Track[]>([]);
  const [globalCharts, setGlobalCharts] = useState<Track[]>([]);
  const [indiaCharts, setIndiaCharts] = useState<Track[]>([]);
  const [genreSections, setGenreSections] = useState<{ label: string; color: string; tracks: Track[] }[]>([]);
  const [error, setError] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let userDna: any = null;
        if (session) {
          const { data } = await supabase.from("taste_dna").select("*").eq("user_id", session.user.id).single();
          userDna = data;
        }

        const genre1 = userDna?.top_genres?.[0] || "indie";
        const genre2 = userDna?.top_genres?.[1] || "pop";

        // Run all fetches in parallel, fail gracefully
        const [gems, globalData, indiaData, ...genreResults] = await Promise.allSettled([
          searchMusic(`underrated ${genre1} tracks 2024`),
          getCharts("ZZ"),
          getCharts("IN"),
          searchMusic(DISCOVER_GENRES[0].query),
          searchMusic(DISCOVER_GENRES[1].query),
          searchMusic(`best ${genre1}`),
          searchMusic(`deep ${genre2}`),
        ]);

        if (gems.status === "fulfilled") setHiddenGems(gems.value.slice(0, 8));

        if (globalData.status === "fulfilled") {
          const g = globalData.value;
          setGlobalCharts((g as any[]).slice(0, 10));
        }
        if (indiaData.status === "fulfilled") {
          const ind = indiaData.value;
          setIndiaCharts((ind as any[]).slice(0, 10));
        }

        const built: { label: string; color: string; tracks: Track[] }[] = [];
        DISCOVER_GENRES.forEach((genre, i) => {
          const result = genreResults[i];
          if (result?.status === "fulfilled" && (result.value as Track[]).length > 0) {
            built.push({ label: genre.label, color: genre.color, tracks: (result.value as Track[]).slice(0, 6) });
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
        <div className="grid grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
              <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && hiddenGems.length === 0 && globalCharts.length === 0) {
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
          Step outside your bubble. Global charts, hidden gems, and sounds you haven't heard yet.
        </p>
      </div>

      {/* ── Hidden Gems ── */}
      {hiddenGems.length > 0 && (
        <section className="px-8 mb-12">
          <SectionHeader
            icon={<Zap className="text-[#FFB703]" size={22} />}
            title="Hidden Gems"
            subtitle={`Underrated tracks matched to your taste`}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {hiddenGems.map((track, idx) => (
              <TrackCard key={track.id + idx} track={track} queue={hiddenGems} idx={idx} />
            ))}
          </div>
        </section>
      )}

      {/* ── India Charts ── */}
      {indiaCharts.length > 0 && (
        <section className="px-8 mb-12">
          <SectionHeader
            icon={<Flame className="text-orange-500" size={22} />}
            title="Trending in India"
            subtitle="Top 10 right now on YouTube Music India"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {indiaCharts.map((track: any, idx: number) => (
              <div
                key={track.id + idx}
                onClick={() => playTrack(track, indiaCharts)}
                className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100"
              >
                <span className="text-xl font-black text-gray-200 w-8 text-center tabular-nums leading-none">{idx + 1}</span>
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                    <Play size={16} fill="white" className="text-white opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                  <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2 shrink-0" onClick={e => e.stopPropagation()}>
                  <SongActions track={track} size="sm" />
                </div>
                {track.trend && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    track.trend === "up" ? "bg-green-50 text-green-600" :
                    track.trend === "down" ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400"
                  }`}>
                    {track.trend === "up" ? "↑" : track.trend === "down" ? "↓" : "—"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Global Charts ── */}
      {globalCharts.length > 0 && (
        <section className="px-8 mb-12">
          <SectionHeader
            icon={<Globe className="text-blue-500" size={22} />}
            title="Global Charts"
            subtitle="The biggest songs on the planet right now"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {globalCharts.map((track: any, idx: number) => (
              <div
                key={track.id + idx}
                onClick={() => playTrack(track, globalCharts)}
                className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100"
              >
                <span className="text-xl font-black text-gray-200 w-8 text-center tabular-nums leading-none">{idx + 1}</span>
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                    <Play size={16} fill="white" className="text-white opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                  <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2 shrink-0" onClick={e => e.stopPropagation()}>
                  <SongActions track={track} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Genre Sections ── */}
      {genreSections.map((section) => (
        <section key={section.label} className="px-8 mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${section.color}`} />
            <h2 className="text-xl font-black text-[#1A1A1A]">{section.label}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {section.tracks.map((track, idx) => (
              <TrackCard key={track.id + idx} track={track} queue={section.tracks} idx={idx} />
            ))}
          </div>
        </section>
      ))}

    </div>
  );
}
