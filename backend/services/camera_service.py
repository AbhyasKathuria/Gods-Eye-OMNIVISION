import asyncio
from datetime import datetime, timezone
import json
import math
import os
import pathlib
import time
from typing import List, Dict, Any, Optional
import httpx
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

try:
    from config import settings
    WINDY_KEY_DEFAULT = settings.WINDY_API_KEY
    TFL_KEY_DEFAULT = settings.TFL_APP_KEY
except Exception:
    WINDY_KEY_DEFAULT = os.getenv("WINDY_API_KEY", "Nzw2ZIQUV3wDfWp5S3gQJRCZdBPN42G4")
    TFL_KEY_DEFAULT = os.getenv("TFL_APP_KEY", "")

# In-memory cache for TfL JamCams (to prevent rate-limit flooding)
_tfl_cache: Dict[str, Any] = {
    "timestamp": 0,
    "cameras": []
}

# In-memory cache for aggregated camera responses to guarantee sub-millisecond response times
_global_cameras_cache: Dict[str, Any] = {
    "timestamp": 0,
    "data": []
}
_regional_cameras_cache: Dict[str, Any] = {}

CURATED_DATA_FILE = pathlib.Path(__file__).parent.parent / "data" / "curated_cameras.json"
STREAMS_GEOJSON_FILE = pathlib.Path(__file__).parent.parent / "data" / "streams.geojson"

_geojson_streams_cache: List[Dict[str, Any]] = []


def get_all_geojson_streams() -> List[Dict[str, Any]]:
    """Load and cache features from streams.geojson."""
    global _geojson_streams_cache
    if not _geojson_streams_cache and STREAMS_GEOJSON_FILE.exists():
        try:
            with open(STREAMS_GEOJSON_FILE, "r", encoding="utf-8") as f:
                d = json.load(f)
                _geojson_streams_cache = d.get("features", [])
        except Exception as e:
            print(f"[CameraService] Error loading streams.geojson: {e}")
    return _geojson_streams_cache


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Great Circle distance between two points in km."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def format_video_stream(url: str, url_type: str) -> tuple[str, str, str]:
    """Format stream URL and determine streamType and feedType for direct playback."""
    if "youtube.com/watch?v=" in url:
        v_id = url.split("watch?v=")[-1].split("&")[0]
        return f"https://www.youtube-nocookie.com/embed/{v_id}?autoplay=1&mute=1&controls=0&playsinline=1&enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0", "youtube", "live_youtube"
    elif "youtu.be/" in url:
        v_id = url.split("youtu.be/")[-1].split("?")[0]
        return f"https://www.youtube-nocookie.com/embed/{v_id}?autoplay=1&mute=1&controls=0&playsinline=1&enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0", "youtube", "live_youtube"
    elif "youtube.com/embed/" in url:
        clean_url = url.split("?")[0]
        return f"{clean_url}?autoplay=1&mute=1&controls=0&playsinline=1&enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0", "youtube", "live_youtube"
    elif url_type == "hls" or ".m3u8" in url:
        return url, "hls", "live_video"
    else:
        return url, "mp4", "live_video"


def fetch_geojson_streams(
    lat: float,
    lon: float,
    radius_km: float = 100.0,
    limit: int = 60,
    is_global: bool = False
) -> List[Dict[str, Any]]:
    """
    Fetch live HLS / video streams from the GeoJSON dataset.
    Only returns direct playable video streams (HLS .m3u8, YouTube live, MP4).
    Filters out dead token streams (balticlivecam, skylinewebcams, token=).
    Prioritizes native HLS .m3u8 streams for guaranteed autoplay.
    """
    raw_features = get_all_geojson_streams()
    if not raw_features:
        return []

    # Prioritize direct HLS .m3u8 streams over embeds for seamless HTML5 video autoplay
    features = sorted(
        raw_features,
        key=lambda f: 0 if ('.m3u8' in (f.get('properties', {}).get('url') or '') or f.get('properties', {}).get('url_type') == 'hls') else 1
    )

    cams: List[Dict[str, Any]] = []

    if is_global or radius_km >= 2500:
        # Global multi-country distribution
        country_counts: Dict[str, int] = {}
        for idx, f in enumerate(features):
            geom = f.get("geometry", {})
            coords = geom.get("coordinates", [])
            if len(coords) < 2:
                continue
            props = f.get("properties", {})
            url = props.get("url")
            if not url or not (url.startswith("http://") or url.startswith("https://")):
                continue

            url_lower = url.lower()
            url_type = props.get("url_type", "")
            # Strictly filter out dead or broken streams:
            # - BalticLiveCam has expired auth tokens that return 403 Forbidden
            # - SkylineWebcams are HTML webpages, not playable streams
            # - Any token= parameter usually represents an expired short-lived token
            if (
                "balticlivecam.com" in url_lower or
                "skylinewebcams.com" in url_lower or
                "token=" in url_lower or
                url_type == "html_page" or
                url_lower.endswith(".html") or
                "/webcam/" in url_lower
            ):
                continue

            c_code = props.get("country_code") or "GL"

            # Cap each country so no single country dominates the global map
            max_per_country = 3 if len(cams) > 40 else 4
            if country_counts.get(c_code, 0) >= max_per_country:
                continue

            formatted_url, stream_type, feed_type = format_video_stream(url, url_type)
            country_counts[c_code] = country_counts.get(c_code, 0) + 1
            cam_lat = coords[1]
            cam_lon = coords[0]
            dist = haversine_distance(lat, lon, cam_lat, cam_lon)

            # Extract YouTube thumbnail if applicable
            yt_thumb = None
            if stream_type == "youtube":
                v_id = url.split("watch?v=")[-1].split("&")[0] if "watch?v=" in url else url.split("youtu.be/")[-1].split("?")[0]
                yt_thumb = f"https://img.youtube.com/vi/{v_id}/hqdefault.jpg"

            cams.append({
                "id": f"STREAM-{c_code}-{idx}",
                "name": props.get("display_name") or props.get("name") or f"{c_code} Live Stream",
                "lat": cam_lat,
                "lon": cam_lon,
                "angle": 90,
                "radius": 0.003,
                "source": "youtube" if feed_type == "live_youtube" else "direct_stream",
                "sourceLabel": f"{c_code} LIVE VIDEO",
                "feedType": feed_type,
                "streamUrl": formatted_url,
                "imageUrl": yt_thumb,
                "lastUpdated": props.get("last_verified"),
                "refreshIntervalSeconds": None,
                "verified": False,
                "verifiedAt": None,
                "city": props.get("scene_type") or props.get("environment") or "",
                "country": c_code,
                "webcamUrl": formatted_url,
                "status": "active",
                "distanceKm": round(dist, 2),
                # Legacy compatibility
                "realImg": yt_thumb or formatted_url,
                "thumbnail": yt_thumb,
                "videoUrl": formatted_url,
                "streamType": stream_type
            })

            if len(cams) >= limit:
                break
        return cams

    # Local radius search
    for idx, f in enumerate(features):
        geom = f.get("geometry", {})
        coords = geom.get("coordinates", [])
        if len(coords) < 2:
            continue
        cam_lat = coords[1]
        cam_lon = coords[0]
        dist = haversine_distance(lat, lon, cam_lat, cam_lon)
        if dist <= radius_km:
            props = f.get("properties", {})
            url = props.get("url")
            if not url:
                continue

            url_lower = url.lower()
            url_type = props.get("url_type", "")
            if (
                "balticlivecam.com" in url_lower or
                "skylinewebcams.com" in url_lower or
                "token=" in url_lower or
                url_type == "html_page" or
                url_lower.endswith(".html") or
                "/webcam/" in url_lower
            ):
                continue

            formatted_url, stream_type, feed_type = format_video_stream(url, url_type)
            c_code = props.get("country_code") or "GL"

            yt_thumb = None
            if stream_type == "youtube":
                v_id = url.split("watch?v=")[-1].split("&")[0] if "watch?v=" in url else url.split("youtu.be/")[-1].split("?")[0]
                yt_thumb = f"https://img.youtube.com/vi/{v_id}/hqdefault.jpg"

            cams.append({
                "id": f"STREAM-{c_code}-{idx}",
                "name": props.get("display_name") or props.get("name") or "Live Stream",
                "lat": cam_lat,
                "lon": cam_lon,
                "angle": 90,
                "radius": 0.003,
                "source": "youtube" if feed_type == "live_youtube" else "direct_stream",
                "sourceLabel": f"{c_code} LIVE VIDEO",
                "feedType": feed_type,
                "streamUrl": formatted_url,
                "imageUrl": yt_thumb,
                "lastUpdated": props.get("last_verified"),
                "refreshIntervalSeconds": None,
                "verified": False,
                "verifiedAt": None,
                "city": props.get("scene_type") or props.get("environment") or "",
                "country": c_code,
                "webcamUrl": formatted_url,
                "status": "active",
                "distanceKm": round(dist, 2),
                # Legacy compatibility
                "realImg": yt_thumb or formatted_url,
                "thumbnail": yt_thumb,
                "videoUrl": formatted_url,
                "streamType": stream_type
            })

    cams.sort(key=lambda x: x["distanceKm"])
    return cams[:limit]


def _parse_windy_webcam(w: Dict[str, Any], lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """Parse a single Windy API v3 webcam record with live optical image and metadata."""
    loc = w.get("location", {})
    cam_lat = loc.get("latitude")
    cam_lon = loc.get("longitude")
    if cam_lat is None or cam_lon is None:
        return None

    images = w.get("images", {})
    current_img = images.get("current", {})
    daylight_img = images.get("daylight", {})

    image_url = (
        current_img.get("preview") or
        daylight_img.get("preview") or
        current_img.get("thumbnail") or
        daylight_img.get("thumbnail")
    )

    if not image_url:
        return None

    dist = haversine_distance(lat, lon, cam_lat, cam_lon)
    webcam_id = w.get("webcamId")
    city = loc.get("city") or ""
    country = loc.get("country") or ""
    title = w.get("title") or "Optical Webcam"

    name = f"{title} ({city}, {country})" if city and city not in title else title
    is_active = (w.get("status") == "active")
    last_updated = w.get("lastUpdatedOn")

    # Only use streamUrl if Windy explicitly exposes a genuine live stream player
    player = w.get("player", {})
    live_player = player.get("live")
    if live_player and "live" in live_player:
        feed_type = "live_video"
        stream_url = live_player
    else:
        feed_type = "refreshing_image"
        stream_url = None

    return {
        "id": f"WINDY-{webcam_id}",
        "name": name,
        "lat": cam_lat,
        "lon": cam_lon,
        "angle": 90,
        "radius": 0.003,
        "source": "windy",
        "sourceLabel": "WINDY OPTICAL",
        "feedType": feed_type,
        "streamUrl": stream_url,
        "imageUrl": image_url,
        "lastUpdated": last_updated,
        "refreshIntervalSeconds": 60,
        "verified": is_active,
        "verifiedAt": datetime.now(timezone.utc).isoformat() if is_active else None,
        "city": city,
        "country": country,
        "webcamUrl": w.get("urls", {}).get("detail"),
        "status": w.get("status", "active"),
        "distanceKm": round(dist, 2),
        # Legacy compatibility
        "realImg": image_url,
        "thumbnail": current_img.get("thumbnail") or image_url,
        "videoUrl": stream_url or image_url,
        "streamType": feed_type
    }


async def fetch_windy_cameras(lat: float, lon: float, radius_km: float = 50.0, limit: int = 30) -> List[Dict[str, Any]]:
    """Fetch live webcams from Windy Webcams API v3 near coordinates."""
    windy_key = os.getenv("WINDY_API_KEY") or WINDY_KEY_DEFAULT or "Nzw2ZIQUV3wDfWp5S3gQJRCZdBPN42G4"
    if not windy_key:
        return []

    # Windy API v3 requires 0 < radius <= 250, and limit <= 50
    bounded_radius = min(max(int(radius_km), 1), 250)
    bounded_limit = min(max(int(limit), 1), 50)

    url = (
        f"https://api.windy.com/webcams/api/v3/webcams"
        f"?nearby={lat},{lon},{bounded_radius}&limit={bounded_limit}&include=images,location,urls,player,categories"
    )
    headers = {
        "x-windy-api-key": windy_key,
        "Accept": "application/json"
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code != 200:
                print(f"[CameraService] Windy nearby status: {resp.status_code}")
                return []

            data = resp.json()
            raw_webcams = data.get("webcams", [])
            cameras = []
            for w in raw_webcams:
                c = _parse_windy_webcam(w, lat, lon)
                if c:
                    cameras.append(c)
            return cameras
    except Exception as e:
        print(f"[CameraService] Error fetching Windy webcams: {e}")
        return []


async def fetch_windy_by_countries(countries: str = "IN", limit: int = 50, lat: float = 0.0, lon: float = 0.0) -> List[Dict[str, Any]]:
    """Fetch webcams for specific countries using Windy API v3."""
    windy_key = os.getenv("WINDY_API_KEY") or WINDY_KEY_DEFAULT or "Nzw2ZIQUV3wDfWp5S3gQJRCZdBPN42G4"
    if not windy_key:
        return []

    bounded_limit = min(max(int(limit), 1), 50)
    url = (
        f"https://api.windy.com/webcams/api/v3/webcams"
        f"?countries={countries}&limit={bounded_limit}&include=images,location,urls,player,categories"
    )
    headers = {
        "x-windy-api-key": windy_key,
        "Accept": "application/json"
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code != 200:
                print(f"[CameraService] Windy countries={countries} status: {resp.status_code}")
                return []

            data = resp.json()
            raw_webcams = data.get("webcams", [])
            cameras = []
            for w in raw_webcams:
                c = _parse_windy_webcam(w, lat, lon)
                if c:
                    cameras.append(c)
            return cameras
    except Exception as e:
        print(f"[CameraService] Error fetching Windy by countries: {e}")
        return []


async def fetch_tfl_cameras(lat: float, lon: float, radius_km: float = 40.0, limit: int = 40) -> List[Dict[str, Any]]:
    """Fetch live Transport for London (TfL) JamCams near coordinates."""
    # Strictly only query TfL if within 50km of Greater London (51.5074, -0.1278)
    london_dist = haversine_distance(lat, lon, 51.5074, -0.1278)
    if london_dist > 50.0:
        return []

    global _tfl_cache
    now = time.time()

    # Refresh TfL cache if older than 300 seconds (5 min)
    if now - _tfl_cache["timestamp"] > 300 or not _tfl_cache["cameras"]:
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                url = "https://api.tfl.gov.uk/Place/Type/JamCam"
                tfl_key = os.getenv("TFL_APP_KEY") or TFL_KEY_DEFAULT
                params = {"app_key": tfl_key} if tfl_key else {}
                resp = await client.get(url, params=params)

                if resp.status_code == 200:
                    data = resp.json()
                    parsed = []
                    for c in data:
                        props = {p.get("key"): p.get("value") for p in c.get("additionalProperties", [])}
                        if props.get("available") == "false":
                            continue

                        img_url = props.get("imageUrl")
                        video_url = props.get("videoUrl")
                        if not img_url and not video_url:
                            continue

                        cam_lat = c.get("lat")
                        cam_lon = c.get("lon")
                        if cam_lat is None or cam_lon is None:
                            continue

                        feed_type = "live_video" if video_url else "refreshing_image"
                        parsed.append({
                            "id": f"TFL-{c.get('id')}",
                            "name": f"{c.get('commonName', 'TfL JamCam')} (London)",
                            "lat": cam_lat,
                            "lon": cam_lon,
                            "angle": 90,
                            "radius": 0.003,
                            "source": "tfl_jamcam",
                            "sourceLabel": "TFL TRAFFIC VIDEO",
                            "feedType": feed_type,
                            "streamUrl": video_url,
                            "imageUrl": img_url,
                            "lastUpdated": props.get("modified"),
                            "refreshIntervalSeconds": 60,
                            "verified": True,
                            "verifiedAt": datetime.now(timezone.utc).isoformat(),
                            "city": "London",
                            "country": "United Kingdom",
                            "webcamUrl": f"https://tfl.gov.uk/traffic/status/?camera={c.get('id')}",
                            "status": "active",
                            "distanceKm": 0.0,
                            # Legacy compatibility
                            "realImg": img_url or video_url,
                            "thumbnail": img_url,
                            "videoUrl": video_url or img_url,
                            "streamType": "mp4" if video_url else "image"
                        })
                    _tfl_cache = {"timestamp": now, "cameras": parsed}
        except Exception as e:
            print(f"[CameraService] Error fetching TfL JamCams: {e}")

    # Filter by radius to request coords
    nearby = []
    for c in _tfl_cache.get("cameras", []):
        dist = haversine_distance(lat, lon, c["lat"], c["lon"])
        if dist <= radius_km:
            c_copy = dict(c)
            c_copy["distanceKm"] = round(dist, 2)
            nearby.append(c_copy)

    nearby.sort(key=lambda x: x["distanceKm"])
    return nearby[:limit]


def fetch_curated_cameras(lat: float, lon: float, radius_km: float = 100.0) -> List[Dict[str, Any]]:
    """Fetch verified curated cameras near coordinates."""
    if not CURATED_DATA_FILE.exists():
        return []

    try:
        with open(CURATED_DATA_FILE, "r", encoding="utf-8") as f:
            curated_list = json.load(f)

        matched = []
        for c in curated_list:
            c_lat = c.get("lat")
            c_lon = c.get("lon")
            if c_lat is None or c_lon is None:
                continue
            dist = haversine_distance(lat, lon, c_lat, c_lon)
            if dist <= radius_km or radius_km >= 2500.0:
                c_copy = dict(c)
                c_copy["distanceKm"] = round(dist, 2)
                # Legacy compatibility aliases
                c_copy["realImg"] = c_copy.get("imageUrl") or c_copy.get("streamUrl")
                c_copy["thumbnail"] = c_copy.get("imageUrl")
                c_copy["videoUrl"] = c_copy.get("streamUrl") or c_copy.get("imageUrl")
                c_copy["streamType"] = c_copy.get("feedType")
                matched.append(c_copy)

        matched.sort(key=lambda x: x["distanceKm"])
        return matched
    except Exception as e:
        print(f"[CameraService] Error reading curated cameras: {e}")
        return []


async def fetch_osm_cameras(lat: float, lon: float, radius_m: float = 5000.0, limit: int = 20) -> List[Dict[str, Any]]:
    """Query OpenStreetMap Overpass for physical CCTV cameras as sensor points."""
    try:
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json][timeout:10];
        (
          node["man_made"="surveillance"](around:{int(radius_m)},{lat},{lon});
          way["man_made"="surveillance"](around:{int(radius_m)},{lat},{lon});
        );
        out center {limit};
        """
        async with httpx.AsyncClient(timeout=12.0) as client:
            res = await client.post(overpass_url, data={"data": query})
            if res.status_code != 200:
                return []

            elements = res.json().get("elements", [])
            cameras = []
            for elem in elements:
                cam_lat = elem.get("lat") or elem.get("center", {}).get("lat")
                cam_lon = elem.get("lon") or elem.get("center", {}).get("lon")
                if not cam_lat or not cam_lon:
                    continue

                tags = elem.get("tags", {})
                cam_id = f"OSM-{elem.get('id')}"

                name = tags.get("name") or tags.get("description")
                if not name:
                    operator = tags.get("operator")
                    zone = tags.get("surveillance:zone")
                    if operator and zone:
                        name = f"{operator} Camera ({zone})"
                    elif operator:
                        name = f"{operator} Camera"
                    elif zone:
                        name = f"Public Camera ({zone})"
                    else:
                        name = "Physical CCTV Sensor"

                angle = int(tags.get("camera:direction") or tags.get("direction") or "90")
                dist = haversine_distance(lat, lon, cam_lat, cam_lon)

                cameras.append({
                    "id": cam_id,
                    "name": name,
                    "lat": cam_lat,
                    "lon": cam_lon,
                    "angle": angle,
                    "radius": 0.003,
                    "realImg": None,
                    "thumbnail": None,
                    "videoUrl": None,
                    "streamType": "sensor",
                    "source": "OSM",
                    "sourceLabel": "OSM SENSOR NODE",
                    "city": tags.get("addr:city") or "",
                    "country": "",
                    "webcamUrl": None,
                    "status": "active",
                    "lastUpdated": None,
                    "distanceKm": round(dist, 2)
                })

            return cameras
    except Exception as e:
        print(f"[CameraService] Error fetching OSM cameras: {e}")
        return []


async def get_unified_cameras(
    lat: float,
    lon: float,
    radius_km: float = 50.0,
    provider: str = "all",
    limit: int = 120
) -> List[Dict[str, Any]]:
    """
    Unified multi-provider camera aggregator with server-side caching:
    1. Global HLS & YouTube Video Streams (filtered, no dead tokens)
    2. Windy Webcams API v3 (Global live webcams with embed players & images)
    3. Curated Datasets (Verified Indian & Global feeds)
    4. TfL JamCams (London-only traffic video)
    5. OpenStreetMap Overpass (Physical sensor backup)
    """
    now = time.time()
    is_global = radius_km >= 2500.0 or (lat == 0.0 and lon == 0.0)

    # 1. Check Global Cache (sub-millisecond return)
    if is_global and _global_cameras_cache["data"] and (now - _global_cameras_cache["timestamp"] < 600):
        return _global_cameras_cache["data"][:limit]

    # 2. Check Regional Cache
    cache_key = f"{round(lat, 2)}_{round(lon, 2)}_{round(radius_km, -1)}_{provider}"
    if not is_global and cache_key in _regional_cameras_cache:
        cached_entry = _regional_cameras_cache[cache_key]
        if now - cached_entry["timestamp"] < 300:
            return cached_entry["data"][:limit]

    all_cameras: List[Dict[str, Any]] = []

    if is_global:
        # Instant local memory hubs
        curated_all = fetch_curated_cameras(0, 0, radius_km=25000)
        all_cameras.extend(curated_all)

        global_streams = fetch_geojson_streams(lat, lon, radius_km=15000, limit=50, is_global=True)
        all_cameras.extend(global_streams)

        # Parallel external API queries (Windy India, Windy Global, London TfL)
        tasks = [
            fetch_windy_by_countries("IN", limit=20, lat=lat, lon=lon),
            fetch_windy_by_countries("US,ES,FR,DE,IT,JP,AU,GB,BR,CA", limit=50, lat=lat, lon=lon),
            fetch_tfl_cameras(51.5074, -0.1278, radius_km=20, limit=10)
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for res in results:
            if isinstance(res, list):
                all_cameras.extend(res)

    else:
        # Local / Regional query
        is_india = (8.0 <= lat <= 36.0 and 68.0 <= lon <= 98.0)
        tasks = []
        if provider in ("all", "windy"):
            tasks.append(fetch_windy_cameras(lat, lon, radius_km=min(radius_km, 250.0), limit=min(limit, 40)))
            # If user is in India or searching India (lat 8-36, lon 68-98), ensure all active India webcams are pulled
            if is_india:
                tasks.append(fetch_windy_by_countries("IN", limit=25, lat=lat, lon=lon))

        if provider in ("all", "tfl"):
            # Only query TfL if within 50km of Greater London
            if haversine_distance(lat, lon, 51.5074, -0.1278) <= 50.0:
                tasks.append(fetch_tfl_cameras(lat, lon, radius_km=min(radius_km, 40.0), limit=min(limit, 40)))

        results = await asyncio.gather(*tasks, return_exceptions=True)
        for res in results:
            if isinstance(res, list):
                all_cameras.extend(res)

        # Include local GeoJSON HLS / YouTube streams
        geojson_local = fetch_geojson_streams(lat, lon, radius_km=radius_km, limit=30)
        all_cameras.extend(geojson_local)

        # Include curated cameras with progressive radius widening for India
        curated_radius = radius_km
        curated = fetch_curated_cameras(lat, lon, radius_km=curated_radius)
        if is_india and len(curated) < 6:
            # Widen radius progressively (2x then 3x) to reach regional density
            curated_radius = min(radius_km * 2.0, 400.0)
            curated = fetch_curated_cameras(lat, lon, radius_km=curated_radius)
            if len(curated) < 6:
                curated_radius = min(radius_km * 3.0, 600.0)
                curated = fetch_curated_cameras(lat, lon, radius_km=curated_radius)

        all_cameras.extend(curated)

        # OSM Overpass fallback only if specifically requested
        if provider == "osm":
            osm_cams = await fetch_osm_cameras(lat, lon, radius_m=radius_km * 1000.0, limit=15)
            all_cameras.extend(osm_cams)

    # De-duplicate by coordinate proximity (within 30 meters) or ID
    unique_cameras: List[Dict[str, Any]] = []
    seen_ids = set()

    for cam in all_cameras:
        if cam["id"] in seen_ids:
            continue

        is_duplicate = False
        for u in unique_cameras:
            if abs(cam["lat"] - u["lat"]) < 0.0003 and abs(cam["lon"] - u["lon"]) < 0.0003:
                is_duplicate = True
                break

        if not is_duplicate:
            seen_ids.add(cam["id"])
            unique_cameras.append(cam)

    if not is_global:
        unique_cameras.sort(key=lambda x: x.get("distanceKm", 99999))

    final_result = unique_cameras[:limit]

    # Save to cache
    if is_global:
        _global_cameras_cache["timestamp"] = now
        _global_cameras_cache["data"] = final_result
    else:
        _regional_cameras_cache[cache_key] = {
            "timestamp": now,
            "data": final_result
        }

    return final_result
