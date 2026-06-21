"use client";

import { usePlayer } from "@/context/PlayerContext";
import { getArtistProfile } from "@/lib/api";
import { useEffect, useState } from "react";
import { Play, Heart, MoreHorizontal, CheckCircle2 } from "lucide-react";

export default function ArtistPage({ params }: { params: { id: string } }) {
  const { playTrack } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [artistData, setArtistData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getArtistProfile(params.id);
        setArtistData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <div className="w-12 h-12 border-4 border-[#FFB703]/20 border-t-[#FFB703] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!artistData) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <p className="text-gray-500">Failed to load artist profile.</p>
      </div>
    );
  }

  return (
    <div className="pb-32">
      
      {/* Artist Hero */}
      <div className="h-[400px] relative flex flex-col justify-end p-8 md:p-12">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        {artistData.image && (
          <img 
            src={artistData.image} 
            alt="Artist Banner" 
            className="absolute inset-0 w-full h-full object-cover z-0 filter blur-sm scale-110"
          />
        )}
        
        <div className="relative z-20 flex items-center gap-6">
          <img src={artistData.image || "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg"} className="w-48 h-48 rounded-full shadow-2xl object-cover border-4 border-white/10" alt={artistData.name} />
          <div>
            <div className="flex items-center gap-2 text-white mb-2 font-bold uppercase tracking-widest text-xs">
              <CheckCircle2 size={16} className="text-blue-400" /> Verified Artist
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-lg">
              {artistData.name}
            </h1>
            <div className="text-gray-200 font-medium">
              {artistData.subscribers || "1M+"} Subscribers
            </div>
          </div>
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
              {artistData.top_tracks?.map((track: any, idx: number) => (
                <div 
                  key={track.id} 
                  onClick={() => playTrack(track, artistData.top_tracks)}
                  className="grid grid-cols-[auto_1fr_auto] gap-4 p-3 items-center hover:bg-white rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="w-8 text-center text-gray-400 font-medium group-hover:hidden">{idx + 1}</div>
                  <div className="w-8 text-center hidden group-hover:flex justify-center text-[#FFB703]">
                    <Play size={16} fill="currentColor" />
                  </div>
                  
                  <div className="flex items-center gap-4 overflow-hidden">
                    <img src={track.thumbnail} alt={track.title} className="w-12 h-12 rounded shadow-sm object-cover shrink-0" />
                    <div className="font-bold text-[#1A1A1A] truncate group-hover:text-[#FFB703] transition-colors">{track.title}</div>
                  </div>

                  <div className="flex items-center gap-8 pr-4 shrink-0">
                    <Heart size={16} className="text-gray-300 hover:text-pink-500 opacity-0 group-hover:opacity-100 transition-all" />
                    <span className="text-sm text-gray-400">{track.duration || track.length || "3:20"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: About */}
        <div>
          <h2 className="text-2xl font-black text-[#1A1A1A] mb-6">About</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group">
            <div className="h-48 relative">
              {artistData.image && (
                <img src={artistData.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="About"/>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-3xl font-black mb-1">{artistData.views || "1M+"}</p>
                <p className="text-sm font-medium opacity-80">Total Views</p>
              </div>
            </div>
            <div className="p-4 text-sm text-gray-500 max-h-64 overflow-y-auto">
              {artistData.description || `${artistData.name} is an artist with a massive global following.`}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
