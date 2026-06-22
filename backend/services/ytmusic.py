import asyncio
from ytmusicapi import YTMusic
from cachetools import TTLCache
from fastapi import HTTPException

# Global YTMusic instance and cache
ytmusic = YTMusic()
cache = TTLCache(maxsize=1000, ttl=600)  # 10 minute cache

class Formatter:
    @staticmethod
    def parse_duration(text):
        if not text: return None
        parts = text.split(":")
        if len(parts) == 2: return f"00:{parts[0].zfill(2)}:{parts[1].zfill(2)}"
        if len(parts) == 3: return f"{parts[0].zfill(2)}:{parts[1].zfill(2)}:{parts[2].zfill(2)}"
        return text

    @staticmethod
    def get_thumbnail(thumbnails):
        if not thumbnails: return None
        if isinstance(thumbnails, list) and len(thumbnails) > 0:
            return thumbnails[-1].get("url")
        return None

class YTMusicService:
    @staticmethod
    async def run_with_cache(cache_key: str, func, *args, **kwargs):
        if cache_key in cache:
            return cache[cache_key]
        try:
            result = await asyncio.to_thread(func, *args, **kwargs)
            cache[cache_key] = result
            return result
        except Exception as e:
            print(f"YTMusic Error ({func.__name__}): {e}")
            raise HTTPException(status_code=500, detail=f"External API error: {e}")

    @staticmethod
    async def search(query: str, filter_type: str = "songs", limit: int = 20):
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
        return await YTMusicService.run_with_cache(f"radio:{seed_id}", ytmusic.get_watch_playlist, videoId=seed_id, limit=limit)

    @staticmethod
    async def get_charts(country: str = "IN"):
        return await YTMusicService.run_with_cache(f"charts:{country}", ytmusic.get_charts, country=country)

    @staticmethod
    async def get_mood_categories():
        return await YTMusicService.run_with_cache("moods", ytmusic.get_mood_categories)
