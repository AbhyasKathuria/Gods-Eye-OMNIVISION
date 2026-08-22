import httpx
import os
import pathlib
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

async def query_wifi_by_coords(lat: float, lon: float) -> dict:
    results = {}
    auth_encoded = os.getenv("WIGLE_API_ENCODED", "").strip()
    if not auth_encoded:
        return {"status": "error", "message": "Wigle API credentials missing"}

    # Define a bounding box around the coordinates (approx 500 meters)
    lat_delta = 0.005
    lon_delta = 0.005
    
    params = {
        "onlymine": "false",
        "latrange1": lat - lat_delta,
        "latrange2": lat + lat_delta,
        "longrange1": lon - lon_delta,
        "longrange2": lon + lon_delta,
        "freenet": "false",
        "paynet": "false"
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://api.wigle.net/api/v2/network/search",
                headers={
                    "Authorization": f"Basic {auth_encoded}",
                    "Accept": "application/json"
                },
                params=params
            )
            if resp.status_code == 200:
                data = resp.json()
                networks = data.get("results", [])
                formatted = []
                for n in networks:
                    formatted.append({
                        "bssid": n.get("netid"),
                        "ssid": n.get("ssid"),
                        "lat": n.get("trilat"),
                        "lon": n.get("trilon"),
                        "encryption": n.get("encryption"),
                        "channel": n.get("channel"),
                        "type": n.get("type"),
                        "qos": n.get("qos")
                    })
                results = {
                    "status": "success",
                    "lat": lat,
                    "lon": lon,
                    "count": len(formatted),
                    "networks": formatted
                }
            else:
                results = {
                    "status": "error",
                    "code": resp.status_code,
                    "message": f"Wigle API responded with status {resp.status_code}: {resp.text}"
                }
    except Exception as e:
        results = {"status": "error", "message": str(e)}

    return results

async def query_wifi_by_bssid(bssid: str) -> dict:
    results = {}
    auth_encoded = os.getenv("WIGLE_API_ENCODED", "").strip()
    if not auth_encoded:
        return {"status": "error", "message": "Wigle API credentials missing"}

    params = {
        "onlymine": "false",
        "netid": bssid
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://api.wigle.net/api/v2/network/search",
                headers={
                    "Authorization": f"Basic {auth_encoded}",
                    "Accept": "application/json"
                },
                params=params
            )
            if resp.status_code == 200:
                data = resp.json()
                networks = data.get("results", [])
                formatted = []
                for n in networks:
                    formatted.append({
                        "bssid": n.get("netid"),
                        "ssid": n.get("ssid"),
                        "lat": n.get("trilat"),
                        "lon": n.get("trilon"),
                        "encryption": n.get("encryption"),
                        "channel": n.get("channel"),
                        "type": n.get("type"),
                        "qos": n.get("qos")
                    })
                results = {
                    "status": "success",
                    "bssid": bssid,
                    "count": len(formatted),
                    "networks": formatted
                }
            else:
                results = {
                    "status": "error",
                    "code": resp.status_code,
                    "message": f"Wigle API responded with status {resp.status_code}: {resp.text}"
                }
    except Exception as e:
        results = {"status": "error", "message": str(e)}

    return results
