"use client";

import { usePlayer } from "@/context/PlayerContext";
import { searchMusic } from "@/lib/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Sparkles, TrendingUp, Compass, Globe, Zap } from "lucide-react";

export default function DiscoverPage() {
  const { playTrack } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    async function load() {
      try {
        const [hiddenGems, globalHits, indieFolk, electronic] = await Promise.all([
          searchMusic("underrated indie hits 2024"),
          searchMusic("top 50 global chart hits"),
          searchMusic("acoustic indie folk"),
          searchMusic("deep house electronic")
        ]);

        setData({
          hiddenGems: hiddenGems.slice(0, 4),
          charts: globalHits.slice(0, 4),
          genres: {
            folk: indieFolk.slice(0, 4),
            electronic: electronic.slice(0, 4)
          }
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#FFB703]/20 border-t-[#FFB703] rounded-full animate-spin" />
        <p className="text-gray-400 font-medium animate-pulse">Scouring the globe for new sounds...</p>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32">
      
      {/* Hero Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-black text-[#1A1A1A] mb-4 tracking-tight flex items-center gap-4">
          Discover <Compass className="text-[#FFB703]" size={40} />
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl">
          Step outside your algorithm. Explore new genres, rising artists, and global charts.
        </p>
      </div>

      {/* Hero Banner (Interactive) */}
      <div className="w-full h-[300px] rounded-[2rem] overflow-hidden relative mb-16 shadow-2xl group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-900 z-0"></div>
        <div className="absolute inset-0 bg-black/40 z-10 transition-opacity group-hover:opacity-30"></div>
        <img 
          src="https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?q=80&w=2070&auto=format&fit=crop" 
          alt="Discover" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 scale-105 group-hover:scale-100 transition-transform duration-700" 
        />
        
        <div className="relative z-20 h-full p-10 flex flex-col justify-end">
          <div className="inline-flex items-center gap-2 bg-[#FFB703] text-[#1A1A1A] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest w-fit mb-4">
            <Sparkles size={14} /> Editorial Pick
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">The Underground Sound</h2>
          <p className="text-gray-200 max-w-xl text-lg mb-6">A curated collection of the best unreleased and underground tracks making waves globally.</p>
        </div>
      </div>

      {/* Grid: Hidden Gems */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-[#1A1A1A] flex items-center gap-2">
            <Zap className="text-[#FFB703]" size={24} /> Hidden Gems
          </h2>
          <button className="text-sm font-bold text-gray-500 hover:text-[#1A1A1A] uppercase tracking-wider">View All</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {data.hiddenGems?.map((track: any) => (
            <div key={track.id} className="group cursor-pointer" onClick={() => playTrack(track, data.hiddenGems)}>
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-xl transition-all duration-300">
                <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#FFB703] rounded-full flex items-center justify-center text-[#1A1A1A] opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                    <Play fill="currentColor" size={20} className="ml-1" />
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-[#1A1A1A] text-lg truncate group-hover:text-[#FFB703] transition-colors">{track.title}</h3>
              <p className="text-sm text-gray-500 truncate">{track.artist}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Global Charts */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-[#1A1A1A] flex items-center gap-2">
            <Globe className="text-blue-500" size={24} /> Global Charts
          </h2>
          <button className="text-sm font-bold text-gray-500 hover:text-[#1A1A1A] uppercase tracking-wider">View All</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {data.charts?.map((track: any, idx: number) => (
            <div key={track.id} className="group cursor-pointer flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all" onClick={() => playTrack(track, data.charts)}>
              <div className="text-2xl font-black text-gray-200 w-8 text-center">{idx + 1}</div>
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                  <Play className="text-white opacity-0 group-hover:opacity-100" size={20} fill="currentColor" />
                </div>
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-[#1A1A1A] text-sm truncate">{track.title}</h3>
                <p className="text-xs text-gray-500 truncate">{track.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
