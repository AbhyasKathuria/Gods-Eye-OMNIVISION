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
