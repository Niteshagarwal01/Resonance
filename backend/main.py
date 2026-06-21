import asyncio
import re
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


# ── Image URL Utilities ────────────────────────────────────────────────────────

def upgrade_yt3_image(url: str | None, size: int = 500) -> str | None:
    """
    YouTube's artist/album art CDN (yt3.googleusercontent.com) embeds size params
    like =w120-h120-l90-rj directly in the URL. We rewrite them to get high-res art.
    e.g. =w120-h120-l90-rj  →  =w500-h500-l90-rj
    """
    if not url:
        return None
    # Replace the size suffix pattern: =w<n>-h<n>... or -w<n>-h<n>...
    upgraded = re.sub(r"=w\d+-h\d+", f"=w{size}-h{size}", url)
    # Some URLs use a different pattern like /w120-h120/
    upgraded = re.sub(r"/w\d+-h\d+/", f"/w{size}-h{size}/", upgraded)
    return upgraded


def upgrade_ytimg_thumbnail(url: str | None, video_id: str | None = None) -> str | None:
    """
    YouTube video thumbnails (i.ytimg.com) come in multiple resolutions.
    We prefer maxresdefault → sddefault → hqdefault (fallback chain).
    If we have the videoId we can build the best URL directly.
    """
    if video_id:
        # maxresdefault is 1280×720, perfect for a song banner
        return f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg"
    if not url:
        return None
    # Upgrade existing hqdefault or sddefault URLs
    url = url.replace("hqdefault.jpg", "maxresdefault.jpg")
    url = url.replace("sddefault.jpg", "maxresdefault.jpg")
    return url


def best_thumbnail(thumbnails: list, video_id: str | None = None) -> str | None:
    """Pick the highest resolution thumbnail from a thumbnails array."""
    if not thumbnails:
        return upgrade_ytimg_thumbnail(None, video_id)
    # Sort by width descending and take the biggest one
    sorted_thumbs = sorted(thumbnails, key=lambda t: t.get("width", 0), reverse=True)
    url = sorted_thumbs[0].get("url")
    # Determine CDN type and upgrade accordingly
    if url and "yt3.googleusercontent.com" in url:
        return upgrade_yt3_image(url, size=500)
    if url and "ytimg.com" in url:
        return upgrade_ytimg_thumbnail(url, video_id)
    return url


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "Resonance Backend is running. YT Engine active."}


@app.get("/api/search")
async def search_music(q: str = Query(..., min_length=1)):
    """
    Searches YouTube Music for tracks, returning high-res thumbnails.
    """
    try:
        raw_results = await asyncio.to_thread(ytmusic.search, query=q, filter="songs", limit=15)
        formatted = []
        for item in raw_results:
            video_id = item.get("videoId")
            formatted.append({
                "id": video_id,
                "title": item.get("title"),
                "artist": ", ".join([a["name"] for a in item.get("artists", [])]),
                "album": item.get("album", {}).get("name") if item.get("album") else None,
                "duration": item.get("duration"),
                # Always use the maxresdefault YouTube thumbnail for songs
                "thumbnail": upgrade_ytimg_thumbnail(None, video_id),
            })
        return {"query": q, "results": formatted}
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail="Search failed")


@app.get("/api/search/artists")
async def search_artists(q: str = Query(..., min_length=1)):
    """
    Searches YouTube Music for Artists, returning high-res 500×500 artist art.
    """
    try:
        raw_results = await asyncio.to_thread(ytmusic.search, query=q, filter="artists", limit=12)
        formatted = []
        for item in raw_results:
            raw_image = best_thumbnail(item.get("thumbnails", []))
            formatted.append({
                "id": item.get("browseId"),
                "name": item.get("artist"),
                # Upgraded to 500×500 from the yt3.googleusercontent.com CDN
                "image": raw_image,
            })
        return {"query": q, "results": [r for r in formatted if r["id"] and r["name"]]}
    except Exception as e:
        print(f"Artist Search error: {e}")
        raise HTTPException(status_code=500, detail="Artist Search failed")


@app.get("/api/radio")
async def get_radio(seed_id: str = Query(..., description="The seed video ID from YouTube Music")):
    """
    Hits YT Music's Watch Next algorithm to get the perfect auto-play queue.
    """
    try:
        radio_queue = await asyncio.to_thread(ytmusic.get_watch_playlist, videoId=seed_id)
        tracks = []
        for track in radio_queue.get("tracks", []):
            video_id = track.get("videoId")
            tracks.append({
                "id": video_id,
                "title": track.get("title"),
                "artist": ", ".join([a["name"] for a in track.get("artists", [])]),
                # Use maxresdefault for all radio queue tracks
                "thumbnail": upgrade_ytimg_thumbnail(None, video_id),
                "length": track.get("length"),
            })

        return {
            "seed_id": seed_id,
            "playlist_id": radio_queue.get("playlistId"),
            "queue": tracks,
        }
    except Exception as e:
        print(f"Radio error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch recommendation queue.")
