"use client";

import { usePlayer } from "@/context/PlayerContext";
import { searchMusic } from "@/lib/api";
import { useEffect, useState } from "react";
import { Play, Heart, MoreHorizontal, Clock, Share2 } from "lucide-react";

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const { playTrack } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await searchMusic("aesthetic lofi playlist");
        setTracks(data);
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
      
      {/* Playlist Hero */}
      <div className="bg-gradient-to-b from-[#8ECAE6]/40 to-transparent p-8 md:p-12 flex flex-col md:flex-row items-end gap-8 relative">
        <div className="absolute inset-0 bg-[#FDFBF7] opacity-60 z-0 mix-blend-overlay"></div>
        
        <div className="w-56 h-56 shrink-0 shadow-2xl rounded-xl overflow-hidden relative z-10 bg-white">
          <img src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1000&auto=format&fit=crop" alt="Playlist Cover" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative z-10 flex-1">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Public Playlist</span>
          <h1 className="text-5xl md:text-7xl font-black text-[#1A1A1A] mb-4 tracking-tighter">Late Night Drives</h1>
          <p className="text-gray-500 font-medium mb-2">The perfect soundtrack for empty highways and city lights.</p>
          <div className="flex items-center gap-2 text-sm text-gray-400 font-bold">
            <span className="text-[#1A1A1A]">Resonance Curators</span>
            <span>•</span>
            <span>24,512 Saves</span>
            <span>•</span>
            <span>42 songs, 2 hr 15 min</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-8 py-6 flex items-center gap-6 relative z-10">
        <button className="w-16 h-16 bg-[#FFB703] text-[#1A1A1A] rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
          <Play size={28} fill="currentColor" className="ml-1" />
        </button>
        <button className="text-gray-400 hover:text-pink-500 transition-colors">
          <Heart size={32} />
        </button>
        <button className="text-gray-400 hover:text-[#1A1A1A] transition-colors">
          <Share2 size={24} />
        </button>
        <button className="text-gray-400 hover:text-[#1A1A1A] transition-colors">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Tracklist */}
      <div className="px-8 max-w-6xl">
        <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 p-4 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          <div className="w-12 text-center">#</div>
          <div>Title</div>
          <div>Album</div>
          <div className="w-24 text-right pr-4 flex justify-end"><Clock size={16} /></div>
        </div>

        {loading ? (
          <div className="w-full py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-[#FFB703]/20 border-t-[#FFB703] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col">
            {tracks.map((track, idx) => (
              <div 
                key={track.id} 
                onClick={() => playTrack(track, tracks)}
                className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 p-3 items-center hover:bg-white rounded-xl transition-colors cursor-pointer group"
              >
                <div className="w-12 text-center text-gray-400 font-medium group-hover:hidden">{idx + 1}</div>
                <div className="w-12 text-center hidden group-hover:flex justify-center text-[#FFB703]">
                  <Play size={16} fill="currentColor" />
                </div>
                
                <div className="flex items-center gap-4">
                  <img src={track.thumbnail} alt={track.title} className="w-10 h-10 rounded shadow-sm object-cover" />
                  <div className="truncate">
                    <div className="font-bold text-[#1A1A1A] truncate group-hover:text-[#FFB703] transition-colors">{track.title}</div>
                    <div className="text-sm text-gray-500 truncate">{track.artist}</div>
                  </div>
                </div>

                <div className="text-sm text-gray-500 truncate hover:underline hover:text-[#1A1A1A]">Unknown Album</div>

                <div className="w-24 flex items-center justify-end gap-4 pr-4">
                  <Heart size={16} className="text-gray-300 hover:text-pink-500 opacity-0 group-hover:opacity-100 transition-all" />
                  <span className="text-sm text-gray-400">{track.length || "3:00"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
