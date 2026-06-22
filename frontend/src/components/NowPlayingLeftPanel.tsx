import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Sparkles, Volume2, Music2 } from "lucide-react";
import { SafeImage as Image } from "@/components/SafeImage";
import { SongActions } from "@/components/SongActions";
import { Track } from "@/lib/api";

interface NowPlayingLeftPanelProps {
  currentTrack: Track;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: "off" | "all" | "one";
  isMagicShuffle: boolean;
  seekTo: (percent: number) => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleMagicShuffle: () => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  prevTrack: () => void;
  nextTrack: () => void;
}

export function NowPlayingLeftPanel({
  currentTrack, isPlaying, progress, duration, volume,
  isShuffle, repeatMode, isMagicShuffle,
  seekTo, setVolume, toggleShuffle, toggleRepeat, toggleMagicShuffle,
  pauseTrack, resumeTrack, prevTrack, nextTrack
}: NowPlayingLeftPanelProps) {
  const formatTime = (pct: number, dur: number) => {
    const secs = Math.floor((pct / 100) * dur);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
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
  );
}
