import Link from "next/link";
import { SectionHeader } from "./SectionHeader";
import { SafeImage as Image } from "@/components/SafeImage";
import { Disc3 } from "lucide-react";

export function PopularAlbumsRow({ albums, showMoreUrl }: { albums: any[], showMoreUrl?: string }) {
  if (!albums || albums.length === 0) return null;
  return (
    <section className="mb-10">
      <SectionHeader title="Popular Albums & EPs" icon={<Disc3 size={20} className="text-purple-500" />} showMoreUrl={showMoreUrl} />
      <div className="relative">
        <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2" style={{ scrollSnapType: "x mandatory", paddingLeft: "32px", paddingRight: "32px" }}>
          {albums.map((album, idx) => (
            <Link
              href={`/dashboard/album/${album.browseId || album.id}`}
              key={`${album.id || album.browseId || album.name}-${idx}`}
              className="group flex-shrink-0 w-40 flex flex-col items-start cursor-pointer"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="relative w-40 h-40 rounded-xl overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all duration-300">
                {album.image || album.thumbnail ? (
                  <Image src={album.image || album.thumbnail || album.thumbnails?.[0]?.url} alt={album.name || album.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                    <Disc3 size={40} className="text-purple-300" />
                  </div>
                )}
              </div>
              <p className="font-bold text-[#1A1A1A] text-sm group-hover:text-[#FFB703] transition-colors line-clamp-1 w-full">{album.name || album.title}</p>
              <p className="text-xs text-gray-500 line-clamp-1 w-full mt-0.5">{album.artist || "Various Artists"}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
