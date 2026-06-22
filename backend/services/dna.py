import asyncio
from typing import List
from supabase import Client

class DNAEvolutionEngine:
    @staticmethod
    async def get_evolved_seeds(supabase: Client, user_id: str) -> List[str]:
        """
        Dynamically aggregates the user's taste based on:
        1. Taste DNA (Onboarding)
        2. Liked Artists (Explicit)
        3. Liked Songs (Explicit)
        4. Listening History (Passive, >50% completion)
        
        Returns a weighted list of seed IDs (videoIds or artistIds) to be used for YTM radio.
        """
        try:
            # Fetch all data concurrently
            dna_res, artists_res, songs_res, history_res = await asyncio.gather(
                asyncio.to_thread(supabase.table("taste_dna").select("top_artists, top_tracks").eq("user_id", user_id).single().execute),
                asyncio.to_thread(supabase.table("liked_artists").select("artist_name").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute),
                asyncio.to_thread(supabase.table("liked_songs").select("video_id").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute),
                asyncio.to_thread(supabase.table("listening_history").select("video_id, percentage_played").eq("user_id", user_id).order("created_at", desc=True).limit(50).execute)
            )

            seeds = {}

            # 1. Base DNA (Weight: 5)
            if dna_res.data:
                for artist in dna_res.data.get("top_artists", []):
                    name = artist if isinstance(artist, str) else artist.get("name")
                    if name: seeds[name] = seeds.get(name, 0) + 5
                for track in dna_res.data.get("top_tracks", []):
                    vid = track if isinstance(track, str) else track.get("id")
                    if vid: seeds[vid] = seeds.get(vid, 0) + 5

            # 2. Liked Artists (Weight: 10)
            if artists_res.data:
                for row in artists_res.data:
                    seeds[row["artist_name"]] = seeds.get(row["artist_name"], 0) + 10

            # 3. Liked Songs (Weight: 10)
            if songs_res.data:
                for row in songs_res.data:
                    seeds[row["video_id"]] = seeds.get(row["video_id"], 0) + 10

            # 4. Listening History (Weight: +4 for >50%, -2 for <10%)
            if history_res.data:
                for row in history_res.data:
                    vid = row["video_id"]
                    pct = row.get("percentage_played", 0)
                    if pct > 0.5:
                        seeds[vid] = seeds.get(vid, 0) + 4
                    elif pct < 0.1:
                        seeds[vid] = seeds.get(vid, 0) - 2
            
            # Filter out negative or zero weights and sort by weight
            sorted_seeds = sorted(
                [(k, v) for k, v in seeds.items() if v > 0],
                key=lambda x: x[1],
                reverse=True
            )

            # Return the top 5 highest weighted seeds
            top_seeds = [k for k, v in sorted_seeds[:5]]
            
            # Fallback to standard generic seed if completely empty
            if not top_seeds:
                return ["RDAMVM"]
                
            return top_seeds

        except Exception as e:
            print(f"DNA Evolution Error: {e}")
            return ["RDAMVM"]
