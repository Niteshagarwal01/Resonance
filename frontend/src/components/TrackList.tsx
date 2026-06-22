import { usePlayer } from "@/context/PlayerContext";
import { Play, Clock, Music2 } from "lucide-react";
import { SafeImage as Image } from "@/components/SafeImage";
import { SongActions } from "@/components/SongActions";
import { Track } from "@/lib/api";

interface TrackListProps {
  tracks: Track[];
  showAlbum?: boolean;
  showArtist?: boolean;
  showThumbnail?: boolean;
}

export function TrackList({ tracks, showAlbum = true, showArtist = true, showThumbnail = true }: TrackListProps) {
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const gridCols = showAlbum 
    ? "grid-cols-[2rem_1fr_1fr_auto]" 
    : "grid-cols-[2rem_1fr_auto]";

  return (
    <div className="w-full">
      {/* Header row */}
      <div className={`grid ${gridCols} gap-4 px-3 pb-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest`}>
        <div className="text-center">#</div>
        <div>Title</div>
        {showAlbum && <div className="hidden md:block">Album</div>}
        <div className="pr-2"><Clock size={12} /></div>
      </div>

      <div className="mt-2 space-y-0.5">
        {tracks.map((track, idx) => {
          const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
          return (
            <div
              key={track.id + idx}
              onClick={() => playTrack(track, tracks)}
              className={`group grid ${gridCols} gap-4 px-3 py-2 items-center hover:bg-white rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-sm`}
            >
              <div className="text-center flex justify-center">
                {isCurrentlyPlaying ? (
                  <div className="flex items-center justify-center gap-0.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-0.5 bg-[#FFB703] rounded-full animate-bounce" style={{ height: `${5 + i * 3}px`, animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-bold text-gray-300 group-hover:hidden tabular-nums">
                      {(track as any).trackNumber || idx + 1}
                    </span>
                    <Play size={14} fill="#FFB703" className="text-[#FFB703] hidden group-hover:block" />
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 min-w-0">
                {showThumbnail && (
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    {track.thumbnail ? (
                      <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />
                    ) : (
                      <Music2 className="text-gray-300 m-auto mt-2" size={20}/>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-[15px] truncate group-hover:text-[#FFB703] transition-colors ${currentTrack?.id === track.id ? "text-[#FFB703]" : "text-[#1A1A1A]"}`}>
                    {track.title}
                  </p>
                  {showArtist && track.artist && (
                    <p className="text-sm text-gray-500 truncate group-hover:text-gray-600 transition-colors">
                      {track.artist}
                    </p>
                  )}
                </div>
              </div>
              
              {showAlbum && (
                <div className="hidden md:block min-w-0 pr-4">
                  <p className="text-sm font-medium text-gray-500 truncate hover:text-[#1A1A1A] hover:underline transition-all w-fit">
                    {track.album || ""}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 text-sm font-bold text-gray-400 tabular-nums">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <SongActions track={track} />
                </div>
                {track.duration}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
