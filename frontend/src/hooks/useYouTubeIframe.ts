import { useEffect, useRef } from "react";
import { Track } from "@/lib/api";

interface UseYouTubeIframeProps {
  volume: number;
  currentTrackRef: React.MutableRefObject<Track | null>;
  setIsPlaying: (playing: boolean) => void;
  setDuration: (duration: number) => void;
  setProgress: (progress: number) => void;
  handleTrackEnd: () => void;
  startTracking: () => void;
  flushTracking: () => void;
}

export function useYouTubeIframe({
  volume,
  currentTrackRef,
  setIsPlaying,
  setDuration,
  setProgress,
  handleTrackEnd,
  startTracking,
  flushTracking
}: UseYouTubeIframeProps) {
  const ytPlayerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
            event.target.setVolume(volume); 
            if (currentTrackRef.current?.id) {
              event.target.cueVideoById(currentTrackRef.current.id);
            }
          },
          onStateChange: (event: any) => {
            const YT = (window as any).YT;
            if (event.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startTracking();
              const initialD = event.target.getDuration();
              if (initialD > 0) setDuration(initialD);
              
              if (!progressIntervalRef.current) {
                progressIntervalRef.current = setInterval(() => {
                  const t = event.target.getCurrentTime();
                  const d = event.target.getDuration();
                  if (d > 0) {
                    setProgress((t / d) * 100);
                    setDuration(d); 
                  }
                }, 1000);
              }
            } else {
              if (event.data === YT.PlayerState.ENDED) {
                handleTrackEnd();
              }
              setIsPlaying(false);
              flushTracking();
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

  // Sync volume to player when it changes
  useEffect(() => {
    if (ytPlayerRef.current?.setVolume) {
      ytPlayerRef.current.setVolume(volume);
    }
  }, [volume]);

  return { ytPlayerRef };
}
