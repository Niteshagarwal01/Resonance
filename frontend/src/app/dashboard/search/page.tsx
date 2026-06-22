"use client";

import { useState, useEffect, useRef } from "react";
import { searchMusic, searchArtists, Track } from "@/lib/api";
import { usePlayer } from "@/context/PlayerContext";
import { SafeImage as Image } from "@/components/SafeImage";
import { Search, Play, Mic2, Music2, X, Clock, TrendingUp, Disc3, Flame } from "lucide-react";
import Link from "next/link";
import { SongActions } from "@/components/SongActions";

// Spotify-style category cards with rich gradients
const CATEGORIES = [
  { name: "Hip-Hop", query: "hip hop hits", gradient: "from-orange-500 to-amber-600", emoji: "🎤" },
  { name: "Pop", query: "pop songs 2024", gradient: "from-pink-500 to-rose-400", emoji: "🌸" },
  { name: "Indie", query: "indie alternative music", gradient: "from-emerald-500 to-teal-400", emoji: "🎸" },
  { name: "Electronic", query: "electronic dance music", gradient: "from-blue-500 to-cyan-400", emoji: "🎛️" },
  { name: "R&B", query: "rnb soul music", gradient: "from-indigo-500 to-violet-500", emoji: "🎶" },
  { name: "Rock", query: "rock music best", gradient: "from-red-600 to-orange-500", emoji: "🤘" },
  { name: "Classical", query: "classical piano music", gradient: "from-slate-600 to-gray-500", emoji: "🎹" },
  { name: "Jazz", query: "jazz lounge music", gradient: "from-amber-600 to-yellow-500", emoji: "🎷" },
  { name: "Workout", query: "workout motivation music", gradient: "from-lime-500 to-emerald-500", emoji: "💪" },
  { name: "Chill", query: "lofi chill beats study", gradient: "from-sky-400 to-blue-500", emoji: "😌" },
  { name: "Desi", query: "bollywood hindi hits", gradient: "from-orange-400 to-pink-500", emoji: "🪘" },
  { name: "Party", query: "party hits dance", gradient: "from-fuchsia-500 to-purple-500", emoji: "🎉" },
];

const TRENDING_QUERIES = [
  "AP Dhillon latest", "Aditya Rikhari 2024", "King hindi songs",
  "Bollywood top hits", "The Weeknd hits", "Drake best songs",
];

type SearchTab = "songs" | "artists";

export default function SearchPage() {
  const { playTrack } = usePlayer();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("songs");
  const [songResults, setSongResults] = useState<Track[]>([]);
  const [artistResults, setArtistResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryTracks, setCategoryTracks] = useState<Track[]>([]);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  // Execute search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSongResults([]);
      setArtistResults([]);
      return;
    }
    const run = async () => {
      setLoading(true);
      try {
        const [songs, artists] = await Promise.all([
          searchMusic(debouncedQuery),
          searchArtists(debouncedQuery),
        ]);
        setSongResults(songs);
        setArtistResults(artists);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [debouncedQuery]);

  const browseCategory = async (cat: typeof CATEGORIES[0]) => {
    setCategoryName(cat.name);
    setCategoryLoading(true);
    setCategoryTracks([]);
    setQuery("");
    try {
      const tracks = await searchMusic(cat.query);
      setCategoryTracks(tracks);
    } finally {
      setCategoryLoading(false);
    }
  };

  const isSearching = !!debouncedQuery.trim();
  const showCategory = !isSearching && categoryName;
  const showBrowse = !isSearching && !categoryName;

  return (
    <div className="pb-32 min-h-screen">
      {/* ── SEARCH HEADER (HERO) ── */}
      <div className="sticky top-0 z-20 bg-[#FDFBF7]/90 backdrop-blur-2xl border-b border-gray-100 px-8 py-6">
        <h1 className="text-4xl font-black text-[#1A1A1A] mb-5">Search</h1>
        <div className="relative w-full group">
          {/* Animated gradient border on focus */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFB703] to-pink-400 rounded-full blur opacity-0 group-focus-within:opacity-50 transition duration-500" />
          <div className="relative flex items-center w-full bg-white rounded-full shadow-md border border-gray-100">
            <Search className="absolute left-6 text-gray-400" size={24} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What do you want to listen to?"
              className="w-full bg-transparent py-4 pl-16 pr-14 text-lg font-bold text-[#1A1A1A] placeholder:text-gray-400 placeholder:font-medium focus:outline-none rounded-full"
            />
            {query && (
              <button 
                onClick={() => { setQuery(""); setCategoryName(null); inputRef.current?.focus(); }} 
                className="absolute right-5 p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-[#1A1A1A] transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 pt-8">

        {/* ── SEARCH RESULTS ── */}
        {isSearching && (
          <div>
            {/* Tab switcher */}
            <div className="flex gap-2 mb-8 border-b border-gray-100 pb-2">
              {(["songs", "artists"] as SearchTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-full text-sm font-black transition-all capitalize ${
                    activeTab === tab
                      ? "bg-[#1A1A1A] text-white shadow-md shadow-[#1A1A1A]/20 scale-105"
                      : "bg-white text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#FFB703]/20 border-t-[#FFB703] rounded-full animate-spin" />
              </div>
            ) : activeTab === "songs" ? (
              <div>
                {songResults.length === 0 ? (
                  <div className="py-24 text-center">
                    <Music2 size={64} className="text-gray-200 mx-auto mb-6" />
                    <p className="text-xl font-black text-[#1A1A1A]">No results found</p>
                    <p className="text-gray-500 mt-2">Try searching for something else.</p>
                  </div>
                ) : (
                  <div>
                    {/* Top Result Spotlight */}
                    {songResults[0] && (
                      <div className="mb-10 grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8">
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5"><Sparkles size={14}/> Top Result</p>
                          <div
                            onClick={() => playTrack(songResults[0], songResults)}
                            className="group bg-white rounded-[2rem] p-8 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                          >
                            {/* Hover background blob */}
                            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#FFB703] rounded-full mix-blend-multiply filter blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
                            
                            <div className="relative w-32 h-32 rounded-2xl overflow-hidden mb-6 shadow-xl group-hover:scale-105 transition-transform duration-500">
                              {songResults[0].thumbnail ? (
                                <Image src={songResults[0].thumbnail} alt="" fill className="object-cover" unoptimized />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center"><Music2 className="text-gray-300" size={40}/></div>
                              )}
                            </div>
                            <h3 className="text-3xl font-black text-[#1A1A1A] group-hover:text-[#FFB703] transition-colors truncate">{songResults[0].title}</h3>
                            <p className="text-gray-500 font-medium text-lg mt-1">{songResults[0].artist}</p>
                            
                            <div className="absolute bottom-8 right-8">
                              <div className="w-16 h-16 rounded-full bg-[#FFB703] flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                <Play size={28} fill="#1A1A1A" className="text-[#1A1A1A] ml-1.5" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Songs</p>
                          <div className="space-y-1">
                            {songResults.slice(0, 6).map((track, idx) => (
                              <div
                                key={track.id + idx}
                                onClick={() => playTrack(track, songResults)}
                                className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100"
                              >
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100 shadow-sm">
                                  {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                                    <Play size={16} fill="white" className="text-white opacity-0 group-hover:opacity-100" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-[#1A1A1A] text-[15px] truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                                  <p className="text-[13px] text-gray-500 truncate">{track.artist}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <SongActions track={track} size="sm" />
                                  </div>
                                  <span className="text-xs text-gray-400 font-medium tabular-nums w-10 text-right">{track.duration || "—"}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Full results list */}
                    {songResults.length > 6 && (
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 border-t border-gray-100 pt-6">More Songs</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {songResults.slice(6).map((track, idx) => (
                            <div
                              key={track.id + idx}
                              onClick={() => playTrack(track, songResults)}
                              className="group flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-50 hover:border-[#FFB703]/30 hover:shadow-md transition-all cursor-pointer"
                            >
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                                {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                                  <Play size={16} fill="white" className="text-white opacity-0 group-hover:opacity-100" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                                <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                <SongActions track={track} size="sm" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Artists tab
              <div>
                {artistResults.length === 0 ? (
                  <div className="py-24 text-center">
                    <Mic2 size={64} className="text-gray-200 mx-auto mb-6" />
                    <p className="text-xl font-black text-[#1A1A1A]">No artists found</p>
                    <p className="text-gray-500 mt-2">Try searching for a different artist name.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {artistResults.map((artist) => (
                      <Link
                        key={artist.id}
                        href={`/dashboard/artist/${artist.id}`}
                        className="group flex flex-col items-center text-center cursor-pointer"
                      >
                        <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4 bg-gray-100 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                          {artist.image ? (
                            <Image src={artist.image} alt={artist.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <Mic2 size={48} className="text-gray-300" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </div>
                        <p className="font-black text-[#1A1A1A] text-base truncate w-full group-hover:text-[#FFB703] transition-colors">{artist.name}</p>
                        <p className="text-xs font-bold text-gray-400 mt-0.5">Artist</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CATEGORY BROWSE RESULT ── */}
        {showCategory && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <button
                  onClick={() => setCategoryName(null)}
                  className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#1A1A1A] transition-colors flex items-center gap-1.5 mb-2"
                >
                  <Clock size={12} className="rotate-180" /> Back to Search
                </button>
                <h2 className="text-5xl font-black text-[#1A1A1A] tracking-tight">{categoryName}</h2>
              </div>
              {categoryTracks.length > 0 && (
                <button
                  onClick={() => playTrack(categoryTracks[0], categoryTracks)}
                  className="flex items-center gap-2 bg-[#FFB703] text-[#1A1A1A] px-8 py-3.5 rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#FFB703]/30"
                >
                  <Play size={18} fill="currentColor" /> Play All
                </button>
              )}
            </div>

            {categoryLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-square rounded-[2rem] bg-gray-100 animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {categoryTracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, categoryTracks)}
                    className="group cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 bg-gray-100 shadow-md group-hover:shadow-2xl transition-all duration-500">
                      {track.thumbnail && (
                        <Image src={track.thumbnail} alt={track.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <div className="flex items-center justify-between transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <div onClick={e => e.stopPropagation()}>
                            <SongActions track={track} size="sm" />
                          </div>
                          <div className="w-12 h-12 rounded-full bg-[#FFB703] flex items-center justify-center shadow-xl">
                            <Play size={20} fill="#1A1A1A" className="text-[#1A1A1A] ml-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="font-bold text-[#1A1A1A] text-[15px] truncate group-hover:text-[#FFB703] transition-colors px-1">{track.title}</p>
                    <p className="text-[13px] text-gray-500 truncate mt-0.5 px-1">{track.artist}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BROWSE ALL ── */}
        {showBrowse && (
          <div className="animate-in fade-in duration-500">
            {/* Trending searches row */}
            <div className="mb-12">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
                <Flame size={16} className="text-orange-500" /> Trending Searches
              </h2>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {TRENDING_QUERIES.map((q, i) => (
                  <button
                    key={q}
                    onClick={() => setQuery(q)}
                    className="shrink-0 flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 shadow-sm rounded-full text-[13px] font-bold text-[#1A1A1A] hover:border-[#FFB703] hover:text-[#FFB703] hover:shadow-md transition-all duration-300"
                  >
                    <TrendingUp size={14} className="text-gray-400 group-hover:text-[#FFB703]" /> {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Category grid */}
            <div>
              <h2 className="text-xl font-black text-[#1A1A1A] mb-6">Browse All</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => browseCategory(cat)}
                    className={`group relative bg-gradient-to-br ${cat.gradient} rounded-[2rem] p-6 text-left overflow-hidden h-40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md hover:shadow-xl`}
                  >
                    {/* Noise overlay for texture */}
                    <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }} />
                    
                    <span className="absolute bottom-5 left-6 text-white font-black text-xl leading-tight block drop-shadow-md z-10">{cat.name}</span>
                    
                    {/* Large emoji floating in top right */}
                    <div className="absolute -top-2 -right-4 text-6xl opacity-90 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 drop-shadow-xl">
                      {cat.emoji}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
