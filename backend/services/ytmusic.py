import asyncio
from ytmusicapi import YTMusic
from cachetools import TTLCache
from fastapi import HTTPException

# Global YTMusic instance and cache
ytmusic = YTMusic(location="IN", language="en")
cache = TTLCache(maxsize=1000, ttl=600)  # 10 minute cache
cache_lock = asyncio.Lock()

class Formatter:
    @staticmethod
    def parse_duration(text):
        if not text: return None
        parts = text.split(":")
        if len(parts) == 1: return f"0:{parts[0].zfill(2)}"
        if len(parts) == 2: return f"{parts[0]}:{parts[1].zfill(2)}"
        if len(parts) == 3: 
            if parts[0] == "00" or parts[0] == "0":
                return f"{parts[1]}:{parts[2].zfill(2)}"
            return f"{parts[0]}:{parts[1].zfill(2)}:{parts[2].zfill(2)}"
        return text

    @staticmethod
    def get_thumbnail(thumbnails):
        if not thumbnails: return None
        if isinstance(thumbnails, list) and len(thumbnails) > 0:
            return thumbnails[-1].get("url")
        if isinstance(thumbnails, str):
            return thumbnails
        return None

    @staticmethod
    def format_track(item: dict, fallback_thumbnail=None, fallback_artist=None, fallback_album=None) -> dict:
        vid = item.get("videoId")
        if not vid: return None
        
        thumbs = item.get("thumbnail") or item.get("thumbnails")
        thumbnail = Formatter.get_thumbnail(thumbs) or Formatter.get_thumbnail(fallback_thumbnail)
        
        # Parse artist(s)
        artists = item.get("artists") or item.get("artist")
        if isinstance(artists, list):
            artist_str = ", ".join(a.get("name", "") for a in artists if isinstance(a, dict) and a.get("name"))
        elif artists:
            artist_str = str(artists)
        else:
            artist_str = fallback_artist or ""

        # Parse album
        album = item.get("album")
        if isinstance(album, dict):
            album_str = album.get("name")
        elif album:
            album_str = str(album)
        else:
            album_str = fallback_album

        duration = item.get("duration") or item.get("length")

        return {
            "id": vid,
            "title": item.get("title", ""),
            "artist": artist_str,
            "album": album_str,
            "duration": Formatter.parse_duration(duration),
            "thumbnail": thumbnail
        }

class YTMusicService:
    @staticmethod
    async def run_with_cache(cache_key: str, func, *args, **kwargs):
        async with cache_lock:
            if cache_key in cache:
                return cache[cache_key]
        try:
            result = await asyncio.to_thread(func, *args, **kwargs)
            async with cache_lock:
                cache[cache_key] = result
            return result
        except Exception as e:
            print(f"YTMusic Error ({func.__name__}): {e}")
            raise HTTPException(status_code=500, detail=f"External API error: {e}")

    @staticmethod
    async def search(query: str, filter_type: str = None, limit: int = 20):
        return await YTMusicService.run_with_cache(f"search:{filter_type}:{query}", ytmusic.search, query=query, filter=filter_type, limit=limit)

    @staticmethod
    async def get_artist(channel_id: str):
        return await YTMusicService.run_with_cache(f"artist:{channel_id}", ytmusic.get_artist, channelId=channel_id)

    @staticmethod
    async def get_album(browse_id: str):
        return await YTMusicService.run_with_cache(f"album:{browse_id}", ytmusic.get_album, browseId=browse_id)

    @staticmethod
    async def get_playlist(playlist_id: str, limit: int = 50):
        return await YTMusicService.run_with_cache(f"playlist:{playlist_id}", ytmusic.get_playlist, playlistId=playlist_id, limit=limit)

    @staticmethod
    async def get_radio(seed_id: str, limit: int = 50):
        if seed_id.startswith("UC"):
            artist_data = await YTMusicService.run_with_cache(f"artist:{seed_id}", ytmusic.get_artist, channelId=seed_id)
            if "songs" in artist_data and "results" in artist_data["songs"]:
                return {"tracks": artist_data["songs"]["results"]}
            return {"tracks": []}
            
        is_playlist = seed_id.startswith("RD") or seed_id.startswith("PL") or seed_id.startswith("VL")
        if is_playlist:
            return await YTMusicService.run_with_cache(f"radio:{seed_id}", ytmusic.get_watch_playlist, playlistId=seed_id, limit=limit)
        else:
            return await YTMusicService.run_with_cache(f"radio:{seed_id}", ytmusic.get_watch_playlist, videoId=seed_id, limit=limit)

    @staticmethod
    async def get_charts(country: str = "IN"):
        return await YTMusicService.run_with_cache(f"charts:{country}", ytmusic.get_charts, country=country)

    @staticmethod
    async def get_mood_categories():
        return await YTMusicService.run_with_cache("moods", ytmusic.get_mood_categories)
