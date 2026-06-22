import { Track } from "@/lib/api";
import { usePlayer } from "@/context/PlayerContext";
import { SectionHeader } from "./SectionHeader";
import { SafeImage as Image } from "@/components/SafeImage";
import { Play, Music2 } from "lucide-react";
import { SongActions } from "@/components/SongActions";

export function ShelfRow({ title, icon, tracks, showMoreUrl }: { title: string, icon: React.ReactNode, tracks: Track[], showMoreUrl?: string }) {
  const { playTrack } = usePlayer();
  if (!tracks || tracks.length === 0) return null;

  return (
    <section className="mb-10">
      <SectionHeader title={title} icon={icon} showMoreUrl={showMoreUrl} />
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4" style={{ scrollSnapType: "x mandatory", paddingLeft: "32px", paddingRight: "32px" }}>
          {tracks.map((track, idx) => (
            <div
              key={track.id + idx}
              onClick={() => playTrack(track, tracks)}
              className="group flex-shrink-0 w-[140px] md:w-[160px] flex flex-col cursor-pointer"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-xl transition-all duration-300 border border-gray-100">
                {track.thumbnail ? (
                  <Image src={track.thumbnail} alt={track.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Music2 size={32} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/50 backdrop-blur-md rounded-full px-1.5 py-0.5 border border-white/10" onClick={e => e.stopPropagation()}>
                    <SongActions track={track} size="sm" />
                  </div>
                  <div className="w-12 h-12 bg-[#FFB703] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                    <Play size={20} fill="#1A1A1A" className="text-[#1A1A1A] ml-1" />
                  </div>
                </div>
              </div>
              <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors px-1">{track.title}</p>
              <p className="text-xs text-gray-500 truncate px-1 mt-0.5">{track.artist}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
