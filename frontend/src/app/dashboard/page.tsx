"use client";

import { useState, useEffect } from "react";
import { searchMusic, getHomeMixes, getCharts, Track, searchArtists } from "@/lib/api";
import { usePlayer } from "@/context/PlayerContext";
import { SafeImage as Image } from "@/components/SafeImage";
import { Play, TrendingUp, Music2, Radio, Users, ChevronRight, Flame, Sparkles, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
const PX = "px-6 md:px-12 lg:px-20";
const supabase = createClient();

const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
};

const getGreetingEmoji = () => {
  const h = new Date().getHours();
  return h < 12 ? "🌅" : h < 17 ? "☀️" : "🌙";
};

// Helper Component for Section Headers
function SectionHeader({ title, icon, showMoreUrl }: { title: string, icon: React.ReactNode, showMoreUrl?: string }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${PX}`}>
      <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {showMoreUrl && (
        <Link href={showMoreUrl} className="text-xs font-bold text-gray-400 hover:text-[#1A1A1A] transition-colors flex items-center uppercase tracking-wider">
          View All <ChevronRight size={14} className="ml-0.5" />
        </Link>
      )}
    </div>
  );
}

// Helper Component for Track Shelf
function ShelfRow({ title, icon, tracks, showMoreUrl }: { title: string, icon: React.ReactNode, tracks: Track[], showMoreUrl?: string }) {
  const { playTrack } = usePlayer();
  if (!tracks || tracks.length === 0) return null;

  return (
    <section className="mb-10">
      <SectionHeader title={title} icon={icon} showMoreUrl={showMoreUrl} />
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4" style={{ scrollSnapType: "x mandatory", paddingLeft: "32px", paddingRight: "32px" }}>
          {tracks.map((track, idx) => (
            <div
              key={track.id + idx}
              onClick={() => playTrack(track, tracks)}
              className="group flex-shrink-0 w-[140px] md:w-[160px] flex flex-col cursor-pointer"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-xl transition-all duration-300 border border-gray-100">
                {track.thumbnail ? (
                  <Image src={track.thumbnail} alt={track.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Music2 size={32} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                  <div className="w-12 h-12 bg-[#FFB703] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                    <Play size={20} fill="#1A1A1A" className="text-[#1A1A1A] ml-1" />
                  </div>
                </div>
              </div>
              <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors px-1">{track.title}</p>
              <p className="text-xs text-gray-500 truncate px-1 mt-0.5">{track.artist}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Helper Component for Popular Artists
function PopularArtistsRow({ artists }: { artists: any[] }) {
  if (!artists || artists.length === 0) return null;
  return (
    <section className="mb-10">
      <SectionHeader title="Iconic Artists" icon={<Users size={20} className="text-pink-500" />} />
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollSnapType: "x mandatory", paddingLeft: "32px", paddingRight: "32px" }}>
          {artists.map((artist, idx) => (
            <Link
              href={`/dashboard/search?q=${encodeURIComponent(artist.name)}`}
              key={`${artist.id || artist.name}-${idx}`}
              className="group flex-shrink-0 w-36 flex flex-col items-center cursor-pointer"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="relative w-36 h-36 rounded-full overflow-hidden mb-3 shadow-sm group-hover:shadow-xl transition-all duration-300 border-4 border-white">
                {artist.image ? (
                  <Image src={artist.image} alt={artist.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                    <Users size={40} className="text-pink-300" />
                  </div>
                )}
              </div>
              <p className="font-bold text-[#1A1A1A] text-sm text-center group-hover:text-[#FFB703] transition-colors line-clamp-1 px-2">{artist.name}</p>
              <p className="text-xs text-gray-500 text-center mt-0.5">Artist</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { playTrack } = usePlayer();
  const [loading, setLoading] = useState(true);

  // User State
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userDna, setUserDna] = useState<any>(null);
  const [greeting, setGreeting] = useState("Welcome");
  const [greetingEmoji, setGreetingEmoji] = useState("👋");
  const [vibeGreeting, setVibeGreeting] = useState("Your Mix");

  // Feed State
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [jumpBackIn, setJumpBackIn] = useState<Track[]>([]);
  const [curatedForYou, setCuratedForYou] = useState<Track[]>([]);
  const [yourTopMixes, setYourTopMixes] = useState<Track[]>([]);
  const [trendingNow, setTrendingNow] = useState<Track[]>([]);
  const [freshDrops, setFreshDrops] = useState<Track[]>([]);
  const [popularArtists, setPopularArtists] = useState<any[]>([]);
  const [vibeLoading, setVibeLoading] = useState(false);

  useEffect(() => {
    setGreeting(getGreeting());
    setGreetingEmoji(getGreetingEmoji());
    const h = new Date().getHours();
    setVibeGreeting(h < 12 ? "Morning Energy" : h < 17 ? "Afternoon Vibes" : "Late Night Focus");
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        let localUserDna: any = null;
        let localRecentlyPlayed: Track[] = [];

        // 1. Fetch User Data (Profile, DNA, History)
        if (session) {
          const [profileRes, dnaRes, historyRes] = await Promise.allSettled([
            supabase.from("profiles").select("*").eq("id", session.user.id).single(),
            supabase.from("taste_dna").select("*").eq("user_id", session.user.id).single(),
            supabase.from("listening_history").select("track_id, track_title, track_artist, track_thumbnail").eq("user_id", session.user.id).order("played_at", { ascending: false }).limit(30),
          ]);

          if (profileRes.status === "fulfilled" && profileRes.value.data) {
            setUserProfile(profileRes.value.data);
          }
          
          if (historyRes.status === "fulfilled" && historyRes.value.data) {
            const history = historyRes.value.data;
            // Deduplicate history by track_id
            const unique = Array.from(new Set(history.map((h: any) => h.track_id))).map(id => {
              const h = history.find((x: any) => x.track_id === id);
              if (!h) return null;
              return { id: h.track_id, title: h.track_title, artist: h.track_artist, thumbnail: h.track_thumbnail || "" };
            }).filter(Boolean);
            localRecentlyPlayed = unique as Track[];
            setRecentlyPlayed(localRecentlyPlayed);
            setJumpBackIn([...localRecentlyPlayed].reverse()); // slight variation for shelf
          }
          
          if (dnaRes.status === "fulfilled" && dnaRes.value.data) {
            localUserDna = dnaRes.value.data;
            setUserDna(localUserDna);
          }
        }

        // 2. Fetch DNA Vibe Mix
        if (localUserDna) {
          setVibeLoading(true);
          getHomeMixes().then(vibe => {
            if (vibe && vibe.length > 0) {
              setCuratedForYou(vibe);
              setYourTopMixes(vibe.slice(15, 30));
            }
          }).catch(console.error).finally(() => setVibeLoading(false));
        } else {
          // If no DNA, just fetch generic home mixes
          getHomeMixes().then(vibe => {
            if (vibe && vibe.length > 0) {
              setCuratedForYou(vibe);
              setYourTopMixes(vibe.slice(15, 30));
            }
          }).catch(console.error);
        }

        // 3. Fetch Generic Home Feeds (Trending, Fresh Drops, Iconic Artists)
        const genre2 = localUserDna?.top_genres?.[1] || "desi hip hop";
        
        const [trendingRes, newRes] = await Promise.allSettled([
          getCharts("IN"),
          searchMusic(`latest ${genre2} new releases`),
        ]);

        if (trendingRes.status === "fulfilled" && trendingRes.value) {
          setTrendingNow(trendingRes.value);
        }
        if (newRes.status === "fulfilled" && newRes.value) {
          setFreshDrops(newRes.value);
        }

        // 4. Fetch Real Data for Iconic Artists
        const POPULAR_ARTIST_NAMES = ["Arijit Singh", "Shreya Ghoshal", "AR Rahman", "Diljit Dosanjh", "Karan Aujla", "Pritam", "Anirudh Ravichander", "Badshah"];
        Promise.allSettled(
          POPULAR_ARTIST_NAMES.map(name => searchArtists(name).then(res => res[0]))
        ).then(results => {
          const artists = results
            .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && !!r.value)
            .map(r => r.value);
          setPopularArtists(artists);
        });

      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase]);

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
                <Sparkles size={12} /> Taste DNA Playlist
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2 drop-shadow-lg">
                {vibeGreeting}
              </h2>
              <p className="text-white/80 text-sm max-w-md mb-5 drop-shadow-md">
                Your {userDna.core_vibe?.replace(/[^\w\s]/gi, '') || "Daily"} mix, curated from {(typeof userDna.top_artists?.[0] === 'object' ? userDna.top_artists[0].name : userDna.top_artists?.[0]) || "your favorites"} & {(typeof userDna.top_artists?.[1] === 'object' ? userDna.top_artists[1].name : userDna.top_artists?.[1]) || "recent history"}.
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

      {/* ── Jump Back In ── */}
      {jumpBackIn.length > 0 && (
         <ShelfRow 
           title="Jump Back In" 
           icon={<Music2 size={20} className="text-blue-500" />} 
           tracks={jumpBackIn} 
         />
      )}

      {/* ── Curated For You ── */}
      <ShelfRow 
        title="Curated For You" 
        icon={<Sparkles size={20} className="text-[#FFB703]" />} 
        tracks={curatedForYou} 
      />

      {/* ── Trending Right Now ── */}
      <ShelfRow 
        title="Trending Right Now" 
        icon={<TrendingUp size={20} className="text-green-500" />} 
        tracks={trendingNow} 
      />

      {/* ── Iconic Artists ── */}
      <PopularArtistsRow artists={popularArtists} />

      {/* ── Your Top Mixes ── */}
      <ShelfRow 
        title="Your Top Mixes" 
        icon={<Radio size={20} className="text-purple-500" />} 
        tracks={yourTopMixes} 
      />

      {/* ── Fresh Drops ── */}
      <ShelfRow 
        title="Fresh Drops" 
        icon={<Flame size={20} className="text-red-500" />} 
        tracks={freshDrops} 
      />

    </div>
  );
}
