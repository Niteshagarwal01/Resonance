import asyncio
import re
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ytmusicapi import YTMusic
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Resonance API", description="YT Music Powered Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ytmusic = YTMusic()


# ── Image URL Utilities ────────────────────────────────────────────────────────

def upgrade_yt3_image(url: str | None, size: int = 500) -> str | None:
    if not url:
        return None
    upgraded = re.sub(r"=w\d+-h\d+", f"=w{size}-h{size}", url)
    upgraded = re.sub(r"/w\d+-h\d+/", f"/w{size}-h{size}/", upgraded)
    return upgraded


def upgrade_ytimg_thumbnail(url: str | None, video_id: str | None = None) -> str | None:
    if video_id:
        return f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg"
    if not url:
        return None
    url = url.replace("hqdefault.jpg", "maxresdefault.jpg")
    url = url.replace("sddefault.jpg", "maxresdefault.jpg")
    return url


def best_thumbnail(thumbnails: list, video_id: str | None = None) -> str | None:
    if not thumbnails:
        return upgrade_ytimg_thumbnail(None, video_id)
    sorted_thumbs = sorted(thumbnails, key=lambda t: t.get("width", 0), reverse=True)
    url = sorted_thumbs[0].get("url")
    if url and "yt3.googleusercontent.com" in url:
        return upgrade_yt3_image(url, size=500)
    if url and "ytimg.com" in url:
        return upgrade_ytimg_thumbnail(url, video_id)
    return url


def format_track(item: dict) -> dict | None:
    """Normalize any track-like dict from ytmusicapi into our Track shape."""
    video_id = item.get("videoId")
    if not video_id:
        return None
    artists = item.get("artists") or []
    artist_str = ", ".join(a["name"] for a in artists if a.get("name"))
    album_name = None
    if item.get("album"):
        album_name = item["album"].get("name")
    return {
        "id": video_id,
        "title": item.get("title"),
        "artist": artist_str,
        "album": album_name,
        "duration": item.get("duration"),
        "thumbnail": upgrade_ytimg_thumbnail(None, video_id),
    }


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
    """Search YouTube Music for artists, returning browse IDs and high-res images."""
    try:
        raw_results = await asyncio.to_thread(ytmusic.search, query=q, filter="artists", limit=12)
        formatted = []
        for item in raw_results:
            browse_id = item.get("browseId")
            name = item.get("artist")
            if not browse_id or not name:
                continue
            formatted.append({
                "id": browse_id,
                "name": name,
                "image": best_thumbnail(item.get("thumbnails", [])),
                "subscribers": item.get("subscribers"),
            })
        return {"query": q, "results": formatted}
    except Exception as e:
        print(f"Artist search error: {e}")
        raise HTTPException(status_code=500, detail="Artist search failed")


@app.get("/api/moods")
async def get_moods():
    """
    Fetch mood and genre categories from YouTube Music.
    Returns a dictionary of sections and categories.
    """
    try:
        categories = await asyncio.to_thread(ytmusic.get_mood_categories)
        return categories
    except Exception as e:
        print(f"Moods error: {e}")
        raise HTTPException(status_code=500, detail="Moods fetch failed")

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
        raise HTTPException(status_code=500, detail="Radio fetch failed")


@app.get("/api/home")
async def get_home_feed(seed_ids: str = Query(..., description="Comma-separated videoIds from user top songs")):
    """
    Spotify-style personalized home feed.
    Seeds YTM's watch_playlist from each top song, interleaves & deduplicates
    results to produce a diverse mix across the user's taste clusters.
    """
    try:
        ids = [s.strip() for s in seed_ids.split(",") if s.strip()][:5]
        if not ids:
            raise HTTPException(status_code=400, detail="No seed IDs provided")

        seen: set[str] = set()
        all_tracks: list[dict] = []

        async def fetch_seed(video_id: str):
            try:
                data = await asyncio.to_thread(ytmusic.get_watch_playlist, videoId=video_id)
                return data.get("tracks", [])
            except Exception:
                return []

        results = await asyncio.gather(*[fetch_seed(vid) for vid in ids])

        # Interleave from all seeds so no single artist dominates
        max_len = max((len(r) for r in results), default=0)
        for i in range(max_len):
            for seed_tracks in results:
                if i < len(seed_tracks):
                    item = seed_tracks[i]
                    vid = item.get("videoId")
                    if vid and vid not in seen:
                        seen.add(vid)
                        artists = item.get("artists") or []
                        all_tracks.append({
                            "id": vid,
                            "title": item.get("title"),
                            "artist": ", ".join(a["name"] for a in artists if a.get("name")),
                            "thumbnail": upgrade_ytimg_thumbnail(None, vid),
                            "duration": item.get("duration") or item.get("length"),
                        })

        return {"tracks": all_tracks[:30]}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Home feed error: {e}")
        raise HTTPException(status_code=500, detail="Home feed failed")


@app.get("/api/charts")
async def get_charts(country: str = Query(default="IN")):
    """
    Real top chart songs from YouTube Music.
    Equivalent to Spotify's Top 50 charts.
    country='IN' for India, 'ZZ' for global.
    """
    try:
        data = await asyncio.to_thread(ytmusic.get_charts, country=country)
        tracks = []
        songs_section = data.get("songs", {})
        items = songs_section.get("items", [])
        for item in items:
            video_id = item.get("videoId")
            if not video_id:
                continue
            artists = item.get("artists") or []
            tracks.append({
                "id": video_id,
                "title": item.get("title"),
                "artist": ", ".join(a["name"] for a in artists if a.get("name")),
                "rank": item.get("rank"),
                "trend": item.get("trend"),
                "thumbnail": upgrade_ytimg_thumbnail(None, video_id),
            })
        return {"country": country, "tracks": tracks[:20]}
    except Exception as e:
        print(f"Charts error: {e}")
        raise HTTPException(status_code=500, detail="Charts fetch failed")


@app.get("/api/artist/{artist_id}")
async def get_artist_profile(artist_id: str):
    """Fetch full artist profile: bio, top tracks, subscriber count."""
    try:
        data = await asyncio.to_thread(ytmusic.get_artist, channelId=artist_id)
        top_songs = []
        songs_section = data.get("songs", {})
        if songs_section and songs_section.get("results"):
            for song in songs_section["results"]:
                video_id = song.get("videoId")
                if not video_id:
                    continue
                artists = song.get("artists") or []
                top_songs.append({
                    "id": video_id,
                    "title": song.get("title"),
                    "artist": ", ".join(a["name"] for a in artists if a.get("name")) or data.get("name"),
                    "album": (song.get("album") or {}).get("name"),
                    "thumbnail": upgrade_ytimg_thumbnail(None, video_id),
                    "duration": song.get("duration"),
                })
        return {
            "id": data.get("channelId") or artist_id,
            "name": data.get("name"),
            "description": data.get("description"),
            "views": data.get("views"),
            "subscribers": data.get("subscribers"),
            "image": best_thumbnail(data.get("thumbnails", [])),
            "top_tracks": top_songs,
        }
    except Exception as e:
        print(f"Artist profile error: {e}")
        raise HTTPException(status_code=500, detail="Artist profile fetch failed")
