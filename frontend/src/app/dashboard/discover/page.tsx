"use client";

import { useEffect, useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { searchMusic, searchAlbums, searchPlaylists } from "@/lib/api";
import { Search, Mic, Sparkles, Loader2, Music2, Play, Users, Flame, Radio, Zap, Globe, Heart, Activity, Disc } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ShelfRow } from "@/components/ShelfRow";
import { useRouter } from "next/navigation";

// TABS DEFINITION
const TABS = [
  { id: "for-you", label: "For You", icon: <Heart size={16} /> },
  { id: "trending", label: "Trending Now", icon: <Flame size={16} /> },
  { id: "new-releases", label: "New Releases", icon: <Sparkles size={16} /> },
  { id: "lab", label: "Discovery Lab", icon: <Zap size={16} /> },
  { id: "mood", label: "Explore By Mood", icon: <Activity size={16} /> },
  { id: "genre", label: "Explore By Genre", icon: <Music2 size={16} /> },
  { id: "taste", label: "Taste Expansion", icon: <Globe size={16} /> },
  { id: "ai", label: "AI Discovery", icon: <Radio size={16} /> },
  { id: "community", label: "Community", icon: <Users size={16} /> }
];

export default function DiscoverPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("for-you");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data States
  const [tabData, setTabData] = useState<Record<string, { title: string, tracks: any[], type?: "tracks" | "albums" | "artists" | "playlists" }[]>>({});
  const [loading, setLoading] = useState(false);
  const [userDna, setUserDna] = useState<any>(null);

  // Load User DNA once
  useEffect(() => {
    async function loadDNA() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from("taste_dna").select("*").eq("user_id", session.user.id).single();
        if (data) setUserDna(data);
      }
    }
    loadDNA();
  }, [supabase]);

  // Handle Tab Change and Fetching
  useEffect(() => {
    if (tabData[activeTab]) return; // Already loaded!
    
    let isMounted = true;
    
    async function fetchTabData() {
      setLoading(true);
      try {
        const topGenre = userDna?.top_genres?.[0] || "Pop";
        const topArtist = typeof userDna?.top_artists?.[0] === 'object' ? userDna?.top_artists?.[0].name : (userDna?.top_artists?.[0] || "Arijit Singh");

        let sections: any[] = [];

        if (activeTab === "for-you") {
          const [daily, recent] = await Promise.allSettled([
            searchMusic(`top hit songs`),
            searchMusic(`more like ${topArtist}`)
          ]);
          await new Promise(r => setTimeout(r, 400));
          const [gems, future] = await Promise.allSettled([
            searchMusic(`underrated indie hit songs`),
            searchMusic(`upcoming viral hit songs`)
          ]);
          sections = [
            { title: "Daily Discoveries", tracks: daily.status === 'fulfilled' ? daily.value?.songs || [] : [] },
            { title: "Based On Recent Listening", tracks: recent.status === 'fulfilled' ? recent.value?.songs || [] : [] },
            { title: "Hidden Gems", tracks: gems.status === 'fulfilled' ? gems.value?.songs || [] : [] },
            { title: "Future Favorites", tracks: future.status === 'fulfilled' ? future.value?.songs || [] : [] },
          ];
        } 
        else if (activeTab === "trending") {
          const [songs, albums] = await Promise.allSettled([
            searchMusic(`top trending ${topGenre} global hit songs`),
            searchAlbums(`top trending ${topGenre} hit albums`)
          ]);
          await new Promise(r => setTimeout(r, 400));
          const [playlists] = await Promise.allSettled([
            searchPlaylists(`top trending ${topGenre} hits`)
          ]);
          sections = [
            { title: "Trending Songs", tracks: songs.status === 'fulfilled' ? songs.value?.songs || [] : [] },
            { title: "Trending Albums", tracks: albums.status === 'fulfilled' ? albums.value || [] : [], type: "albums" },
            { title: "Trending Playlists", tracks: playlists.status === 'fulfilled' ? playlists.value || [] : [], type: "playlists" },
          ];
        }
        else if (activeTab === "new-releases") {
          const [songs, albums] = await Promise.allSettled([
            searchMusic(`latest new ${topGenre} hit songs`),
            searchAlbums(`latest new ${topGenre} hit albums`)
          ]);
          sections = [
            { title: "New Songs", tracks: songs.status === 'fulfilled' ? songs.value?.songs || [] : [] },
            { title: "New Albums", tracks: albums.status === 'fulfilled' ? albums.value || [] : [], type: "albums" },
          ];
        }
        else if (activeTab === "lab") {
          const [emerging, underground] = await Promise.allSettled([
            searchMusic(`emerging indie ${topGenre} hit songs`),
            searchMusic(`underground hip hop indie ${topGenre} songs`)
          ]);
          await new Promise(r => setTimeout(r, 400));
          const [listeners, rising] = await Promise.allSettled([
            searchMusic(`obscure hidden gem indie ${topGenre} songs`),
            searchMusic(`rising viral ${topGenre} songs this week`)
          ]);
          sections = [
            { title: "Emerging Artists", tracks: emerging.status === 'fulfilled' ? emerging.value?.songs || [] : [] },
            { title: "Underground Artists", tracks: underground.status === 'fulfilled' ? underground.value?.songs || [] : [] },
            { title: "Under 10K Listeners", tracks: listeners.status === 'fulfilled' ? listeners.value?.songs || [] : [] },
            { title: "Rising This Week", tracks: rising.status === 'fulfilled' ? rising.value?.songs || [] : [] },
          ];
        }
        else if (activeTab === "mood") {
          const [happy, focus] = await Promise.allSettled([
            searchMusic(`happy upbeat ${topGenre} songs`),
            searchMusic(`deep focus study lofi ${topGenre}`)
          ]);
          await new Promise(r => setTimeout(r, 400));
          const [workout, chill] = await Promise.allSettled([
            searchMusic(`hype high energy workout ${topGenre} ${topArtist}`),
            searchMusic(`chill acoustic relaxing ${topArtist}`)
          ]);
          await new Promise(r => setTimeout(r, 400));
          const [sleep, party] = await Promise.allSettled([
            searchMusic(`sleep ambient relaxing ${topGenre}`),
            searchMusic(`party dance hits ${topGenre} ${topArtist}`)
          ]);
          sections = [
            { title: "Happy", tracks: happy.status === 'fulfilled' ? happy.value?.songs || [] : [] },
            { title: "Focus", tracks: focus.status === 'fulfilled' ? focus.value?.songs || [] : [] },
            { title: "Workout", tracks: workout.status === 'fulfilled' ? workout.value?.songs || [] : [] },
            { title: "Chill", tracks: chill.status === 'fulfilled' ? chill.value?.songs || [] : [] },
            { title: "Sleep", tracks: sleep.status === 'fulfilled' ? sleep.value?.songs || [] : [] },
            { title: "Party", tracks: party.status === 'fulfilled' ? party.value?.songs || [] : [] }
          ];
        }
        else if (activeTab === "genre") {
           const genre1 = userDna?.top_genres?.[1] || "Pop";
           const genre2 = userDna?.top_genres?.[2] || "Hip-Hop";
           
           const [pop, hiphop] = await Promise.allSettled([
            searchMusic(`best ${genre1} songs`),
            searchMusic(`best ${genre2} songs`)
          ]);
          await new Promise(r => setTimeout(r, 400));
          const [indie, rock] = await Promise.allSettled([
            searchMusic(`best indie ${topGenre} songs`),
            searchMusic(`best rock ${topGenre} songs`)
          ]);
          await new Promise(r => setTimeout(r, 400));
          const [edm, regional] = await Promise.allSettled([
            searchMusic(`best edm dance ${topGenre} songs`),
            searchMusic(`best regional folk songs india`)
          ]);
          sections = [
            { title: genre1, tracks: pop.status === 'fulfilled' ? pop.value?.songs || [] : [] },
            { title: genre2, tracks: hiphop.status === 'fulfilled' ? hiphop.value?.songs || [] : [] },
            { title: `Indie ${topGenre}`, tracks: indie.status === 'fulfilled' ? indie.value?.songs || [] : [] },
            { title: `Rock ${topGenre}`, tracks: rock.status === 'fulfilled' ? rock.value?.songs || [] : [] },
            { title: `EDM ${topGenre}`, tracks: edm.status === 'fulfilled' ? edm.value?.songs || [] : [] },
            { title: "Regional", tracks: regional.status === 'fulfilled' ? regional.value?.songs || [] : [] }
          ];
        }
        else if (activeTab === "taste") {
           const [similarA, similarG] = await Promise.allSettled([
            searchMusic(`more like ${topArtist}`),
            searchMusic(`more ${topGenre} hits`)
          ]);
          await new Promise(r => setTimeout(r, 400));
          const [adjacent, outside] = await Promise.allSettled([
            searchMusic(`experimental electronic ${topGenre} fusion`),
            searchMusic(`global international world music hits`)
          ]);
          sections = [
            { title: `Similar to ${topArtist}`, tracks: similarA.status === 'fulfilled' ? similarA.value?.songs || [] : [] },
            { title: `More ${topGenre}`, tracks: similarG.status === 'fulfilled' ? similarG.value?.songs || [] : [] },
            { title: "Adjacent Genres", tracks: adjacent.status === 'fulfilled' ? adjacent.value?.songs || [] : [] },
            { title: "Outside Your Bubble", tracks: outside.status === 'fulfilled' ? outside.value?.songs || [] : [] }
          ];
        }
        else if (activeTab === "ai") {
           const [surprise, fusion, journey, rabbit] = await Promise.allSettled([
            searchMusic(`random trending hit songs`),
            searchMusic(`electronic classical fusion`),
            searchMusic(`ambient cinematic journey`),
            searchMusic(`weird obscure internet music`)
          ]);
          sections = [
            { title: "Surprise Me", tracks: surprise.status === 'fulfilled' ? surprise.value?.songs || [] : [] },
            { title: "Genre Fusion", tracks: fusion.status === 'fulfilled' ? fusion.value?.songs || [] : [] },
            { title: "Mood Journey", tracks: journey.status === 'fulfilled' ? journey.value?.songs || [] : [] },
            { title: "Random Rabbit Hole", tracks: rabbit.status === 'fulfilled' ? rabbit.value?.songs || [] : [] }
          ];
        }
        else if (activeTab === "community") {
           const [shared, saved, picks, discussions] = await Promise.allSettled([
            searchMusic(`viral tiktok hits`),
            searchMusic(`most popular trending hits`),
            searchMusic(`indie viral hits`),
            searchMusic(`trending rap hip hop discussions`)
          ]);
          sections = [
            { title: "Most Shared", tracks: shared.status === 'fulfilled' ? shared.value?.songs || [] : [] },
            { title: "Most Saved", tracks: saved.status === 'fulfilled' ? saved.value?.songs || [] : [] },
            { title: "Community Picks", tracks: picks.status === 'fulfilled' ? picks.value?.songs || [] : [] },
            { title: "Rising Discussions", tracks: discussions.status === 'fulfilled' ? discussions.value?.songs || [] : [] }
          ];
        }

        if (isMounted) {
          setTabData(prev => ({ ...prev, [activeTab]: sections }));
        }

      } catch (err) {
        console.error("Tab fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTabData();
    return () => { isMounted = false; };
  }, [activeTab, tabData, userDna]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const currentData = tabData[activeTab] || [];

  return (
    <div className="pb-32 min-h-screen bg-[#FDFBF7]">
      {/* HERO SEARCH SECTION */}
      <div className="bg-[#1A1A1A] px-4 md:px-12 py-20 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-[#1A1A1A] to-orange-900/30" />
        
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-black text-white text-center mb-6 tracking-tight">
            Discover Your Sound
          </h1>
          <p className="text-gray-400 text-center mb-10 text-lg max-w-xl">
            Search across millions of songs, albums, and artists, or explore the curated categories below.
          </p>
          
          <form onSubmit={handleSearch} className="w-full relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="text-gray-400 group-focus-within:text-[#FFB703] transition-colors" size={24} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to listen to?"
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-black placeholder-gray-400 border-2 border-white/20 focus:border-[#FFB703] rounded-full py-5 pl-16 pr-32 outline-none text-lg transition-all shadow-xl"
            />
            <div className="absolute inset-y-0 right-3 flex items-center gap-2">
              <button type="button" className="p-2 hover:bg-gray-100 hover:text-black rounded-full text-gray-400 transition-colors" title="Voice Search">
                <Mic size={20} />
              </button>
              <button type="submit" className="bg-[#FFB703] text-black px-6 py-2.5 rounded-full font-bold hover:bg-[#e6a500] transition-colors shadow-md">
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="px-4 md:px-8 mt-10 mb-12">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-4 pt-4 px-2 -mx-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === tab.id 
                  ? "bg-[#1A1A1A] text-white shadow-xl scale-105" 
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="space-y-12 pb-12">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-32">
              <Loader2 size={40} className="animate-spin text-[#FFB703] mb-4" />
              <p className="text-sm font-bold tracking-widest uppercase text-gray-400">Loading {TABS.find(t=>t.id===activeTab)?.label}...</p>
            </motion.div>
          ) : (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              {currentData.length > 0 ? (
                currentData.map((section, idx) => {
                  if (!section.tracks || section.tracks.length === 0) return null;
                  
                  if (section.type === "albums" || section.type === "playlists") {
                    return (
                      <div key={idx} className="w-full mb-12 px-4 md:px-8">
                        <div className="flex items-center gap-2 mb-6">
                          <Sparkles size={20} className="text-[#FFB703]" />
                          <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#1A1A1A]">{section.title}</h2>
                        </div>
                        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-2" style={{ scrollSnapType: "x mandatory" }}>
                          {section.tracks.map((item: any, i: number) => {
                            const isAlbum = section.type === "albums";
                            const linkHref = isAlbum ? `/dashboard/album/${item.browseId || item.id}` : `/dashboard/playlists/${item.browseId || item.id}`;
                            const imgUrl = item.thumbnail || item.thumbnails?.[0]?.url || item.image;
                            const title = item.title || item.name;
                            const subtitle = item.artist || item.author || "Various Artists";
                            
                            return (
                              <div key={`${item.browseId || item.id}-${i}`} className="group flex-shrink-0 w-[140px] md:w-[160px] flex flex-col cursor-pointer" style={{ scrollSnapAlign: "start" }} onClick={() => router.push(linkHref)}>
                                <div className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-xl transition-all duration-300 border border-gray-100">
                                  {imgUrl ? (
                                    <img src={imgUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                      <Disc size={32} className="text-gray-400" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                                <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors px-1">{title}</p>
                                <p className="text-xs text-gray-500 truncate px-1 mt-0.5">{subtitle}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="w-full mb-12">
                      <ShelfRow 
                        title={section.title} 
                        icon={<Sparkles size={20} className="text-[#FFB703]" />} 
                        tracks={section.tracks} 
                      />
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-32 text-gray-500 font-medium">No results found for this category.</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
