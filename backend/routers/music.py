from fastapi import APIRouter, Query, Request, Depends
from services.ytmusic import YTMusicService, Formatter
from services.dna import DNAEvolutionEngine
from db import supabase, verify_token
from rate_limiter import limiter

router = APIRouter()

@router.get("/search")
@limiter.limit("600/minute")
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
        
        if r_type == "song":
            entry["id"] = item.get("videoId")
            entry["artist"] = ", ".join(a.get("name", "") for a in item.get("artists", [])) if item.get("artists") else item.get("artist", "")
            entry["duration"] = Formatter.parse_duration(item.get("duration", item.get("length")))
            entry["album"] = item.get("album", {}).get("name") if item.get("album") else None
            entry["type"] = "song"
            
            if entry.get("id") and cat != "Top result":
                songs.append(entry)
                
        elif r_type == "artist":
            # Filter out fake fan pages and playlist channels
            if not item.get("shuffleId") and not item.get("radioId"): continue
            
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

@router.get("/search/songs")
async def search_songs(q: str = Query(..., min_length=1)):
    raw_results = await YTMusicService.search(q, filter_type="songs", limit=40)
    formatted = []
    for item in raw_results:
        video_id = item.get("videoId")
        if not video_id: continue
        formatted.append({
            "id": video_id,
            "title": item.get("title", ""),
            "artist": ", ".join(a.get("name", "") for a in item.get("artists", [])) if item.get("artists") else item.get("artist", ""),
            "duration": Formatter.parse_duration(item.get("duration", item.get("length"))),
            "album": item.get("album", {}).get("name") if item.get("album") else None,
            "thumbnail": Formatter.get_thumbnail(item.get("thumbnails")),
            "type": "song"
        })
    return {"results": formatted}

@router.get("/search/albums")
async def search_albums(q: str = Query(..., min_length=1)):
    raw_results = await YTMusicService.search(q, filter_type="albums", limit=40)
    formatted = []
    for item in raw_results:
        browse_id = item.get("browseId")
        if not browse_id: continue
        title_lower = item.get("title", "").lower()
        artist_lower = str(item.get("artist", "")).lower()
        if any(x in title_lower for x in ["top 10", "top 20", "top 50", "best of", "jhankar", "lofi", "remix", "mashup", "jukebox", "hits"]): continue
        if "various artists" in artist_lower: continue
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
@limiter.limit("600/minute")
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
@limiter.limit("600/minute")
async def get_charts(request: Request, country: str = Query(default="IN")):
    data = await YTMusicService.get_charts(country=country)
    
    # ytmusicapi 1.8+ returns ['countries', 'daily', 'weekly', 'artists']
    # We grab the first daily playlist or fallback
    daily = data.get("daily", [])
    if not daily:
        daily = data.get("weekly", [])
    if not daily:
        daily = data.get("videos", [])
        
    if daily and daily[0].get("playlistId"):
        playlist_id = daily[0]["playlistId"]
        playlist_data = await YTMusicService.get_playlist(playlist_id, limit=100)
        trending = playlist_data.get("tracks", [])
    else:
        # Fallback if structure is missing
        trending = data.get("songs", {}).get("items", [])

    tracks = []
    for item in trending:
        track = Formatter.format_track(item)
        if track: tracks.append(track)
    return {"tracks": tracks}

@router.get("/explore/new_releases")
@limiter.limit("600/minute")
async def get_explore_new_releases(request: Request):
    try:
        data = await YTMusicService.get_explore()
        new_releases = data.get("new_releases", [])
        formatted = []
        for item in new_releases:
            browse_id = item.get("browseId")
            if not browse_id: continue
            formatted.append({
                "id": browse_id,
                "title": item.get("title", ""),
                "artist": ", ".join(a.get("name", "") for a in item.get("artists", [])) if item.get("artists") else "",
                "image": Formatter.get_thumbnail(item.get("thumbnails")),
                "thumbnail": Formatter.get_thumbnail(item.get("thumbnails")),
                "type": "album"
            })
        return {"albums": formatted}
    except Exception as e:
        return {"albums": []}

@router.get("/moods")
async def get_moods():
    categories = await YTMusicService.get_mood_categories()
    return categories

@router.get("/radio")
@limiter.limit("600/minute")
async def get_radio(request: Request, seed_id: str = Query(..., min_length=1)):
    import asyncio
    import random
    
    # --- Diversity Enforcer Helper ---
    def enforce_diversity(raw_tracks, max_per_artist=3):
        diverse_tracks = []
        artist_counts = {}
        for track in raw_tracks:
            # Safely extract the primary artist name to track counts
            primary_artist = track.get("artist", "").split(",")[0].strip().lower()
            if not primary_artist:
                diverse_tracks.append(track)
                continue
                
            count = artist_counts.get(primary_artist, 0)
            if count < max_per_artist:
                diverse_tracks.append(track)
                artist_counts[primary_artist] = count + 1
        return diverse_tracks
    # ---------------------------------

    # Custom intercept for Hip-Hop blends (60% DHH, 25% Western, 15% K-HipHop)
    if "Hip-Hop" in seed_id or "hip hop" in seed_id.lower():
        try:
            dhh_task = YTMusicService.search("top desi hip hop dhh hit songs", filter_type="songs", limit=30)
            western_task = YTMusicService.search("top global western hip hop rap hits", filter_type="songs", limit=15)
            khiphop_task = YTMusicService.search("top trending korean hip hop k-rap hits", filter_type="songs", limit=10)
            
            dhh_res, western_res, khiphop_res = await asyncio.gather(dhh_task, western_task, khiphop_task)
            
            tracks = []
            seen = set()
            
            # Combine based on requested ratios (~50 tracks total)
            for item in (dhh_res[:30] + western_res[:13] + khiphop_res[:7]):
                track = Formatter.format_track(item)
                if track and track["id"] not in seen:
                    tracks.append(track)
                    seen.add(track["id"])
                    
            random.shuffle(tracks)
            tracks = enforce_diversity(tracks, max_per_artist=4)
            
            if tracks:
                return {"queue": tracks}
        except Exception as e:
            print(f"Custom Hip Hop blend failed: {e}")
            # Falls back to standard radio if it fails

    # Custom intercept for Today's Mix (50% GenZ Indian, 25% YT Trending, 25% Global/Kpop)
    if seed_id.startswith("today-mix:"):
        parts = seed_id.split(":")
        artist1 = parts[1] if len(parts) > 1 else "top indie pop"
        artist2 = parts[2] if len(parts) > 2 else "trending genz"
        
        try:
            trending_task = YTMusicService.get_charts(country="IN")
            genz_task1 = YTMusicService.search(f"top indie pop bollywood hits", filter_type="songs", limit=20)
            genz_task2 = YTMusicService.search(f"latest hits {artist1} {artist2}", filter_type="songs", limit=15)
            global_kpop_task = YTMusicService.search("top global hit pop songs english kpop bts", filter_type="songs", limit=15)
            
            res = await asyncio.gather(trending_task, genz_task1, genz_task2, global_kpop_task)
            
            # Parse trending charts
            chart_data = res[0]
            daily = chart_data.get("daily", []) or chart_data.get("weekly", []) or chart_data.get("videos", [])
            trending_raw = []
            if daily and daily[0].get("playlistId"):
                pl = await YTMusicService.get_playlist(daily[0]["playlistId"], limit=30)
                trending_raw = pl.get("tracks", [])
            else:
                trending_raw = chart_data.get("songs", {}).get("items", [])
                
            genz_raw = res[1][:20] + res[2][:15]
            global_kpop_raw = res[3] or []
            
            tracks = []
            seen = set()
            
            for item in (trending_raw[:25] + genz_raw[:35] + global_kpop_raw[:15]):
                track = Formatter.format_track(item)
                if not track: continue
                
                title = track.get("title", "").lower()
                # Strict filter against YouTube Bhojpuri/Regional MV spam in trending
                if any(x in title for x in ["#video", "# video", "bhojpuri", "|", "##", "full video"]):
                    continue
                    
                if track["id"] not in seen:
                    tracks.append(track)
                    seen.add(track["id"])
                    
            random.shuffle(tracks)
            tracks = enforce_diversity(tracks, max_per_artist=3)
            
            if tracks:
                return {"queue": tracks[:50]}
        except Exception as e:
            print(f"Custom Today's Mix blend failed: {e}")

    # Custom intercept for Personalized Editor's Mix
    if seed_id.startswith("editor-mix"):
        try:
            task1 = YTMusicService.search("latest top indian indie pop hits acoustic", filter_type="songs", limit=25)
            task2 = YTMusicService.search("top trending new bollywood lofi hits", filter_type="songs", limit=25)
            res = await asyncio.gather(task1, task2)
            tracks = [Formatter.format_track(i) for i in (res[0] + res[1]) if Formatter.format_track(i)]
            random.shuffle(tracks)
            tracks = enforce_diversity(tracks, max_per_artist=3)
            return {"queue": tracks[:50]}
        except Exception: pass

    # Custom intercept for Personalized Discovery Mix
    if seed_id.startswith("discovery-mix"):
        try:
            task1 = YTMusicService.search("undiscovered underground indian indie pop", filter_type="songs", limit=30)
            task2 = YTMusicService.search("fresh new indian pop artists", filter_type="songs", limit=20)
            res = await asyncio.gather(task1, task2)
            tracks = [Formatter.format_track(i) for i in (res[0] + res[1]) if Formatter.format_track(i)]
            random.shuffle(tracks)
            tracks = enforce_diversity(tracks, max_per_artist=2) # Max 2 per artist to ensure high discovery
            return {"queue": tracks[:50]}
        except Exception: pass

    # Custom intercept for Mood Mix
    if seed_id.startswith("mood-mix"):
        parts = seed_id.split(":")
        vibe = parts[1] if len(parts) > 1 else "chill lofi acoustic"
        artist = parts[2] if len(parts) > 2 else "indie pop"
        try:
            task1 = YTMusicService.search(f"best {vibe} indian songs", filter_type="songs", limit=20)
            task2 = YTMusicService.search(f"top trending indian {vibe} hits", filter_type="songs", limit=20)
            task3 = YTMusicService.search(f"{vibe} songs {artist}", filter_type="songs", limit=15)
            res = await asyncio.gather(task1, task2, task3)
            
            tracks = []
            seen = set()
            for item in (res[0][:20] + res[1][:20] + res[2][:15]):
                track = Formatter.format_track(item)
                if track and track["id"] not in seen:
                    tracks.append(track)
                    seen.add(track["id"])
                    
            random.shuffle(tracks)
            tracks = enforce_diversity(tracks, max_per_artist=3)
            return {"queue": tracks[:50]}
        except Exception: pass

    # Custom intercept for Nostalgia Mix
    if seed_id.startswith("nostalgia-mix"):
        parts = seed_id.split(":")
        artist = parts[2] if len(parts) > 2 else "bollywood"
        try:
            task1 = YTMusicService.search("best nostalgic classic 2000s 2010s throwback indian hits", filter_type="songs", limit=30)
            task2 = YTMusicService.search(f"classic old throwback hits {artist}", filter_type="songs", limit=20)
            res = await asyncio.gather(task1, task2)
            
            tracks = []
            seen = set()
            for item in (res[0][:30] + res[1][:20]):
                track = Formatter.format_track(item)
                if track and track["id"] not in seen:
                    tracks.append(track)
                    seen.add(track["id"])
                    
            random.shuffle(tracks)
            tracks = enforce_diversity(tracks, max_per_artist=3)
            return {"queue": tracks[:50]}
        except Exception: pass

    # Custom intercept for Blended Artist Mixes (e.g., Artist 2 & Artist 3)
    if seed_id.startswith("blend-artists:"):
        parts = seed_id.split(":")
        if len(parts) >= 3:
            artist1 = parts[1]
            artist2 = parts[2]
            try:
                task1 = YTMusicService.search(f"{artist1} top hit songs", filter_type="songs", limit=30)
                task2 = YTMusicService.search(f"{artist2} top hit songs", filter_type="songs", limit=30)
                res = await asyncio.gather(task1, task2)
                
                tracks = []
                seen = set()
                
                for item in (res[0][:30] + res[1][:30]):
                    track = Formatter.format_track(item)
                    if track and track["id"] not in seen:
                        tracks.append(track)
                        seen.add(track["id"])
                        
                random.shuffle(tracks)
                # Allow a bit more for dedicated artist mixes, but still cap to prevent one from completely dominating if the other fails
                tracks = enforce_diversity(tracks, max_per_artist=15) 
                if tracks:
                    return {"queue": tracks[:50]}
            except Exception as e:
                print(f"Custom Blended Artist Mix failed: {e}")

    radio_queue = await YTMusicService.get_radio(seed_id, limit=100)
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
