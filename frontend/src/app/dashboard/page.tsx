"use client";

import { useState, useEffect } from "react";
import { searchMusic, Track } from "@/lib/api";
import { usePlayer } from "@/context/PlayerContext";
import Image from "next/image";
import { Play } from "lucide-react";

export default function DashboardHome() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    // Fetch some initial trending/daily picks tracks to populate the home page
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const results = await searchMusic("Trending Pop");
        setTracks(results);
      } catch (error) {
        console.error("Failed to load initial tracks", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A] mb-2">Good Evening</h1>
        <p className="text-gray-500 font-medium">Here's your Daily Picks based on your Taste DNA.</p>
      </header>

      <section>
        <h2 className="text-xl font-bold mb-4 text-[#1A1A1A]">Daily Picks</h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-[#FFB703] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {tracks.map((track) => (
              <div 
                key={track.id}
                className="group relative bg-[#FDFBF7] border border-gray-100 rounded-2xl p-4 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
                onClick={() => playTrack(track, tracks)}
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-gray-100 shadow-sm">
                  {track.thumbnail ? (
                    <Image src={track.thumbnail} alt={track.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"></div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-[#FFB703] text-[#1A1A1A] flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <Play size={24} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                </div>
                
                <h3 className="font-bold text-[#1A1A1A] text-sm truncate">{track.title}</h3>
                <p className="text-xs text-gray-500 font-medium truncate mt-1">{track.artist}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
