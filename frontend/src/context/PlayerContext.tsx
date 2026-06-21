"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Track } from "@/lib/api";

interface PlayerContextType {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number; // 0 to 100
  duration: number; // in seconds
  playTrack: (track: Track, newQueue?: Track[]) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (vol: number) => void;
  seekTo: (percent: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(50);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const ytPlayerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create the hidden div for the youtube player outside of React's control
    let playerDiv = document.getElementById("youtube-hidden-player");
    if (!playerDiv) {
      playerDiv = document.createElement("div");
      playerDiv.id = "youtube-hidden-player";
      playerDiv.style.display = "none";
      document.body.appendChild(playerDiv);
    }

    // Load YouTube IFrame API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      ytPlayerRef.current = new (window as any).YT.Player("youtube-hidden-player", {
        height: "0",
        width: "0",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume);
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setDuration(event.target.getDuration());
              if (!progressIntervalRef.current) {
                progressIntervalRef.current = setInterval(() => {
                  const currTime = event.target.getCurrentTime();
                  const dur = event.target.getDuration();
                  if (dur > 0) setProgress((currTime / dur) * 100);
                }, 1000);
              }
            } else {
              if (event.data === (window as any).YT.PlayerState.ENDED) {
                nextTrack();
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

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const playTrack = (track: Track, newQueue?: Track[]) => {
    setCurrentTrack(track);
    if (newQueue) setQueue(newQueue);
    setIsPlaying(true);
    setProgress(0);
    if (ytPlayerRef.current?.loadVideoById) {
      ytPlayerRef.current.loadVideoById(track.id);
    }
  };

  const pauseTrack = () => {
    if (ytPlayerRef.current?.pauseVideo) ytPlayerRef.current.pauseVideo();
    setIsPlaying(false);
  };

  const resumeTrack = () => {
    if (ytPlayerRef.current?.playVideo) ytPlayerRef.current.playVideo();
    setIsPlaying(true);
  };

  const nextTrack = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex >= 0 && currentIndex < queue.length - 1) {
      playTrack(queue[currentIndex + 1]);
    }
  };

  const prevTrack = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      playTrack(queue[currentIndex - 1]);
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (ytPlayerRef.current?.setVolume) {
      ytPlayerRef.current.setVolume(vol);
    }
  };

  const seekTo = (percent: number) => {
    if (ytPlayerRef.current?.seekTo && duration > 0) {
      const seekTime = (percent / 100) * duration;
      ytPlayerRef.current.seekTo(seekTime, true);
      setProgress(percent);
    }
  };

  return (
    <PlayerContext.Provider
      value={{ currentTrack, queue, isPlaying, volume, progress, duration, playTrack, pauseTrack, resumeTrack, nextTrack, prevTrack, setVolume, seekTo }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
