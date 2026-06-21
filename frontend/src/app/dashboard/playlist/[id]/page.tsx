"use client";

import { usePlayer } from "@/context/PlayerContext";
import { getPlaylist } from "@/lib/api";
import { useEffect, useState } from "react";
import { Play, Heart, MoreHorizontal, Clock, Share2, Shuffle, ListMusic } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState<any>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPlaylist(params.id);
        setPlaylist(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="pb-32">
        <div className="flex gap-8 p-8 bg-gradient-to-b from-gray-100 to-transparent">
          <div className="w-56 h-56 rounded-2xl bg-gray-200 animate-pulse shrink-0" />
          <div className="flex-1 space-y-4 pt-8">
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-12 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="px-8 space-y-3 mt-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-4 bg-gray-100 rounded animate-pulse" />
              <div className="w-10 h-10 bg-gray-100 rounded animate-pulse" />
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

  if (!playlist) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[500px] gap-4">
        <ListMusic size={64} className="text-gray-200" />
        <p className="text-gray-500 font-semibold">Failed to load playlist.</p>
      </div>
    );
  }

  const tracks = playlist.tracks || [];
  const trackCount = playlist.trackCount || tracks.length;

  // Determine total duration
  let totalDurationStr = "0 min";
  if (tracks.length > 0) {
    const totalSeconds = tracks.reduce((acc: number, t: any) => {
      if (!t.duration) return acc;
      const [m, s] = t.duration.split(":").map(Number);
      return acc + (m || 0) * 60 + (s || 0);
    }, 0);
    const totalMin = Math.floor(totalSeconds / 60);
    totalDurationStr = totalMin > 60
      ? `${Math.floor(totalMin / 60)} hr ${totalMin % 60} min`
      : `${totalMin} min`;
  }

  const gradients = [
    "from-indigo-900/60", "from-pink-900/60", "from-amber-900/60",
    "from-emerald-900/60", "from-fuchsia-900/60", "from-sky-900/60",
  ];
  const grad = gradients[playlist.title?.charCodeAt(0) % gradients.length] || gradients[0];

  return (
    <div className="pb-32">

      {/* ── Playlist Hero ── */}
      <div className={`bg-gradient-to-b ${grad} to-[#FDFBF7] p-8 md:p-10 flex flex-col md:flex-row items-end gap-8`}>
        {/* Cover Art */}
        <div className="w-52 h-52 md:w-64 md:h-64 shrink-0 shadow-2xl rounded-2xl overflow-hidden relative">
          {playlist.thumbnail ? (
            <Image src={playlist.thumbnail} alt={playlist.title} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <ListMusic size={64} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-black uppercase tracking-widest text-gray-600 mb-2 flex items-center gap-2">
            Playlist
          </span>
          <h1 className="text-4xl md:text-7xl font-black text-[#1A1A1A] tracking-tighter leading-none mb-4 line-clamp-2">
            {playlist.title}
          </h1>
          {playlist.description && (
            <p className="text-gray-600 font-medium mb-3 line-clamp-2 max-w-3xl">
              {playlist.description}
            </p>
          )}
          <div className="flex items-center flex-wrap gap-2 text-sm font-semibold text-gray-700">
            <span className="font-bold text-[#1A1A1A]">{playlist.author || "YouTube Music"}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500">{trackCount} songs</span>
            {tracks.length > 0 && <><span className="text-gray-400">,</span><span className="text-gray-400">{totalDurationStr}</span></>}
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
      <div className="px-8 max-w-6xl">
        {/* Header row */}
        <div className="grid grid-cols-[2rem_1fr_1fr_auto] gap-4 px-3 pb-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <div className="text-center">#</div>
          <div>Title</div>
          <div className="hidden md:block">Album</div>
          <div className="pr-2"><Clock size={12} /></div>
        </div>

        <div className="mt-2 space-y-0.5">
          {tracks.map((track: any, idx: number) => {
            const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <div
                key={track.id + idx}
                onClick={() => playTrack(track, tracks)}
                className="group grid grid-cols-[2rem_1fr_1fr_auto] gap-4 px-3 py-2 items-center hover:bg-white rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-sm"
              >
                <div className="text-center">
                  {isCurrentlyPlaying ? (
                    <div className="flex items-center justify-center gap-0.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-0.5 bg-[#FFB703] rounded-full animate-bounce" style={{ height: `${5 + i * 3}px`, animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-bold text-gray-300 group-hover:hidden tabular-nums">{idx + 1}</span>
                      <Play size={14} fill="#FFB703" className="text-[#FFB703] hidden group-hover:block mx-auto" />
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  {track.thumbnail && (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className={`font-bold text-sm truncate transition-colors ${isCurrentlyPlaying ? "text-[#FFB703]" : "text-[#1A1A1A] group-hover:text-[#FFB703]"}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="hidden md:block min-w-0">
                  <p className="text-xs text-gray-500 truncate group-hover:text-[#1A1A1A] transition-colors">
                    {track.album?.title || "Single"}
                  </p>
                </div>

                <div className="flex items-center gap-4 pr-2 shrink-0">
                  <Heart size={14} className="text-gray-300 hover:text-pink-500 opacity-0 group-hover:opacity-100 transition-all" />
                  <span className="text-xs text-gray-400 tabular-nums">{track.duration || "—"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
