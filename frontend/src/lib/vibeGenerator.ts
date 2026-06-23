import { searchMusic, getRadioQueue, getArtistProfile, Track } from "./api";

export function computeEvolvedDNA(baseDna: any, historyTracks: any[]) {
  if (!baseDna) return { evolvedArtists: [], evolvedGenres: [] };
  const base = baseDna.top_artists ?? [];
  
  const artistCounts: Record<string, number> = {};
  historyTracks.forEach(t => {
    const artistName = t.artist || t.track_artist;
    if (artistName) {
      artistCounts[artistName] = (artistCounts[artistName] || 0) + 1;
    }
  });
  
  const recentArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => ({ id: null, name: entry[0], image: null }))
    .slice(0, 5);

  const merged = [...recentArtists, ...base.map((b: any) => typeof b === "string" ? { id: null, name: b, image: null } : b)];
  const unique = [];
  const seenNames = new Set();
  for (const a of merged) {
     const nameKey = a.name?.toLowerCase();
     if (nameKey && !seenNames.has(nameKey)) { 
       seenNames.add(nameKey); 
       unique.push(a); 
     }
  }
  return {
    evolvedArtists: unique.slice(0, 8),
    evolvedGenres: baseDna.top_genres ?? []
  };
}

export async function generateLiveVibe(
  dnaData: any,
  hTracks: any[],
  eArtists: any[],
  eGenres: string[]
): Promise<Track[]> {
  try {
    const sources: Promise<Track[]>[] = [];

    // 1. From listening history (most personal)
    if (hTracks && hTracks.length > 0) {
      const seeds = hTracks.slice(0, 2);
      for (const seed of seeds) {
        sources.push(getRadioQueue(seed.id).catch(() => []));
      }
    } else if (eArtists && eArtists.length > 0) {
      // Fallback to getting a radio queue based on top artist if no history
      for (const artist of eArtists.slice(0, 1)) {
        if (artist.id && !artist.id.startsWith("legacy-")) {
          sources.push(getRadioQueue(artist.id).catch(() => []));
        } else {
          sources.push(
            searchMusic(`${artist.name} song`).then(async (res) => {
              const songs = res?.songs || [];
              if (songs.length > 0) {
                return await getRadioQueue(songs[0].id).catch(() => songs);
              }
              return [];
            }).catch(() => [])
          );
        }
      }
    }

    // 2. From evolved artists directly
    if (eArtists && eArtists.length > 0) {
      for (const artist of eArtists.slice(0, 4)) {
        if (artist.id && !artist.id.startsWith("legacy-")) {
          sources.push(
            getArtistProfile(artist.id)
              .then((res) => res?.songs?.results || [])
              .catch(() => [])
          );
        } else {
          sources.push(searchMusic(`${artist.name} songs`).then(res => res?.songs || []).catch(() => []));
        }
      }
    }

    // 3. Contextual Genre searches
    if (eGenres && eGenres.length > 0) {
      for (const genre of eGenres.slice(0, 2)) {
        sources.push(searchMusic(`${genre} hits`).then(res => res?.songs || []).catch(() => []));
      }
    }

    // 4. Core vibe context
    if (dnaData?.core_vibe) {
      const vibe = dnaData.core_vibe.replace(/[^\w\s]/gi, "").trim();
      sources.push(searchMusic(`${vibe} playlist`).then(res => res?.songs || []).catch(() => []));
    }

    const results = await Promise.all(sources);
    const allTracks = results.flat();

    // Deduplicate
    const seen = new Set<string>();
    const unique: Track[] = [];
    for (const t of allTracks) {
      if (t && t.id && !seen.has(t.id)) {
        seen.add(t.id);
        unique.push(t);
      }
    }

    // Shuffle and cap at 40
    const shuffled = unique.sort(() => Math.random() - 0.5).slice(0, 40);
    return shuffled;
  } catch (e) {
    console.error("Failed to build vibe playlist:", e);
    return [];
  }
}
