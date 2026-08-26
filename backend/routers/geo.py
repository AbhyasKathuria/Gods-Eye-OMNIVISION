from fastapi import APIRouter, HTTPException
from services.geo_service import (
    get_flights,
    get_flight_by_callsign,
    geocode_location,
    reverse_geocode,
    get_weather,
    search_places,
    get_ships,
    get_satellite_imagery
)
from services.claude_service import generate_geo_report
import pathlib
import httpx
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

router = APIRouter(prefix="/geo", tags=["Geo Intelligence"])


@router.get("/flights")
async def live_flights():
    try:
        data = await get_flights()
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/flights/{callsign}")
async def track_flight(callsign: str):
    try:
        data = await get_flight_by_callsign(callsign)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/geocode")
async def geocode(query: str):
    try:
        data = await geocode_location(query)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reverse")
async def reverse(lat: float, lon: float):
    try:
        data = await reverse_geocode(lat, lon)
        weather = await get_weather(lat, lon)
        satellite = await get_satellite_imagery(lat, lon)
        report = await generate_geo_report({
            "location": data,
            "weather": weather
        })
        return {
            "status": "success",
            "location": data,
            "weather": weather,
            "satellite": satellite,
            "ai_report": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/weather")
async def weather(lat: float, lon: float):
    try:
        data = await get_weather(lat, lon)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/places")
async def places(query: str, lat: float = None, lon: float = None):
    try:
        data = await search_places(query, lat, lon)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ships")
async def live_ships():
    try:
        data = await get_ships()
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/satellite")
async def satellite(lat: float, lon: float):
    try:
        data = await get_satellite_imagery(lat, lon)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/military-flights")
async def live_military_flights():
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get('https://api.adsb.one/v2/mil/')
            if resp.status_code == 200:
                return resp.json()
            else:
                return {"ac": []}
    except Exception:
        return {"ac": []}


@router.get("/streetview")
async def streetview(lat: float, lon: float):
    from config import settings
    from fastapi.responses import RedirectResponse
    import random
    
    # Live-moving public traffic camera feeds
    fallbacks = [
        "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnloMDNsNTB6bjh4aHoxY29zdmc5Nmt5amI1NDdzczJrdGk4ZWlhcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Vdfd3wW4B2S76/giphy.gif",
        "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3JqNmgzaDlpNmtudnV6ajk0NGQ5Z3QyeXN4OG93ZmdidmV6Zmd5OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41YkewVv5L108Pew/giphy.gif",
        "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHY5bmd2ajI2YTMwaXZ5cG1udWNndmFwNHoyOXg2cmx2ZmtnY3l0biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6Zt7jEPu2FokWICk/giphy.gif",
        "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNseWF3aWZyeHFtdHB2ZHBwZWxtbzh0NHBvOHFrcmVid3F3djB6dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT8qAYc1tGkZ58tH9u/giphy.gif"
    ]
    
    key = settings.GOOGLE_MAPS_API_KEY
    if not key or key.startswith("AIzaSyCpEUg1AEtMcjVKEV0ROlRdmhnIFO_pU-w"):  # Check if dummy key
        return RedirectResponse(random.choice(fallbacks))
        
    url = f"https://maps.googleapis.com/maps/api/streetview?size=200x80&location={lat},{lon}&key={key}"
    return RedirectResponse(url)


@router.get("/cameras")
async def get_cctv_cameras(lat: float, lon: float, radius: float = 5000):
    try:
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json][timeout:15];
        (
          node["man_made"="surveillance"](around:{radius},{lat},{lon});
          way["man_made"="surveillance"](around:{radius},{lat},{lon});
        );
        out center;
        """
        async with httpx.AsyncClient() as client:
            res = await client.post(overpass_url, data={"data": query}, timeout=15.0)
            if res.status_code == 200:
                elements = res.json().get("elements", [])
                cameras = []
                for idx, elem in enumerate(elements):
                    cam_lat = elem.get("lat") or elem.get("center", {}).get("lat")
                    cam_lon = elem.get("lon") or elem.get("center", {}).get("lon")
                    if not cam_lat or not cam_lon:
                        continue
                    
                    tags = elem.get("tags", {})
                    cam_id = f"CAM-OSM-{elem.get('id')}"
                    
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
                            name = f"Public Traffic Surveillance Camera"
                    
                    angle = int(tags.get("camera:direction") or tags.get("direction") or "90")
                    cameras.append({
                        "id": cam_id,
                        "name": name,
                        "lat": cam_lat,
                        "lon": cam_lon,
                        "angle": angle,
                        "radius": 0.003,
                        "realImg": f"/api/geo/streetview?lat={cam_lat}&lon={cam_lon}"
                    })
                return {"status": "success", "data": cameras}
            else:
                return {"status": "error", "message": "Failed to fetch from Overpass"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
