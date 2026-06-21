import asyncio
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ytmusicapi import YTMusic
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Resonance API", description="YT Music Powered Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize YTMusic
ytmusic = YTMusic()

@app.get("/")
def read_root():
    return {"message": "Resonance Backend is running. YT Engine active."}

@app.get("/api/search")
async def search_music(q: str = Query(..., min_length=1)):
    """
    Searches YouTube Music for tracks.
    """
    try:
        raw_results = await asyncio.to_thread(ytmusic.search, query=q, filter="songs", limit=10)
        formatted = []
        for item in raw_results:
            formatted.append({
                "id": item.get("videoId"),
                "title": item.get("title"),
                "artist": ", ".join([a["name"] for a in item.get("artists", [])]),
                "album": item.get("album", {}).get("name") if item.get("album") else None,
                "duration": item.get("duration"),
                "thumbnail": item.get("thumbnails", [{}])[-1].get("url") if item.get("thumbnails") else None
            })
        return {"query": q, "results": formatted}
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail="Search failed")

@app.get("/api/radio")
async def get_radio(seed_id: str = Query(..., description="The seed video ID from YouTube Music")):
    """
    Hits YT Music's 'Watch Next' algorithm to get the perfect auto-play queue.
    """
    try:
        radio_queue = await asyncio.to_thread(ytmusic.get_watch_playlist, videoId=seed_id)
        tracks = []
        for track in radio_queue.get("tracks", []):
            tracks.append({
                "id": track.get("videoId"),
                "title": track.get("title"),
                "artist": ", ".join([a["name"] for a in track.get("artists", [])]),
                "thumbnail": track.get("thumbnail", [{}])[-1].get("url") if track.get("thumbnail") else None,
                "length": track.get("length")
            })
            
        return {
            "seed_id": seed_id,
            "playlist_id": radio_queue.get("playlistId"),
            "queue": tracks
        }
    except Exception as e:
        print(f"Radio error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch recommendation queue.")
