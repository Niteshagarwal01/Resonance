"use client";

import { useState, useEffect, useRef } from "react";
import { searchMusic, searchArtists, Track } from "@/lib/api";
import { usePlayer } from "@/context/PlayerContext";
import Image from "next/image";
import { Search, Play, Mic2, Music2, X, Clock, TrendingUp, Disc3 } from "lucide-react";
import Link from "next/link";

// Spotify-style category cards with gradients
const CATEGORIES = [
  { name: "Hip-Hop", query: "hip hop hits", gradient: "from-orange-500 to-yellow-400", emoji: "🎤" },
  { name: "Pop", query: "pop songs 2024", gradient: "from-pink-500 to-rose-400", emoji: "🌸" },
  { name: "Indie", query: "indie alternative music", gradient: "from-green-500 to-teal-400", emoji: "🎸" },
  { name: "Electronic", query: "electronic dance music", gradient: "from-blue-500 to-cyan-400", emoji: "🎛️" },
  { name: "R&B", query: "rnb soul music", gradient: "from-purple-600 to-violet-500", emoji: "🎶" },
  { name: "Rock", query: "rock music best", gradient: "from-red-600 to-orange-500", emoji: "🤘" },
  { name: "Classical", query: "classical piano music", gradient: "from-slate-500 to-gray-400", emoji: "🎹" },
  { name: "Jazz", query: "jazz lounge music", gradient: "from-amber-600 to-yellow-500", emoji: "🎷" },
  { name: "Workout", query: "workout motivation music", gradient: "from-lime-500 to-green-400", emoji: "💪" },
  { name: "Chill", query: "lofi chill beats study", gradient: "from-sky-500 to-blue-400", emoji: "😌" },
  { name: "Desi", query: "bollywood hindi hits", gradient: "from-saffron-500 to-orange-400 bg-gradient-to-r from-orange-400 to-pink-500", emoji: "🪘" },
  { name: "Party", query: "party hits dance", gradient: "from-fuchsia-500 to-pink-500", emoji: "🎉" },
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
      {/* Search Header */}
      <div className="sticky top-0 z-20 bg-[#FDFBF7]/90 backdrop-blur-xl border-b border-gray-100 px-8 py-4">
        <h1 className="text-2xl font-black text-[#1A1A1A] mb-3">Search</h1>
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-12 text-sm font-medium focus:outline-none focus:border-[#FFB703] focus:ring-2 focus:ring-[#FFB703]/20 transition-all shadow-sm placeholder:text-gray-400"
          />
          {query && (
            <button onClick={() => { setQuery(""); setCategoryName(null); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A1A1A] transition-colors">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="px-8 pt-6">

        {/* ── SEARCH RESULTS ── */}
        {isSearching && (
          <div>
            {/* Tab switcher */}
            <div className="flex gap-2 mb-6">
              {(["songs", "artists"] as SearchTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all capitalize ${
                    activeTab === tab
                      ? "bg-[#1A1A1A] text-white shadow-md"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#FFB703]/20 border-t-[#FFB703] rounded-full animate-spin" />
              </div>
            ) : activeTab === "songs" ? (
              <div>
                {songResults.length === 0 ? (
                  <div className="py-16 text-center">
                    <Music2 size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-semibold">No songs found for "{debouncedQuery}"</p>
                  </div>
                ) : (
                  <div>
                    {/* Top Result Spotlight */}
                    {songResults[0] && (
                      <div className="mb-8 grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Top Result</p>
                          <div
                            onClick={() => playTrack(songResults[0], songResults)}
                            className="group bg-white border border-gray-100 rounded-3xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
                          >
                            <div className="relative w-28 h-28 rounded-2xl overflow-hidden mb-4 shadow-lg">
                              {songResults[0].thumbnail && (
                                <Image src={songResults[0].thumbnail} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                              )}
                            </div>
                            <h3 className="text-2xl font-black text-[#1A1A1A] group-hover:text-[#FFB703] transition-colors truncate">{songResults[0].title}</h3>
                            <p className="text-gray-500 font-medium mt-1">{songResults[0].artist}</p>
                            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-14 h-14 rounded-full bg-[#FFB703] flex items-center justify-center shadow-lg shadow-[#FFB703]/30">
                                <Play size={24} fill="#1A1A1A" className="text-[#1A1A1A] ml-1" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Songs</p>
                          <div className="space-y-1">
                            {songResults.slice(0, 6).map((track, idx) => (
                              <div
                                key={track.id + idx}
                                onClick={() => playTrack(track, songResults)}
                                className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100"
                              >
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                  {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                                    <Play size={14} fill="white" className="text-white opacity-0 group-hover:opacity-100" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                                  <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                                </div>
                                <span className="text-xs text-gray-400 tabular-nums">{track.duration || "—"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Full results list */}
                    {songResults.length > 6 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">All Results</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {songResults.slice(6).map((track, idx) => (
                            <div
                              key={track.id + idx}
                              onClick={() => playTrack(track, songResults)}
                              className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100"
                            >
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                                  <Play size={14} fill="white" className="text-white opacity-0 group-hover:opacity-100" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                                <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                              </div>
                              <span className="text-xs text-gray-400 tabular-nums">{track.duration || "—"}</span>
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
                  <div className="py-16 text-center">
                    <Mic2 size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-semibold">No artists found for "{debouncedQuery}"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {artistResults.map((artist) => (
                      <Link
                        key={artist.id}
                        href={`/dashboard/artist/${artist.id}`}
                        className="group flex flex-col items-center text-center cursor-pointer"
                      >
                        <div className="relative w-full aspect-square rounded-full overflow-hidden mb-3 bg-gray-100 shadow-md group-hover:shadow-xl transition-all duration-300">
                          {artist.image ? (
                            <Image src={artist.image} alt={artist.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <Mic2 size={40} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <p className="font-bold text-[#1A1A1A] text-sm truncate w-full group-hover:text-[#FFB703] transition-colors">{artist.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Artist</p>
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
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setCategoryName(null)}
                className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#1A1A1A] transition-colors flex items-center gap-1"
              >
                ← Browse
              </button>
              <span className="text-gray-300">/</span>
              <h2 className="text-xl font-black text-[#1A1A1A]">{categoryName}</h2>
            </div>

            {categoryLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                    <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
                    <div className="h-2 w-1/2 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {categoryTracks.length > 0 && (
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => playTrack(categoryTracks[0], categoryTracks)}
                      className="flex items-center gap-2 bg-[#FFB703] text-[#1A1A1A] px-5 py-2.5 rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#FFB703]/30"
                    >
                      <Play size={16} fill="currentColor" /> Play All
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {categoryTracks.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track, categoryTracks)}
                      className="group cursor-pointer"
                    >
                      <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-300">
                        {track.thumbnail && (
                          <Image src={track.thumbnail} alt={track.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-end justify-end p-3 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-[#FFB703] flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <Play size={18} fill="#1A1A1A" className="text-[#1A1A1A] ml-1" />
                          </div>
                        </div>
                      </div>
                      <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{track.artist}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BROWSE ALL ── */}
        {showBrowse && (
          <div>
            {/* Trending searches */}
            <div className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <TrendingUp size={14} /> Trending searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {TRENDING_QUERIES.map(q => (
                  <button
                    key={q}
                    onClick={() => setQuery(q)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:border-[#FFB703] hover:text-[#1A1A1A] transition-all"
                  >
                    <Clock size={12} className="text-gray-400" /> {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Category grid */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Browse All</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {CATEGORIES.map(cat => (
                  <div
                    key={cat.name}
                    onClick={() => browseCategory(cat)}
                    className={`relative w-full aspect-square rounded-xl cursor-pointer overflow-hidden bg-gradient-to-br ${cat.gradient} p-4 hover:scale-[1.02] transition-transform shadow-md group`}
                  >
                    <h3 className="text-white font-black text-xl tracking-tight leading-tight w-2/3">
                      {cat.name}
                    </h3>
                    {/* Tilted element to mimic Spotify's cover art inside categories */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-black/20 rounded-lg transform rotate-12 group-hover:rotate-6 transition-transform flex items-center justify-center text-4xl shadow-xl">
                      {cat.emoji}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
