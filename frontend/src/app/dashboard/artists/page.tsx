"use client";

import { Mic2, Star, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { searchArtists, getArtist } from "@/lib/api";
import Link from "next/link";
import { useLikedArtists } from "@/hooks/useLikedArtists";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLiked: isLikedArtist, toggleLikedArtist } = useLikedArtists();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch Taste DNA and Liked Artists in parallel
        const [dnaRes, likedRes] = await Promise.all([
          supabase.from("taste_dna").select("top_artists").eq("user_id", session.user.id).single(),
          supabase.from("liked_artists").select("*").eq("user_id", session.user.id)
        ]);
        
        const dnaArtists = dnaRes.data?.top_artists || [];
        const likedArtists = likedRes.data || [];

        // Normalize DNA artists
        const normalizedDna = await Promise.all(
          dnaArtists.map(async (a: any) => {
            if (typeof a === "string") {
              try {
                const res = await searchArtists(a);
                const validArtist = res?.find((r: any) => r.id);
                if (validArtist) {
                  return { id: validArtist.id, name: a, image: validArtist.image };
                }
              } catch (e) {}
              return { id: `legacy-${a}`, name: a, image: null };
            }
            return { id: a.id, name: a.name, image: a.image };
          })
        );

        // Normalize Liked Artists
        const normalizedLiked = likedArtists.map(a => ({
          id: a.artist_id,
          name: a.artist_name,
          image: a.artist_image
        }));

        // Merge and Deduplicate
        const allArtistsMap = new Map();
        [...normalizedDna, ...normalizedLiked].forEach(a => {
          if (!a.id && !a.name) return;
          
          // Find if we already have an artist with this exact name (case-insensitive)
          let existingKey = null;
          for (const [key, val] of allArtistsMap.entries()) {
            if (val.name?.toLowerCase() === a.name?.toLowerCase()) {
              existingKey = key;
              break;
            }
          }

          if (existingKey) {
            const existing = allArtistsMap.get(existingKey);
            const existingIsLegacy = typeof existing.id === "string" && existing.id.startsWith("legacy-");
            const newIsLegacy = typeof a.id === "string" && a.id.startsWith("legacy-");
            
            // If the existing one is legacy and the new one is real, replace it!
            if (existingIsLegacy && !newIsLegacy) {
              allArtistsMap.delete(existingKey);
              allArtistsMap.set(a.id, a);
            }
          } else {
            allArtistsMap.set(a.id || a.name, a);
          }
        });

        const mergedArtists = Array.from(allArtistsMap.values());

        if (mergedArtists.length > 0) {
          const results = await Promise.all(
            mergedArtists.map(async (artist: any) => {
              let realSubscribers = "";
              const isLegacy = typeof artist.id === "string" && artist.id.startsWith("legacy-");
              try {
                if (artist.id && !isLegacy) {
                  const details = await getArtist(artist.id);
                  if (details?.subscribers) realSubscribers = details.subscribers;
                  if (!artist.image && details?.image) artist.image = details.image;
                }
              } catch(e) {}

              return {
                id: isLegacy ? "" : artist.id,
                name: artist.name,
                image: artist.image || null,
                followers: realSubscribers,
                following: true
              };
            })
          );
          setArtists(results);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  return (
    <div className="p-8 pb-32">
      
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-black text-[#1A1A1A] mb-4 flex items-center gap-4">
          Fav Artists <Mic2 className="text-pink-500" size={40} />
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl">
          The creators behind the resonance. Track your favorites and discover rising talent.
        </p>
      </div>

      {/* Following Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-[#1A1A1A] flex items-center gap-2">
            <Star className="text-[#FFB703]" size={24} fill="currentColor" /> Your Roster
          </h2>
          <a href="/dashboard/profile" className="text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-full transition-colors flex items-center gap-1 shadow-sm">
            Edit Taste DNA
          </a>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 size={18} className="animate-spin" /> Loading your artists...
          </div>
        ) : artists.length === 0 ? (
          <p className="text-gray-500">No artists saved. Complete onboarding to add some!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {artists.map((artist) => (
              <div key={artist.id || artist.name} className="flex flex-col items-center group cursor-pointer">
                {artist.id ? (
                  <Link href={`/dashboard/artist/${artist.id}`} className="relative w-full aspect-square rounded-full overflow-hidden mb-4 shadow-md group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 block">
                    {artist.image ? (
                      <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <Mic2 size={48} className="text-gray-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="bg-[#1A1A1A] text-white px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                        View Profile
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4 shadow-md">
                    {artist.image ? (
                      <img src={artist.image} alt={artist.name} className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center opacity-80">
                        <Mic2 size={48} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                )}
                <h3 className="font-bold text-[#1A1A1A] text-center w-full truncate">{artist.name}</h3>
                {artist.followers ? (
                  <p className="text-sm text-gray-500">{artist.followers} Subscribers</p>
                ) : (
                  <p className="text-sm text-gray-500">Unknown Subscribers</p>
                )}
                
                <button 
                  onClick={() => toggleLikedArtist(artist)}
                  className={`mt-3 px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    isLikedArtist(artist.id)
                      ? 'border-[#FFB703] bg-[#FFB703]/10 text-[#FFB703] hover:bg-[#FFB703] hover:text-white' 
                      : 'border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'
                  }`}
                >
                  {isLikedArtist(artist.id) ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
