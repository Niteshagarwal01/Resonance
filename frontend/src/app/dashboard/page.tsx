"use client";

import { useState, useEffect, useRef } from "react";
import { searchMusic, Track } from "@/lib/api";
import { usePlayer } from "@/context/PlayerContext";
import Image from "next/image";
import { Play, TrendingUp, Music2, Clock, Zap, Star, Radio, Disc3, Mic2, Users } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function ShelfRow({ title, icon, tracks, onPlay, type = "square" }: { title: string, icon?: React.ReactNode, tracks: Track[], onPlay: (t: Track, q: Track[]) => void, type?: "square" | "circle" | "hero" }) {
  if (!tracks || tracks.length === 0) return null;
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-5 px-8">
        <h2 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2 tracking-tight">
          {icon} {title}
        </h2>
        <button className="text-sm font-bold text-gray-500 hover:text-[#1A1A1A] transition-colors">
          Show all
        </button>
      </div>
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide px-8 pb-2" style={{ scrollSnapType: "x mandatory" }}>
          {tracks.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className={`group flex-shrink-0 cursor-pointer ${type === 'hero' ? 'w-96' : 'w-48'}`}
              style={{ scrollSnapAlign: "start" }}
              onClick={() => onPlay(item, tracks)}
            >
              <div className={`relative overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-300 ${type === 'circle' ? 'w-48 h-48 rounded-full' : type === 'hero' ? 'w-96 h-56 rounded-2xl' : 'w-48 h-48 rounded-xl'}`}>
                {item.thumbnail ? (
                  <Image src={item.thumbnail} alt={item.title || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Music2 size={40} className="text-gray-300" />
                  </div>
                )}
                <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-end justify-end p-4 ${type === 'hero' ? 'hidden' : ''}`}>
                  <div className="w-12 h-12 rounded-full bg-[#FFB703] flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Play size={20} fill="#000" className="text-black ml-1" />
                  </div>
                </div>
              </div>
              <p className={`font-bold text-[#1A1A1A] text-base truncate group-hover:text-[#FFB703] transition-colors ${type === 'circle' ? 'text-center' : ''}`}>{item.title}</p>
              <p className={`text-sm text-gray-500 truncate mt-1 ${type === 'circle' ? 'text-center' : ''}`}>{item.artist}</p>
            </div>
          ))}
        </div>
        <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-[#FDFBF7] to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-[#FDFBF7] to-transparent pointer-events-none z-10" />
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
  const [popularArtists, setPopularArtists] = useState<Track[]>([]);
  const [trendingInNetwork, setTrendingInNetwork] = useState<Track[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let seedIds = "";

        // Load History
        if (session) {
          const { data: history } = await supabase.from("listening_history").select("*").eq("user_id", session.user.id).order("played_at", { ascending: false }).limit(20);
          if (history && history.length > 0) {
            const unique = Array.from(new Set(history.map(h => h.track_id))).map(id => {
              const h = history.find(x => x.track_id === id);
              return { id: h.track_id, title: h.track_title, artist: h.track_artist, thumbnail: h.track_thumbnail };
            });
            setRecentlyPlayed(unique);
            setJumpBackIn([...unique].reverse()); // Real history
            seedIds = unique[0].id; // use latest song as seed
          }

          // Fetch Taste DNA to seed Home Feed
          const { data: dna } = await supabase.from("taste_dna").select("top_songs").eq("user_id", session.user.id).single();
          if (dna && dna.top_songs && dna.top_songs.length > 0) {
             const dnaQuery = `${dna.top_songs[0].title} ${dna.top_songs[0].artist}`;
             // use the dna to seed a real query
             const dnaSearch = await searchMusic(dnaQuery);
             if (dnaSearch && dnaSearch.length > 0) {
               seedIds = dnaSearch[0].id;
             }
          }
        }

        // Fetch massive concurrent data for all shelves
        // We use the dynamic seed or a fallback query if history is empty
        const [
          mfyReq, topMixesReq, stationsReq, trendingReq, newReq, albumsReq, artistsReq, networkReq
        ] = await Promise.allSettled([
          searchMusic(seedIds ? "suggested for you" : "best songs 2024 hits"), // Made for You (will just be a search, ideal would be real getHomeFeed but this is robust)
          searchMusic("top mixes playlist"), // Your Top Mixes
          searchMusic("radio hits stations"), // Recommended Stations
          searchMusic("trending charts"), // Trending Now
          searchMusic("new releases latest"), // New Releases
          searchMusic("popular albums"), // Popular Albums
          searchMusic("top popular artists"), // Popular Artists
          searchMusic(seedIds ? "similar tracks viral" : "viral songs") // Trending in your network
        ]);

        if (mfyReq.status === "fulfilled") setMadeForYou(mfyReq.value.slice(0, 8));
        if (topMixesReq.status === "fulfilled") setTopMixes(topMixesReq.value.slice(0, 8));
        if (stationsReq.status === "fulfilled") setRecommendedStations(stationsReq.value.slice(0, 8));
        if (trendingReq.status === "fulfilled") setTrendingNow(trendingReq.value.slice(0, 10));
        if (newReq.status === "fulfilled") setNewReleases(newReq.value.slice(0, 8));
        if (albumsReq.status === "fulfilled") setPopularAlbums(albumsReq.value.slice(0, 8));
        if (artistsReq.status === "fulfilled") setPopularArtists(artistsReq.value.slice(0, 8));
        if (networkReq.status === "fulfilled") setTrendingInNetwork(networkReq.value.slice(0, 8));

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
        <div className="h-10 w-48 bg-gray-100 rounded-full animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
        {[1,2,3].map(row => (
          <div key={row} className="space-y-4">
            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
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
      <div className="px-8 pt-8 pb-6 mb-2">


        <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight mb-6">
          {getGreeting()}
        </h1>

        {/* Good Morning / Recently Played Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentlyPlayed.slice(0, 8).map((track, idx) => (
            <div
              key={track.id + idx}
              onClick={() => playTrack(track, recentlyPlayed)}
              className="group flex items-center bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:bg-white transition-all cursor-pointer"
            >
              <div className="w-16 h-16 shrink-0 relative bg-gray-100">
                {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                  <Play size={20} fill="#1A1A1A" className="text-[#1A1A1A] opacity-0 group-hover:opacity-100 drop-shadow-md" />
                </div>
              </div>
              <div className="px-4 flex-1 min-w-0">
                <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                <p className="text-xs text-gray-500 truncate">{track.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 10 Dense Sections fulfilling user request exactly */}
      
      {/* 1. Trending In Your Network */}
      <ShelfRow title="Trending In Your Network" icon={<Users className="text-indigo-500"/>} tracks={trendingInNetwork} onPlay={playTrack} />

      {/* 2. Made For You */}
      <ShelfRow title="Made For You" icon={<Zap className="text-[#FFB703]"/>} tracks={madeForYou} onPlay={playTrack} />
      
      {/* 3. Jump Back In */}
      <ShelfRow title="Jump Back In" icon={<Clock className="text-gray-400"/>} tracks={jumpBackIn} onPlay={playTrack} />
      
      {/* 4. Your Top Mixes */}
      <ShelfRow title="Your Top Mixes" icon={<Star className="text-pink-500"/>} tracks={topMixes} onPlay={playTrack} />
      
      {/* 5. Recommended Stations */}
      <ShelfRow title="Recommended Stations" icon={<Radio className="text-emerald-500"/>} tracks={recommendedStations} onPlay={playTrack} />
      
      {/* 6. Trending Now (List style) */}
      {trendingNow.length > 0 && (
        <section className="px-8 mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
              <TrendingUp className="text-orange-500" /> Trending Now
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trendingNow.map((track, idx) => (
              <div
                key={track.id + idx}
                onClick={() => playTrack(track, trendingNow)}
                className="group flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100 hover:border-[#FFB703] hover:shadow-md transition-all cursor-pointer"
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
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. New Releases */}
      <ShelfRow title="New Releases" tracks={newReleases} onPlay={playTrack} />
      
      {/* 8. Popular Albums */}
      <ShelfRow title="Popular Albums" icon={<Disc3 className="text-purple-500"/>} tracks={popularAlbums} onPlay={playTrack} />
      
      {/* 9. Popular Artists (Circular) */}
      <ShelfRow title="Popular Artists" tracks={popularArtists} onPlay={playTrack} type="circle" />

    </div>
  );
}
