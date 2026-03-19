from fastapi import APIRouter, HTTPException
from services.recon_service import username_recon, check_email_breach, calculate_threat_score
import httpx
import os
import asyncio

router = APIRouter(prefix="/recon", tags=["Recon & Intelligence"])


@router.get("/username/{username}")
async def recon_username(username: str):
    try:
        data = await username_recon(username.strip())
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/breach/{email}")
async def breach_check(email: str):
    try:
        data = await check_email_breach(email.strip())
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/threat-score")
async def threat_score(payload: dict):
    try:
        data = await calculate_threat_score(payload)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api-health")
async def api_health():
    async def ping(name, url, headers=None, expected_status=None):
        try:
            async with httpx.AsyncClient(timeout=8) as client:
                resp = await client.get(url, headers=headers or {})
                ok = resp.status_code in (expected_status or [200, 401, 403, 404, 422])
                return {"api": name, "status": "ONLINE" if ok else "DEGRADED",
                        "code": resp.status_code,
                        "latency_ms": int(resp.elapsed.total_seconds() * 1000)}
        except Exception as e:
            return {"api": name, "status": "OFFLINE", "code": None, "error": str(e)[:40]}

    tasks = [
        ping("OpenSky Network", "https://opensky-network.org/api/states/all"),
        ping("NewsAPI", f"https://newsapi.org/v2/top-headlines?apiKey={os.getenv('NEWS_API_KEY', 'x')}&pageSize=1"),
        ping("IPGeolocation", f"https://api.ipgeolocation.io/ipgeo?apiKey={os.getenv('IPGEO_API_KEY', 'x')}&ip=8.8.8.8"),
        ping("AbuseIPDB", "https://api.abuseipdb.com/api/v2/check?ipAddress=8.8.8.8",
             headers={"Key": os.getenv("ABUSEIPDB_API_KEY", "x")}),
        ping("VirusTotal", "https://www.virustotal.com/api/v3/ip_addresses/8.8.8.8",
             headers={"x-apikey": os.getenv("VIRUSTOTAL_API_KEY", "x")}),
        ping("Shodan", f"https://api.shodan.io/shodan/host/8.8.8.8?key={os.getenv('SHODAN_API_KEY', 'x')}"),
        ping("URLScan", "https://urlscan.io/api/v1/search/?q=domain:google.com&size=1",
             headers={"API-Key": os.getenv("URLSCAN_API_KEY", "x")}),
        ping("OpenWeather", f"https://api.openweathermap.org/data/2.5/weather?q=London&appid={os.getenv('OPENWEATHER_API_KEY', 'x')}"),
        ping("Nominatim", "https://nominatim.openstreetmap.org/search?q=London&format=json&limit=1"),
        ping("SauceNAO", "https://saucenao.com/search.php?output_type=2"),
        ping("GDELT", "https://api.gdeltproject.org/api/v2/doc/doc?query=test&mode=artlist&maxrecords=1&format=json"),
        ping("Groq", "https://api.groq.com/openai/v1/models",
             headers={"Authorization": f"Bearer {os.getenv('GROQ_API_KEY', 'x')}"}),
        ping("WhoisXML", f"https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey={os.getenv('WHOISXML_API_KEY', 'x')}&domainName=google.com&outputFormat=JSON"),
        ping("IPInfo", "https://ipinfo.io/8.8.8.8/json",
             headers={"Authorization": f"Bearer {os.getenv('IPINFO_TOKEN', 'x')}"}),
    ]

    results = await asyncio.gather(*tasks)
    online = sum(1 for r in results if r["status"] == "ONLINE")
    total = len(results)

    return {
        "status": "success",
        "summary": {
            "online": online, "offline": total - online,
            "total": total, "health_percent": int((online / total) * 100)
        },
        "apis": list(results)
    }
