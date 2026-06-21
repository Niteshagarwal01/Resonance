"use client";

import { usePlayer } from "@/context/PlayerContext";
import { ListMusic, Play, Heart, Share2, Disc3 } from "lucide-react";

export default function QueuePage() {
  const { queue, currentTrack, playTrack } = usePlayer();

  if (!currentTrack) {
    return (
      <div className="p-8 pb-32 flex flex-col items-center justify-center h-[calc(100vh-96px)]">
        <Disc3 size={80} className="text-gray-200 mb-6 animate-pulse" />
        <h1 className="text-3xl font-black text-[#1A1A1A] mb-2">Queue is empty</h1>
        <p className="text-gray-500">Go discover some new music to get started.</p>
      </div>
    );
  }

  // Find the index of the currently playing track in the queue
  const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
  const upNext = currentIndex >= 0 ? queue.slice(currentIndex + 1) : [];
  const history = currentIndex > 0 ? queue.slice(0, currentIndex) : [];

  return (
    <div className="p-8 pb-32 max-w-5xl mx-auto flex flex-col lg:flex-row gap-12">
      
      {/* Left Col: Now Playing Giant View */}
      <div className="w-full lg:w-1/2 flex flex-col items-center text-center">
        <div className="w-full aspect-square bg-gray-100 rounded-3xl shadow-2xl mb-8 overflow-hidden">
          <img src={currentTrack.thumbnail} alt={currentTrack.title} className="w-full h-full object-cover" />
        </div>
        
        <h1 className="text-4xl font-black text-[#1A1A1A] mb-2 truncate w-full px-4">{currentTrack.title}</h1>
        <p className="text-xl text-gray-500 font-medium mb-6 truncate w-full px-4">{currentTrack.artist}</p>
        
        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-pink-500 transition-colors">
            <Heart size={32} />
          </button>
          <button className="text-gray-400 hover:text-[#1A1A1A] transition-colors">
            <Share2 size={28} />
          </button>
        </div>
      </div>

      {/* Right Col: The Queue List */}
      <div className="w-full lg:w-1/2">
        
        <h2 className="text-2xl font-black text-[#1A1A1A] mb-6 flex items-center gap-2">
          <ListMusic size={24} className="text-[#FFB703]" /> Up Next
        </h2>

        {upNext.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
            That's all for now! Add more songs to your queue.
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-12">
            {upNext.map((track, idx) => (
              <div 
                key={track.id + idx} 
                onClick={() => playTrack(track, queue)}
                className="flex items-center gap-4 p-3 hover:bg-white rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-gray-100 hover:shadow-sm"
              >
                <div className="w-6 text-center text-gray-400 font-medium group-hover:hidden">{idx + 1}</div>
                <div className="w-6 text-center hidden group-hover:flex justify-center text-[#FFB703]">
                  <Play size={16} fill="currentColor" />
                </div>
                <img src={track.thumbnail} alt={track.title} className="w-12 h-12 rounded object-cover" />
                <div className="flex-1 truncate">
                  <div className="font-bold text-[#1A1A1A] truncate group-hover:text-[#FFB703] transition-colors">{track.title}</div>
                  <div className="text-sm text-gray-500 truncate">{track.artist}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <>
            <h2 className="text-2xl font-black text-gray-400 mb-6">Previously Played</h2>
            <div className="flex flex-col gap-2 opacity-60">
              {history.map((track, idx) => (
                <div 
                  key={track.id + idx} 
                  onClick={() => playTrack(track, queue)}
                  className="flex items-center gap-4 p-3 hover:bg-white rounded-xl transition-colors cursor-pointer group"
                >
                  <img src={track.thumbnail} alt={track.title} className="w-10 h-10 rounded object-cover grayscale group-hover:grayscale-0 transition-all" />
                  <div className="flex-1 truncate">
                    <div className="font-bold text-[#1A1A1A] truncate group-hover:text-[#FFB703] transition-colors">{track.title}</div>
                    <div className="text-sm text-gray-500 truncate">{track.artist}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

    </div>
  );
}
