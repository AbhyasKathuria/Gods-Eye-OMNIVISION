from fastapi import APIRouter, HTTPException, Request
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
async def streetview(request: Request, lat: float, lon: float):
    from config import settings
    from fastapi.responses import RedirectResponse
    import random
    
    # Resolve host origin from referer dynamically (e.g. http://localhost:5173)
    referer = request.headers.get("referer") or "http://localhost:5173"
    origin = "/".join(referer.split("/")[:3])
    
    key = settings.GOOGLE_MAPS_API_KEY
    if not key or len(key) < 20 or key.startswith("YOUR_") or key.startswith("AIzaSyCpEUg1AEtMcjVKEV0ROlRdmhnIFO_pU-w"):
        num = random.randint(1, 5)
        return RedirectResponse(f"{origin}/feeds/feed{num}.gif")
        
    url = f"https://maps.googleapis.com/maps/api/streetview?size=200x80&location={lat},{lon}&key={key}"
    return RedirectResponse(url)


@router.get("/cameras")
async def get_cctv_cameras(
    lat: float,
    lon: float,
    radius: float = 50.0,
    provider: str = "all",
    limit: int = 100
):
    try:
        from services.camera_service import get_unified_cameras
        # Support both meters (e.g. 50000m) and kilometers (e.g. 15000km)
        # Earth half-circumference is ~20,000km; values above 20,000 are meters.
        radius_km = radius / 1000.0 if radius > 20000 else radius
        # Ensure a minimum search radius of 15km for good live camera discovery
        radius_km = max(radius_km, 15.0)

        cameras = await get_unified_cameras(
            lat=lat,
            lon=lon,
            radius_km=radius_km,
            provider=provider,
            limit=limit
        )
        return {
            "status": "success",
            "count": len(cameras),
            "data": cameras
        }
    except Exception as e:
        return {"status": "error", "message": str(e), "data": []}

