"use client";

import { useEffect, useState, useRef } from "react";
import { getHomeMixes, getCharts, getExploreNewReleases, getRadioQueue } from "@/lib/api";
import { Search, Mic, Sparkles, Loader2, Music2, Users, Flame, Radio, Zap, Globe, Heart, Activity } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { LazyShelfRow } from "@/components/LazyShelfRow";

const TABS = [
  { id: "for-you", label: "For You", icon: <Heart size={16} /> },
  { id: "trending", label: "Trending Now", icon: <Flame size={16} /> },
  { id: "new-releases", label: "New Releases", icon: <Sparkles size={16} /> },
  { id: "hip-hop", label: "Hip Hop & RnB", icon: <Music2 size={16} /> },
  { id: "pop", label: "Pop Culture", icon: <Music2 size={16} /> },
  { id: "electronic", label: "Electronic", icon: <Zap size={16} /> },
  { id: "mood", label: "Mood & Vibe", icon: <Activity size={16} /> },
  { id: "underground", label: "Underground", icon: <Radio size={16} /> },
  { id: "global", label: "Global Taste", icon: <Globe size={16} /> },
  { id: "ai", label: "AI Discovery", icon: <Users size={16} /> }
];

export default function DiscoverPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("for-you");
  const [searchQuery, setSearchQuery] = useState("");
  const [userDna, setUserDna] = useState<any>(null);

  // Promise cache for batching requests across multiple sliced rows
  const promiseCache = useRef<Record<string, Promise<any[]>>>({});

  const getCachedFetch = (key: string, fetcher: () => Promise<any[]>) => {
    if (!promiseCache.current[key]) {
      promiseCache.current[key] = fetcher();
    }
    return promiseCache.current[key];
  };

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const topSongId = userDna?.top_songs?.[0]?.id || "RDAMVM";
  const SEEDS = {
    hiphop: "fiOpBR-4o0Q", // desi hip hop
    pop: "51Oz0l-qR3M",    // bollywood pop hit
    house: "aG3iwAU0LUc",  // bollywood edm
    kpop: "ghrlZIMDzbM",   // keep global taste
    latin: "FXovf5dsRTw",  // keep global taste
    french: "Z7cuTnbF-2c", // keep global taste
    party: "IlsPKUrTAwM",  // bollywood party anthem
    lofi: "HhkyEKko868",   // hindi lofi chill
    workout: "5x7Kks9Zscw",// indian workout
    indie: "tNc2coVC2aw",  // indian indie
    edm: "aG3iwAU0LUc"     // bollywood edm
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "for-you":
        return (
          <>
            <LazyShelfRow key={`for-you-1`} title="Your Personalized Mixes" icon={<Heart className="text-pink-500"/>} fetchData={async () => {
              const data = await getCachedFetch("for-you-mix", getHomeMixes);
              return data.slice(0, 20);
            }} />
            <LazyShelfRow key={`for-you-2`} title="Made For Your DNA" fetchData={async () => {
              const data = await getCachedFetch(`dna-radio-${topSongId}`, () => getRadioQueue(topSongId));
              return data.slice(0, 20);
            }} />
            <LazyShelfRow key={`for-you-3`} title="Deep Cuts" fetchData={async () => {
              const data = await getCachedFetch("for-you-mix", getHomeMixes);
              return data.slice(20, 40);
            }} />
            <LazyShelfRow key={`for-you-4`} title="If You Liked Your Top Song" fetchData={async () => {
              const data = await getCachedFetch(`dna-radio-${topSongId}`, () => getRadioQueue(topSongId));
              return data.slice(20, 40);
            }} />
            <LazyShelfRow key={`for-you-5`} title="Daily Discoveries" fetchData={async () => {
              const data = await getCachedFetch("for-you-mix", getHomeMixes);
              return data.slice(40, 60);
            }} />
          </>
        );

      case "trending":
        return (
          <>
            <LazyShelfRow key={`trending-1`} title="Global Top 20" icon={<Flame className="text-orange-500"/>} fetchData={async () => await getCachedFetch("chart-zz", () => getCharts("ZZ"))} />
            <LazyShelfRow key={`trending-2`} title="US Trending" fetchData={async () => await getCachedFetch("chart-us", () => getCharts("US"))} />
            <LazyShelfRow key={`trending-3`} title="UK Trending" fetchData={async () => await getCachedFetch("chart-gb", () => getCharts("GB"))} />
            <LazyShelfRow key={`trending-4`} title="Emerging India" fetchData={async () => await getCachedFetch("chart-in", () => getCharts("IN"))} />
            <LazyShelfRow key={`trending-5`} title="Viral Hits Globally" fetchData={async () => {
              const data = await getCachedFetch("chart-zz", () => getCharts("ZZ"));
              return data.slice().reverse();
            }} />
          </>
        );

      case "new-releases":
        return (
          <>
            <LazyShelfRow key={`new-1`} title="Top New Releases" type="albums" icon={<Sparkles className="text-purple-500"/>} fetchData={async () => {
              const data = await getCachedFetch("new-albums", getExploreNewReleases);
              return data.slice(0, 20);
            }} />
            <LazyShelfRow key={`new-2`} title="Fresh EPs" type="albums" fetchData={async () => {
              const data = await getCachedFetch("new-albums", getExploreNewReleases);
              return data.slice(20, 40);
            }} />
            <LazyShelfRow key={`new-3`} title="Just Dropped" type="albums" fetchData={async () => {
              const data = await getCachedFetch("new-albums", getExploreNewReleases);
              return data.slice(40, 60);
            }} />
            <LazyShelfRow key={`new-4`} title="Trending Drops" type="albums" fetchData={async () => {
              const data = await getCachedFetch("new-albums", getExploreNewReleases);
              return data.slice(60, 80);
            }} />
            <LazyShelfRow key={`new-5`} title="Undiscovered Releases" type="albums" fetchData={async () => {
              const data = await getCachedFetch("new-albums", getExploreNewReleases);
              return data.slice(80, 100);
            }} />
          </>
        );

      case "hip-hop":
        return (
          <>
            <LazyShelfRow key={`hh-1`} title="Rap Caviar Essentials" fetchData={async () => {
              const data = await getCachedFetch("hiphop-radio", () => getRadioQueue(SEEDS.hiphop));
              return data.slice(0, 20);
            }} />
            <LazyShelfRow key={`hh-2`} title="Trap Anthems" fetchData={async () => {
              const data = await getCachedFetch("hiphop-radio", () => getRadioQueue(SEEDS.hiphop));
              return data.slice(20, 40);
            }} />
            <LazyShelfRow key={`hh-3`} title="Lofi Beats & Rhymes" fetchData={async () => {
              const data = await getCachedFetch("hiphop-radio", () => getRadioQueue(SEEDS.hiphop));
              return data.slice(40, 60);
            }} />
            <LazyShelfRow key={`hh-4`} title="R&B Soul Elements" fetchData={async () => {
              const data = await getCachedFetch("hiphop-radio", () => getRadioQueue(SEEDS.hiphop));
              return data.slice(60, 80);
            }} />
            <LazyShelfRow key={`hh-5`} title="Underground Rap" fetchData={async () => {
              const data = await getCachedFetch("hiphop-radio", () => getRadioQueue(SEEDS.hiphop));
              return data.slice(80, 100);
            }} />
          </>
        );

      case "pop":
        return (
          <>
            <LazyShelfRow key={`pop-1`} title="Global Pop Hits" fetchData={async () => {
              const data = await getCachedFetch("pop-radio", () => getRadioQueue(SEEDS.pop));
              return data.slice(0, 20);
            }} />
            <LazyShelfRow key={`pop-2`} title="Synthpop Journey" fetchData={async () => {
              const data = await getCachedFetch("pop-radio", () => getRadioQueue(SEEDS.pop));
              return data.slice(20, 40);
            }} />
            <LazyShelfRow key={`pop-3`} title="Indie Pop" fetchData={async () => {
              const data = await getCachedFetch("pop-radio", () => getRadioQueue(SEEDS.pop));
              return data.slice(40, 60);
            }} />
            <LazyShelfRow key={`pop-4`} title="Vocal Powerhouses" fetchData={async () => {
              const data = await getCachedFetch("pop-radio", () => getRadioQueue(SEEDS.pop));
              return data.slice(60, 80);
            }} />
            <LazyShelfRow key={`pop-5`} title="Acoustic Pop" fetchData={async () => {
              const data = await getCachedFetch("pop-radio", () => getRadioQueue(SEEDS.pop));
              return data.slice(80, 100);
            }} />
          </>
        );

      case "electronic":
        return (
          <>
            <LazyShelfRow key={`elec-1`} title="Festival EDM" fetchData={async () => {
              const data = await getCachedFetch("edm-radio", () => getRadioQueue(SEEDS.edm));
              return data.slice(0, 20);
            }} />
            <LazyShelfRow key={`elec-2`} title="Deep House" fetchData={async () => {
              const data = await getCachedFetch("house-radio", () => getRadioQueue(SEEDS.house));
              return data.slice(0, 20);
            }} />
            <LazyShelfRow key={`elec-3`} title="Trance & Techno" fetchData={async () => {
              const data = await getCachedFetch("edm-radio", () => getRadioQueue(SEEDS.edm));
              return data.slice(20, 40);
            }} />
            <LazyShelfRow key={`elec-4`} title="Bass Drops" fetchData={async () => {
              const data = await getCachedFetch("house-radio", () => getRadioQueue(SEEDS.house));
              return data.slice(20, 40);
            }} />
            <LazyShelfRow key={`elec-5`} title="Ambient Electronic" fetchData={async () => {
              const data = await getCachedFetch("edm-radio", () => getRadioQueue(SEEDS.edm));
              return data.slice(40, 60);
            }} />
          </>
        );

      case "mood":
        return (
          <>
            <LazyShelfRow key={`mood-1`} title="Chill & Focus (Lofi)" fetchData={async () => {
              const data = await getCachedFetch("lofi-radio", () => getRadioQueue(SEEDS.lofi));
              return data.slice(0, 20);
            }} />
            <LazyShelfRow key={`mood-2`} title="High Energy Workout" fetchData={async () => {
              const data = await getCachedFetch("workout-radio", () => getRadioQueue(SEEDS.workout));
              return data.slice(0, 20);
            }} />
            <LazyShelfRow key={`mood-3`} title="Late Night Drive" fetchData={async () => {
              const data = await getCachedFetch("lofi-radio", () => getRadioQueue(SEEDS.lofi));
              return data.slice(20, 40);
            }} />
            <LazyShelfRow key={`mood-4`} title="Party Mix" fetchData={async () => {
              const data = await getCachedFetch("party-radio", () => getRadioQueue(SEEDS.party));
              return data.slice(0, 20);
            }} />
            <LazyShelfRow key={`mood-5`} title="Study Session" fetchData={async () => {
              const data = await getCachedFetch("lofi-radio", () => getRadioQueue(SEEDS.lofi));
              return data.slice(40, 60);
            }} />
          </>
        );

      case "underground":
        return (
          <>
            <LazyShelfRow key={`ug-1`} title="Indie Rock Darlings" fetchData={async () => {
              const data = await getCachedFetch("indie-radio", () => getRadioQueue(SEEDS.indie));
              return data.slice(0, 20);
            }} />
            <LazyShelfRow key={`ug-2`} title="Alternative Hits" fetchData={async () => {
              const data = await getCachedFetch("indie-radio", () => getRadioQueue(SEEDS.indie));
              return data.slice(20, 40);
            }} />
            <LazyShelfRow key={`ug-3`} title="Bedroom Studio" fetchData={async () => {
              const data = await getCachedFetch("indie-radio", () => getRadioQueue(SEEDS.indie));
              return data.slice(40, 60);
            }} />
            <LazyShelfRow key={`ug-4`} title="Experimental Echoes" fetchData={async () => {
              const data = await getCachedFetch("indie-radio", () => getRadioQueue(SEEDS.indie));
              return data.slice(60, 80);
            }} />
            <LazyShelfRow key={`ug-5`} title="Obscure Gems" fetchData={async () => {
              const data = await getCachedFetch("indie-radio", () => getRadioQueue(SEEDS.indie));
              return data.slice(80, 100);
            }} />
          </>
        );

      case "global":
        return (
          <>
            <LazyShelfRow key={`gl-1`} title="K-Pop Bangers" fetchData={async () => {
              const data = await getCachedFetch("kpop-radio", () => getRadioQueue(SEEDS.kpop));
              return data.slice(0, 20);
            }} />
            <LazyShelfRow key={`gl-2`} title="Latin Exclusives" fetchData={async () => {
              const data = await getCachedFetch("latin-radio", () => getRadioQueue(SEEDS.latin));
              return data.slice(0, 20);
            }} />
            <LazyShelfRow key={`gl-3`} title="French Top Hits" fetchData={async () => {
              const data = await getCachedFetch("french-radio", () => getRadioQueue(SEEDS.french));
              return data.slice(0, 20);
            }} />
            <LazyShelfRow key={`gl-4`} title="Japan Top 20" fetchData={async () => await getCachedFetch("chart-jp", () => getCharts("JP"))} />
            <LazyShelfRow key={`gl-5`} title="Global Discovery" fetchData={async () => {
              const data = await getCachedFetch("latin-radio", () => getRadioQueue(SEEDS.latin));
              return data.slice(20, 40);
            }} />
          </>
        );

      case "ai":
        return (
          <>
            <LazyShelfRow key={`ai-1`} title="Surprise Me" fetchData={async () => {
              const data = await getCachedFetch("ai-mix", getHomeMixes);
              return data.slice(0, 20).sort(() => 0.5 - Math.random());
            }} />
            <LazyShelfRow key={`ai-2`} title="Algorithmic Wonders" fetchData={async () => {
              const data = await getCachedFetch("ai-chart", () => getCharts("ZZ"));
              return data.slice().sort(() => 0.5 - Math.random());
            }} />
            <LazyShelfRow key={`ai-3`} title="Community Picks" fetchData={async () => {
              const data = await getCachedFetch("ai-mix", getHomeMixes);
              return data.slice(20, 40).sort(() => 0.5 - Math.random());
            }} />
            <LazyShelfRow key={`ai-4`} title="Trending Discussions" fetchData={async () => {
              const data = await getCachedFetch("indie-radio", () => getRadioQueue(SEEDS.indie));
              return data.slice().sort(() => 0.5 - Math.random()).slice(0, 20);
            }} />
            <LazyShelfRow key={`ai-5`} title="Hidden Code" fetchData={async () => {
              const data = await getCachedFetch("ai-mix", getHomeMixes);
              return data.slice(40, 60).sort(() => 0.5 - Math.random());
            }} />
          </>
        );
    }
  };

  return (
    <div className="pb-32 min-h-screen bg-[#FDFBF7]">
      <div className="bg-[#1A1A1A] px-4 md:px-12 py-20 rounded-b-[3rem] shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-[#1A1A1A] to-orange-900/30" />
        
        <div className="relative z-20 max-w-3xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-black text-white text-center mb-6 tracking-tight">
            Discover Your Sound
          </h1>
          
          <form onSubmit={handleSearch} className="w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search size={22} className="text-gray-400 group-focus-within:text-[#FFB703] transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full bg-white/10 text-white placeholder-gray-400 rounded-full py-5 pl-14 pr-16 text-lg border border-white/10 focus:outline-none focus:border-[#FFB703]/50 focus:bg-white/15 transition-all shadow-inner"
            />
            <button type="button" className="absolute inset-y-0 right-2 flex items-center px-4 text-gray-400 hover:text-white transition-colors">
              <Mic size={20} />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 relative z-20">
        <div className="flex overflow-x-auto scrollbar-hide gap-3 pt-4 pb-6 mb-4 px-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-[#FFB703] text-black shadow-lg scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[800px] space-y-12">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
