import { useState, useEffect } from "react";
import { searchMusic, getHomeMixes, getCharts, Track, searchArtists, getHomeShelves, searchAlbums, getRadioQueue } from "@/lib/api";
import { computeEvolvedDNA, generateLiveVibe } from "@/lib/vibeGenerator";
import { createClient } from "@/utils/supabase/client";
import onboardingData from "@/lib/onboardingData.json";

let feedCache: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 3 * 60 * 1000;

export function useDashboardFeeds() {
  const supabase = createClient();
  const isCacheValid = feedCache !== null && (Date.now() - lastFetchTime < CACHE_TTL);

  const [loading, setLoading] = useState(!isCacheValid);
  
  // Expose errors so UI can handle silent failures
  const [feedErrors, setFeedErrors] = useState<Record<string, string>>({});

  const recordError = (key: string, error: any) => {
    console.error(`[DashboardFeed] Error loading ${key}:`, error);
    setFeedErrors(prev => ({ ...prev, [key]: error?.message || String(error) }));
  };

  // User State
  const [userProfile, setUserProfile] = useState<any>(isCacheValid ? feedCache.userProfile : null);
  const [userDna, setUserDna] = useState<any>(isCacheValid ? feedCache.userDna : null);

  // Feed State
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>(isCacheValid ? feedCache.recentlyPlayed : []);
  const [jumpBackIn, setJumpBackIn] = useState<Track[]>(isCacheValid ? feedCache.jumpBackIn : []);
  const [curatedForYou, setCuratedForYou] = useState<Track[]>(isCacheValid ? feedCache.curatedForYou : []);
  const [yourTopMixes, setYourTopMixes] = useState<Track[]>(isCacheValid ? feedCache.yourTopMixes : []);
  const [trendingNow, setTrendingNow] = useState<Track[]>(isCacheValid ? feedCache.trendingNow : []);
  const [freshDrops, setFreshDrops] = useState<Track[]>(isCacheValid ? feedCache.freshDrops : []);
  const [popularArtists, setPopularArtists] = useState<any[]>(isCacheValid ? feedCache.popularArtists : []);
  const [editorsPicks, setEditorsPicks] = useState<Track[]>(isCacheValid ? feedCache.editorsPicks : []);
  const [popularAlbums, setPopularAlbums] = useState<any[]>(isCacheValid ? feedCache.popularAlbums : []);
  const [trendingInGenre, setTrendingInGenre] = useState<Track[]>(isCacheValid ? feedCache.trendingInGenre : []);
  
  const [vibeLoading, setVibeLoading] = useState(false);

  // Sync cache on updates (always keep cache up to date with latest fetched data)
  useEffect(() => {
    feedCache = {
      userProfile, userDna, recentlyPlayed, jumpBackIn, curatedForYou,
      yourTopMixes, trendingNow, freshDrops, popularArtists, editorsPicks,
      popularAlbums, trendingInGenre
    };
  }, [userProfile, userDna, recentlyPlayed, jumpBackIn, curatedForYou, yourTopMixes, trendingNow, freshDrops, popularArtists, editorsPicks, popularAlbums, trendingInGenre]);

  // Helper to safely extract artist name
  const getArtistName = (artistObj: any) => {
    if (!artistObj) return "";
    return typeof artistObj === 'object' ? artistObj.name : String(artistObj);
  };

  useEffect(() => {
    if (isCacheValid) return;

    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        let localUserDna: any = null;
        let localRecentlyPlayed: Track[] = [];

        // --- BATCH 1: Local User Data & DNA Mix ---
        if (session) {
          const [profileRes, dnaRes, historyRes] = await Promise.allSettled([
            supabase.from("profiles").select("*").eq("id", session.user.id).single(),
            supabase.from("taste_dna").select("*").eq("user_id", session.user.id).single(),
            supabase.from("listening_history").select("track_id, track_title, track_artist, track_thumbnail").eq("user_id", session.user.id).order("played_at", { ascending: false }).limit(30),
          ]);

          if (profileRes.status === "fulfilled" && profileRes.value.data) {
            setUserProfile(profileRes.value.data);
          }
          
          if (historyRes.status === "fulfilled" && historyRes.value.data) {
            const history = historyRes.value.data;
            const unique = Array.from(new Set(history.map((h: any) => h.track_id))).map(id => {
              const h = history.find((x: any) => x.track_id === id);
              if (!h) return null;
              return { id: h.track_id, title: h.track_title, artist: h.track_artist, thumbnail: h.track_thumbnail || "" };
            }).filter(Boolean);
            localRecentlyPlayed = unique as Track[];
            setRecentlyPlayed(localRecentlyPlayed);
            setJumpBackIn([...localRecentlyPlayed].reverse());
          }
          
          if (dnaRes.status === "fulfilled" && dnaRes.value.data) {
            localUserDna = dnaRes.value.data;
            setUserDna(localUserDna);
          }
        }

        setVibeLoading(true);
        const dnaLogic = computeEvolvedDNA(localUserDna, localRecentlyPlayed);
        generateLiveVibe(localUserDna, localRecentlyPlayed, dnaLogic.evolvedArtists, dnaLogic.evolvedGenres)
          .then(vibe => {
            if (vibe && vibe.length > 0) {
              setCuratedForYou(vibe);
            }
          })
          .catch(err => recordError("curatedForYou", err))
          .finally(() => setVibeLoading(false));

        // Unlock UI so Batch 1 renders instantly
        setLoading(false);

        // Wait to prevent rate limiting
        await new Promise(r => setTimeout(r, 200));

        // Setup DNA defaults
        const topGenre = localUserDna?.top_genres?.[0] || "Pop";
        const topArtistObj1 = localUserDna?.top_artists?.[0];
        const topArtistObj2 = localUserDna?.top_artists?.[1];
        const topSongObj1 = localUserDna?.top_songs?.[0];
        const topSongObj2 = localUserDna?.top_songs?.[1];

        const artist1 = getArtistName(topArtistObj1) || localRecentlyPlayed?.[0]?.artist || "trending hit";
        const artist2 = getArtistName(topArtistObj2) || localRecentlyPlayed?.[1]?.artist || "global viral";

        // --- BATCH 2: Trending & Artists ---
        const fetchArtists = searchArtists(artist1)
          .then(async (apiArtists) => {
            const baseArtists = [...onboardingData.artists];
            for (let i = baseArtists.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [baseArtists[i], baseArtists[j]] = [baseArtists[j], baseArtists[i]];
            }
            
            let combined = [...(apiArtists.slice(0, 6)), ...baseArtists].slice(0, 15);
            combined = Array.from(new Map(combined.map(item => [item.id, item])).values());
            
            for (let i = combined.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [combined[i], combined[j]] = [combined[j], combined[i]];
            }
            setPopularArtists(combined.slice(0, 60));
          })
          .catch(err => recordError("popularArtists", err));

        const fetchTrending = Promise.all([
          searchMusic("top trending global hit songs"),
          searchMusic("top trending kpop songs"),
          searchMusic("top trending bollywood hit songs"),
          searchMusic("top trending south indian hits"),
          searchMusic("top trending desi hip hop indie hit songs")
        ]).then(results => {
          const [enRes, kpRes, boRes, soRes, dhRes] = results;
          const trendingMix = [
            ...(enRes?.songs?.slice(0, 20) || []),
            ...(kpRes?.songs?.slice(0, 10) || []),
            ...(boRes?.songs?.slice(0, 25) || []),
            ...(soRes?.songs?.slice(0, 10) || []),
            ...(dhRes?.songs?.slice(0, 10) || [])
          ];
          for (let i = trendingMix.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [trendingMix[i], trendingMix[j]] = [trendingMix[j], trendingMix[i]];
          }
          setTrendingNow(trendingMix);

          getCharts("IN").then(charts => {
            const topCharts = charts.slice(0, 10);
            const onboardSongs = [...onboardingData.songs];
            for (let i = onboardSongs.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [onboardSongs[i], onboardSongs[j]] = [onboardSongs[j], onboardSongs[i]];
            }
            const mixedPicks = [...topCharts, ...onboardSongs.slice(0, 30)];
            for (let i = mixedPicks.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [mixedPicks[i], mixedPicks[j]] = [mixedPicks[j], mixedPicks[i]];
            }
            setEditorsPicks(mixedPicks.slice(0, 60));
          }).catch(err => recordError("editorsPicks", err));
        }).catch(err => recordError("trendingNow", err));

        await Promise.allSettled([fetchArtists, fetchTrending]);

        // Wait to prevent rate limiting
        await new Promise(r => setTimeout(r, 200));

        // --- BATCH 3: Genre, Drops, Mixes, Albums ---
        const fetchAlbums = Promise.allSettled([
          searchAlbums(`best hit albums by ${artist1}`),
          searchAlbums(`best hit albums by ${artist2}`),
          searchAlbums(`top trending new indian bollywood albums`),
          searchAlbums(`latest hit indian punjabi albums`)
        ]).then(results => {
          let mixed: any[] = [];
          results.forEach(res => {
            if (res.status === "fulfilled" && res.value) {
              mixed = [...mixed, ...res.value];
            }
          });
          const unique = Array.from(new Map(mixed.map(item => [item.id || item.title, item])).values());
          for (let i = unique.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [unique[i], unique[j]] = [unique[j], unique[i]];
          }
          setPopularAlbums(unique.slice(0, 60));
        }).catch(err => recordError("popularAlbums", err));

        const fetchGenre = searchMusic(`top trending ${topGenre} songs`)
          .then(async res => {
             let finalRes = res?.songs || [];
             if (finalRes.length < 25) {
                const fb = await searchMusic(`top trending indian hit songs`).catch(() => null);
                finalRes = [...finalRes, ...(fb?.songs || [])];
             }
             setTrendingInGenre(finalRes.slice(0, 60));
          })
          .catch(err => recordError("trendingInGenre", err));

        const fetchDrops = searchMusic(`brand new latest ${topGenre} songs`)
          .then(async res => {
             let finalRes = res?.songs || [];
             if (finalRes.length < 25) {
                const fb = await searchMusic(`latest new hit songs right now`).catch(() => null);
                finalRes = [...finalRes, ...(fb?.songs || [])];
             }
             setFreshDrops(finalRes.slice(0, 60));
          })
          .catch(err => recordError("freshDrops", err));

        const seed2 = typeof topSongObj1 === "object" ? topSongObj1.id : null;
        let fetchMixes;
        if (seed2) {
          fetchMixes = getRadioQueue(seed2)
            .then(async queue => {
               let finalQueue = queue || [];
               if (finalQueue.length < 25) {
                  const m = await getHomeMixes().catch(() => []);
                  finalQueue = [...finalQueue, ...m];
               }
               setYourTopMixes(finalQueue.slice(0, 60));
            })
            .catch(async err => {
              recordError("yourTopMixes", err);
              const m = await getHomeMixes().catch(() => []);
              setYourTopMixes(m.slice(0, 60));
            });
        } else {
          fetchMixes = getHomeMixes().then(m => setYourTopMixes(m.slice(0, 60))).catch(err => recordError("yourTopMixes", err));
        }

        await Promise.allSettled([fetchAlbums, fetchGenre, fetchDrops, fetchMixes]);

        lastFetchTime = Date.now();

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        // Just in case it wasn't unlocked
        setLoading(false);
      }
    }

    loadData();
  }, [isCacheValid]);

  return {
    loading,
    feedErrors,
    userProfile,
    userDna,
    recentlyPlayed,
    setRecentlyPlayed,
    jumpBackIn,
    setJumpBackIn,
    curatedForYou,
    editorsPicks,
    popularAlbums,
    trendingInGenre,
    yourTopMixes,
    trendingNow,
    freshDrops,
    popularArtists,
    vibeLoading
  };
}
