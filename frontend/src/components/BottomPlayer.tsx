"use client";

import { useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Shuffle, Repeat, Sparkles, ListMusic, Heart } from "lucide-react";
import { SafeImage as Image } from "@/components/SafeImage";
import Link from "next/link";
import { NowPlayingModal } from "./NowPlayingModal";
import { SongActions } from "./SongActions";

export function BottomPlayer() {
  const { currentTrack, isPlaying, pauseTrack, resumeTrack, nextTrack, prevTrack, progress, duration, seekTo, isShuffle, repeatMode, isMagicShuffle, toggleShuffle, toggleRepeat, toggleMagicShuffle, volume, setVolume } = usePlayer();
  const [showModal, setShowModal] = useState(false);

  if (!currentTrack) {
    return (
      <div className="w-full h-24 shrink-0 relative bg-white border-t border-gray-200 z-[100] flex items-center justify-center text-gray-400">
        <p className="font-semibold text-sm">No track playing. Discover something new!</p>
      </div>
    );
  }

  return (
    <>
      {showModal && <NowPlayingModal onClose={() => setShowModal(false)} />}

      <div className="w-full h-24 shrink-0 relative bg-white/80 backdrop-blur-xl border-t border-gray-200 z-[100] px-6 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        
        {/* Track Info + quick actions */}
        <div className="flex items-center gap-4 w-1/3 min-w-[200px]">
          {/* Clickable album art → opens modal */}
          <button
            onClick={() => setShowModal(true)}
            className="relative w-14 h-14 rounded-md overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-shadow shrink-0 group"
            title="Open Now Playing"
          >
            {currentTrack.thumbnail && (
              <Image src={currentTrack.thumbnail} alt={currentTrack.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <Maximize2 size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          <div className="flex flex-col truncate flex-1 min-w-0">
            <span
              className="font-bold text-[#1A1A1A] text-sm truncate cursor-pointer hover:text-[#FFB703] transition-colors"
              onClick={() => setShowModal(true)}
            >
              {currentTrack.title}
            </span>
            <span className="text-xs text-gray-500 font-medium truncate">{currentTrack.artist}</span>
          </div>

          {/* Like + Add to playlist inline in player */}
          <div className="flex items-center gap-1.5 pr-2 shrink-0" onClick={e => e.stopPropagation()}>
            <SongActions track={currentTrack} size="sm" hideQueueButton={true} />
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex flex-col items-center justify-center w-1/3 max-w-[500px]">
          <div className="flex items-center gap-6 mb-2">
            <button onClick={toggleShuffle} className={`${isShuffle ? 'text-[#FFB703]' : 'text-gray-400 hover:text-[#1A1A1A]'} transition-colors`}><Shuffle size={18} /></button>
            <button onClick={prevTrack} className="text-gray-600 hover:text-[#1A1A1A] transition-colors"><SkipBack size={20} fill="currentColor" /></button>
            
            <button 
              onClick={isPlaying ? pauseTrack : resumeTrack}
              className="w-10 h-10 rounded-full bg-[#FFB703] text-[#1A1A1A] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>

            <button onClick={nextTrack} className="text-gray-600 hover:text-[#1A1A1A] transition-colors"><SkipForward size={20} fill="currentColor" /></button>
            <button onClick={toggleRepeat} className={`${repeatMode !== 'off' ? 'text-[#FFB703]' : 'text-gray-400 hover:text-[#1A1A1A]'} transition-colors relative flex items-center justify-center`}>
              <Repeat size={18} />
              {repeatMode === 'one' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full w-2.5 h-2.5 flex items-center justify-center">
                  <span className="text-[7px] font-bold text-[#1A1A1A] leading-none">1</span>
                </div>
              )}
            </button>
            <button onClick={toggleMagicShuffle} className={`${isMagicShuffle ? 'text-[#FFB703]' : 'text-gray-400 hover:text-[#1A1A1A]'} transition-colors relative flex items-center justify-center`} title="Magic Shuffle">
              <Sparkles size={18} />
              {isMagicShuffle && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFB703] rounded-full animate-pulse shadow-[0_0_5px_#FFB703]"></span>
              )}
            </button>
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
          <Volume2 
            size={18} 
            onClick={() => setVolume(volume === 0 ? 50 : 0)} 
            className="cursor-pointer hover:text-[#1A1A1A] transition-colors" 
          />
          <div 
            className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden cursor-pointer group"
            onClick={(e) => {
              const bounds = e.currentTarget.getBoundingClientRect();
              const percent = ((e.clientX - bounds.left) / bounds.width) * 100;
              setVolume(Math.max(0, Math.min(100, percent)));
            }}
          >
            <div className="h-full bg-[#1A1A1A] group-hover:bg-[#FFB703] transition-colors" style={{ width: `${volume}%` }}></div>
          </div>
          <Link href="/dashboard/queue" className="hover:text-[#FFB703] transition-colors" title="View Queue">
            <ListMusic size={18} />
          </Link>
          {/* Expand → opens full Now Playing modal */}
          <button
            onClick={() => setShowModal(true)}
            className="hover:text-[#1A1A1A] cursor-pointer transition-colors"
            title="Open Now Playing"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
