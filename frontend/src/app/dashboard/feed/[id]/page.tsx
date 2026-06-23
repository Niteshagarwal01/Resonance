"use client";

import { useDashboardFeeds } from "@/hooks/useDashboardFeeds";
import { usePlayer } from "@/context/PlayerContext";
import { SafeImage as Image } from "@/components/SafeImage";
import { Play, Music2, Loader2, ArrowLeft, Disc3, Users } from "lucide-react";
import { SongActions } from "@/components/SongActions";
import Link from "next/link";
import { useParams } from "next/navigation";

const PX = "px-6 md:px-12 lg:px-20";

export default function FeedPage() {
  const params = useParams();
  const feedId = params?.id as string;
  const { playTrack } = usePlayer();
  const feeds = useDashboardFeeds();

  const getFeedData = () => {
    switch (feedId) {
      case "trending": return { title: "Trending Right Now", data: feeds.trendingNow, type: "tracks" };
      case "curated": return { title: "Curated For You", data: feeds.curatedForYou, type: "tracks" };
      case "editors": return { title: "Editor's Picks", data: feeds.editorsPicks, type: "tracks" };
      case "fresh": return { title: "Fresh Drops", data: feeds.freshDrops, type: "tracks" };
      case "genre": return { title: `Trending in ${feeds.userDna?.top_genres?.[0] || 'Pop'}`, data: feeds.trendingInGenre, type: "tracks" };
      case "history": return { title: "Jump Back In", data: feeds.jumpBackIn, type: "tracks" };
      case "mixes": return { title: "Your Top Mixes", data: feeds.yourTopMixes, type: "tracks" };
      case "albums": return { title: "Popular Albums & EPs", data: feeds.popularAlbums, type: "albums" };
      case "artists": return { title: "Iconic Artists", data: feeds.popularArtists, type: "artists" };
      default: return { title: "Feed", data: [], type: "tracks" };
    }
  };

  const { title, data, type } = getFeedData();

  if (feeds.loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-[#1A1A1A]" suppressHydrationWarning>
        <div className="relative">
          <div className="absolute inset-0 bg-[#FFB703] blur-xl opacity-30 animate-pulse rounded-full" />
          <Loader2 size={48} className="animate-spin text-[#FFB703] relative z-10" />
        </div>
        <p className="mt-4 font-bold tracking-widest uppercase text-sm text-gray-500 animate-pulse">Loading feed...</p>
      </div>
    );
  }

  return (
    <div className="pb-32 bg-white min-h-screen" suppressHydrationWarning>
      {/* Header */}
      <div className={`${PX} pt-8 pb-6`} style={{ background: "linear-gradient(to bottom, rgba(255,183,3,0.08) 0%, transparent 100%)" }}>
        <Link href="/dashboard" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-black mb-4 transition-colors uppercase tracking-wider">
          <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </Link>
        <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight mb-2">
          {title}<span className="text-[#FFB703]">.</span>
        </h1>
        <p className="text-gray-500 font-medium">{data?.length || 0} items</p>
      </div>

      {/* List */}
      <div className={`${PX}`}>
        {data && data.length > 0 ? (
          <>
            {type === "tracks" && (
              <div className="flex flex-col gap-2 max-w-4xl">
                {data.map((track: any, index: number) => (
                  <div 
                    key={track.id + index}
                    onClick={() => playTrack(track, data)}
                    className="group flex items-center bg-white hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-xl p-2 transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <div className="w-8 text-center text-gray-400 font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 relative bg-gray-100 rounded-lg overflow-hidden shrink-0 mx-3">
                      {track.thumbnail ? (
                        <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music2 size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                        <Play size={16} fill="white" className="text-white opacity-0 group-hover:opacity-100 drop-shadow" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{track.artist}</p>
                    </div>
                    {track.duration && (
                      <div className="text-xs font-medium text-gray-400 w-12 text-right hidden sm:block">
                        {track.duration}
                      </div>
                    )}
                    <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <SongActions track={track} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {type === "albums" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {data.map((item: any, index: number) => (
                  <Link
                    href={`/dashboard/album/${item.browseId || item.id}`}
                    key={`${item.id || item.browseId || item.name}-${index}`}
                    className="group flex flex-col items-center cursor-pointer hover:bg-gray-50 p-3 rounded-2xl transition-all border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md"
                  >
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all duration-300">
                      {item.image || item.thumbnail || item.thumbnails?.[0]?.url ? (
                        <Image src={item.image || item.thumbnail || item.thumbnails?.[0]?.url} alt={item.name || item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                          <Disc3 size={40} className="text-purple-300" />
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-[#1A1A1A] text-sm text-center group-hover:text-[#FFB703] transition-colors line-clamp-2 w-full">{item.name || item.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1 w-full mt-1 text-center">{item.artist || "Various Artists"}</p>
                  </Link>
                ))}
              </div>
            )}

            {type === "artists" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {data.map((item: any, index: number) => (
                  <Link
                    href={`/dashboard/search?q=${encodeURIComponent(item.name)}`}
                    key={`${item.id || item.name}-${index}`}
                    className="group flex flex-col items-center cursor-pointer hover:bg-gray-50 p-4 rounded-3xl transition-all border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md"
                  >
                    <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-300 border-4 border-white">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                          <Users size={40} className="text-pink-300" />
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-[#1A1A1A] text-sm text-center group-hover:text-[#FFB703] transition-colors line-clamp-1 w-full">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Artist</p>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-500 font-medium">
            No items found in this feed.
          </div>
        )}
      </div>
    </div>
  );
}
