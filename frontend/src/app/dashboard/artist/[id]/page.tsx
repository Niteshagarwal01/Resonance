"use client";

import { usePlayer } from "@/context/PlayerContext";
import { searchMusic } from "@/lib/api";
import { useEffect, useState } from "react";
import { Play, Heart, MoreHorizontal, CheckCircle2 } from "lucide-react";

export default function ArtistPage({ params }: { params: { id: string } }) {
  const { playTrack } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [topTracks, setTopTracks] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await searchMusic("the weeknd top hits");
        setTopTracks(data.slice(0, 5));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="pb-32">
      
      {/* Artist Hero */}
      <div className="h-[400px] relative flex flex-col justify-end p-8 md:p-12">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop" 
          alt="Artist Banner" 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        
        <div className="relative z-20 flex items-center gap-2 text-white mb-2 font-bold uppercase tracking-widest text-xs">
          <CheckCircle2 size={16} className="text-blue-400" /> Verified Artist
        </div>
        <h1 className="relative z-20 text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter">
          The Weeknd
        </h1>
        <div className="relative z-20 text-gray-200 font-medium">
          108,452,112 monthly listeners
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-8 py-6 flex items-center gap-6 relative z-10">
        <button className="w-16 h-16 bg-[#FFB703] text-[#1A1A1A] rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
          <Play size={28} fill="currentColor" className="ml-1" />
        </button>
        <button className="px-6 py-2 rounded-full border border-gray-300 font-bold text-[#1A1A1A] hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors">
          Follow
        </button>
        <button className="text-gray-400 hover:text-[#1A1A1A] transition-colors">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl">
        
        {/* Left Col: Popular Tracks */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black text-[#1A1A1A] mb-6">Popular</h2>
          
          {loading ? (
            <div className="w-full py-10 flex justify-center">
              <div className="w-8 h-8 border-4 border-[#FFB703]/20 border-t-[#FFB703] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex flex-col">
              {topTracks.map((track, idx) => (
                <div 
                  key={track.id} 
                  onClick={() => playTrack(track, topTracks)}
                  className="grid grid-cols-[auto_1fr_auto] gap-4 p-3 items-center hover:bg-white rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="w-8 text-center text-gray-400 font-medium group-hover:hidden">{idx + 1}</div>
                  <div className="w-8 text-center hidden group-hover:flex justify-center text-[#FFB703]">
                    <Play size={16} fill="currentColor" />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <img src={track.thumbnail} alt={track.title} className="w-12 h-12 rounded shadow-sm object-cover shrink-0" />
                    <div className="font-bold text-[#1A1A1A] truncate group-hover:text-[#FFB703] transition-colors">{track.title}</div>
                  </div>

                  <div className="flex items-center gap-8 pr-4">
                    <span className="text-sm text-gray-400 hidden md:block">1,204,593,211</span>
                    <Heart size={16} className="text-gray-300 hover:text-pink-500 opacity-0 group-hover:opacity-100 transition-all" />
                    <span className="text-sm text-gray-400">{track.length || "3:20"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Artist Pick / About */}
        <div>
          <h2 className="text-2xl font-black text-[#1A1A1A] mb-6">Artist Pick</h2>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex gap-4 mb-4">
              <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop" className="w-16 h-16 rounded-full" alt="Artist"/>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Posted By The Weeknd</p>
                <p className="font-medium text-[#1A1A1A]">My new album is finally out. Experience it from top to bottom.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl">
              <img src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop" className="w-12 h-12 rounded shadow" alt="Album"/>
              <div>
                <p className="font-bold text-[#1A1A1A] text-sm">Starboy</p>
                <p className="text-xs text-gray-500">Album</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-black text-[#1A1A1A] mb-6">About</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group">
            <div className="h-48 relative">
              <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="About"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-3xl font-black mb-1">108.4M</p>
                <p className="text-sm font-medium opacity-80">Monthly Listeners</p>
              </div>
            </div>
            <div className="p-4 text-sm text-gray-500 line-clamp-3">
              Abel Tesfaye, known as The Weeknd, is a Canadian singer, songwriter, and record producer. Known for his sonic versatility and dark lyricism, his music explores escapism, romance, and melancholia...
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
