import httpx
import os
import pathlib
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


async def get_access_token() -> str:
    try:
        client_id = os.getenv("OPENSKY_CLIENT_ID")
        client_secret = os.getenv("OPENSKY_CLIENT_SECRET")
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token",
                data={
                    "grant_type": "client_credentials",
                    "client_id": client_id,
                    "client_secret": client_secret
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            if resp.status_code == 200:
                return resp.json().get("access_token")
            return None
    except Exception:
        return None


async def get_flights() -> dict:
    try:
        token = await get_access_token()
        headers = {"Authorization": f"Bearer {token}"} if token else {}

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                "https://opensky-network.org/api/states/all",
                headers=headers,
                params={"lamin": -90, "lomin": -180, "lamax": 90, "lomax": 180}
            )
            if resp.status_code == 200:
                data = resp.json()
                states = data.get("states", [])
                flights = []
                for s in states[:200]:
                    try:
                        if s and len(s) > 6 and s[5] is not None and s[6] is not None:
                            flights.append({
                                "icao": s[0] if s[0] else "UNKNOWN",
                                "callsign": s[1].strip() if s[1] else "N/A",
                                "country": s[2] if s[2] else "Unknown",
                                "longitude": float(s[5]),
                                "latitude": float(s[6]),
                                "altitude": float(s[7]) if s[7] else 0,
                                "velocity": float(s[9]) if s[9] else 0,
                                "heading": float(s[10]) if s[10] else 0,
                                "on_ground": bool(s[8]) if s[8] is not None else False,
                            })
                    except Exception:
                        continue
                return {
                    "status": "success",
                    "total": len(states),
                    "showing": len(flights),
                    "flights": flights
                }
            else:
                return {
                    "error": f"OpenSky returned {resp.status_code}",
                    "flights": [], "total": 0, "showing": 0
                }
    except Exception as e:
        return {
            "error": str(e),
            "flights": [], "total": 0, "showing": 0
        }


async def get_flight_by_callsign(callsign: str) -> dict:
    try:
        username = os.getenv("OPENSKY_CLIENT_ID")
        password = os.getenv("OPENSKY_CLIENT_SECRET")

        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(
                "https://opensky-network.org/api/states/all",
                params={"callsign": callsign},
                auth=(username, password) if username and password else None
            )
            if resp.status_code == 200:
                data = resp.json()
                states = data.get("states", [])
                flights = []
                for s in states:
                    if s[5] is not None and s[6] is not None:
                        flights.append({
                            "icao": s[0],
                            "callsign": s[1].strip() if s[1] else None,
                            "country": s[2],
                            "longitude": s[5],
                            "latitude": s[6],
                            "altitude": s[7],
                            "velocity": s[9],
                            "heading": s[10],
                            "on_ground": s[8],
                        })
                return {
                    "status": "success",
                    "flights": flights
                }
            else:
                return {"error": f"OpenSky error: {resp.status_code}"}
    except Exception as e:
        return {"error": str(e)}


async def geocode_location(query: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": query,
                    "format": "json",
                    "limit": 5,
                    "addressdetails": 1
                },
                headers={"User-Agent": "GodsEye/1.0"}
            )
            if resp.status_code == 200:
                results = resp.json()
                locations = []
                for r in results:
                    locations.append({
                        "name": r.get("display_name"),
                        "latitude": float(r.get("lat")),
                        "longitude": float(r.get("lon")),
                        "type": r.get("type"),
                        "importance": r.get("importance"),
                        "address": r.get("address", {}),
                    })
                return {
                    "status": "success",
                    "query": query,
                    "results": locations
                }
            else:
                return {"error": f"Nominatim error: {resp.status_code}"}
    except Exception as e:
        return {"error": str(e)}


async def reverse_geocode(lat: float, lon: float) -> dict:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={
                    "lat": lat,
                    "lon": lon,
                    "format": "json",
                    "addressdetails": 1
                },
                headers={"User-Agent": "GodsEye/1.0"}
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "status": "success",
                    "display_name": data.get("display_name"),
                    "address": data.get("address", {}),
                    "latitude": lat,
                    "longitude": lon,
                }
            else:
                return {"error": f"Reverse geocode error: {resp.status_code}"}
    except Exception as e:
        return {"error": str(e)}


async def get_weather(lat: float, lon: float) -> dict:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": os.getenv("OPENWEATHER_API_KEY"),
                    "units": "metric"
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "status": "success",
                    "city": data.get("name"),
                    "country": data.get("sys", {}).get("country"),
                    "temperature": data.get("main", {}).get("temp"),
                    "feels_like": data.get("main", {}).get("feels_like"),
                    "humidity": data.get("main", {}).get("humidity"),
                    "pressure": data.get("main", {}).get("pressure"),
                    "weather": data.get("weather", [{}])[0].get("description"),
                    "wind_speed": data.get("wind", {}).get("speed"),
                    "visibility": data.get("visibility"),
                }
            else:
                return {"error": f"Weather error: {resp.status_code}"}
    except Exception as e:
        return {"error": str(e)}


async def search_places(query: str, lat: float = None, lon: float = None) -> dict:
    try:
        params = {
            "data": f'[out:json][timeout:25];node["{query}"](around:10000,{lat},{lon});out;' if lat and lon
                    else f'[out:json][timeout:25];node[name~"{query}",i];out 20;'
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                "https://overpass-api.de/api/interpreter",
                params=params
            )
            if resp.status_code == 200:
                data = resp.json()
                elements = data.get("elements", [])
                places = []
                for e in elements[:20]:
                    tags = e.get("tags", {})
                    places.append({
                        "name": tags.get("name"),
                        "type": tags.get("amenity") or tags.get("place") or tags.get("tourism"),
                        "latitude": e.get("lat"),
                        "longitude": e.get("lon"),
                        "tags": tags,
                    })
                return {
                    "status": "success",
                    "query": query,
                    "results": places
                }
            else:
                return {"error": f"Overpass error: {resp.status_code}"}
    except Exception as e:
        return {"error": str(e)}


async def get_ships() -> dict:
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(
                f"https://stream.aisstream.io/v0/stream",
                headers={"Authorization": os.getenv("AISSTREAM_API_KEY", "")}
            )
            return {
                "status": "info",
                "message": "AISStream requires WebSocket connection",
                "embed_url": "https://www.marinetraffic.com/en/ais/embed/zoom:3/centery:20/centerx:77"
            }
    except Exception as e:
        return {
            "status": "info",
            "message": "Ship tracking via AISStream WebSocket",
            "embed_url": "https://www.marinetraffic.com/en/ais/embed/zoom:3/centery:20/centerx:77"
        }


async def get_satellite_imagery(lat: float, lon: float) -> dict:
    try:
        return {
            "status": "success",
            "latitude": lat,
            "longitude": lon,
            "google_maps": f"https://www.google.com/maps/@{lat},{lon},15z/data=!3m1!1e3",
            "openstreetmap": f"https://www.openstreetmap.org/#map=15/{lat}/{lon}",
            "sentinel_hub": f"https://apps.sentinel-hub.com/eo-browser/?zoom=12&lat={lat}&lng={lon}",
            "nasa_worldview": f"https://worldview.earthdata.nasa.gov/?v={lon-1},{lat-1},{lon+1},{lat+1}",
        }
    except Exception as e:
        return {"error": str(e)}
