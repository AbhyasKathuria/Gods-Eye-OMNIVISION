import httpx
import os
import pathlib
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

async def check_otx_threat(indicator: str, indicator_type: str) -> dict:
    results = {}
    api_key = os.getenv("ALIENVAULT_OTX_KEY", "").strip()
    if not api_key:
        return {"status": "error", "message": "AlienVault OTX API key missing"}

    # Supported indicator types: IPv4, IPv6, domain, hostname, file (hash)
    otx_type = "IPv4"
    if indicator_type.lower() == "domain":
        otx_type = "domain"
    elif indicator_type.lower() == "hostname":
        otx_type = "hostname"
    elif indicator_type.lower() == "hash":
        otx_type = "file"

    url = f"https://otx.alienvault.com/api/v1/indicators/{otx_type}/{indicator}/general"

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                url,
                headers={"X-OTX-API-KEY": api_key, "Accept": "application/json"}
            )
            if resp.status_code == 200:
                data = resp.json()
                pulse_data = data.get("pulse_info", {})
                pulses = pulse_data.get("pulses", [])
                
                formatted_pulses = []
                for p in pulses:
                    formatted_pulses.append({
                        "id": p.get("id"),
                        "name": p.get("name"),
                        "description": p.get("description"),
                        "created": p.get("created"),
                        "author": p.get("author_name"),
                        "references": p.get("references", [])[:3],
                        "tags": p.get("tags", [])[:5]
                    })
                
                results = {
                    "status": "success",
                    "indicator": indicator,
                    "type": indicator_type,
                    "pulse_count": len(formatted_pulses),
                    "reputation": "MALICIOUS" if len(formatted_pulses) > 0 else "CLEAN",
                    "pulses": formatted_pulses
                }
            else:
                results = {
                    "status": "error",
                    "code": resp.status_code,
                    "message": f"AlienVault OTX responded with status {resp.status_code}: {resp.text}"
                }
    except Exception as e:
        results = {"status": "error", "message": str(e)}

    return results
