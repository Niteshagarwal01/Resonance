"use client";

import { usePlayer } from "@/context/PlayerContext";
import { getAlbum } from "@/lib/api";
import { useEffect, useState, use } from "react";
import { Play, Heart, MoreHorizontal, Clock, Share2, Disc3, Shuffle } from "lucide-react";
import { SafeImage as Image } from "@/components/SafeImage";
import { TrackList } from "@/components/TrackList";
import Link from "next/link";

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [album, setAlbum] = useState<any>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAlbum(unwrappedParams.id);
        setAlbum(data);
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
        <div className="flex gap-8 p-8 bg-gradient-to-b from-gray-100 to-transparent">
          <div className="w-56 h-56 rounded-2xl bg-gray-200 animate-pulse shrink-0" />
          <div className="flex-1 space-y-4 pt-8">
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-12 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="px-8 space-y-3 mt-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-4 bg-gray-100 rounded animate-pulse" />
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

  if (!album) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[500px] gap-4">
        <Disc3 size={64} className="text-gray-200" />
        <p className="text-gray-500 font-semibold">Failed to load album.</p>
      </div>
    );
  }

  const tracks = album.tracks || [];
  // compute total duration
  const totalSeconds = tracks.reduce((acc: number, t: any) => {
    if (!t.duration) return acc;
    const parts = t.duration.split(":").map(Number);
    let s = 0;
    if (parts.length === 3) s = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) s = parts[0] * 60 + parts[1];
    else s = parts[0] || 0;
    return acc + s;
  }, 0);
  const totalMin = Math.floor(totalSeconds / 60);
  const totalSec = totalSeconds % 60;
  const totalDuration = totalMin > 60
    ? `${Math.floor(totalMin / 60)} hr ${totalMin % 60} min`
    : `${totalMin} min ${totalSec} sec`;

  // Dominant color from thumbnail (just pick a nice gradient based on position)
  const gradients = [
    "from-violet-900/60", "from-blue-900/60", "from-green-900/60",
    "from-red-900/60", "from-orange-900/60", "from-teal-900/60",
  ];
  const grad = gradients[album.title?.charCodeAt(0) % gradients.length] || gradients[0];

  return (
    <div className="pb-32">

      {/* ── Album Hero ── */}
      <div className={`bg-gradient-to-b ${grad} to-[#FDFBF7] p-8 md:p-10 flex flex-col md:flex-row items-end gap-8`}>
        {/* Cover Art */}
        <div className="w-52 h-52 md:w-60 md:h-60 shrink-0 shadow-2xl rounded-2xl overflow-hidden">
          {album.image || album.thumbnail ? (
            <Image src={album.image || album.thumbnail} alt={album.title} width={240} height={240} className="object-cover w-full h-full" unoptimized />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <Disc3 size={64} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-black uppercase tracking-widest text-gray-600 mb-2 flex items-center gap-2">
            <Disc3 size={12} /> Album
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-[#1A1A1A] tracking-tighter leading-none mb-5">
            {album.title}
          </h1>
          <div className="flex items-center flex-wrap gap-2 text-sm font-semibold text-gray-700">
            {album.artistId ? (
              <Link href={`/dashboard/artist/${album.artistId}`} className="hover:text-[#FFB703] transition-colors font-bold">
                {album.artist}
              </Link>
            ) : (
              <span className="font-bold">{album.artist}</span>
            )}
            {album.year && <><span className="text-gray-400">·</span><span className="text-gray-500">{album.year}</span></>}
            <span className="text-gray-400">·</span>
            <span className="text-gray-500">{tracks.length} songs</span>
            {totalSeconds > 0 && <><span className="text-gray-400">,</span><span className="text-gray-400">{totalDuration}</span></>}
          </div>
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="px-8 py-5 flex items-center gap-5">
        <button
          onClick={() => tracks.length > 0 && playTrack(tracks[0], tracks)}
          className="w-16 h-16 bg-[#FFB703] text-[#1A1A1A] rounded-full flex items-center justify-center shadow-xl shadow-[#FFB703]/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Play size={28} fill="currentColor" className="ml-1" />
        </button>
        <button
          onClick={() => tracks.length > 0 && playTrack(tracks[Math.floor(Math.random() * tracks.length)], tracks)}
          className="text-gray-500 hover:text-[#FFB703] transition-colors"
          title="Shuffle play"
        >
          <Shuffle size={24} />
        </button>
        <button onClick={() => setLiked(!liked)} className={`transition-colors ${liked ? "text-pink-500" : "text-gray-400 hover:text-pink-500"}`}>
          <Heart size={28} fill={liked ? "currentColor" : "none"} />
        </button>
        <button className="text-gray-400 hover:text-[#1A1A1A] transition-colors">
          <Share2 size={22} />
        </button>
        <button className="text-gray-400 hover:text-[#1A1A1A] transition-colors ml-auto">
          <MoreHorizontal size={22} />
        </button>
      </div>

      {/* ── Tracklist ── */}
      <div className="px-8 max-w-5xl">
        <TrackList tracks={tracks} showAlbum={false} showArtist={true} showThumbnail={false} />

        {/* Footer */}
        {album.year && (
          <div className="mt-10 text-xs text-gray-400 font-medium space-y-1">
            <p>{album.year}</p>
            {album.description && <p className="text-gray-500">{album.description}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
