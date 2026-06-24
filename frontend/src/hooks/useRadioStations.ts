import { useMemo } from "react";
import { Track } from "@/lib/api";
import { useDashboardFeeds } from "./useDashboardFeeds";

export interface RadioStationMix {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  type: 'dna' | 'today' | 'editor' | 'genre' | 'artist' | 'discovery';
  tracks: Track[];
  seedId?: string;
  bgColor: string;
}

const COLORS = [
  "#FFB703", "#64DC96", "#8B5CF6", "#FF6B35", "#38BDF8", 
  "#F43F5E", "#EAB308", "#10B981", "#8B5CF6", "#EC4899"
];

function getRandomColor(index: number) {
  return COLORS[index % COLORS.length];
}

export function useRadioStations() {
  const {
    loading,
    curatedForYou,
    trendingNow,
    editorsPicks,
    trendingInGenre,
    yourTopMixes,
    userDna,
    jumpBackIn,
    vibeLoading,
  } = useDashboardFeeds();

  const stations = useMemo(() => {
    if (loading) return [];

    const mixes: RadioStationMix[] = [];
    let colorIndex = 0;

    // 1. DNA Mix (Super personalized)
    mixes.push({
      id: "dna-mix",
      title: "DNA Mix",
      description: "A hyper-personalized blend of your acoustic fingerprint.",
      thumbnail: curatedForYou?.[0]?.thumbnail || "",
      type: "dna",
      tracks: curatedForYou || [], 
      seedId: "top hit songs", // fallback
      bgColor: getRandomColor(colorIndex++)
    });

    // 2. Today's Top Mix
    const artist1 = jumpBackIn?.[0]?.artist || "top indie pop";
    const artist2 = jumpBackIn?.[1]?.artist || "trending genz";
    mixes.push({
      id: "today-mix",
      title: "Today's Mix",
      description: "The biggest global hits right now.",
      thumbnail: trendingNow?.[0]?.thumbnail || curatedForYou?.[1]?.thumbnail || "",
      type: "today",
      tracks: [],
      seedId: `today-mix:${artist1}:${artist2}`,
      bgColor: getRandomColor(colorIndex++)
    });

    // 3. Editor's Mix
    mixes.push({
      id: "editor-mix",
      title: "Editor's Mix",
      description: "Handpicked tracks and rising stars.",
      thumbnail: editorsPicks?.[0]?.thumbnail || jumpBackIn?.[1]?.thumbnail || "",
      type: "editor",
      tracks: [],
      seedId: `editor-mix:indian-indie-pop`, // intercepted in backend
      bgColor: getRandomColor(colorIndex++)
    });

    // 4. Genre Mix (Based on Top Genre)
    const topGenreObj = userDna?.top_genres?.[0];
    const topGenre = (typeof topGenreObj === 'object' ? topGenreObj.name : topGenreObj) || "Pop";
    mixes.push({
      id: "genre-mix-1",
      title: `${topGenre} Mix`,
      description: `Trending tracks in your favorite genre.`,
      thumbnail: trendingInGenre?.[0]?.thumbnail || jumpBackIn?.[2]?.thumbnail || "",
      type: "genre",
      tracks: [],
      seedId: `${topGenre} hit songs indian`,
      bgColor: getRandomColor(colorIndex++)
    });

    // 5. Discovery Mix
    mixes.push({
      id: "discovery-mix",
      title: "Discovery Mix",
      description: "Unearth hidden gems tailored to you.",
      thumbnail: yourTopMixes?.[0]?.thumbnail || curatedForYou?.[2]?.thumbnail || "",
      type: "discovery",
      tracks: [],
      seedId: `discovery-mix:new-indian-indie`,
      bgColor: getRandomColor(colorIndex++)
    });

    // 6-8. Artist Mixes
    if (jumpBackIn && jumpBackIn.length > 0) {
      const artistMap = new Map<string, Track[]>();
      jumpBackIn.forEach(track => {
        if (!artistMap.has(track.artist)) artistMap.set(track.artist, []);
        artistMap.get(track.artist)!.push(track);
      });

      const sortedArtists = Array.from(artistMap.entries()).sort((a, b) => b[1].length - a[1].length);

      // Artist Mix 1 (Top 1)
      if (sortedArtists.length > 0) {
        const [artist, tracks] = sortedArtists[0];
        mixes.push({
          id: `artist-mix-1`,
          title: `${artist} Mix`,
          description: `Essential tracks from ${artist} and similar artists.`,
          thumbnail: tracks[0]?.thumbnail || "",
          type: "artist",
          tracks: [],
          seedId: tracks[0].id, // Standard radio seed
          bgColor: getRandomColor(colorIndex++)
        });
      }

      // Artist Mix 2 (Blend of 2nd & 3rd)
      if (sortedArtists.length > 2) {
        const [artist1, tracks1] = sortedArtists[1];
        const [artist2, tracks2] = sortedArtists[2];
        mixes.push({
          id: `artist-mix-2`,
          title: `${artist1} & ${artist2} Mix`,
          description: `A unique blend of ${artist1} and ${artist2}.`,
          thumbnail: tracks1[0]?.thumbnail || tracks2[0]?.thumbnail || "",
          type: "artist",
          tracks: [],
          seedId: `blend-artists:${artist1}:${artist2}`,
          bgColor: getRandomColor(colorIndex++)
        });
      }

      // Artist Mix 3 (Blend of 4th & 5th)
      if (sortedArtists.length > 4) {
        const [artist1, tracks1] = sortedArtists[3];
        const [artist2, tracks2] = sortedArtists[4];
        mixes.push({
          id: `artist-mix-3`,
          title: `${artist1} & ${artist2} Mix`,
          description: `A unique blend of ${artist1} and ${artist2}.`,
          thumbnail: tracks1[0]?.thumbnail || tracks2[0]?.thumbnail || "",
          type: "artist",
          tracks: [],
          seedId: `blend-artists:${artist1}:${artist2}`,
          bgColor: getRandomColor(colorIndex++)
        });
      }
    }

    // 9. Mood Mix (Fully Personalized to User's Core Vibe)
    const coreVibe = userDna?.core_vibe || "chill lofi acoustic";
    
    // Capitalize each word for the title
    const vibeTitle = coreVibe.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    mixes.push({
      id: "mood-mix",
      title: `${vibeTitle} Mix`,
      description: `Curated exactly to your core vibe.`,
      thumbnail: jumpBackIn?.[3]?.thumbnail || curatedForYou?.[3]?.thumbnail || "",
      type: "discovery",
      tracks: [],
      seedId: `mood-mix:${coreVibe}:${artist1}`,
      bgColor: getRandomColor(colorIndex++)
    });

    // 10. Nostalgia Mix (Replaces Decade Mix - heavily personalized)
    mixes.push({
      id: "nostalgia-mix",
      title: "Nostalgia Mix",
      description: "A trip down memory lane with classic hits.",
      thumbnail: jumpBackIn?.[4]?.thumbnail || curatedForYou?.[4]?.thumbnail || "",
      type: "discovery",
      tracks: [],
      seedId: `nostalgia-mix:classic-bollywood:${artist1}`,
      bgColor: getRandomColor(colorIndex++)
    });

    return mixes;
  }, [loading, curatedForYou, trendingNow, editorsPicks, trendingInGenre, yourTopMixes, userDna, jumpBackIn]);

  return { stations, loading, vibeLoading };
}
