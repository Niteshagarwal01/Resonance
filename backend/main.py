import asyncio
import re
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ytmusicapi import YTMusic
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Resonance API", description="YT Music Powered Backend", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ytmusic = YTMusic()


# ── Utilities ─────────────────────────────────────────────────────────────────

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


def format_duration(raw: str | None) -> str | None:
    """Ensure durations are in MM:SS format. YTMusic sometimes returns H:MM:SS."""
    if not raw:
        return None
    parts = raw.strip().split(":")
    if len(parts) == 2:
        return raw  # already MM:SS
    if len(parts) == 3:
        # H:MM:SS → convert to total minutes:SS
        h, m, s = int(parts[0]), int(parts[1]), int(parts[2])
        total_min = h * 60 + m
        return f"{total_min}:{s:02d}"
    return raw


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
    duration_raw = item.get("duration") or item.get("length")
    return {
        "id": video_id,
        "title": item.get("title"),
        "artist": artist_str,
        "album": album_name,
        "duration": format_duration(duration_raw),
        "thumbnail": upgrade_ytimg_thumbnail(None, video_id),
    }


# ── Root ──────────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "Resonance Backend v3 — running."}


# ── Search ────────────────────────────────────────────────────────────────────

@app.get("/api/search")
async def search_music(q: str = Query(..., min_length=1)):
    try:
        raw_results = await asyncio.to_thread(ytmusic.search, query=q, filter="songs", limit=20)
        formatted = []
        for item in raw_results:
            video_id = item.get("videoId")
            if not video_id:
                continue
            formatted.append({
                "id": video_id,
                "title": item.get("title"),
                "artist": ", ".join([a["name"] for a in item.get("artists", [])]),
                "album": item.get("album", {}).get("name") if item.get("album") else None,
                "duration": format_duration(item.get("duration")),
                "thumbnail": upgrade_ytimg_thumbnail(None, video_id),
            })
        return {"query": q, "results": formatted}
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail="Search failed")


@app.get("/api/search/artists")
async def search_artists(q: str = Query(..., min_length=1)):
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


@app.get("/api/search/albums")
async def search_albums(q: str = Query(..., min_length=1)):
    try:
        raw_results = await asyncio.to_thread(ytmusic.search, query=q, filter="albums", limit=10)
        formatted = []
        for item in raw_results:
            browse_id = item.get("browseId")
            if not browse_id:
                continue
            artists = item.get("artists") or []
            formatted.append({
                "id": browse_id,
                "title": item.get("title"),
                "artist": ", ".join(a["name"] for a in artists if a.get("name")),
                "year": item.get("year"),
                "image": best_thumbnail(item.get("thumbnails", [])),
            })
        return {"query": q, "results": formatted}
    except Exception as e:
        print(f"Album search error: {e}")
        raise HTTPException(status_code=500, detail="Album search failed")


# ── Home Feed ─────────────────────────────────────────────────────────────────

@app.get("/api/home/shelves")
async def get_home_shelves():
    """
    Fetches the real YouTube Music home page shelves.
    Returns a structured list of shelves just like Spotify's home feed.
    """
    try:
        home_data = await asyncio.to_thread(ytmusic.get_home, limit=8)
        shelves = []
        for shelf in home_data:
            title = shelf.get("title", "")
            contents = shelf.get("contents", [])
            items = []
            for item in contents[:10]:
                # Could be tracks, albums, or playlists
                video_id = item.get("videoId")
                browse_id = item.get("playlistId") or item.get("browseId")
                thumbnails = item.get("thumbnails", [])
                artists = item.get("artists") or item.get("subscribers") and [] or []
                if isinstance(artists, str):
                    artists = []
                
                result = {
                    "id": video_id or browse_id,
                    "type": "track" if video_id else "playlist",
                    "title": item.get("title"),
                    "artist": ", ".join(a["name"] for a in artists if isinstance(a, dict) and a.get("name")),
                    "thumbnail": upgrade_ytimg_thumbnail(None, video_id) if video_id else best_thumbnail(thumbnails),
                    "duration": format_duration(item.get("duration") or item.get("length")),
                    "playlistId": browse_id,
                }
                if result["id"] and result["title"]:
                    items.append(result)
            
            if items:
                shelves.append({"title": title, "items": items})
        
        return {"shelves": shelves}
    except Exception as e:
        print(f"Home shelves error: {e}")
        raise HTTPException(status_code=500, detail="Home shelves failed")


@app.get("/api/home")
async def get_home_feed(seed_ids: str = Query(..., description="Comma-separated videoIds from user top songs")):
    """
    Spotify-style personalized radio - seeds YTM's watch_playlist from top songs.
    """
    try:
        ids = [s.strip() for s in seed_ids.split(",") if s.strip()][:5]
        if not ids:
            raise HTTPException(status_code=400, detail="No seed IDs provided")

        seen: set[str] = set()
        all_tracks: list[dict] = []

        async def fetch_seed(video_id: str):
            try:
                data = await asyncio.to_thread(ytmusic.get_watch_playlist, videoId=video_id, limit=200)
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
                            "duration": format_duration(item.get("duration") or item.get("length")),
                        })

        return {"tracks": all_tracks[:200]}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Home feed error: {e}")
        raise HTTPException(status_code=500, detail="Home feed failed")


# ── Charts ────────────────────────────────────────────────────────────────────

@app.get("/api/charts")
async def get_charts(country: str = Query(default="IN")):
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


# ── Moods ─────────────────────────────────────────────────────────────────────

@app.get("/api/moods")
async def get_moods():
    try:
        categories = await asyncio.to_thread(ytmusic.get_mood_categories)
        return categories
    except Exception as e:
        print(f"Moods error: {e}")
        raise HTTPException(status_code=500, detail="Moods fetch failed")


# ── Radio ─────────────────────────────────────────────────────────────────────

@app.get("/api/radio")
async def get_radio(seed_id: str = Query(...)):
    try:
        radio_queue = await asyncio.to_thread(ytmusic.get_watch_playlist, videoId=seed_id, limit=200)
        tracks = []
        for track in radio_queue.get("tracks", []):
            video_id = track.get("videoId")
            if not video_id:
                continue
            tracks.append({
                "id": video_id,
                "title": track.get("title"),
                "artist": ", ".join([a["name"] for a in track.get("artists", [])]),
                "thumbnail": upgrade_ytimg_thumbnail(None, video_id),
                "duration": format_duration(track.get("length") or track.get("duration")),
            })
        return {
            "seed_id": seed_id,
            "playlist_id": radio_queue.get("playlistId"),
            "queue": tracks,
        }
    except Exception as e:
        print(f"Radio error: {e}")
        raise HTTPException(status_code=500, detail="Radio fetch failed")


# ── Artist ────────────────────────────────────────────────────────────────────

@app.get("/api/artist/{artist_id}")
async def get_artist_profile(artist_id: str):
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
                    "duration": format_duration(song.get("duration")),
                })

        # Albums
        albums = []
        albums_section = data.get("albums", {})
        if albums_section and albums_section.get("results"):
            for album in albums_section["results"][:8]:
                browse_id = album.get("browseId")
                albums.append({
                    "id": browse_id,
                    "title": album.get("title"),
                    "year": album.get("year"),
                    "type": album.get("type", "Album"),
                    "thumbnail": best_thumbnail(album.get("thumbnails", [])),
                })

        # Singles
        singles = []
        singles_section = data.get("singles", {})
        if singles_section and singles_section.get("results"):
            for single in singles_section["results"][:8]:
                browse_id = single.get("browseId")
                singles.append({
                    "id": browse_id,
                    "title": single.get("title"),
                    "year": single.get("year"),
                    "thumbnail": best_thumbnail(single.get("thumbnails", [])),
                })

        return {
            "id": data.get("channelId") or artist_id,
            "name": data.get("name"),
            "description": data.get("description"),
            "views": data.get("views"),
            "subscribers": data.get("subscribers"),
            "image": best_thumbnail(data.get("thumbnails", [])),
            "top_tracks": top_songs,
            "albums": albums,
            "singles": singles,
        }
    except Exception as e:
        print(f"Artist profile error: {e}")
        raise HTTPException(status_code=500, detail="Artist profile fetch failed")


# ── Album ─────────────────────────────────────────────────────────────────────

@app.get("/api/album/{album_id}")
async def get_album(album_id: str):
    try:
        data = await asyncio.to_thread(ytmusic.get_album, browseId=album_id)
        tracks = []
        for i, track in enumerate(data.get("tracks", [])):
            video_id = track.get("videoId")
            if not video_id:
                continue
            artists = track.get("artists") or []
            tracks.append({
                "id": video_id,
                "title": track.get("title"),
                "artist": ", ".join(a["name"] for a in artists if a.get("name")) or data.get("artist", [{}])[0].get("name", ""),
                "duration": format_duration(track.get("duration")),
                "trackNumber": i + 1,
                "thumbnail": upgrade_ytimg_thumbnail(None, video_id),
            })
        
        album_artists = data.get("artists") or []
        return {
            "id": album_id,
            "title": data.get("title"),
            "artist": ", ".join(a["name"] for a in album_artists if a.get("name")),
            "artistId": album_artists[0].get("id") if album_artists else None,
            "year": data.get("year"),
            "trackCount": data.get("trackCount"),
            "duration": data.get("duration"),
            "description": data.get("description"),
            "thumbnail": best_thumbnail(data.get("thumbnails", [])),
            "tracks": tracks,
        }
    except Exception as e:
        print(f"Album error: {e}")
        raise HTTPException(status_code=500, detail="Album fetch failed")


# ── Playlist ──────────────────────────────────────────────────────────────────

@app.get("/api/playlist/{playlist_id}")
async def get_playlist(playlist_id: str):
    try:
        data = await asyncio.to_thread(ytmusic.get_playlist, playlistId=playlist_id, limit=200)
        tracks = []
        for item in data.get("tracks", []):
            video_id = item.get("videoId")
            if not video_id:
                continue
            artists = item.get("artists") or []
            tracks.append({
                "id": video_id,
                "title": item.get("title"),
                "artist": ", ".join(a["name"] for a in artists if a.get("name")),
                "album": (item.get("album") or {}).get("name"),
                "duration": format_duration(item.get("duration")),
                "thumbnail": upgrade_ytimg_thumbnail(None, video_id),
            })
        return {
            "id": playlist_id,
            "title": data.get("title"),
            "description": data.get("description"),
            "author": data.get("author", {}).get("name") if data.get("author") else None,
            "trackCount": data.get("trackCount"),
            "thumbnail": best_thumbnail(data.get("thumbnails", [])),
            "tracks": tracks,
        }
    except Exception as e:
        print(f"Playlist error: {e}")
        raise HTTPException(status_code=500, detail="Playlist fetch failed")
