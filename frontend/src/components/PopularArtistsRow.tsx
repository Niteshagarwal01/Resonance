import Link from "next/link";
import { SectionHeader } from "./SectionHeader";
import { SafeImage as Image } from "@/components/SafeImage";
import { Users } from "lucide-react";

export function PopularArtistsRow({ artists }: { artists: any[] }) {
  if (!artists || artists.length === 0) return null;
  return (
    <section className="mb-10">
      <SectionHeader title="Iconic Artists" icon={<Users size={20} className="text-pink-500" />} />
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollSnapType: "x mandatory", paddingLeft: "32px", paddingRight: "32px" }}>
          {artists.map((artist, idx) => (
            <Link
              href={`/dashboard/search?q=${encodeURIComponent(artist.name)}`}
              key={`${artist.id || artist.name}-${idx}`}
              className="group flex-shrink-0 w-36 flex flex-col items-center cursor-pointer"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="relative w-36 h-36 rounded-full overflow-hidden mb-3 shadow-sm group-hover:shadow-xl transition-all duration-300 border-4 border-white">
                {artist.image ? (
                  <Image src={artist.image} alt={artist.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                    <Users size={40} className="text-pink-300" />
                  </div>
                )}
              </div>
              <p className="font-bold text-[#1A1A1A] text-sm text-center group-hover:text-[#FFB703] transition-colors line-clamp-1 px-2">{artist.name}</p>
              <p className="text-xs text-gray-500 text-center mt-0.5">Artist</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
