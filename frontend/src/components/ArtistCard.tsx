import Link from "next/link";
import { Mic2, Heart } from "lucide-react";
import { SafeImage as Image } from "@/components/SafeImage";

interface ArtistCardProps {
  artist: {
    id: string;
    name: string;
    image: string | null;
  };
  isLiked?: boolean;
  onToggleLike?: (e: React.MouseEvent) => void;
}

export function ArtistCard({ artist, isLiked = false, onToggleLike }: ArtistCardProps) {
  return (
    <Link
      href={`/dashboard/artist/${artist.id}`}
      className="group flex flex-col items-center text-center cursor-pointer relative"
    >
      <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4 bg-gray-100 shadow-lg group-hover:shadow-2xl transition-all duration-300">
        {artist.image ? (
          <Image src={artist.image} alt={artist.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Mic2 size={48} className="text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        
        {/* Like Button overlay */}
        {onToggleLike && (
          <div 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleLike(e);
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10"
          >
            <Heart size={20} fill={isLiked ? "#FFB703" : "transparent"} color={isLiked ? "#FFB703" : "white"} />
          </div>
        )}
      </div>
      <p className="font-black text-[#1A1A1A] text-base truncate w-full group-hover:text-[#FFB703] transition-colors">{artist.name}</p>
      <p className="text-xs font-bold text-gray-400 mt-0.5">Artist</p>
    </Link>
  );
}
