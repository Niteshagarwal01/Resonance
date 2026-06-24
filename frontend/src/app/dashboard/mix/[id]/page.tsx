"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRadioStations } from "@/hooks/useRadioStations";
import { getRadioQueue, Track } from "@/lib/api";
import { usePlayer } from "@/context/PlayerContext";
import { SafeImage as Image } from "@/components/SafeImage";
import { Play, ArrowLeft, Loader2, Music2, Clock } from "lucide-react";
import { SongActions } from "@/components/SongActions";

export default function MixPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { stations, loading: stationsLoading, vibeLoading } = useRadioStations();
  const { playTrack, currentTrack } = usePlayer();
  
  const [station, setStation] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (stationsLoading || vibeLoading) return;
    
    const found = stations.find(s => s.id === id);
    if (!found) {
      setLoading(false);
      return;
    }
    
    setStation(found);
    
    // If we already have tracks synthesized (e.g. DNA mix, Today's mix)
    if (found.tracks && found.tracks.length > 0) {
      setTracks(found.tracks);
      setLoading(false);
    } 
    // Otherwise it's an artist mix, fetch the radio queue from backend!
    else if (found.seedId) {
      getRadioQueue(found.seedId)
        .then(fetchedTracks => {
          setTracks(fetchedTracks);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch mix tracks:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id, stations, stationsLoading, vibeLoading]);

  if (stationsLoading || vibeLoading || loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-[#1A1A1A]">
        <div className="relative">
          <div className="absolute inset-0 bg-[#FFB703] blur-xl opacity-30 animate-pulse rounded-full" />
          <Loader2 size={48} className="animate-spin text-[#FFB703] relative z-10" />
        </div>
        <p className="mt-4 font-bold tracking-widest uppercase text-sm text-gray-500 animate-pulse">Loading Mix...</p>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Mix not found</h2>
        <button onClick={() => router.back()} className="text-[#FFB703] font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="pb-32 min-h-screen bg-white">
      {/* Header Banner */}
      <div 
        className="relative pt-24 pb-12 px-6 md:px-12 lg:px-20 overflow-hidden"
        style={{ background: `linear-gradient(to bottom, ${station.bgColor}40, transparent)` }}
      >
        <button 
          onClick={() => router.back()}
          className="absolute top-8 left-6 md:left-12 bg-white/50 hover:bg-white/80 p-2 rounded-full transition-colors z-20"
        >
          <ArrowLeft size={20} className="text-[#1A1A1A]" />
        </button>

        <div className="relative z-10 flex flex-col md:flex-row items-end gap-6 md:gap-10">
          <div className="w-48 h-48 md:w-60 md:h-60 rounded-xl overflow-hidden shadow-2xl relative shrink-0">
            <Image src={station.thumbnail} alt={station.title} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 mix-blend-multiply opacity-50" style={{ backgroundColor: station.bgColor }} />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md">
              <span className="text-white text-xs font-bold tracking-widest uppercase">Mix</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">{station.type} Radio</p>
            <h1 className="text-5xl md:text-7xl font-black text-[#1A1A1A] tracking-tighter mb-4 leading-none">
              {station.title}
            </h1>
            <p className="text-gray-600 font-medium text-lg max-w-2xl mb-6">
              {station.description}
            </p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (tracks.length > 0) playTrack(tracks[0], tracks);
                }}
                className="bg-[#FFB703] hover:scale-105 transition-transform text-[#1A1A1A] w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
              >
                <Play size={24} fill="#1A1A1A" className="ml-1" />
              </button>
              <span className="text-sm font-bold text-gray-500">{tracks.length} tracks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="px-6 md:px-12 lg:px-20 mt-8">
        {/* Table Header */}
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 pb-2 border-b border-gray-100 text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
          <div className="w-8 text-center">#</div>
          <div>Title</div>
          <div className="flex items-center justify-end pr-8"><Clock size={14} /></div>
        </div>

        {tracks.length === 0 ? (
          <p className="text-center text-gray-500 py-12 font-medium">No tracks found for this mix.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {tracks.map((track, idx) => {
              const isPlaying = currentTrack?.id === track.id;
              return (
                <div 
                  key={`${track.id}-${idx}`}
                  className={`group grid grid-cols-[auto_1fr_auto] gap-4 items-center px-4 py-3 rounded-xl transition-colors cursor-pointer ${isPlaying ? 'bg-[#FFB703]/10' : 'hover:bg-gray-50'}`}
                  onClick={() => playTrack(track, tracks)}
                >
                  <div className="w-8 text-center">
                    {isPlaying ? (
                      <div className="flex items-end justify-center gap-[2px] h-4">
                        <div className="w-1 h-3 bg-[#FFB703] animate-pulse" />
                        <div className="w-1 h-4 bg-[#FFB703] animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-1 h-2 bg-[#FFB703] animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-400 group-hover:hidden">{idx + 1}</span>
                    )}
                    <Play size={14} className={`hidden group-hover:inline-block text-[#1A1A1A] ${isPlaying ? 'hidden group-hover:hidden' : ''}`} fill="#1A1A1A" />
                  </div>

                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0 relative">
                      {track.thumbnail ? (
                        <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Music2 size={16} className="text-gray-400" /></div>
                      )}
                    </div>
                    <div className="min-w-0 pr-4">
                      <p className={`text-sm font-bold truncate ${isPlaying ? 'text-[#FFB703]' : 'text-[#1A1A1A]'}`}>{track.title}</p>
                      <p className="text-xs font-medium text-gray-500 truncate mt-0.5">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-gray-400 tabular-nums">{track.duration || '--:--'}</span>
                    <div onClick={e => e.stopPropagation()}>
                      <SongActions track={track} size="sm" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
