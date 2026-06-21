"use client";

import { Library as LibraryIcon, Play, Heart, Clock, Download } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { searchMusic } from "@/lib/api";
import { useEffect, useState } from "react";

export default function LibraryPage() {
  const { playTrack } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const tracks = await searchMusic("chill acoustic covers");
        setData(tracks.slice(0, 10)); // mock library
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-8 pb-32 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="mb-12 flex items-end justify-between">
        <div>
          <h1 className="text-5xl font-black text-[#1A1A1A] mb-4 flex items-center gap-4">
            Your Library <LibraryIcon className="text-indigo-500" size={40} />
          </h1>
          <p className="text-gray-500 text-lg">
            Everything you've saved, liked, and curated.
          </p>
        </div>
        
        {/* Filter Pills */}
        <div className="flex gap-2">
          {["Playlists", "Albums", "Artists", "Podcasts"].map(filter => (
            <button key={filter} className="px-5 py-2 rounded-full border border-gray-200 bg-white font-bold text-sm text-gray-600 hover:border-[#FFB703] transition-colors">
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Liked Songs Hero Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-700 w-full rounded-3xl p-10 text-white mb-12 shadow-xl relative overflow-hidden group cursor-pointer">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
          <Heart size={300} fill="currentColor" />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-between min-h-[200px]">
          <div>
            <h2 className="text-4xl font-black mb-2">Liked Songs</h2>
            <p className="text-indigo-100 font-medium">128 tracks • 8 hours 12 mins</p>
          </div>
          <button className="bg-white text-indigo-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <Play fill="currentColor" size={24} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Recent Adds (List View) */}
      <div>
        <h2 className="text-2xl font-black text-[#1A1A1A] mb-6 flex items-center gap-2">
          <Clock size={24} className="text-gray-400"/> Recently Added
        </h2>

        {loading ? (
          <div className="w-full flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-[#1A1A1A] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 p-4 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <div className="w-12 text-center">#</div>
              <div>Title</div>
              <div>Album</div>
              <div className="w-24 text-right pr-4">Duration</div>
            </div>

            {/* Track Rows */}
            <div className="flex flex-col">
              {data.map((track, idx) => (
                <div 
                  key={track.id} 
                  onClick={() => playTrack(track, data)}
                  className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 p-3 items-center hover:bg-gray-50 transition-colors cursor-pointer group"
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

                  <div className="text-sm text-gray-500 truncate">Unknown Album</div>

                  <div className="w-24 flex items-center justify-end gap-4 pr-4">
                    <Heart size={16} className="text-gray-300 hover:text-pink-500 opacity-0 group-hover:opacity-100 transition-all" />
                    <span className="text-sm text-gray-400">{track.length || "3:00"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
