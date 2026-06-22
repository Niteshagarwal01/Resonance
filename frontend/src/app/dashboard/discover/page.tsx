"use client";

import { usePlayer } from "@/context/PlayerContext";
import { searchMusic, getCharts, getArtist, Track } from "@/lib/api";
import { useEffect, useState } from "react";
import { Play, Globe, Flame, Radio, Loader2 } from "lucide-react";
import { SafeImage as Image } from "@/components/SafeImage";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { SongActions } from "@/components/SongActions";

// ── TrackCard ────────────────────────────────────────────────────────────────
function TrackCard({ track, queue, idx }: { track: Track; queue: Track[]; idx: number }) {
  const { playTrack } = usePlayer();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
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
          <div className="w-10 h-10 rounded-full bg-[#FFB703] flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Play size={16} fill="#1A1A1A" className="text-[#1A1A1A] ml-0.5" />
          </div>
        </div>
      </div>
      <div className="flex items-start justify-between gap-1 mt-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{track.artist}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
          <SongActions track={track} size="sm" />
        </div>
      </div>
    </motion.div>
  );
}

// ── ChartRow ─────────────────────────────────────────────────────────────────
function ChartRow({ track, idx, queue }: { track: Track; idx: number; queue: Track[] }) {
  const { playTrack } = usePlayer();
  return (
    <div
      onClick={() => playTrack(track, queue)}
      className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-[#FFB703]/40 hover:shadow-md transition-all cursor-pointer"
    >
      <span className="text-xl font-black text-gray-200 w-8 text-center tabular-nums leading-none">{idx + 1}</span>
      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
        {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
          <Play size={14} fill="white" className="text-white opacity-0 group-hover:opacity-100" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
        <p className="text-xs text-gray-500 truncate">{track.artist}</p>
      </div>
    </div>
  );
}

// ── SectionCarousel ───────────────────────────────────────────────────────────
function SectionCarousel({ label, tracks, dotColor }: { label: string; tracks: Track[]; dotColor: string }) {
  if (!tracks || tracks.length === 0) return null;
  return (
    <section className="mb-12">
      <div className="px-8 flex items-center gap-3 mb-5">
        <div className={`w-3 h-3 rounded-full ${dotColor}`} />
        <h2 className="text-xl font-black text-[#1A1A1A]">{label}</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide px-8 pb-4" style={{ scrollSnapType: "x mandatory" }}>
        {tracks.map((track, idx) => (
          <div key={`${track.id}-${idx}`} style={{ scrollSnapAlign: "start" }}>
            <TrackCard track={track} queue={tracks} idx={idx} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Mood config ───────────────────────────────────────────────────────────────
const MOODS = [
  { key: "midnight", label: "Midnight Drive", query: "midnight drive late night hindi songs", hoverGrad: "from-indigo-500/10 to-purple-600/10" },
  { key: "morning",  label: "Morning Energy", query: "morning energy upbeat pop songs",        hoverGrad: "from-orange-400/10 to-pink-500/10" },
  { key: "focus",    label: "Deep Focus",     query: "deep focus lofi chill beats",             hoverGrad: "from-emerald-400/10 to-teal-500/10" },
  { key: "chill",    label: "Chill Vibes",    query: "chill vibes relaxed acoustic songs",      hoverGrad: "from-blue-400/10 to-cyan-500/10" },
];

const DOT_COLORS = [
  "bg-gradient-to-br from-emerald-400 to-teal-500",
  "bg-gradient-to-br from-blue-400 to-indigo-500",
  "bg-gradient-to-br from-orange-400 to-yellow-400",
  "bg-gradient-to-br from-purple-400 to-violet-500",
  "bg-gradient-to-br from-pink-400 to-rose-500",
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface ArtistSection { artistName: string; tracks: Track[]; dotColor: string; }
interface GenreSection   { label: string;      tracks: Track[]; dotColor: string; }

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DiscoverPage() {
  const [indiaCharts,    setIndiaCharts]    = useState<Track[]>([]);
  const [globalCharts,   setGlobalCharts]   = useState<Track[]>([]);
  const [artistSections, setArtistSections] = useState<ArtistSection[]>([]);
  const [genreSections,  setGenreSections]  = useState<GenreSection[]>([]);
  const [loadingMood,    setLoadingMood]    = useState<string | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(false);
  const { playTrack } = usePlayer();
  const supabase = createClient();

  const handleMoodClick = async (moodKey: string, query: string) => {
    if (loadingMood) return;
    setLoadingMood(moodKey);
    try {
      const results = await searchMusic(query);
      if (results?.length > 0) playTrack(results[0], results);
    } catch (e) { console.error(e); }
    finally { setLoadingMood(null); }
  };

  useEffect(() => {
    async function load() {
      try {
        // 1. Get user taste_dna — exact column names: top_artists, top_genres
        const { data: { session } } = await supabase.auth.getSession();
        let topArtists: { id: string; name: string }[] = [];
        let topGenres:  string[] = [];

        if (session) {
          const { data: dna } = await supabase
            .from("taste_dna")
            .select("top_artists, top_genres")
            .eq("user_id", session.user.id)
            .single();

          // top_artists: [{ id: "UC...", name: "...", image: "..." }]
          if (Array.isArray(dna?.top_artists)) {
            // Deduplicate by ID
            const seen = new Set();
            topArtists = dna.top_artists.filter((a: any) => {
              if (seen.has(a.id)) return false;
              seen.add(a.id);
              return true;
            }).slice(0, 5);
          }
          // top_genres: string[]
          if (Array.isArray(dna?.top_genres))  topGenres  = Array.from(new Set(dna.top_genres)).slice(0, 3);
        }

        // 2. Charts (always work, no personalisation needed)
        const [indiaResult, globalResult] = await Promise.allSettled([
          getCharts("IN"),
          getCharts("ZZ"),
        ]);
        if (indiaResult.status  === "fulfilled") setIndiaCharts(indiaResult.value.slice(0, 5));
        if (globalResult.status === "fulfilled") setGlobalCharts(globalResult.value.slice(0, 5));

        // 3. Artist sections — use exact UC artist id from taste_dna.top_artists[].id
        if (topArtists.length > 0) {
          const artistResults = await Promise.allSettled(
            topArtists.map((artist) =>
              getArtist(artist.id).then((data) => {
                const songs: any[] = data?.songs?.results ?? [];
                const tracks: Track[] = songs.slice(0, 10).map((s: any) => ({
                  id:        s.videoId ?? "",
                  title:     s.title   ?? "Unknown",
                  artist:    s.artists?.map((a: any) => a.name).join(", ") ?? artist.name,
                  thumbnail: s.thumbnails?.[s.thumbnails.length - 1]?.url ?? "",
                  album:     s.album?.name ?? "",
                  duration:  s.duration ?? null,
                })).filter((t) => t.id);
                return { artistName: artist.name, tracks, dotColor: DOT_COLORS[topArtists.indexOf(artist) % DOT_COLORS.length] };
              })
            )
          );
          setArtistSections(
            artistResults
              .filter((r): r is PromiseFulfilledResult<ArtistSection> => r.status === "fulfilled" && r.value.tracks.length > 0)
              .map((r) => r.value)
          );
        }

        // 4. Genre sections — text search is safe here (genre name, not ID)
        if (topGenres.length > 0) {
          const genreResults = await Promise.allSettled(
            topGenres.map((genre) =>
              searchMusic(`trending popular ${genre} songs`).then((tracks: Track[]) => ({
                label: `Trending ${genre}`,
                tracks: (tracks ?? []).slice(0, 10),
                dotColor: DOT_COLORS[(topArtists.length + topGenres.indexOf(genre)) % DOT_COLORS.length],
              }))
            )
          );
          setGenreSections(
            genreResults
              .filter((r): r is PromiseFulfilledResult<GenreSection> => r.status === "fulfilled" && r.value.tracks.length > 0)
              .map((r) => r.value)
          );
        }
      } catch (e) {
        console.error("Discover load error:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-8 pb-32 space-y-10">
        <div className="h-44 rounded-3xl bg-gray-100 animate-pulse mx-4 mt-4" />
        <div className="px-8 grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
        {[...Array(2)].map((_, s) => (
          <div key={s} className="space-y-4 px-8">
            <div className="h-5 w-40 bg-gray-100 rounded-full animate-pulse" />
            <div className="flex gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-40 shrink-0 space-y-2">
                  <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                  <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error && indiaCharts.length === 0 && globalCharts.length === 0) {
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

      {/* Hero */}
      <div className="relative px-8 pt-12 pb-10 mb-8 mx-4 mt-4 rounded-3xl overflow-hidden border border-gray-100">
        <div className="absolute top-[-60%] left-[-5%] w-80 h-80 bg-[#FFB703] rounded-full mix-blend-multiply filter blur-[90px] opacity-20 animate-pulse" />
        <div className="absolute bottom-[-60%] right-[-5%] w-80 h-80 bg-[#8ECAE6] rounded-full mix-blend-multiply filter blur-[90px] opacity-20 animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-black text-[#1A1A1A] tracking-tight mb-3"
          >
            Discover<span className="text-[#FFB703]">.</span>
          </motion.h1>
          <p className="text-gray-500 text-lg font-medium max-w-lg">
            Fresh picks based on your Taste DNA. Updated every session.
          </p>
        </div>
      </div>

      {/* Mood Quickplay */}
      <section className="px-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MOODS.map((mood) => (
            <div
              key={mood.key}
              onClick={() => handleMoodClick(mood.key, mood.query)}
              className="relative overflow-hidden rounded-2xl p-6 bg-white border border-gray-100 text-[#1A1A1A] font-bold cursor-pointer hover:-translate-y-1 transition-all shadow-sm group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${mood.hoverGrad} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <span className={`relative z-10 transition-opacity ${loadingMood === mood.key ? "opacity-0" : "opacity-100"}`}>{mood.label}</span>
              {loadingMood === mood.key && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <Loader2 size={20} className="animate-spin text-[#1A1A1A]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Charts */}
      {(indiaCharts.length > 0 || globalCharts.length > 0) && (
        <section className="px-8 mb-12 grid grid-cols-1 xl:grid-cols-2 gap-8">
          {indiaCharts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Flame className="text-orange-500" size={22} />
                <h2 className="text-2xl font-black text-[#1A1A1A]">Trending in India</h2>
              </div>
              <div className="flex flex-col gap-2">
                {indiaCharts.map((track, idx) => (
                  <ChartRow key={`in-${track.id}-${idx}`} track={track} idx={idx} queue={indiaCharts} />
                ))}
              </div>
            </div>
          )}
          {globalCharts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Globe className="text-blue-500" size={22} />
                <h2 className="text-2xl font-black text-[#1A1A1A]">Global Charts</h2>
              </div>
              <div className="flex flex-col gap-2">
                {globalCharts.map((track, idx) => (
                  <ChartRow key={`gl-${track.id}-${idx}`} track={track} idx={idx} queue={globalCharts} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Artist Sections — by exact UC artist id from taste_dna.top_artists */}
      {artistSections.map((section) => (
        <SectionCarousel
          key={section.artistName}
          label={`Because you love ${section.artistName}`}
          tracks={section.tracks}
          dotColor={section.dotColor}
        />
      ))}

      {/* Genre Sections */}
      {genreSections.map((section) => (
        <SectionCarousel
          key={section.label}
          label={section.label}
          tracks={section.tracks}
          dotColor={section.dotColor}
        />
      ))}

    </div>
  );
}
