"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Track, getRadioQueue } from "@/lib/api";
import { createClient } from "@/utils/supabase/client";

import { usePlayerTelemetry } from "@/hooks/usePlayerTelemetry";
import { useYouTubeIframe } from "@/hooks/useYouTubeIframe";

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
  addToQueue: (track: Track) => void;
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
    } catch (e) {
      console.error("Failed to save player state", e);
    }
  }, [queue, currentTrack, volume, isShuffle, repeatMode, isMagicShuffle]);

  const { startTracking, flushTracking, logTrackStart } = usePlayerTelemetry();

  // Forward declare handleTrackEnd since useYouTubeIframe needs it
  const handleTrackEndRef = useRef<() => void>(() => {});
  
  const { ytPlayerRef } = useYouTubeIframe({
    volume,
    currentTrackRef,
    setIsPlaying,
    setDuration,
    setProgress,
    handleTrackEnd: () => handleTrackEndRef.current(),
    startTracking,
    flushTracking
  });

  // Core play function (internal, not exposed directly for queue management)
  const _play = useCallback(async (track: Track, q: Track[]) => {
    // 1. Flush telemetry for the outgoing track (if it exists)
    if (currentTrackRef.current) {
      flushTracking();
    }

    // 2. Setup the new track
    setCurrentTrack(track);
    currentTrackRef.current = track;
    setQueue(q);
    queueRef.current = q;
    setIsPlaying(true);
    setProgress(0);
    startTracking();

    // Pre-parse duration from string (e.g. "3:45" -> 225) to prevent initial 0:00 glitch
    let parsedDuration = 0;
    if (track.duration) {
      const parts = track.duration.split(':').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        parsedDuration = parts[0] * 60 + parts[1];
      } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        parsedDuration = parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    }
    setDuration(parsedDuration);

    // Fire and forget history logging for the newly started track
    logTrackStart(track, parsedDuration);

    if (ytPlayerRef.current?.loadVideoById) {
      ytPlayerRef.current.loadVideoById(track.id);
    }
  }, [logTrackStart, flushTracking, startTracking, ytPlayerRef]);

  // Public playTrack: sets up the queue (with shuffle if on) and plays
  const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
    if (newQueue && newQueue.length > 0) {
      // Auto-reset modes when explicitly starting a new queue context
      isShuffleRef.current = false;
      setIsShuffle(false);
      repeatModeRef.current = 'off';
      setRepeatMode('off');
      isMagicShuffleRef.current = true; // Default to Spotify's Autoplay behavior
      setIsMagicShuffle(true);

      originalQueueRef.current = newQueue;
      _play(track, newQueue);
    } else {
      _play(track, queueRef.current);
    }
  }, [_play]);

  // Core Magic Shuffle fetcher logic (Anti-Stall & Seed Branching)
  const _fetchMoreMagicTracks = async (seedTrackId: string, retryCount = 0): Promise<Track[]> => {
    if (magicInFlightRef.current && retryCount === 0) return [];
    magicInFlightRef.current = true;
    try {
      const moreTracks = await getRadioQueue(seedTrackId);
      const q = queueRef.current;
      const existingIds = new Set(q.map(t => t.id));
      const newTracks = moreTracks
        .filter(t => !existingIds.has(t.id))
        .map(t => ({ ...t, isMagic: true }));
      
      if (newTracks.length > 0) {
        magicInFlightRef.current = false;
        return newTracks;
      } else if (retryCount < 3 && q.length > 0) {
        // Anti-Stall: We exhausted this branch. Pick a random track from the queue to branch off
        const randomSeed = q[Math.floor(Math.random() * q.length)].id;
        return await _fetchMoreMagicTracks(randomSeed, retryCount + 1);
      }
    } catch (e) {
      console.error("Magic shuffle fetch failed", e);
    }
    magicInFlightRef.current = false;
    return [];
  };

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
    // If magic is on and we're nearing the end of the queue (less than 5 songs left)
    // We fetch a batch and keep the music going forever.
    if (isMagicShuffleRef.current && !magicInFlightRef.current && (q.length - currentIndex <= 5)) {
      const newTracks = await _fetchMoreMagicTracks(curr.id);
      if (newTracks.length > 0) {
        // Append new tracks to the end of the queue to keep it flowing
        const newQ = [...queueRef.current, ...newTracks];
        queueRef.current = newQ;
        setQueue(newQ);
      }
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
  }, [_play, ytPlayerRef]);

  // Hook up the ref so the effect can use it
  useEffect(() => {
    handleTrackEndRef.current = handleTrackEnd;
  }, [handleTrackEnd]);

  async function nextTrack() {
    const q = queueRef.current;
    const curr = currentTrackRef.current;
    if (!q.length || !curr) return;
    const i = q.findIndex(t => t.id === curr.id);

    // Magic Shuffle Check for nextTrack
    if (isMagicShuffleRef.current && !magicInFlightRef.current && (q.length - i <= 5)) {
      const newTracks = await _fetchMoreMagicTracks(curr.id);
      if (newTracks.length > 0) {
        const newQ = [...queueRef.current, ...newTracks];
        queueRef.current = newQ;
        setQueue(newQ);
      }
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
    flushTracking();
  };

  const resumeTrack = () => {
    const yt = ytPlayerRef.current;
    if (yt && typeof yt.getPlayerState === 'function') {
      const state = yt.getPlayerState();
      // If player is Unstarted (-1) or Cued (5) and we have a track, force a hard play.
      if ((state === -1 || state === 5) && currentTrackRef.current) {
        _play(currentTrackRef.current, queueRef.current);
        return;
      }
      if (typeof yt.playVideo === 'function') {
        yt.playVideo();
      }
    } else if (currentTrackRef.current) {
      _play(currentTrackRef.current, queueRef.current);
      return;
    }
    setIsPlaying(true);
    startTracking();
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
      // Turn ON: inject radio songs after current track
      try {
        let newTracks = await _fetchMoreMagicTracks(curr.id);
        if (newTracks.length > 0) {
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
    
    // Reset toggle states to match user expectations of a completely clear state
    isShuffleRef.current = false;
    setIsShuffle(false);
    isMagicShuffleRef.current = false;
    setIsMagicShuffle(false);
    repeatModeRef.current = 'off';
    setRepeatMode('off');
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

  const addToQueue = useCallback((track: Track) => {
    const q = queueRef.current;
    const curr = currentTrackRef.current;
    const newQ = [...q];
    
    if (curr) {
      const idx = q.findIndex(t => t.id === curr.id);
      if (idx >= 0) {
        newQ.splice(idx + 1, 0, track); // Insert right after current track
      } else {
        newQ.push(track);
      }
    } else {
      newQ.push(track);
    }
    
    setQueue(newQ);
    queueRef.current = newQ;
    originalQueueRef.current = [...originalQueueRef.current, track];
    
    // If player is idle/empty, start playing immediately
    if (!curr) {
      _play(track, newQ);
    }
  }, [_play]);

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
        addToQueue,
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
