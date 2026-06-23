"use client";

import { useEffect, useState, ReactNode } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { SafeImage as Image } from "@/components/SafeImage";
import { Play, TrendingUp, Music2, Radio, Flame, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useDashboardFeeds } from "@/hooks/useDashboardFeeds";
import { ShelfRow } from "@/components/ShelfRow";
import { PopularArtistsRow } from "@/components/PopularArtistsRow";
import { PopularAlbumsRow } from "@/components/PopularAlbumsRow";
import { SongActions } from "@/components/SongActions";

const PX = "px-6 md:px-12 lg:px-20";

const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
};

const getGreetingEmoji = () => {
  const h = new Date().getHours();
  return h < 12 ? "🌅" : h < 17 ? "☀️" : "🌙";
};

export default function HomePage() {
  const { playTrack, currentTrack } = usePlayer();
  const {
    loading,
    feedErrors,
    userProfile,
    userDna,
    recentlyPlayed,
    setRecentlyPlayed,
    jumpBackIn,
    setJumpBackIn,
    curatedForYou,
    editorsPicks,
    popularAlbums,
    trendingInGenre,
    yourTopMixes,
    trendingNow,
    freshDrops,
    popularArtists,
    vibeLoading
  } = useDashboardFeeds();

  const [greeting, setGreeting] = useState("Welcome");
  const [greetingEmoji, setGreetingEmoji] = useState("👋");
  const [vibeGreeting, setVibeGreeting] = useState("Your Mix");

  useEffect(() => {
    setGreeting(getGreeting());
    setGreetingEmoji(getGreetingEmoji());
    const h = new Date().getHours();
    setVibeGreeting(h < 12 ? "Morning Energy" : h < 17 ? "Afternoon Vibes" : "Late Night Focus");
  }, []);

  useEffect(() => {
    if (currentTrack) {
      setRecentlyPlayed(prev => {
        const filtered = prev.filter(t => t.id !== currentTrack.id);
        const newHistory = [currentTrack, ...filtered];
        setJumpBackIn([...newHistory].reverse());
        return newHistory;
      });
    }
  }, [currentTrack, setRecentlyPlayed, setJumpBackIn]);

  let dnaText = "your unique acoustic fingerprint & recent history";
  if (userDna?.top_genres && userDna.top_genres.length > 0) {
    const genres = userDna.top_genres.slice(0, 2).map((g: any) => typeof g === 'object' ? g.name : g);
    if (genres.length === 1) dnaText = genres[0];
    else dnaText = `${genres[0]} & ${genres[1]}`;
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-[#1A1A1A]">
        <div className="relative">
          <div className="absolute inset-0 bg-[#FFB703] blur-xl opacity-30 animate-pulse rounded-full" />
          <Loader2 size={48} className="animate-spin text-[#FFB703] relative z-10" />
        </div>
        <p className="mt-4 font-bold tracking-widest uppercase text-sm text-gray-500 animate-pulse">Curating your experience...</p>
      </div>
    );
  }

  const renderSection = (errorKey: string, data: any[], renderFn: () => ReactNode) => {
    if (feedErrors[errorKey]) {
      return <div className={`${PX} mb-6 text-red-500 text-sm bg-red-50 p-3 rounded-xl`}>Failed to load: {feedErrors[errorKey]}</div>;
    }
    if (!data || data.length === 0) return null;
    return renderFn();
  };

  return (
    <div className="pb-32 bg-white min-h-screen">
      
      {/* ── Hero Header ── */}
      <div className={`${PX} pt-8 pb-6`} style={{ background: "linear-gradient(to bottom, rgba(255,183,3,0.08) 0%, transparent 100%)" }}>
        <p className="text-sm font-semibold text-gray-400 mb-1">{greetingEmoji}</p>
        <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight mb-6">
          {greeting}<span className="text-[#FFB703]">.</span>
        </h1>

        {/* Conditional Top Section: History Grid vs Getting Started Banner */}
        {recentlyPlayed.length > 0 ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Recently Played</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recentlyPlayed.slice(0, 8).map((track, idx) => (
                <div
                  key={`rp-${track.id}-${idx}`}
                  onClick={() => playTrack(track, recentlyPlayed)}
                  className="group flex items-center bg-white hover:bg-[#1A1A1A] border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <div className="w-14 h-14 shrink-0 relative bg-gray-100 flex items-center justify-center">
                    {track.thumbnail ? (
                       <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />
                    ) : (
                       <Music2 size={20} className="text-gray-400" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                      <Play size={18} fill="white" className="text-white opacity-0 group-hover:opacity-100 drop-shadow" />
                    </div>
                  </div>
                  <div className="px-3 flex-1 min-w-0">
                    <p className="font-bold text-[#1A1A1A] text-xs truncate group-hover:text-white transition-colors">{track.title}</p>
                    <p className="text-[11px] text-gray-500 truncate group-hover:text-gray-400 transition-colors">{track.artist}</p>
                  </div>
                  <div className="pr-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <SongActions track={track} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-[#FFB703] to-orange-400 rounded-3xl p-8 shadow-lg text-[#1A1A1A] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-2">Ready to discover new music?</h2>
                <p className="text-[#1A1A1A]/80 font-medium max-w-md">Your listening history is empty. Start playing songs to see them here and get better recommendations.</p>
              </div>
              <Link href="/dashboard/search" className="relative z-10 bg-[#1A1A1A] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shrink-0 shadow-xl flex items-center gap-2">
                <Sparkles size={18} />
                Explore Now
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Vibe DNA Hero ── */}
      {userDna && userProfile && userDna.top_songs && (
        <div className={`${PX} mb-12`}>
          <div className="relative overflow-hidden rounded-3xl bg-[#1A1A1A]/90 backdrop-blur-xl border border-white/10 p-7 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] flex flex-col md:flex-row md:items-center items-start justify-start gap-7 group">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#FFB703] rounded-full mix-blend-overlay filter blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity duration-700 animate-pulse" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-500 rounded-full mix-blend-overlay filter blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity duration-700 animate-pulse" />

            <div className="relative w-36 h-36 shrink-0 shadow-2xl rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
              <Image src={userDna.top_songs[0]?.thumbnail || "/icon.png"} alt="Vibe" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-black leading-tight">
                {userProfile.full_name?.split(' ')[0] || userProfile.username}'s Vibe
              </p>
            </div>

            <div className="flex-1 relative z-10 text-left min-w-0 w-full">
              <p className="text-[#FFB703] font-bold text-xs tracking-widest uppercase mb-1.5 flex items-center gap-1.5 justify-center md:justify-start">
                <Sparkles size={12} /> Taste DNA 40-Song Mix
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2 drop-shadow-lg">
                {vibeGreeting}
              </h2>
              <p className="text-white/80 text-sm max-w-md mb-5 drop-shadow-md">
                A hyper-personalized {userDna.core_vibe?.replace(/[^\w\s]/gi, '') || "Daily"} mix powered by your Taste DNA, blending {dnaText} with your daily rotation.
              </p>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <button
                  disabled={vibeLoading || curatedForYou.length === 0}
                  onClick={() => playTrack(curatedForYou[0], curatedForYou)}
                  className="bg-[#FFB703] text-[#1A1A1A] px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
                >
                  {vibeLoading ? <Loader2 size={16} className="animate-spin text-black" /> : <Play size={16} fill="black" />}
                  {vibeLoading ? "Generating..." : "Play Your Vibe"}
                </button>
                <Link href="/dashboard/taste-dna" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-6 py-2.5 rounded-full font-bold text-sm transition-colors backdrop-blur-md">
                  View DNA
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Shelves rendering using unified configuration array */}
      {renderSection('jumpBackIn', jumpBackIn, () => (
        <ShelfRow title="Jump Back In" icon={<Music2 size={20} className="text-blue-500" />} tracks={jumpBackIn} />
      ))}
      
      {renderSection('curatedForYou', curatedForYou, () => (
        <ShelfRow title="Curated For You" icon={<Sparkles size={20} className="text-[#FFB703]" />} tracks={curatedForYou} showMoreUrl="/dashboard/feed/curated" />
      ))}
      
      {renderSection('editorsPicks', editorsPicks, () => (
        <ShelfRow title="Editor's Picks" icon={<Sparkles size={20} className="text-pink-500" />} tracks={editorsPicks} showMoreUrl="/dashboard/feed/editors" />
      ))}
      
      {renderSection('trendingNow', trendingNow, () => (
        <ShelfRow title="Trending Right Now" icon={<TrendingUp size={20} className="text-green-500" />} tracks={trendingNow} showMoreUrl="/dashboard/feed/trending" />
      ))}
      
      {renderSection('trendingInGenre', trendingInGenre, () => (
        <ShelfRow title={`Trending in ${userDna?.top_genres?.[0] || 'Pop'}`} icon={<Flame size={20} className="text-orange-500" />} tracks={trendingInGenre} showMoreUrl="/dashboard/feed/genre" />
      ))}
      
      {renderSection('popularAlbums', popularAlbums, () => (
        <PopularAlbumsRow albums={popularAlbums} showMoreUrl="/dashboard/feed/albums" />
      ))}
      
      {renderSection('popularArtists', popularArtists, () => (
        <PopularArtistsRow artists={popularArtists} showMoreUrl="/dashboard/feed/artists" />
      ))}
      
      {renderSection('yourTopMixes', yourTopMixes, () => (
        <ShelfRow title="Your Top Mixes" icon={<Radio size={20} className="text-purple-500" />} tracks={yourTopMixes} showMoreUrl="/dashboard/feed/mixes" />
      ))}
      
      {renderSection('freshDrops', freshDrops, () => (
        <ShelfRow title="New Releases For You" icon={<Flame size={20} className="text-red-500" />} tracks={freshDrops} showMoreUrl="/dashboard/feed/fresh" />
      ))}

    </div>
  );
}
