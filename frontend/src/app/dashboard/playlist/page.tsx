"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { searchMusic, Track } from "@/lib/api";
import { usePlayer } from "@/context/PlayerContext";
import { SafeImage as Image } from "@/components/SafeImage";
import { Play, Disc3, ArrowLeft, Clock } from "lucide-react";
import { SongActions } from "@/components/SongActions";

function PlaylistPreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { playTrack } = usePlayer();
  const title = searchParams.get("title") || "Playlist";
  const query = searchParams.get("query");

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaylist() {
      if (!query) {
        setLoading(false);
        return;
      }
      try {
        const results = await searchMusic(query);
        setTracks(results);
      } catch (e) {
        console.error("Failed to fetch playlist", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaylist();
  }, [query]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <div className="pb-32 min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#1A1A1A] px-8 pt-12 pb-16 mb-8 rounded-b-[3rem] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 to-orange-500/20 mix-blend-screen pointer-events-none" />
        
        <button 
          onClick={() => router.back()}
          className="relative z-10 flex items-center gap-2 text-white/60 hover:text-white font-bold text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="relative z-10 flex flex-col md:flex-row items-end gap-8">
          <div className="w-48 h-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex items-center justify-center shrink-0 overflow-hidden relative">
            {tracks.length > 0 && tracks[0].thumbnail ? (
              <Image src={tracks[0].thumbnail} alt={title} fill className="object-cover opacity-80" unoptimized />
            ) : (
              <Disc3 size={64} className="text-[#FFB703]" />
            )}
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="flex-1">
            <p className="text-[#FFB703] font-black text-xs tracking-[0.2em] uppercase mb-2">Playlist</p>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">{title}</h1>
            <p className="text-gray-300 font-medium">{tracks.length} songs • Endless vibes</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Disc3 size={40} className="text-[#FFB703] animate-spin" style={{ animationDuration: "3s" }} />
            <p className="text-gray-500 font-bold animate-pulse">Curating playlist...</p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-black text-[#1A1A1A] mb-2">No tracks found</h2>
            <p className="text-gray-500 font-medium">We couldn't generate tracks for this vibe.</p>
          </div>
        ) : (
          <>
            {/* Play Button Row */}
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={handlePlayAll}
                className="w-14 h-14 bg-[#FFB703] text-[#1A1A1A] rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Play size={24} fill="currentColor" className="ml-1" />
              </button>
            </div>

            {/* Track List */}
            <div className="space-y-1">
              <div className="flex items-center gap-4 px-4 py-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <span className="w-8 text-center">#</span>
                <span className="flex-1">Title</span>
                <span className="w-12 text-center"><Clock size={14} className="mx-auto" /></span>
              </div>
              
              {tracks.map((track, idx) => (
                <div 
                  key={`${track.id}-${idx}`}
                  onClick={() => playTrack(track, tracks)}
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100"
                >
                  <div className="w-8 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-gray-300 group-hover:hidden tabular-nums">{idx + 1}</span>
                    <Play size={14} fill="#FFB703" className="text-[#FFB703] hidden group-hover:block" />
                  </div>
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                    <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <SongActions track={track} size="sm" />
                  </div>
                  <div className="w-12 text-right shrink-0 text-xs text-gray-400 font-medium tabular-nums">
                    {track.duration || "—"}
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

export default function PlaylistPreviewPage() {
  return (
    <Suspense fallback={
      <div className="pb-32 min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Disc3 size={40} className="text-[#FFB703] animate-spin" style={{ animationDuration: "3s" }} />
      </div>
    }>
      <PlaylistPreviewContent />
    </Suspense>
  );
}
