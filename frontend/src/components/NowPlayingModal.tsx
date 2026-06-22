"use client";

import { useState, useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { X, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Sparkles, Heart, ListPlus, Volume2, ChevronDown, Music2, Mic2, Disc3, ExternalLink } from "lucide-react";
import Image from "next/image";
import { SongActions } from "./SongActions";
import { getRadioQueue } from "@/lib/api";
import Link from "next/link";

interface NowPlayingModalProps {
  onClose: () => void;
}

type ActiveTab = "about" | "up-next" | "artist";

export function NowPlayingModal({ onClose }: NowPlayingModalProps) {
  const {
    currentTrack, isPlaying, pauseTrack, resumeTrack,
    nextTrack, prevTrack, progress, duration, seekTo,
    isShuffle, repeatMode, isMagicShuffle, toggleShuffle, toggleRepeat, toggleMagicShuffle,
    volume, setVolume, queue
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<ActiveTab>("about");
  const [radioTracks, setRadioTracks] = useState<any[]>([]);
  const [radioLoading, setRadioLoading] = useState(false);
  const [dominantColor, setDominantColor] = useState("#1A1A1A");

  const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
  const upNext = currentIndex >= 0 ? queue.slice(currentIndex + 1, currentIndex + 6) : [];

  // Fetch related tracks for "Artist" tab
  useEffect(() => {
    if (!currentTrack) return;
    setRadioLoading(true);
    getRadioQueue(currentTrack.id)
      .then(tracks => setRadioTracks(tracks.slice(0, 8)))
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
  const genres = ["Pop", "Indie", "Soul"];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(20px)" }}
    >
      {/* Main Panel — slides up */}
      <div
        className="w-full max-w-2xl bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "94vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Close button */}
        <div className="flex items-center justify-between px-6 pb-2">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronDown size={22} />
          </button>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Now Playing</p>
          <div className="w-9" />
        </div>

        {/* Album Art */}
        <div className="flex justify-center px-10 mb-5">
          <div className="relative w-full aspect-square max-h-60 rounded-3xl overflow-hidden shadow-2xl">
            {currentTrack.thumbnail ? (
              <Image
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                fill
                className={`object-cover transition-all duration-700 ${isPlaying ? "scale-105" : "scale-100"}`}
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <Music2 size={64} className="text-gray-400" />
              </div>
            )}
            {/* Animated playing shimmer */}
            {isPlaying && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            )}
          </div>
        </div>

        {/* Track Info + Actions */}
        <div className="px-8 flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 mr-3">
            <h2 className="text-xl font-black text-[#1A1A1A] truncate leading-tight">{currentTrack.title}</h2>
            <p className="text-gray-500 font-semibold text-sm truncate mt-0.5">{currentTrack.artist}</p>
          </div>
          <div className="shrink-0">
            <SongActions track={currentTrack} size="md" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-8 mb-4">
          <div
            className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden cursor-pointer group"
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
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-gray-400 tabular-nums">{formatTime(progress, duration)}</span>
            <span className="text-[11px] text-gray-400 tabular-nums">{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, "0")}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="px-8 mb-5">
          <div className="flex items-center justify-between">
            <button onClick={toggleShuffle} className={`p-2 rounded-full transition-colors ${isShuffle ? "text-[#FFB703]" : "text-gray-400 hover:text-[#1A1A1A]"}`}>
              <Shuffle size={20} />
            </button>
            <button onClick={prevTrack} className="p-2 text-gray-600 hover:text-[#1A1A1A] transition-colors">
              <SkipBack size={24} fill="currentColor" />
            </button>
            <button
              onClick={isPlaying ? pauseTrack : resumeTrack}
              className="w-14 h-14 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={nextTrack} className="p-2 text-gray-600 hover:text-[#1A1A1A] transition-colors">
              <SkipForward size={24} fill="currentColor" />
            </button>
            <button onClick={toggleRepeat} className={`p-2 rounded-full transition-colors relative ${repeatMode !== "off" ? "text-[#FFB703]" : "text-gray-400 hover:text-[#1A1A1A]"}`}>
              <Repeat size={20} />
              {repeatMode === "one" && (
                <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-[#FFB703] rounded-full flex items-center justify-center">
                  <span className="text-[7px] font-black text-[#1A1A1A]">1</span>
                </span>
              )}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 mt-4">
            <Volume2 size={16} className="text-gray-400 shrink-0 cursor-pointer" onClick={() => setVolume(volume === 0 ? 60 : 0)} />
            <div
              className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden cursor-pointer group"
              onClick={e => {
                const bounds = e.currentTarget.getBoundingClientRect();
                const pct = ((e.clientX - bounds.left) / bounds.width) * 100;
                setVolume(Math.max(0, Math.min(100, pct)));
              }}
            >
              <div className="h-full bg-gray-400 group-hover:bg-[#FFB703] transition-colors rounded-full" style={{ width: `${volume}%` }} />
            </div>
            <button onClick={toggleMagicShuffle} className={`p-1.5 rounded-full transition-colors ${isMagicShuffle ? "text-[#FFB703]" : "text-gray-300 hover:text-gray-500"}`} title="Magic Shuffle">
              <Sparkles size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-100 shrink-0">
          {(["about", "up-next", "artist"] as ActiveTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
                activeTab === tab
                  ? "text-[#1A1A1A] border-b-2 border-[#FFB703]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab === "about" ? "About" : tab === "up-next" ? "Up Next" : "Artist"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* About Tab */}
          {activeTab === "about" && (
            <div className="p-6 space-y-5">
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                  <Disc3 size={12} /> Track
                </p>
                <p className="font-black text-[#1A1A1A] text-lg">{currentTrack.title}</p>
                {currentTrack.album && (
                  <p className="text-sm text-gray-500 mt-1">Album: {currentTrack.album}</p>
                )}
                <p className="text-sm text-gray-500">Artist: {currentTrack.artist}</p>
                {currentTrack.duration && (
                  <p className="text-sm text-gray-500">Duration: {currentTrack.duration}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                  <Mic2 size={12} /> Main Artist
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFB703]/30 to-purple-400/30 flex items-center justify-center">
                    <Mic2 size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-black text-[#1A1A1A]">{artistName}</p>
                    <p className="text-xs text-gray-500">Artist</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#FFB703]/10 to-transparent rounded-2xl p-5 border border-[#FFB703]/20">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Open in YouTube Music</p>
                <a
                  href={`https://music.youtube.com/watch?v=${currentTrack.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-bold text-[#FFB703] hover:text-[#ffc124] transition-colors"
                >
                  <ExternalLink size={14} /> View on YouTube Music
                </a>
              </div>
            </div>
          )}

          {/* Up Next Tab */}
          {activeTab === "up-next" && (
            <div className="p-4">
              {upNext.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 font-medium text-sm">Nothing else in your queue.</p>
                  <p className="text-gray-300 text-xs mt-1">Enable Magic Shuffle ✨ to keep the music going!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {upNext.map((track, idx) => (
                    <div key={`${track.id}-${idx}`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-bold text-gray-200 w-5 text-center tabular-nums">{idx + 1}</span>
                      {track.thumbnail && (
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0">
                          <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1A1A1A] text-sm truncate">{track.title}</p>
                        <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                      </div>
                      {(track as any).isMagic && (
                        <span className="text-[10px] font-bold text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded-md shrink-0">✨</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Artist Discovery Tab */}
          {activeTab === "artist" && (
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-4 bg-[#1A1A1A] rounded-2xl p-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFB703]/40 to-purple-400/40 flex items-center justify-center shrink-0">
                  <Mic2 size={28} className="text-[#FFB703]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Artist</p>
                  <p className="text-xl font-black text-white">{artistName}</p>
                  <a
                    href={`https://music.youtube.com/search?q=${encodeURIComponent(artistName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#FFB703] font-bold flex items-center gap-1 mt-1 hover:underline"
                  >
                    <ExternalLink size={10} /> View on YouTube Music
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">More Like This</p>
                {radioLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[#FFB703]/30 border-t-[#FFB703] rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    {radioTracks.map((track, idx) => (
                      <div key={`${track.id}-${idx}`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer">
                        {track.thumbnail && (
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0">
                            <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                          <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                        </div>
                        <div onClick={e => e.stopPropagation()}>
                          <SongActions track={track} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
