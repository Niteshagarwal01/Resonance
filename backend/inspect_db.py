import asyncio
from db import supabase

async def inspect():
    # Let's get the first user in taste_dna
    res = supabase.table("taste_dna").select("*").limit(5).execute()
    for row in res.data:
        print("Taste DNA user:", row["user_id"])
        print("Top Artists:", row.get("top_artists"))
        
    res2 = supabase.table("liked_artists").select("*").limit(5).execute()
    print("Liked Artists:")
    for row in res2.data:
        print(row)

if __name__ == "__main__":
    asyncio.run(inspect())
