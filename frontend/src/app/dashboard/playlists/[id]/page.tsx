"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { usePlayer } from "@/context/PlayerContext";
import { Play, Pause, ListMusic, Clock, Music2, MoreHorizontal, Shuffle, ArrowLeft } from "lucide-react";
import { SafeImage as Image } from "@/components/SafeImage";
import { Track } from "@/lib/api";
import { SongActions } from "@/components/SongActions";

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const supabase = createClient();
  
  const [playlist, setPlaylist] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaylist() {
      if (!params || !params.id) return;
      const playlistId = Array.isArray(params.id) ? params.id[0] : params.id;
      
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch playlist metadata
        const { data: plData, error: plError } = await supabase
          .from("playlists")
          .select("*")
          .eq("id", playlistId)
          .eq("user_id", session.user.id)
          .single();
        
        if (plError) console.error("Playlist error", plError);
        
        if (plData) setPlaylist(plData);

        // Fetch tracks
        const { data: tracksData, error: tracksError } = await supabase
          .from("playlist_tracks")
          .select("*")
          .eq("playlist_id", playlistId)
          .order("added_at", { ascending: true });

        if (tracksData) {
          const mapped: Track[] = tracksData.map(t => ({
            id: t.track_id,
            title: t.track_title,
            artist: t.track_artist,
            thumbnail: t.track_thumbnail,
            duration: t.track_duration,
          }));
          setTracks(mapped);
        }
      } catch (err) {
        console.error("Failed to load playlist", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaylist();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="p-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-[#1A1A1A] mb-8 font-bold">
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="text-3xl font-black">Playlist not found</h1>
      </div>
    );
  }

  const isPlaylistPlaying = tracks.some(t => t.id === currentTrack?.id) && isPlaying;

  return (
    <div className="pb-32">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-100 to-[#FDFBF7] px-8 pt-10 pb-12 mb-0">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-end">
          <div className="w-48 h-48 md:w-60 md:h-60 rounded-2xl bg-white shadow-2xl flex items-center justify-center shrink-0 border border-gray-100 relative overflow-hidden">
            {tracks.length > 0 && tracks[0].thumbnail ? (
              <>
                <Image src={tracks[0].thumbnail} alt="cover" fill className="object-cover opacity-80" unoptimized />
                <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply" />
              </>
            ) : (
              <ListMusic size={64} className="text-blue-200" />
            )}
          </div>
          
          <div className="flex-1">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-[#1A1A1A] mb-4 font-bold transition-colors">
              <ArrowLeft size={16} /> Back
            </button>
            <p className="text-blue-600 font-black text-xs tracking-widest uppercase mb-2">Playlist</p>
            <h1 className="text-5xl md:text-7xl font-black text-[#1A1A1A] mb-4 tracking-tight drop-shadow-sm">
              {playlist.name}
            </h1>
            <p className="text-gray-500 font-medium">
              {tracks.length} songs
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 mt-6">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => tracks.length > 0 && playTrack(tracks[0], tracks)}
            className="w-16 h-16 bg-[#FFB703] text-[#1A1A1A] rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaylistPlaying ? <Pause fill="currentColor" size={28} /> : <Play fill="currentColor" size={28} className="ml-1.5" />}
          </button>
          <button 
            onClick={() => tracks.length > 0 && playTrack(tracks[Math.floor(Math.random() * tracks.length)], tracks)}
            className="w-12 h-12 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-white hover:border-gray-300 transition-colors"
          >
            <Shuffle size={20} />
          </button>
        </div>

        {/* Tracks Table */}
        {tracks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
            <Music2 size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-bold">This playlist is empty.</p>
            <p className="text-sm text-gray-400 mt-1">Search for songs and add them here!</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="grid grid-cols-[3rem_1fr_1fr_auto_auto] gap-4 px-6 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 sticky top-0 z-10">
              <div className="text-center">#</div>
              <div>Title</div>
              <div className="hidden md:block">Artist</div>
              <div className="pr-4"><Clock size={12} /></div>
              <div className="w-8"></div>
            </div>
            
            <div className="flex-1">
              {tracks.map((track, idx) => {
                const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
                return (
                  <div 
                    key={`${track.id}-${idx}`} 
                    onClick={() => playTrack(track, tracks)}
                    className="group grid grid-cols-[3rem_1fr_1fr_auto_auto] gap-4 px-6 py-3 items-center hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100"
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
                    
                    <div className="flex items-center gap-4 min-w-0">
                      {track.thumbnail ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm">
                          <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0"><Music2 size={16} className="text-gray-400"/></div>
                      )}
                      <div className="min-w-0">
                        <p className={`font-bold text-[15px] truncate transition-colors ${isCurrentlyPlaying ? "text-[#FFB703]" : "text-[#1A1A1A] group-hover:text-[#FFB703]"}`}>
                          {track.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate md:hidden mt-0.5">{track.artist}</p>
                      </div>
                    </div>

                    <div className="hidden md:block min-w-0">
                      <p className="text-sm text-gray-600 truncate group-hover:text-[#1A1A1A] transition-colors">{track.artist}</p>
                    </div>

                    <div className="text-xs font-medium text-gray-400 tabular-nums pr-4">
                      {track.duration || "--:--"}
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end" onClick={e => e.stopPropagation()}>
                      <SongActions track={track} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
