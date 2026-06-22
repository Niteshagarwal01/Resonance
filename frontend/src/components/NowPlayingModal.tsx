"use client";

import { useState, useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { X, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Sparkles, Heart, ListPlus, Volume2, ChevronDown, Music2, Mic2, Disc3, ExternalLink } from "lucide-react";
import { SafeImage as Image } from "@/components/SafeImage";
import { SongActions } from "./SongActions";
import { getRadioQueue } from "@/lib/api";
import Link from "next/link";

interface NowPlayingModalProps {
  onClose: () => void;
}

type ActiveTab = "up-next" | "artist" | "about";

export function NowPlayingModal({ onClose }: NowPlayingModalProps) {
  const {
    currentTrack, isPlaying, pauseTrack, resumeTrack,
    nextTrack, prevTrack, progress, duration, seekTo,
    isShuffle, repeatMode, isMagicShuffle, toggleShuffle, toggleRepeat, toggleMagicShuffle,
    volume, setVolume, queue
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<ActiveTab>("up-next");
  const [radioTracks, setRadioTracks] = useState<any[]>([]);
  const [radioLoading, setRadioLoading] = useState(false);

  const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
  const upNext = currentIndex >= 0 ? queue.slice(currentIndex + 1, currentIndex + 20) : [];

  // Fetch related tracks for "Artist" tab
  useEffect(() => {
    if (!currentTrack) return;
    setRadioLoading(true);
    getRadioQueue(currentTrack.id)
      .then(tracks => setRadioTracks(tracks.slice(0, 10)))
      .catch(() => {})
      .finally(() => setRadioLoading(false));
  }, [currentTrack?.id]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const formatTime = (pct: number, dur: number) => {
    const secs = Math.floor((pct / 100) * dur);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!currentTrack) return null;

  const artistName = currentTrack.artist?.split(",")[0]?.trim() || "Unknown Artist";

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
      <div className="relative z-10 w-full md:w-[55%] lg:w-[60%] h-full flex flex-col items-center justify-center p-8 md:p-12 lg:p-20 border-r border-gray-100">
        
        {/* Album Art */}
        <div className="w-full max-w-lg aspect-square rounded-[2rem] overflow-hidden shadow-2xl shadow-black/10 mb-10 relative group bg-white border border-gray-50">
          {currentTrack.thumbnail ? (
            <Image
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              fill
              className={`object-cover transition-transform duration-[20s] ease-linear ${isPlaying ? "scale-110" : "scale-100"}`}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 size={100} className="text-gray-200" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="w-full max-w-lg">
          {/* Info + Actions */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1 min-w-0 mr-4">
              <h1 className="text-3xl md:text-4xl font-black text-[#1A1A1A] truncate leading-tight tracking-tight drop-shadow-sm">
                {currentTrack.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-500 font-medium truncate mt-1">
                {currentTrack.artist}
              </p>
            </div>
            <div className="shrink-0 bg-white/60 border border-gray-100 p-2 rounded-2xl backdrop-blur-md flex items-center gap-2 shadow-sm">
              <SongActions track={currentTrack} size="lg" hideQueueButton={true} />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div
              className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden cursor-pointer group mb-3 shadow-inner"
              onClick={e => {
                const bounds = e.currentTarget.getBoundingClientRect();
                const pct = ((e.clientX - bounds.left) / bounds.width) * 100;
                seekTo(Math.max(0, Math.min(100, pct)));
              }}
            >
              <div
                className="h-full bg-[#1A1A1A] group-hover:bg-[#FFB703] transition-colors rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-bold text-gray-400 tabular-nums">{formatTime(progress, duration)}</span>
              <span className="text-xs font-bold text-gray-400 tabular-nums">{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, "0")}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button onClick={toggleShuffle} className={`p-3 rounded-full transition-all hover:bg-gray-100 ${isShuffle ? "text-[#FFB703]" : "text-gray-400"}`}>
              <Shuffle size={24} />
            </button>
            
            <div className="flex items-center gap-6">
              <button onClick={prevTrack} className="p-3 text-gray-600 hover:text-[#1A1A1A] transition-colors hover:scale-110 active:scale-95">
                <SkipBack size={36} fill="currentColor" />
              </button>
              
              <button
                onClick={isPlaying ? pauseTrack : resumeTrack}
                className="w-24 h-24 rounded-full bg-[#FFB703] text-[#1A1A1A] flex items-center justify-center shadow-[0_8px_30px_rgba(255,183,3,0.3)] hover:shadow-[0_12px_40px_rgba(255,183,3,0.4)] hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
              </button>
              
              <button onClick={nextTrack} className="p-3 text-gray-600 hover:text-[#1A1A1A] transition-colors hover:scale-110 active:scale-95">
                <SkipForward size={36} fill="currentColor" />
              </button>
            </div>

            <button onClick={toggleRepeat} className={`p-3 rounded-full transition-all hover:bg-gray-100 relative ${repeatMode !== "off" ? "text-[#FFB703]" : "text-gray-400"}`}>
              <Repeat size={24} />
              {repeatMode === "one" && (
                <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-[#FFB703] rounded-full flex items-center justify-center">
                  <span className="text-[8px] font-black text-[#1A1A1A]">1</span>
                </span>
              )}
            </button>
          </div>

          {/* Volume + Magic */}
          <div className="flex items-center gap-4 mt-10 bg-white/60 border border-gray-100 p-4 rounded-2xl backdrop-blur-md shadow-sm">
            <Volume2 size={20} className="text-gray-400 shrink-0 cursor-pointer hover:text-[#1A1A1A]" onClick={() => setVolume(volume === 0 ? 60 : 0)} />
            <div
              className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer group"
              onClick={e => {
                const bounds = e.currentTarget.getBoundingClientRect();
                const pct = ((e.clientX - bounds.left) / bounds.width) * 100;
                setVolume(Math.max(0, Math.min(100, pct)));
              }}
            >
              <div className="h-full bg-gray-400 group-hover:bg-[#FFB703] transition-colors rounded-full" style={{ width: `${volume}%` }} />
            </div>
            <button 
              onClick={toggleMagicShuffle} 
              className={`p-2 rounded-full transition-colors flex items-center gap-2 text-sm font-bold ${isMagicShuffle ? "bg-[#FFB703]/20 text-[#FFB703]" : "text-gray-400 hover:bg-gray-100"}`} 
            >
              <Sparkles size={18} className={isMagicShuffle ? "animate-pulse" : ""} />
            </button>
          </div>

        </div>
      </div>

      {/* RIGHT PANEL: Tabs & Lists */}
      <div className="relative z-10 w-full md:w-[45%] lg:w-[40%] h-full flex flex-col bg-white/40 backdrop-blur-3xl">
        {/* Tabs Header */}
        <div className="flex px-6 pt-10 pb-4 shrink-0 gap-6 border-b border-gray-200">
          {(["up-next", "artist", "about"] as ActiveTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                activeTab === tab
                  ? "text-[#1A1A1A]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab === "about" ? "About" : tab === "up-next" ? "Up Next" : "Artist"}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFB703] rounded-t-full shadow-[0_0_10px_#FFB703]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
          
          {/* Up Next Tab */}
          {activeTab === "up-next" && (
            <div>
              {upNext.length === 0 ? (
                <div className="text-center py-20">
                  <ListPlus size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-500 font-medium">Nothing else in your queue.</p>
                  <button onClick={toggleMagicShuffle} className="mt-6 px-6 py-2.5 rounded-full bg-white border border-gray-200 hover:border-[#FFB703] shadow-sm hover:text-[#FFB703] transition-all text-sm font-bold flex items-center gap-2 mx-auto">
                    <Sparkles size={16}/> Auto-play Magic Mix
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 pl-2">Playing Next</p>
                  {upNext.map((track, idx) => (
                    <div key={`${track.id}-${idx}`} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-sm">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        {track.thumbnail ? (
                          <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />
                        ) : (
                          <Music2 className="text-gray-300 m-auto mt-3" size={24}/>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play size={16} fill="white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1A1A1A] text-[15px] truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                        <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                      </div>
                      {(track as any).isMagic && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] bg-[#FFB703] px-2 py-1 rounded-md shrink-0 shadow-sm">Magic</span>
                      )}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <SongActions track={track} size="sm" hideQueueButton={true} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Artist Discovery Tab */}
          {activeTab === "artist" && (
            <div className="space-y-8">
              <div className="flex items-center gap-5 bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm backdrop-blur-md">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFB703] to-pink-500 flex items-center justify-center shrink-0 shadow-lg">
                  <Mic2 size={32} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Main Artist</p>
                  <p className="text-2xl font-black text-[#1A1A1A]">{artistName}</p>
                  <a
                    href={`https://music.youtube.com/search?q=${encodeURIComponent(artistName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 font-bold flex items-center gap-1.5 mt-2 hover:text-[#FFB703] transition-colors"
                  >
                    <ExternalLink size={14} /> Open in YouTube Music
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 pl-2">More Like This</p>
                {radioLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[#FFB703]/20 border-t-[#FFB703] rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {radioTracks.map((track, idx) => (
                      <div key={`${track.id}-${idx}`} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-sm">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                          {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play size={16} fill="white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#1A1A1A] text-[15px] truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                          <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <SongActions track={track} size="sm" hideQueueButton={true} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === "about" && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm backdrop-blur-md">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <Disc3 size={16} /> Track Details
                </p>
                <div className="space-y-5">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Title</p>
                    <p className="font-black text-[#1A1A1A] text-xl">{currentTrack.title}</p>
                  </div>
                  {currentTrack.album && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Album</p>
                      <p className="font-bold text-gray-700 text-lg">{currentTrack.album}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Artist</p>
                    <p className="font-bold text-gray-700 text-lg">{currentTrack.artist}</p>
                  </div>
                  {currentTrack.duration && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Duration</p>
                      <p className="font-bold text-gray-700 text-lg">{currentTrack.duration}</p>
                    </div>
                  )}
                </div>
              </div>

              <a
                href={`https://music.youtube.com/watch?v=${currentTrack.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-6 bg-gradient-to-br from-[#FF0000]/5 to-white border border-[#FF0000]/10 rounded-[2rem] hover:from-[#FF0000]/10 hover:shadow-md transition-all cursor-pointer shadow-sm"
              >
                <div>
                  <p className="text-[#1A1A1A] font-black text-lg mb-1">YouTube Music</p>
                  <p className="text-gray-500 text-sm font-medium">Watch the official video or lyrics</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#FF0000]/10 group-hover:bg-[#FF0000]/20 flex items-center justify-center transition-colors">
                  <ExternalLink size={20} className="text-[#FF0000]" />
                </div>
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
