import { useState, useEffect } from "react";
import { searchMusic, getHomeMixes, getCharts, Track, searchArtists } from "@/lib/api";
import { createClient } from "@/utils/supabase/client";

export function useDashboardFeeds() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  // User State
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userDna, setUserDna] = useState<any>(null);

  // Feed State
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [jumpBackIn, setJumpBackIn] = useState<Track[]>([]);
  const [curatedForYou, setCuratedForYou] = useState<Track[]>([]);
  const [yourTopMixes, setYourTopMixes] = useState<Track[]>([]);
  const [trendingNow, setTrendingNow] = useState<Track[]>([]);
  const [freshDrops, setFreshDrops] = useState<Track[]>([]);
  const [popularArtists, setPopularArtists] = useState<any[]>([]);
  const [vibeLoading, setVibeLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        let localUserDna: any = null;
        let localRecentlyPlayed: Track[] = [];

        // 1. Fetch User Data (Profile, DNA, History)
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

        // 2. Fetch DNA Vibe Mix
        if (localUserDna) {
          setVibeLoading(true);
          getHomeMixes().then(vibe => {
            if (vibe && vibe.length > 0) {
              setCuratedForYou(vibe);
              setYourTopMixes(vibe.slice(15, 30));
            }
          }).catch(console.error).finally(() => setVibeLoading(false));
        } else {
          getHomeMixes().then(vibe => {
            if (vibe && vibe.length > 0) {
              setCuratedForYou(vibe);
              setYourTopMixes(vibe.slice(15, 30));
            }
          }).catch(console.error);
        }

        // 3. Fetch Generic Home Feeds
        const genre2 = localUserDna?.top_genres?.[1] || "desi hip hop";
        
        const [trendingRes, newRes] = await Promise.allSettled([
          getCharts("IN"),
          searchMusic(`latest ${genre2} new releases`),
        ]);

        if (trendingRes.status === "fulfilled" && trendingRes.value) {
          setTrendingNow(trendingRes.value);
        }
        if (newRes.status === "fulfilled" && newRes.value && newRes.value.songs) {
          setFreshDrops(newRes.value.songs);
        }

        // 4. Fetch Real Data for Iconic Artists
        const POPULAR_ARTIST_NAMES = ["Arijit Singh", "Shreya Ghoshal", "AR Rahman", "Diljit Dosanjh", "Karan Aujla", "Pritam", "Anirudh Ravichander", "Badshah"];
        Promise.allSettled(
          POPULAR_ARTIST_NAMES.map(name => searchArtists(name).then(res => res[0]))
        ).then(results => {
          const artists = results
            .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && !!r.value)
            .map(r => r.value);
          setPopularArtists(artists);
        });

      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  return {
    loading,
    userProfile,
    userDna,
    recentlyPlayed,
    setRecentlyPlayed,
    jumpBackIn,
    setJumpBackIn,
    curatedForYou,
    yourTopMixes,
    trendingNow,
    freshDrops,
    popularArtists,
    vibeLoading
  };
}
