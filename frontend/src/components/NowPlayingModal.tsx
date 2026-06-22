"use client";

import { useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { ChevronDown } from "lucide-react";
import { NowPlayingLeftPanel } from "./NowPlayingLeftPanel";
import { NowPlayingRightPanel } from "./NowPlayingRightPanel";

interface NowPlayingModalProps {
  onClose: () => void;
}

export function NowPlayingModal({ onClose }: NowPlayingModalProps) {
  const {
    currentTrack, isPlaying, pauseTrack, resumeTrack,
    nextTrack, prevTrack, progress, duration, seekTo,
    isShuffle, repeatMode, isMagicShuffle, toggleShuffle, toggleRepeat, toggleMagicShuffle,
    volume, setVolume, queue
  } = usePlayer();

  const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
  const upNext = currentIndex >= 0 ? queue.slice(currentIndex + 1, currentIndex + 20) : [];

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!currentTrack) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#FDFBF7] overflow-hidden flex flex-col md:flex-row text-[#1A1A1A] animate-in fade-in duration-300">
      {/* Light Blurred immersive background */}
      {currentTrack.thumbnail && (
        <div 
          className="absolute inset-0 opacity-10 mix-blend-multiply scale-110 pointer-events-none"
          style={{ 
            backgroundImage: `url(${currentTrack.thumbnail})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            filter: 'blur(100px)' 
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-[#FDFBF7] pointer-events-none" />

      {/* Top Header - Close Button (Absolute) */}
      <button 
        onClick={onClose} 
        className="absolute top-8 left-8 z-50 p-3 rounded-full bg-white/50 hover:bg-white backdrop-blur-md text-[#1A1A1A] transition-all shadow-sm border border-gray-100"
      >
        <ChevronDown size={28} />
      </button>

      {/* LEFT PANEL: Massive Player */}
      <NowPlayingLeftPanel
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
        volume={volume}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        isMagicShuffle={isMagicShuffle}
        seekTo={seekTo}
        setVolume={setVolume}
        toggleShuffle={toggleShuffle}
        toggleRepeat={toggleRepeat}
        toggleMagicShuffle={toggleMagicShuffle}
        pauseTrack={pauseTrack}
        resumeTrack={resumeTrack}
        prevTrack={prevTrack}
        nextTrack={nextTrack}
      />

      {/* RIGHT PANEL: Tabs & Lists */}
      <NowPlayingRightPanel
        currentTrack={currentTrack}
        upNext={upNext}
        toggleMagicShuffle={toggleMagicShuffle}
        onClose={onClose}
      />
    </div>
  );
}
