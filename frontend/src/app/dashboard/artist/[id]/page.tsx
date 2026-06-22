"use client";

import { usePlayer } from "@/context/PlayerContext";
import { getArtistProfile } from "@/lib/api";
import { useEffect, useState, use } from "react";
import { Play, Heart, MoreHorizontal, CheckCircle2, Clock, Disc3, Music2, ChevronRight } from "lucide-react";
import { SafeImage as Image } from "@/components/SafeImage";
import Link from "next/link";

import { useLikedArtists } from "@/hooks/useLikedArtists";

export default function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [artistData, setArtistData] = useState<any>(null);
  const { isLiked, toggleLikedArtist } = useLikedArtists();

  useEffect(() => {
    async function load() {
      try {
        const data = await getArtistProfile(unwrappedParams.id);
        setArtistData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [unwrappedParams.id]);

  if (loading) {
    return (
      <div className="pb-32">
        {/* Skeleton hero */}
        <div className="h-[420px] bg-gray-100 animate-pulse" />
        <div className="px-8 py-6 flex gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 animate-pulse" />
          <div className="w-24 h-10 rounded-full bg-gray-100 animate-pulse" />
        </div>
        <div className="px-8 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!artistData) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[500px] gap-4">
        <Music2 size={64} className="text-gray-200" />
        <p className="text-gray-500 font-semibold">Failed to load artist profile.</p>
      </div>
    );
  }

  const topTracks: any[] = artistData.top_tracks || [];
  const albums: any[] = artistData.albums || [];
  const singles: any[] = artistData.singles || [];
  
  // Format for the hook
  const artistObj = {
    id: unwrappedParams.id,
    name: artistData.name,
    image: artistData.image
  };
  const currentlyLiked = isLiked(unwrappedParams.id);

  return (
    <div className="pb-32">

      {/* ── Hero Banner ── */}
      <div className="relative h-[420px] flex flex-col justify-end overflow-hidden">
        {/* Background */}
        {artistData.image && (
          <Image
            src={artistData.image}
            alt={artistData.name}
            fill
            className="object-cover object-top scale-105"
            priority
            unoptimized
          />
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/40 to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 px-8 pb-8">
          <div className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-widest mb-3">
            <CheckCircle2 size={14} className="text-blue-400" /> Verified Artist
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-4 drop-shadow-2xl">
            {artistData.name}
          </h1>
          <p className="text-white/70 font-semibold text-sm">
            {artistData.subscribers ? `${artistData.subscribers} monthly listeners` : "Artist on Resonance"}
          </p>
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="bg-gradient-to-b from-[#1A1A1A]/10 to-transparent px-8 py-6 flex items-center gap-5">
        <button
          onClick={() => topTracks.length > 0 && playTrack(topTracks[0], topTracks)}
          className="w-16 h-16 bg-[#FFB703] text-[#1A1A1A] rounded-full flex items-center justify-center shadow-xl shadow-[#FFB703]/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Play size={28} fill="currentColor" className="ml-1" />
        </button>
        <button
          onClick={() => toggleLikedArtist(artistObj)}
          className={`px-6 py-2.5 rounded-full border font-bold text-sm transition-all ${
            currentlyLiked
              ? "border-[#FFB703] text-[#FFB703] bg-[#FFB703]/10"
              : "border-gray-300 text-[#1A1A1A] hover:border-[#1A1A1A]"
          }`}
        >
          {currentlyLiked ? "Following" : "Follow"}
        </button>
        <button className="text-gray-400 hover:text-[#1A1A1A] transition-colors ml-2">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* ── Main Content ── */}
      <div className="px-8 max-w-7xl">

        {/* Popular Songs */}
        {topTracks.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-black text-[#1A1A1A] mb-5">Popular</h2>
            <div className="space-y-1">
              {topTracks.slice(0, 10).map((track: any, idx: number) => {
                const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
                return (
                  <div
                    key={track.id + idx}
                    onClick={() => playTrack(track, topTracks)}
                    className="group grid grid-cols-[2rem_1fr_auto] gap-4 p-3 items-center hover:bg-white rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-sm"
                  >
                    <div className="text-center">
                      {isCurrentlyPlaying ? (
                        <div className="flex items-center justify-center gap-0.5">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-0.5 bg-[#FFB703] rounded-full animate-bounce" style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-bold text-gray-400 group-hover:hidden tabular-nums">{idx + 1}</span>
                          <Play size={14} fill="#FFB703" className="text-[#FFB703] hidden group-hover:block mx-auto" />
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        {track.thumbnail && (
                          <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-bold text-sm truncate transition-colors ${isCurrentlyPlaying ? "text-[#FFB703]" : "text-[#1A1A1A] group-hover:text-[#FFB703]"}`}>
                          {track.title}
                        </p>
                        {track.album && <p className="text-xs text-gray-500 truncate">{track.album}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pr-2 shrink-0">
                      <Heart size={16} className="text-gray-300 hover:text-pink-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer" />
                      <span className="text-sm text-gray-400 tabular-nums">{track.duration || "—"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Albums Grid */}
        {albums.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-black text-[#1A1A1A]">Albums</h2>
              <button className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#FFB703] transition-colors flex items-center gap-1">
                Show All <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {albums.map((album: any) => (
                <Link
                  key={album.id}
                  href={`/dashboard/album/${album.id}`}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-300">
                    {album.thumbnail ? (
                      <Image src={album.thumbnail} alt={album.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Disc3 size={40} className="text-gray-300" /></div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-end justify-end p-3 transition-colors">
                      <div className="w-11 h-11 rounded-full bg-[#FFB703] flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <Play size={16} fill="#1A1A1A" className="text-[#1A1A1A] ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{album.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{album.year} · {album.type || "Album"}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Singles Grid */}
        {singles.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-black text-[#1A1A1A]">Singles & EPs</h2>
              <button className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#FFB703] transition-colors flex items-center gap-1">
                Show All <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {singles.map((single: any) => (
                <Link
                  key={single.id}
                  href={`/dashboard/album/${single.id}`}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-300">
                    {single.thumbnail ? (
                      <Image src={single.thumbnail} alt={single.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Disc3 size={32} className="text-gray-300" /></div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-end justify-end p-3 transition-colors">
                      <div className="w-11 h-11 rounded-full bg-[#FFB703] flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <Play size={16} fill="#1A1A1A" className="text-[#1A1A1A] ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#FFB703] transition-colors">{single.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{single.year} · Single</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* About Artist */}
        {(artistData.description || artistData.views) && (
          <section className="mb-12">
            <h2 className="text-2xl font-black text-[#1A1A1A] mb-5">About</h2>
            <div className="relative rounded-3xl overflow-hidden bg-[#1A1A1A] text-white">
              {artistData.image && (
                <>
                  <Image src={artistData.image} alt="" fill className="object-cover opacity-30" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/70 to-[#1A1A1A]/40" />
                </>
              )}
              <div className="relative z-10 p-8">
                {artistData.views && (
                  <p className="text-4xl font-black text-white mb-1">{artistData.views}</p>
                )}
                {artistData.subscribers && (
                  <p className="text-gray-400 text-sm font-semibold mb-6">{artistData.subscribers} monthly listeners</p>
                )}
                {artistData.description && (
                  <p className="text-gray-300 text-sm leading-relaxed max-w-2xl line-clamp-4">
                    {artistData.description}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
