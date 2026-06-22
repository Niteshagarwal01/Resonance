"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, Plus, ListPlus, Check, Loader2, X, ListEnd } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { usePlayer } from "@/context/PlayerContext";

interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail?: string;
  duration?: string | null;
}

interface Playlist {
  id: string;
  name: string;
  track_count?: number;
}

interface SongActionsProps {
  track: Track;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  hideQueueButton?: boolean;
}

export function SongActions({ track, size = "sm", showLabel = false, hideQueueButton = false }: SongActionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set());
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [creating, setCreating] = useState(false);
  const [justQueued, setJustQueued] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { addToQueue } = usePlayer();
  const iconSize = size === "sm" ? 14 : 18;

  // Check if liked on mount
  useEffect(() => {
    async function checkLiked() {
      setIsLiked(false);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("liked_songs")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("track_id", track.id)
        .single();
      setIsLiked(!!data);
    }
    checkLiked();
  }, [track.id]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowPlaylistMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikeLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLikeLoading(false); return; }

    if (isLiked) {
      await supabase.from("liked_songs").delete().eq("user_id", session.user.id).eq("track_id", track.id);
      setIsLiked(false);
    } else {
      await supabase.from("liked_songs").upsert({
        user_id: session.user.id,
        track_id: track.id,
        track_title: track.title,
        track_artist: track.artist,
        track_thumbnail: track.thumbnail || null,
        track_duration: track.duration || null,
      });
      setIsLiked(true);
    }
    setLikeLoading(false);
  };

  const openPlaylistMenu = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPlaylistMenu(true);
    setPlaylistsLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setPlaylistsLoading(false); return; }

    const { data } = await supabase
      .from("playlists")
      .select("id, name")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (data) setPlaylists(data);

    // Check which playlists already have this track
    const { data: ptData } = await supabase
      .from("playlist_tracks")
      .select("playlist_id")
      .eq("track_id", track.id);

    if (ptData) {
      setAddedTo(new Set(ptData.map((r: any) => r.playlist_id)));
    }

    setPlaylistsLoading(false);
  };

  const addToPlaylist = async (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from("playlist_tracks").upsert({
      playlist_id: playlistId,
      track_id: track.id,
      track_title: track.title,
      track_artist: track.artist,
      track_thumbnail: track.thumbnail || null,
      track_duration: track.duration || null,
      user_id: session.user.id,
    });

    setAddedTo(prev => new Set([...prev, playlistId]));
  };

  const createPlaylist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!newPlaylistName.trim()) return;
    setCreating(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setCreating(false); return; }

    const { data: playlist } = await supabase.from("playlists").insert({
      user_id: session.user.id,
      name: newPlaylistName.trim(),
    }).select("id, name").single();

    if (playlist) {
      await supabase.from("playlist_tracks").upsert({
        playlist_id: playlist.id,
        track_id: track.id,
        track_title: track.title,
        track_artist: track.artist,
        track_thumbnail: track.thumbnail || null,
        track_duration: track.duration || null,
        user_id: session.user.id,
      });

      setPlaylists(prev => [playlist, ...prev]);
      setAddedTo(prev => new Set([...prev, playlist.id]));
      setNewPlaylistName("");
      setShowCreateModal(false);
    }

    setCreating(false);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(track as any);
    setJustQueued(true);
    setTimeout(() => setJustQueued(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 relative" ref={menuRef}>
      {/* Like Button */}
      <button
        onClick={toggleLike}
        className={`flex items-center gap-1 rounded-full transition-all duration-200 p-1.5 hover:scale-110 active:scale-95 ${
          isLiked
            ? "text-pink-500"
            : "text-gray-400 hover:text-pink-500"
        }`}
        title={isLiked ? "Unlike" : "Like"}
      >
        {likeLoading ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : (
          <Heart size={iconSize} fill={isLiked ? "currentColor" : "none"} />
        )}
        {showLabel && <span className="text-xs font-bold">{isLiked ? "Liked" : "Like"}</span>}
      </button>

      {/* Add to Queue */}
      {!hideQueueButton && (
        <button
          onClick={handleAddToQueue}
          className={`flex items-center gap-1 rounded-full p-1.5 transition-all duration-200 hover:scale-110 active:scale-95 ${
            justQueued ? "text-[#FFB703]" : "text-gray-400 hover:text-[#1A1A1A]"
          }`}
          title="Add to queue"
        >
          {justQueued ? <Check size={iconSize} /> : <ListEnd size={iconSize} />}
          {showLabel && <span className="text-xs font-bold">{justQueued ? "Queued" : "Queue"}</span>}
        </button>
      )}

      {/* Add to Playlist */}
      <div className="relative">
        <button
          onClick={openPlaylistMenu}
          className="flex items-center gap-1 rounded-full p-1.5 text-gray-400 hover:text-[#FFB703] hover:scale-110 active:scale-95 transition-all duration-200"
          title="Add to playlist"
        >
          <ListPlus size={iconSize} />
          {showLabel && <span className="text-xs font-bold">Add</span>}
        </button>

        {/* Playlist dropdown */}
        {showPlaylistMenu && (
          <div
            className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[200] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Add to playlist</p>
              <p className="text-sm font-bold text-[#1A1A1A] truncate mt-0.5">{track.title}</p>
            </div>

            <div className="max-h-48 overflow-y-auto scrollbar-hide">
              {playlistsLoading ? (
                <div className="p-4 flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin text-gray-400" />
                </div>
              ) : playlists.length === 0 ? (
                <p className="p-4 text-xs text-gray-500 text-center">No playlists yet</p>
              ) : (
                playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={(e) => addToPlaylist(e, pl.id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-sm font-bold text-[#1A1A1A] truncate">{pl.name}</span>
                    {addedTo.has(pl.id) && <Check size={14} className="text-[#FFB703] shrink-0 ml-2" />}
                  </button>
                ))
              )}
            </div>

            <div className="p-2 border-t border-gray-100">
              {showCreateModal ? (
                <div className="flex gap-2 p-1">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={e => setNewPlaylistName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && createPlaylist(e as any)}
                    placeholder="Playlist name…"
                    autoFocus
                    onClick={e => e.stopPropagation()}
                    className="flex-1 min-w-0 text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#FFB703] font-medium"
                  />
                  <button
                    onClick={createPlaylist}
                    disabled={creating || !newPlaylistName.trim()}
                    className="shrink-0 px-3 py-1.5 bg-[#FFB703] rounded-xl text-xs font-black text-[#1A1A1A] disabled:opacity-50 hover:bg-[#ffc124] transition-colors"
                  >
                    {creating ? <Loader2 size={12} className="animate-spin" /> : "Create"}
                  </button>
                  <button onClick={e => { e.stopPropagation(); setShowCreateModal(false); }} className="p-1.5 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={e => { e.stopPropagation(); setShowCreateModal(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#FFB703] hover:bg-[#FFB703]/10 rounded-xl transition-colors"
                >
                  <Plus size={16} />
                  New playlist
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Standalone modal for creating playlists (used from Sidebar)
interface CreatePlaylistModalProps {
  onClose: () => void;
  onCreated?: (playlist: Playlist) => void;
}

export function CreatePlaylistModal({ onClose, onCreated }: CreatePlaylistModalProps) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const supabase = createClient();

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setCreating(false); return; }

    const { data: playlist } = await supabase
      .from("playlists")
      .insert({ user_id: session.user.id, name: name.trim() })
      .select("id, name")
      .single();

    if (playlist && onCreated) onCreated(playlist);
    setCreating(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-black text-[#1A1A1A] mb-1">New Playlist</h2>
        <p className="text-sm text-gray-500 mb-6">Give your playlist a name to get started.</p>

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && create()}
          placeholder="My Awesome Playlist"
          autoFocus
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#FFB703] transition-colors mb-4 placeholder:text-gray-300"
        />

        <button
          onClick={create}
          disabled={creating || !name.trim()}
          className="w-full py-3.5 bg-[#FFB703] rounded-2xl text-[#1A1A1A] font-black text-sm hover:bg-[#ffc124] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
        >
          {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          {creating ? "Creating…" : "Create Playlist"}
        </button>
      </div>
    </div>
  );
}
