"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Track, getRadioQueue } from "@/lib/api";
import { createClient } from "@/utils/supabase/client";

// Fisher-Yates shuffle
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface PlayerContextType {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (vol: number) => void;
  seekTo: (percent: number) => void;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  isMagicShuffle: boolean;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleMagicShuffle: () => void;
  clearQueue: () => void;
  moveTrackInQueue: (oldIndex: number, newIndex: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(50);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [isMagicShuffle, setIsMagicShuffle] = useState(true);

  // Refs hold latest values for use inside YT callbacks (stale closure fix)
  const currentTrackRef = useRef<Track | null>(null);
  const queueRef = useRef<Track[]>([]);
  const originalQueueRef = useRef<Track[]>([]); // unshuffled backup
  const isShuffleRef = useRef(false);
  const repeatModeRef = useRef<'off' | 'all' | 'one'>('off');
  const isMagicShuffleRef = useRef(true);
  const magicInFlightRef = useRef(false); // prevent concurrent fetches

  const supabase = createClient();
  const ytPlayerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("reson_player_state");
      if (saved) {
        const state = JSON.parse(saved);
        if (state.queue?.length > 0) {
          setQueue(state.queue);
          queueRef.current = state.queue;
          originalQueueRef.current = state.queue;
        }
        if (state.currentTrack) {
          setCurrentTrack(state.currentTrack);
          currentTrackRef.current = state.currentTrack;
          if (state.currentTrack.duration) {
            const parts = state.currentTrack.duration.split(':').map(Number);
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              setDuration(parts[0] * 60 + parts[1]);
            }
          }
        }
        if (state.volume !== undefined) {
          setVolumeState(state.volume);
        }
        if (state.isShuffle) {
          setIsShuffle(state.isShuffle);
          isShuffleRef.current = state.isShuffle;
        }
        if (state.repeatMode) {
          setRepeatMode(state.repeatMode);
          repeatModeRef.current = state.repeatMode;
        }
        if (state.isMagicShuffle) {
          setIsMagicShuffle(state.isMagicShuffle);
          isMagicShuffleRef.current = state.isMagicShuffle;
        }
      }
    } catch (e) {
      console.error("Failed to load player state", e);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem("reson_player_state", JSON.stringify({
        queue: queueRef.current,
        currentTrack: currentTrackRef.current,
        volume: volume,
        isShuffle: isShuffleRef.current,
        repeatMode: repeatModeRef.current,
        isMagicShuffle: isMagicShuffleRef.current,
      }));
    } catch (e) {}
    
    // Sync volume to player in case it changed or initialized from localstorage
    if (ytPlayerRef.current?.setVolume) {
      ytPlayerRef.current.setVolume(volume);
    }
  }, [queue, currentTrack, volume, isShuffle, repeatMode, isMagicShuffle]);

  useEffect(() => {
    let playerDiv = document.getElementById("youtube-hidden-player");
    if (!playerDiv) {
      playerDiv = document.createElement("div");
      playerDiv.id = "youtube-hidden-player";
      playerDiv.style.display = "none";
      document.body.appendChild(playerDiv);
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    if (firstScriptTag?.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      ytPlayerRef.current = new (window as any).YT.Player("youtube-hidden-player", {
        height: "0",
        width: "0",
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, rel: 0, modestbranding: 1 },
        events: {
          onReady: (event: any) => { 
            // set volume to whatever the current state is (loaded from localStorage)
            event.target.setVolume(volume); 
          },
          onStateChange: (event: any) => {
            const YT = (window as any).YT;
            if (event.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              const initialD = event.target.getDuration();
              if (initialD > 0) setDuration(initialD);
              
              if (!progressIntervalRef.current) {
                progressIntervalRef.current = setInterval(() => {
                  const t = event.target.getCurrentTime();
                  const d = event.target.getDuration();
                  if (d > 0) {
                    setProgress((t / d) * 100);
                    setDuration(d); // continually update duration in case it was 0 initially
                  }
                }, 1000);
              }
            } else {
              if (event.data === YT.PlayerState.ENDED) {
                handleTrackEnd();
              }
              setIsPlaying(false);
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
              }
            }
          },
        },
      });
    };

    return () => { if (progressIntervalRef.current) clearInterval(progressIntervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Core play function (internal, not exposed directly for queue management)
  const _play = useCallback(async (track: Track, q: Track[]) => {
    setCurrentTrack(track);
    currentTrackRef.current = track;
    setQueue(q);
    queueRef.current = q;
    setIsPlaying(true);
    setProgress(0);

    // Pre-parse duration from string (e.g. "3:45" -> 225) to prevent initial 0:00 glitch
    if (track.duration) {
      const parts = track.duration.split(':').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        setDuration(parts[0] * 60 + parts[1]);
      } else {
        setDuration(0);
      }
    } else {
      setDuration(0);
    }

    if (ytPlayerRef.current?.loadVideoById) {
      ytPlayerRef.current.loadVideoById(track.id);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("listening_history").insert({
          user_id: session.user.id,
          track_id: track.id,
          track_title: track.title,
          track_artist: track.artist,
          track_thumbnail: track.thumbnail,
        });
      }
    } catch (e) {
      console.error("Failed to log listening history", e);
    }
  }, [supabase]);

  // Public playTrack: sets up the queue (with shuffle if on) and plays
  const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
    if (newQueue && newQueue.length > 0) {
      originalQueueRef.current = newQueue;
      if (isShuffleRef.current) {
        // Shuffle all tracks except the one being played; put played track first
        const rest = newQueue.filter(t => t.id !== track.id);
        const shuffled = shuffleArray(rest);
        const finalQueue = [track, ...shuffled];
        _play(track, finalQueue);
      } else {
        _play(track, newQueue);
      }
    } else {
      _play(track, queueRef.current);
    }
  }, [_play]);

  // Handle track ending — Spotify-like logic
  const handleTrackEnd = useCallback(async () => {
    const q = queueRef.current;
    const curr = currentTrackRef.current;
    if (!curr) return;

    // 1. Repeat: replay current (if repeatMode === 'one')
    if (repeatModeRef.current === 'one') {
      if (ytPlayerRef.current?.loadVideoById) ytPlayerRef.current.loadVideoById(curr.id);
      setIsPlaying(true);
      setProgress(0);
      return;
    }

    const currentIndex = q.findIndex(t => t.id === curr.id);

    // 2. Magic Shuffle
    // If magic is on and we're nearing the end of the queue (less than 3 songs left)
    // We fetch a batch and keep the music going forever.
    if (isMagicShuffleRef.current && !magicInFlightRef.current && (q.length - currentIndex <= 3)) {
      magicInFlightRef.current = true;
      try {
        const moreTracks = await getRadioQueue(curr.id);
        if (moreTracks && moreTracks.length > 0) {
          const existingIds = new Set(q.map(t => t.id));
          const newTracks = moreTracks
            .filter(t => !existingIds.has(t.id))
            .map(t => ({ ...t, isMagic: true }))
            .slice(0, 30); // Grab up to 30 tracks
          
          if (newTracks.length > 0) {
            // Append new tracks to the end of the queue to keep it flowing
            const newQ = [...q, ...newTracks];
            queueRef.current = newQ;
            setQueue(newQ);
          }
        }
      } catch (e) {
        console.error("Magic shuffle fetch failed", e);
      }
      magicInFlightRef.current = false;
    }

    // 3. Normal next (must use updated queueRef)
    const updatedQ = queueRef.current;
    const hasNextUpdated = currentIndex >= 0 && currentIndex < updatedQ.length - 1;

    if (hasNextUpdated) {
      await _play(updatedQ[currentIndex + 1], updatedQ);
    } else if (updatedQ.length > 0 && repeatModeRef.current === 'all') {
      // Loop back to start (repeatMode === 'all')
      await _play(updatedQ[0], updatedQ);
    }
  }, [_play]);

  async function nextTrack() {
    const q = queueRef.current;
    const curr = currentTrackRef.current;
    if (!q.length || !curr) return;
    const i = q.findIndex(t => t.id === curr.id);

    // Magic Shuffle Check for nextTrack
    if (isMagicShuffleRef.current && !magicInFlightRef.current && (q.length - i <= 3)) {
      magicInFlightRef.current = true;
      try {
        const moreTracks = await getRadioQueue(curr.id);
        if (moreTracks && moreTracks.length > 0) {
          const existingIds = new Set(q.map(t => t.id));
          const newTracks = moreTracks
            .filter(t => !existingIds.has(t.id))
            .map(t => ({ ...t, isMagic: true }))
            .slice(0, 30);
          
          if (newTracks.length > 0) {
            const newQ = [...q, ...newTracks];
            queueRef.current = newQ;
            setQueue(newQ);
          }
        }
      } catch (e) {
        console.error("Magic shuffle fetch failed", e);
      }
      magicInFlightRef.current = false;
    }
    
    // Use the potentially updated queue
    const updatedQ = queueRef.current;
    const newIndex = updatedQ.findIndex(t => t.id === curr.id);
    
    if (newIndex >= 0 && newIndex < updatedQ.length - 1) {
      _play(updatedQ[newIndex + 1], updatedQ);
    } else if (updatedQ.length > 0 && repeatModeRef.current === 'all') {
      _play(updatedQ[0], updatedQ);
    }
  }

  function prevTrack() {
    const q = queueRef.current;
    const curr = currentTrackRef.current;
    if (!q.length || !curr) return;
    const i = q.findIndex(t => t.id === curr.id);
    if (i > 0) {
      _play(q[i - 1], q);
    }
  }

  const pauseTrack = () => {
    if (ytPlayerRef.current?.pauseVideo) ytPlayerRef.current.pauseVideo();
    setIsPlaying(false);
  };

  const resumeTrack = () => {
    if (ytPlayerRef.current?.playVideo) ytPlayerRef.current.playVideo();
    setIsPlaying(true);
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (ytPlayerRef.current?.setVolume) ytPlayerRef.current.setVolume(vol);
  };

  const seekTo = (percent: number) => {
    if (ytPlayerRef.current?.seekTo && duration > 0) {
      ytPlayerRef.current.seekTo((percent / 100) * duration, true);
      setProgress(percent);
    }
  };

  const toggleShuffle = () => {
    const newVal = !isShuffleRef.current;
    isShuffleRef.current = newVal;
    setIsShuffle(newVal);

    const q = queueRef.current;
    const curr = currentTrackRef.current;
    if (!q.length || !curr) return;

    if (newVal) {
      // Shuffle remaining queue after current track
      const currIdx = q.findIndex(t => t.id === curr.id);
      const before = q.slice(0, currIdx + 1);
      const after = shuffleArray(q.slice(currIdx + 1));
      const shuffled = [...before, ...after];
      queueRef.current = shuffled;
      setQueue(shuffled);
    } else {
      // Restore original order, keeping current track position
      const orig = originalQueueRef.current;
      if (orig.length > 0) {
        queueRef.current = orig;
        setQueue(orig);
      }
    }
  };

  const toggleRepeat = () => {
    let nextMode: 'off' | 'all' | 'one' = 'off';
    if (repeatModeRef.current === 'off') nextMode = 'all';
    else if (repeatModeRef.current === 'all') nextMode = 'one';
    else if (repeatModeRef.current === 'one') nextMode = 'off';

    repeatModeRef.current = nextMode;
    setRepeatMode(nextMode);
  };

  const toggleMagicShuffle = async () => {
    const newVal = !isMagicShuffleRef.current;
    isMagicShuffleRef.current = newVal;
    setIsMagicShuffle(newVal);

    const q = queueRef.current;
    const curr = currentTrackRef.current;

    if (newVal && curr && !magicInFlightRef.current) {
      // Turn ON: inject 10 radio songs immediately after current track (Spotify behavior)
      magicInFlightRef.current = true;
      try {
        const moreTracks = await getRadioQueue(curr.id);
        if (moreTracks && moreTracks.length > 0) {
          const existingIds = new Set(q.map(t => t.id));
          let newTracks = moreTracks
            .filter(t => !existingIds.has(t.id))
            .map(t => ({ ...t, isMagic: true }))
            .slice(0, 10);
          
          newTracks = shuffleArray(newTracks);
          
          if (newTracks.length > 0) {
            const currIdx = q.findIndex(t => t.id === curr.id);
            const keepIdx = currIdx >= 0 ? currIdx : -1;
            
            const pastAndCurrent = q.slice(0, keepIdx + 1);
            const remainingUserTracks = q.slice(keepIdx + 1);
            
            const interleaved = [];
            let userPtr = 0;
            let magicPtr = 0;
            
            while (userPtr < remainingUserTracks.length || magicPtr < newTracks.length) {
              // Add up to 3 user tracks
              let uAdded = 0;
              while (uAdded < 3 && userPtr < remainingUserTracks.length) {
                interleaved.push(remainingUserTracks[userPtr]);
                userPtr++;
                uAdded++;
              }
              // Add up to 2 magic tracks
              let mAdded = 0;
              while (mAdded < 2 && magicPtr < newTracks.length) {
                interleaved.push(newTracks[magicPtr]);
                magicPtr++;
                mAdded++;
              }
            }
            
            const newQ = [...pastAndCurrent, ...interleaved];
            queueRef.current = newQ;
            setQueue(newQ);
          }
        }
      } catch (e) {}
      magicInFlightRef.current = false;
    } else if (!newVal) {
      // Turn OFF: remove all unplayed magic tracks
      const currIdx = curr ? q.findIndex(t => t.id === curr.id) : -1;
      const keepIdx = currIdx >= 0 ? currIdx : 0;
      const newQ = q.filter((t, i) => i <= keepIdx || !t.isMagic);
      queueRef.current = newQ;
      setQueue(newQ);
    }
  };

  function clearQueue() {
    setQueue([]);
    queueRef.current = [];
    originalQueueRef.current = [];
  }

  function moveTrackInQueue(oldIndex: number, newIndex: number) {
    if (oldIndex < 0 || oldIndex >= queueRef.current.length || newIndex < 0 || newIndex >= queueRef.current.length) return;
    const newQueue = [...queueRef.current];
    const [moved] = newQueue.splice(oldIndex, 1);
    newQueue.splice(newIndex, 0, moved);
    setQueue(newQueue);
    queueRef.current = newQueue;
    // We also update originalQueueRef so un-shuffling doesn't lose the new order
    originalQueueRef.current = newQueue;
  }

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        volume,
        progress,
        duration,
        playTrack,
        pauseTrack,
        resumeTrack,
        nextTrack,
        prevTrack,
        setVolume: setVolume,
        seekTo,
        isShuffle,
        repeatMode,
        isMagicShuffle,
        toggleShuffle,
        toggleRepeat,
        toggleMagicShuffle,
        clearQueue,
        moveTrackInQueue,
      }}
    >  {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
}
