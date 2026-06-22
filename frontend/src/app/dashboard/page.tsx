"use client";

import { useState, useEffect } from "react";
import { searchMusic, Track } from "@/lib/api";
import { usePlayer } from "@/context/PlayerContext";
import { SafeImage as Image } from "@/components/SafeImage";
import { Play, TrendingUp, Music2, Clock, Zap, Star, Radio, Disc3, Mic2, Users, ChevronRight, Flame, Sparkles } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { SongActions } from "@/components/SongActions";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Good Night";
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function getGreetingEmoji() {
  const h = new Date().getHours();
  if (h < 5) return "🌙";
  if (h < 12) return "☀️";
  if (h < 17) return "🌤️";
  return "🌆";
}

// Consistent left padding across the page
const PX = "px-8";

function SectionHeader({ title, icon, href }: { title: string; icon?: React.ReactNode; href?: string }) {
  return (
    <div className={`flex items-center justify-between mb-5 ${PX}`}>
      <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2.5">
        {icon}
        {title}
      </h2>
      {href && (
        <Link href={href} className="text-xs font-bold text-gray-400 hover:text-[#FFB703] flex items-center gap-1 transition-colors">
          See all <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

function ShelfRow({ title, icon, tracks, onPlay, href }: {
  title: string;
  icon?: React.ReactNode;
  tracks: Track[];
  onPlay: (t: Track, q: Track[]) => void;
  href?: string;
}) {
  if (!tracks || tracks.length === 0) return null;
  return (
    <section className="mb-10">
      <SectionHeader title={title} icon={icon} href={href} />
      <div className="relative">
        {/* left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        {/* right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollSnapType: "x mandatory", paddingLeft: "32px", paddingRight: "32px" }}>
          {tracks.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="group flex-shrink-0 w-44 cursor-pointer"
              style={{ scrollSnapAlign: "start" }}
            >
              <div
                className="relative w-44 h-44 rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-xl transition-all duration-300"
                onClick={() => onPlay(item, tracks)}
              >
                {item.thumbnail ? (
                  <Image src={item.thumbnail} alt={item.title || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Music2 size={40} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end justify-between p-3">
                  <div className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300" onClick={e => e.stopPropagation()}>
                    <SongActions track={item} size="sm" />
                  </div>
                  <div className="w-11 h-11 rounded-full bg-[#FFB703] flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Play size={18} fill="#1A1A1A" className="text-[#1A1A1A] ml-0.5" />
                  </div>
                </div>
              </div>
              <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{item.title}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{item.artist}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { playTrack } = usePlayer();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [madeForYou, setMadeForYou] = useState<Track[]>([]);
  const [jumpBackIn, setJumpBackIn] = useState<Track[]>([]);
  const [topMixes, setTopMixes] = useState<Track[]>([]);
  const [recommendedStations, setRecommendedStations] = useState<Track[]>([]);
  const [trendingNow, setTrendingNow] = useState<Track[]>([]);
  const [newReleases, setNewReleases] = useState<Track[]>([]);
  const [popularAlbums, setPopularAlbums] = useState<Track[]>([]);
  const [trendingInNetwork, setTrendingInNetwork] = useState<Track[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userDna, setUserDna] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const [profileRes, dnaRes, historyRes] = await Promise.allSettled([
            supabase.from("profiles").select("*").eq("id", session.user.id).single(),
            supabase.from("taste_dna").select("*").eq("user_id", session.user.id).single(),
            supabase.from("listening_history").select("*").eq("user_id", session.user.id).order("played_at", { ascending: false }).limit(20),
          ]);

          if (profileRes.status === "fulfilled" && profileRes.value.data) setUserProfile(profileRes.value.data);
          if (dnaRes.status === "fulfilled" && dnaRes.value.data) setUserDna(dnaRes.value.data);
          if (historyRes.status === "fulfilled" && historyRes.value.data) {
            const history = historyRes.value.data;
            const unique = Array.from(new Set(history.map((h: any) => h.track_id))).map(id => {
              const h = history.find((x: any) => x.track_id === id);
              return { id: h.track_id, title: h.track_title, artist: h.track_artist, thumbnail: h.track_thumbnail };
            });
            setRecentlyPlayed(unique as Track[]);
            setJumpBackIn([...unique].reverse() as Track[]);
          }
        }

        let dna = null;
        if (session) {
          const dnaRes = await supabase.from("taste_dna").select("*").eq("user_id", session.user.id).single();
          if (dnaRes.data) dna = dnaRes.data;
        }

        const topArtist = dna?.top_artists?.[0] || "top pop";
        const topGenre = dna?.top_genres?.[0] || "hits";
        const coreVibe = dna?.core_vibe ? dna.core_vibe.replace(/[^\w\s]/gi, '').trim() : "viral";

        const [mfyReq, topMixesReq, stationsReq, trendingReq, newReq, albumsReq, networkReq] = await Promise.allSettled([
          searchMusic(`${topArtist} top songs`),
          searchMusic(`${topGenre} trending mixes today`),
          searchMusic(`${coreVibe} radio stations`),
          searchMusic("global trending charts today"),
          searchMusic("latest new releases"),
          searchMusic("popular new albums"),
          searchMusic("viral trending songs today"),
        ]);

        if (mfyReq.status === "fulfilled") setMadeForYou(mfyReq.value.slice(0, 10));
        if (topMixesReq.status === "fulfilled") setTopMixes(topMixesReq.value.slice(0, 10));
        if (stationsReq.status === "fulfilled") setRecommendedStations(stationsReq.value.slice(0, 10));
        if (trendingReq.status === "fulfilled") setTrendingNow(trendingReq.value.slice(0, 12));
        if (newReq.status === "fulfilled") setNewReleases(newReq.value.slice(0, 10));
        if (albumsReq.status === "fulfilled") setPopularAlbums(albumsReq.value.slice(0, 10));
        if (networkReq.status === "fulfilled") setTrendingInNetwork(networkReq.value.slice(0, 10));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  if (loading) {
    return (
      <div className="p-8 pb-32 space-y-10">
        <div className="h-12 w-64 bg-gray-100 rounded-full animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
        {[1,2,3].map(row => (
          <div key={row} className="space-y-4">
            <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
            <div className="flex gap-4 overflow-hidden">
              {[1,2,3,4,5].map(i => <div key={i} className="w-44 h-44 bg-gray-100 rounded-2xl shrink-0 animate-pulse" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* ── Hero Header ── */}
      <div className={`${PX} pt-8 pb-6`} style={{ background: "linear-gradient(to bottom, rgba(255,183,3,0.08) 0%, transparent 100%)" }}>
        <p className="text-sm font-semibold text-gray-400 mb-1">{getGreetingEmoji()}</p>
        <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight mb-6">
          {getGreeting()}<span className="text-[#FFB703]">.</span>
        </h1>

        {/* Recently Played Quick Grid */}
        {recentlyPlayed.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentlyPlayed.slice(0, 8).map((track, idx) => (
              <div
                key={track.id + idx}
                onClick={() => playTrack(track, recentlyPlayed)}
                className="group flex items-center bg-white hover:bg-[#1A1A1A] border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <div className="w-14 h-14 shrink-0 relative bg-gray-100">
                  {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                    <Play size={18} fill="white" className="text-white opacity-0 group-hover:opacity-100 drop-shadow" />
                  </div>
                </div>
                <div className="px-3 flex-1 min-w-0">
                  <p className="font-bold text-[#1A1A1A] text-xs truncate group-hover:text-white transition-colors">{track.title}</p>
                  <p className="text-[11px] text-gray-500 truncate group-hover:text-white/60 transition-colors">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Vibe DNA Hero ── */}
      {userDna && userProfile && userDna.top_songs && (
        <div className={`${PX} mb-10`}>
          <div className="relative overflow-hidden rounded-3xl bg-[#1A1A1A] p-7 shadow-2xl flex flex-col md:flex-row md:items-center items-start justify-start gap-7 group">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#FFB703] rounded-full mix-blend-screen filter blur-[80px] opacity-25 group-hover:opacity-50 transition-opacity duration-700" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" />

            <div className="relative w-36 h-36 shrink-0 shadow-2xl rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
              <Image src={userDna.top_songs[0]?.thumbnail || "/icon.png"} alt="Vibe" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-black leading-tight">
                {userProfile.full_name?.split(' ')[0] || userProfile.username}'s Vibe
              </p>
            </div>

            <div className="flex-1 relative z-10 text-left min-w-0 w-full">
              <p className="text-[#FFB703] font-bold text-xs tracking-widest uppercase mb-1.5 flex items-center gap-1.5 justify-center md:justify-start">
                <Sparkles size={12} /> Taste DNA Playlist
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                Your {userDna.core_vibe?.replace(/[^\w\s]/gi, '') || "Daily"} Mix
              </h2>
              <p className="text-gray-400 text-sm max-w-md mb-5">
                Curated from {userDna.favorite_genres?.slice(0, 2).join(" & ") || "your listening habits"} — always fresh.
              </p>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <button
                  onClick={async () => {
                    // Quick personalized mix for home page
                    try {
                      const { data: { session } } = await supabase.auth.getSession();
                      let history = [];
                      if (session) {
                        const { data } = await supabase.from("listening_history").select("*").eq("user_id", session.user.id).order("played_at", { ascending: false }).limit(5);
                        history = data || [];
                      }
                      
                      const sources = [];
                      if (history.length > 0) sources.push(searchMusic(`${history[0].track_artist} hits`));
                      if (userDna.top_artists?.length > 0) sources.push(searchMusic(`${userDna.top_artists[0]} best songs`));
                      if (userDna.top_genres?.length > 0) sources.push(searchMusic(`${userDna.top_genres[0]} hits 2024`));
                      if (userDna.core_vibe) sources.push(searchMusic(`${userDna.core_vibe.replace(/[^\w\s]/gi, '').trim()} music`));
                      
                      const results = await Promise.all(sources);
                      const allTracks = results.flat();
                      
                      const unique = [];
                      const seen = new Set();
                      for (const t of allTracks) {
                        if (t && t.id && !seen.has(t.id)) { seen.add(t.id); unique.push(t); }
                      }
                      
                      const shuffled = unique.sort(() => Math.random() - 0.5).slice(0, 30);
                      if (shuffled.length > 0) {
                        playTrack(shuffled[0], shuffled);
                      } else {
                        playTrack(userDna.top_songs[0], userDna.top_songs);
                      }
                    } catch (e) {
                      playTrack(userDna.top_songs[0], userDna.top_songs);
                    }
                  }}
                  className="px-7 py-2.5 bg-[#FFB703] text-[#1A1A1A] rounded-full font-black text-sm hover:bg-[#ffc124] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-[#FFB703]/30 shrink-0"
                >
                  <Play size={16} fill="currentColor" /> Play Vibe
                </button>
                <Link href="/dashboard/taste-dna" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-sm backdrop-blur-md transition-all shrink-0">
                  View DNA
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Trending in Your Network ── */}
      <ShelfRow title="Trending In Your Network" icon={<Users size={20} className="text-indigo-500" />} tracks={trendingInNetwork} onPlay={playTrack} />

      {/* ── Made For You ── */}
      <ShelfRow title="Made For You" icon={<Zap size={20} className="text-[#FFB703]" />} tracks={madeForYou} onPlay={playTrack} />

      {/* ── Jump Back In ── */}
      <ShelfRow title="Jump Back In" icon={<Clock size={20} className="text-gray-400" />} tracks={jumpBackIn} onPlay={playTrack} />

      {/* ── Trending Now (Ranked List) ── */}
      {trendingNow.length > 0 && (
        <section className={`${PX} mb-10`}>
          <SectionHeader title="Trending Now" icon={<Flame size={20} className="text-orange-500" />} />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {trendingNow.map((track, idx) => (
              <div
                key={track.id + idx}
                onClick={() => playTrack(track, trendingNow)}
                className="group flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-100 hover:border-[#FFB703]/40 hover:shadow-md transition-all cursor-pointer"
              >
                <span className="text-2xl font-black text-gray-100 w-9 text-center tabular-nums leading-none shrink-0 group-hover:text-[#FFB703]/30 transition-colors">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover group-hover:scale-110 transition-transform duration-300" unoptimized />}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                    <Play size={14} fill="white" className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                  <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <SongActions track={track} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Your Top Mixes ── */}
      <ShelfRow title="Your Top Mixes" icon={<Star size={20} className="text-pink-500" />} tracks={topMixes} onPlay={playTrack} />

      {/* ── Recommended Stations ── */}
      <ShelfRow title="Recommended Stations" icon={<Radio size={20} className="text-emerald-500" />} tracks={recommendedStations} onPlay={playTrack} />

      {/* ── New Releases ── */}
      <ShelfRow title="New Releases" icon={<Sparkles size={20} className="text-violet-500" />} tracks={newReleases} onPlay={playTrack} />

      {/* ── Popular Albums ── */}
      <ShelfRow title="Popular Albums" icon={<Disc3 size={20} className="text-purple-500" />} tracks={popularAlbums} onPlay={playTrack} />
    </div>
  );
}
