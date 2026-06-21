"use client";

import { usePlayer } from "@/context/PlayerContext";
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Shuffle, Repeat } from "lucide-react";
import Image from "next/image";

export function BottomPlayer() {
  const { currentTrack, isPlaying, pauseTrack, resumeTrack, nextTrack, prevTrack, progress, duration, seekTo } = usePlayer();

  if (!currentTrack) {
    return (
      <div className="w-full h-24 shrink-0 relative bg-white border-t border-gray-200 z-[100] flex items-center justify-center text-gray-400">
        <p className="font-semibold text-sm">No track playing. Discover something new!</p>
      </div>
    );
  }

  return (
    <div className="w-full h-24 shrink-0 relative bg-white/80 backdrop-blur-xl border-t border-gray-200 z-[100] px-6 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
      
      {/* Track Info */}
      <div className="flex items-center gap-4 w-1/3 min-w-[200px]">
        {currentTrack.thumbnail && (
          <div className="relative w-14 h-14 rounded-md overflow-hidden bg-gray-100 shadow-sm">
            <Image src={currentTrack.thumbnail} alt={currentTrack.title} fill className="object-cover" />
          </div>
        )}
        <div className="flex flex-col truncate">
          <span className="font-bold text-[#1A1A1A] text-sm truncate">{currentTrack.title}</span>
          <span className="text-xs text-gray-500 font-medium truncate">{currentTrack.artist}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col items-center justify-center w-1/3 max-w-[500px]">
        <div className="flex items-center gap-6 mb-2">
          <button className="text-gray-400 hover:text-[#1A1A1A] transition-colors"><Shuffle size={18} /></button>
          <button onClick={prevTrack} className="text-gray-600 hover:text-[#1A1A1A] transition-colors"><SkipBack size={20} fill="currentColor" /></button>
          
          <button 
            onClick={isPlaying ? pauseTrack : resumeTrack}
            className="w-10 h-10 rounded-full bg-[#FFB703] text-[#1A1A1A] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>

          <button onClick={nextTrack} className="text-gray-600 hover:text-[#1A1A1A] transition-colors"><SkipForward size={20} fill="currentColor" /></button>
          <button className="text-gray-400 hover:text-[#1A1A1A] transition-colors"><Repeat size={18} /></button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-3">
          <span className="text-[10px] font-medium text-gray-500 w-8 text-right">
            {Math.floor((progress / 100 * duration) / 60) || 0}:
            {Math.floor((progress / 100 * duration) % 60).toString().padStart(2, '0') || '00'}
          </span>
          <div 
            className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden cursor-pointer group relative"
            onClick={(e) => {
              const bounds = e.currentTarget.getBoundingClientRect();
              const percent = ((e.clientX - bounds.left) / bounds.width) * 100;
              seekTo(percent);
            }}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-[#1A1A1A] group-hover:bg-[#FFB703] transition-colors" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <span className="text-[10px] font-medium text-gray-500 w-8">
            {Math.floor(duration / 60) || 0}:
            {Math.floor(duration % 60).toString().padStart(2, '0') || '00'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center justify-end gap-4 w-1/3 min-w-[150px] text-gray-500">
        <Volume2 size={18} />
        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="w-1/2 h-full bg-[#1A1A1A]"></div>
        </div>
        <Maximize2 size={18} className="ml-2 hover:text-[#1A1A1A] cursor-pointer transition-colors" />
      </div>

    </div>
  );
}
