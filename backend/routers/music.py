from fastapi import APIRouter, Query, Request, Depends
from services.ytmusic import YTMusicService, Formatter
from services.dna import DNAEvolutionEngine
from db import supabase, verify_token
from rate_limiter import limiter

router = APIRouter()

@router.get("/search")
@limiter.limit("200/minute")
async def search_music(request: Request, q: str = Query(..., min_length=1)):
    raw_results = await YTMusicService.search(q, filter_type=None, limit=30)
    
    top_result = None
    songs = []
    artists = []
    albums = []
    
    for item in raw_results:
        r_type = item.get("resultType")
        cat = item.get("category")
        
        entry = {
            "title": item.get("title", item.get("artist", "")),
            "thumbnail": Formatter.get_thumbnail(item.get("thumbnails"))
        }
        
        if r_type in ["song", "video"]:
            entry["id"] = item.get("videoId")
            entry["artist"] = ", ".join(a.get("name", "") for a in item.get("artists", [])) if item.get("artists") else item.get("artist", "")
            entry["duration"] = Formatter.parse_duration(item.get("duration", item.get("length")))
            entry["album"] = item.get("album", {}).get("name") if item.get("album") else None
            entry["type"] = "song"
            
            if entry.get("id") and cat != "Top result":
                songs.append(entry)
                
        elif r_type == "artist":
            entry["id"] = item.get("browseId") or item.get("id")
            if not entry.get("id") and item.get("artists"):
                entry["id"] = item["artists"][0].get("id")
                
            entry["name"] = item.get("artist", item.get("title", ""))
            if not entry.get("name") and item.get("artists"):
                entry["name"] = item["artists"][0].get("name")
            entry["type"] = "artist"
            
            if entry.get("id") and cat != "Top result":
                artists.append(entry)
                
        elif r_type in ["album", "single", "ep"]:
            entry["id"] = item.get("browseId")
            entry["artist"] = ", ".join(a.get("name", "") for a in item.get("artists", [])) if item.get("artists") else item.get("artist", "")
            entry["year"] = item.get("year", "")
            entry["type"] = "album"
            
            if entry.get("id") and cat != "Top result":
                albums.append(entry)
                
        if cat == "Top result" and not top_result and entry.get("id"):
            top_result = entry
            
    return {
        "topResult": top_result,
        "songs": songs,
        "artists": artists,
        "albums": albums
    }

@router.get("/search/artists")
async def search_artists(q: str = Query(..., min_length=1)):
    raw_results = await YTMusicService.search(q, filter_type="artists", limit=40)
    formatted = []
    for item in raw_results:
        browse_id = item.get("browseId")
        if not browse_id: continue
        # Filter out fake artist profiles (playlist channels) by requiring shuffleId/radioId
        if not item.get("shuffleId") and not item.get("radioId"): continue
        
        formatted.append({
            "id": browse_id,
            "name": item.get("artist", ""),
            "subscribers": item.get("subscribers", ""),
            "image": Formatter.get_thumbnail(item.get("thumbnails")),
            "thumbnail": Formatter.get_thumbnail(item.get("thumbnails"))
        })
    return {"results": formatted}

@router.get("/search/albums")
async def search_albums(q: str = Query(..., min_length=1)):
    raw_results = await YTMusicService.search(q, filter_type="albums", limit=40)
    formatted = []
    for item in raw_results:
        browse_id = item.get("browseId")
        if not browse_id: continue
        formatted.append({
            "id": browse_id,
            "title": item.get("title", ""),
            "year": item.get("year", ""),
            "artist": ", ".join(a.get("name", "") for a in item.get("artists", [])) if item.get("artists") else item.get("artist", ""),
            "image": Formatter.get_thumbnail(item.get("thumbnails")),
            "thumbnail": Formatter.get_thumbnail(item.get("thumbnails"))
        })
    return {"results": formatted}

@router.get("/search/playlists")
async def search_playlists(q: str = Query(..., min_length=1)):
    raw_results = await YTMusicService.search(q, filter_type="playlists", limit=40)
    formatted = []
    for item in raw_results:
        browse_id = item.get("browseId")
        if not browse_id: continue
        formatted.append({
            "id": browse_id,
            "title": item.get("title", ""),
            "author": item.get("author", ""),
            "itemCount": item.get("itemCount", ""),
            "image": Formatter.get_thumbnail(item.get("thumbnails")),
            "thumbnail": Formatter.get_thumbnail(item.get("thumbnails"))
        })
    return {"results": formatted}

@router.get("/home/shelves")
async def get_home_shelves():
    categories = await YTMusicService.get_mood_categories()
    shelves = []
    for cat_name, items in categories.items():
        if not items: continue
        shelf_items = []
        for pl in items[:8]:
            shelf_items.append({
                "id": pl.get("params"),
                "title": pl.get("title", ""),
                "artist": "Category Mix",
                "thumbnail": "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg"
            })
        if shelf_items:
            shelves.append({"title": cat_name, "items": shelf_items})
    return {"shelves": shelves}

@router.get("/home")
@limiter.limit("60/minute")
async def get_home_mixes(request: Request, user: dict = Depends(verify_token)):
    user_id = user.user.id
    
    import asyncio
    
    # 1. Fetch evolved DNA seeds (up to 5 video IDs)
    top_seeds = await DNAEvolutionEngine.get_evolved_seeds(supabase, user_id)
    
    if "RDAMVM" in top_seeds and len(top_seeds) == 1:
        top_seeds = ["PL4fGSI1pDJn5RgLW0Sb_zECecWdH_4zOX"]

    # 2. Fetch separate radio mixes concurrently
    async def fetch_radio(seed):
        try:
            res = await YTMusicService.get_radio(seed, limit=15)
            return res.get("tracks", [])
        except Exception as e:
            print(f"Failed to fetch radio for seed {seed}: {e}")
            return []

    radio_queues = await asyncio.gather(*[fetch_radio(seed) for seed in top_seeds])
    
    # 3. Interleave tracks
    interleaved = []
    max_len = max([len(q) for q in radio_queues] + [0])
    seen_ids = set()
    
    for i in range(max_len):
        for q in radio_queues:
            if i < len(q):
                item = q[i]
                vid = item.get("videoId")
                if vid and vid not in seen_ids:
                    seen_ids.add(vid)
                    track = Formatter.format_track(item)
                    if track: interleaved.append(track)
                    
    # Enforce constraints: min 25, max 60
    final_tracks = interleaved[:60]
    
    if len(final_tracks) < 25:
        # Fallback to a massive default chart if somehow the radios failed or returned too few
        try:
            fallback = await YTMusicService.get_radio("PL4fGSI1pDJn5RgLW0Sb_zECecWdH_4zOX", limit=40)
            for item in fallback.get("tracks", []):
                vid = item.get("videoId")
                if vid and vid not in seen_ids:
                    seen_ids.add(vid)
                    track = Formatter.format_track(item)
                    if track:
                        final_tracks.append(track)
                        if len(final_tracks) >= 60: break
        except Exception:
            pass

    return {"tracks": final_tracks, "evolved_seeds": top_seeds}

@router.get("/charts")
@limiter.limit("60/minute")
async def get_charts(request: Request, country: str = Query(default="IN")):
    data = await YTMusicService.get_charts(country=country)
    
    # ytmusicapi 1.8+ returns ['countries', 'daily', 'weekly', 'artists']
    # We grab the first daily playlist or fallback
    daily = data.get("daily", [])
    if not daily:
        daily = data.get("weekly", [])
        
    if daily and daily[0].get("playlistId"):
        playlist_id = daily[0]["playlistId"]
        playlist_data = await YTMusicService.get_playlist(playlist_id, limit=20)
        trending = playlist_data.get("tracks", [])
    else:
        # Fallback if structure is missing
        trending = data.get("songs", {}).get("items", [])

    tracks = []
    for item in trending:
        track = Formatter.format_track(item)
        if track: tracks.append(track)
    return {"tracks": tracks}

@router.get("/moods")
async def get_moods():
    categories = await YTMusicService.get_mood_categories()
    return categories

@router.get("/radio")
@limiter.limit("60/minute")
async def get_radio(request: Request, seed_id: str = Query(..., min_length=1)):
    radio_queue = await YTMusicService.get_radio(seed_id, limit=50)
    tracks = []
    for item in radio_queue.get("tracks", []):
        track = Formatter.format_track(item)
        if track: tracks.append(track)
    return {"queue": tracks}

@router.get("/artist/{artist_id}")
async def get_artist(artist_id: str):
    data = await YTMusicService.get_artist(artist_id)
    top_songs = []
    if "songs" in data and "results" in data["songs"]:
        for item in data["songs"]["results"]:
            track = Formatter.format_track(item, fallback_artist=data.get("name"))
            if track: top_songs.append(track)
                
    albums = []
    if "albums" in data and "results" in data["albums"]:
        for item in data["albums"]["results"]:
            browse_id = item.get("browseId")
            if browse_id:
                albums.append({
                    "id": browse_id,
                    "title": item.get("title", ""),
                    "year": item.get("year", ""),
                    "thumbnail": Formatter.get_thumbnail(item.get("thumbnails"))
                })
                
    singles = []
    if "singles" in data and "results" in data["singles"]:
        for item in data["singles"]["results"]:
            browse_id = item.get("browseId")
            if browse_id:
                singles.append({
                    "id": browse_id,
                    "title": item.get("title", ""),
                    "year": item.get("year", ""),
                    "thumbnail": Formatter.get_thumbnail(item.get("thumbnails"))
                })

    return {
        "id": artist_id,
        "name": data.get("name"),
        "description": data.get("description"),
        "subscribers": data.get("subscribers"),
        "image": Formatter.get_thumbnail(data.get("thumbnails")),
        "top_songs": top_songs,
        "albums": albums,
        "singles": singles
    }

@router.get("/album/{album_id}")
async def get_album(album_id: str):
    data = await YTMusicService.get_album(album_id)
    tracks = []
    for item in data.get("tracks", []):
        artist_name = data.get("artist", "") if isinstance(data.get("artist"), str) else ", ".join(a.get("name", "") for a in data.get("artist", []) if isinstance(a, dict))
        track = Formatter.format_track(item, fallback_thumbnail=data.get("thumbnails"), fallback_artist=artist_name, fallback_album=data.get("title"))
        if track: tracks.append(track)
    return {
        "id": album_id,
        "title": data.get("title"),
        "artist": data.get("artist"),
        "year": data.get("year"),
        "image": Formatter.get_thumbnail(data.get("thumbnails")),
        "tracks": tracks
    }

@router.get("/playlist/{playlist_id}")
async def get_playlist(playlist_id: str):
    data = await YTMusicService.get_playlist(playlist_id)
    tracks = []
    for item in data.get("tracks", []):
        track = Formatter.format_track(item)
        if track: tracks.append(track)
    return {
        "id": playlist_id,
        "title": data.get("title"),
        "author": data.get("author", {}).get("name") if isinstance(data.get("author"), dict) else data.get("author"),
        "trackCount": data.get("trackCount"),
        "image": Formatter.get_thumbnail(data.get("thumbnails")),
        "tracks": tracks
    }
