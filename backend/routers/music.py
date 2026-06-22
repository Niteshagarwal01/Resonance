from fastapi import APIRouter, Query, Request, Depends
from services.ytmusic import YTMusicService, Formatter
from services.dna import DNAEvolutionEngine
from db import supabase, verify_token

router = APIRouter()

@router.get("/search")
async def search_music(q: str = Query(..., min_length=1)):
    raw_results = await YTMusicService.search(q, filter_type="songs", limit=20)
    formatted = []
    for item in raw_results:
        video_id = item.get("videoId")
        if not video_id: continue
        formatted.append({
            "id": video_id,
            "title": item.get("title", ""),
            "artist": ", ".join(a.get("name", "") for a in item.get("artists", [])),
            "album": item.get("album", {}).get("name") if item.get("album") else None,
            "duration": Formatter.parse_duration(item.get("duration")),
            "thumbnail": Formatter.get_thumbnail(item.get("thumbnails"))
        })
    return {"results": formatted}

@router.get("/search/artists")
async def search_artists(q: str = Query(..., min_length=1)):
    raw_results = await YTMusicService.search(q, filter_type="artists", limit=12)
    formatted = []
    for item in raw_results:
        browse_id = item.get("browseId")
        if not browse_id: continue
        formatted.append({
            "id": browse_id,
            "name": item.get("artist", ""),
            "subscribers": item.get("subscribers", ""),
            "image": Formatter.get_thumbnail(item.get("thumbnails"))
        })
    return {"results": formatted}

@router.get("/search/albums")
async def search_albums(q: str = Query(..., min_length=1)):
    raw_results = await YTMusicService.search(q, filter_type="albums", limit=10)
    formatted = []
    for item in raw_results:
        browse_id = item.get("browseId")
        if not browse_id: continue
        formatted.append({
            "id": browse_id,
            "title": item.get("title", ""),
            "year": item.get("year", ""),
            "artist": ", ".join(a.get("name", "") for a in item.get("artists", [])),
            "image": Formatter.get_thumbnail(item.get("thumbnails"))
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
async def get_home_mixes(user: dict = Depends(verify_token)):
    user_id = user.user.id
    
    # 1. Fetch evolved DNA seeds
    top_seeds = await DNAEvolutionEngine.get_evolved_seeds(supabase, user_id)
    
    # 2. Pick the absolute highest weighted seed to anchor the radio
    main_seed = top_seeds[0] if top_seeds else "RDAMVM"
    
    # 3. Fetch a custom radio queue based on this evolving seed
    radio_queue = await YTMusicService.get_radio(main_seed, limit=40)
    
    tracks = []
    for item in radio_queue.get("tracks", []):
        vid = item.get("videoId")
        if not vid: continue
        tracks.append({
            "id": vid,
            "title": item.get("title", ""),
            "artist": ", ".join(a.get("name", "") for a in item.get("artists", [])),
            "album": item.get("album", {}).get("name") if item.get("album") else None,
            "duration": item.get("length"),
            "thumbnail": Formatter.get_thumbnail(item.get("thumbnails"))
        })
    return {"tracks": tracks, "evolved_seeds": top_seeds}

@router.get("/charts")
async def get_charts(country: str = Query(default="IN")):
    data = await YTMusicService.get_charts(country=country)
    tracks = []
    trending = data.get("songs", {}).get("items", [])
    for item in trending:
        vid = item.get("videoId")
        if not vid: continue
        tracks.append({
            "id": vid,
            "title": item.get("title", ""),
            "artist": ", ".join(a.get("name", "") for a in item.get("artists", [])),
            "album": item.get("album", {}).get("name") if item.get("album") else None,
            "duration": None,
            "thumbnail": Formatter.get_thumbnail(item.get("thumbnails"))
        })
    return {"tracks": tracks}

@router.get("/moods")
async def get_moods():
    categories = await YTMusicService.get_mood_categories()
    return categories

@router.get("/radio")
async def get_radio(seed_id: str = Query(..., min_length=1)):
    radio_queue = await YTMusicService.get_radio(seed_id, limit=50)
    tracks = []
    for item in radio_queue.get("tracks", []):
        vid = item.get("videoId")
        if not vid: continue
        tracks.append({
            "id": vid,
            "title": item.get("title", ""),
            "artist": ", ".join(a.get("name", "") for a in item.get("artists", [])),
            "album": item.get("album", {}).get("name") if item.get("album") else None,
            "duration": item.get("length"),
            "thumbnail": Formatter.get_thumbnail(item.get("thumbnails"))
        })
    return {"queue": tracks}

@router.get("/artist/{artist_id}")
async def get_artist(artist_id: str):
    data = await YTMusicService.get_artist(artist_id)
    top_songs = []
    if "songs" in data and "results" in data["songs"]:
        for item in data["songs"]["results"]:
            vid = item.get("videoId")
            if vid:
                top_songs.append({
                    "id": vid,
                    "title": item.get("title", ""),
                    "artist": data.get("name", ""),
                    "album": item.get("album", {}).get("name") if item.get("album") else None,
                    "thumbnail": Formatter.get_thumbnail(item.get("thumbnails"))
                })
    return {
        "id": artist_id,
        "name": data.get("name"),
        "description": data.get("description"),
        "subscribers": data.get("subscribers"),
        "image": Formatter.get_thumbnail(data.get("thumbnails")),
        "top_songs": top_songs
    }

@router.get("/album/{album_id}")
async def get_album(album_id: str):
    data = await YTMusicService.get_album(album_id)
    tracks = []
    for item in data.get("tracks", []):
        vid = item.get("videoId")
        if not vid: continue
        tracks.append({
            "id": vid,
            "title": item.get("title", ""),
            "artist": data.get("artist", "") if isinstance(data.get("artist"), str) else ", ".join(a.get("name", "") for a in data.get("artist", [])),
            "album": data.get("title", ""),
            "duration": Formatter.parse_duration(item.get("duration")),
            "thumbnail": Formatter.get_thumbnail(data.get("thumbnails"))
        })
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
        vid = item.get("videoId")
        if not vid: continue
        tracks.append({
            "id": vid,
            "title": item.get("title", ""),
            "artist": ", ".join(a.get("name", "") for a in item.get("artists", [])),
            "album": item.get("album", {}).get("name") if item.get("album") else None,
            "duration": Formatter.parse_duration(item.get("duration")),
            "thumbnail": Formatter.get_thumbnail(item.get("thumbnails"))
        })
    return {
        "id": playlist_id,
        "title": data.get("title"),
        "author": data.get("author", {}).get("name") if isinstance(data.get("author"), dict) else data.get("author"),
        "trackCount": data.get("trackCount"),
        "image": Formatter.get_thumbnail(data.get("thumbnails")),
        "tracks": tracks
    }
