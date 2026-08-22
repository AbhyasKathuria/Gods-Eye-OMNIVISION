from fastapi import APIRouter, HTTPException
from services.cyber_service import (
    ip_lookup,
    domain_lookup,
    virustotal_scan,
    breach_check,
    shodan_lookup,
    urlhaus_check
)
from services.otx_service import check_otx_threat
from services.claude_service import analyze_cyber_threat
import pathlib
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

router = APIRouter(prefix="/cyber", tags=["Cyber Intelligence"])


@router.get("/ip/{ip}")
async def investigate_ip(ip: str):
    try:
        data = await ip_lookup(ip)
        vt = await virustotal_scan(ip, "ip")
        data["virustotal"] = vt
        report = await analyze_cyber_threat({"ip": ip, "data": data})
        return {
            "status": "success",
            "ip": ip,
            "data": data,
            "ai_report": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/domain/{domain}")
async def investigate_domain(domain: str):
    try:
        data = await domain_lookup(domain)
        vt = await virustotal_scan(domain, "domain")
        data["virustotal"] = vt
        report = await analyze_cyber_threat({"domain": domain, "data": data})
        return {
            "status": "success",
            "domain": domain,
            "data": data,
            "ai_report": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/breach/{email}")
async def check_breach(email: str):
    try:
        data = await breach_check(email)
        return {
            "status": "success",
            "email": email,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/shodan")
async def shodan_search(query: str):
    try:
        data = await shodan_lookup(query)
        return {
            "status": "success",
            "query": query,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/virustotal")
async def vt_scan(target: str, scan_type: str = "url"):
    try:
        data = await virustotal_scan(target, scan_type)
        return {
            "status": "success",
            "target": target,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/urlhaus")
async def urlhaus_scan(payload: dict):
    try:
        url = payload.get("url")
        if not url:
            raise HTTPException(status_code=400, detail="URL required")
        data = await urlhaus_check(url)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/otx/{indicator_type}/{indicator}")
async def investigate_otx(indicator_type: str, indicator: str):
    try:
        data = await check_otx_threat(indicator, indicator_type)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
