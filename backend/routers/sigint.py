from fastapi import APIRouter, HTTPException
from services.sigint_service import query_wifi_by_coords, query_wifi_by_bssid

router = APIRouter(prefix="/sigint", tags=["SIGINT & Wireless Recon"])

@router.get("/wifi")
async def get_wifi_by_coords(lat: float, lon: float):
    try:
        data = await query_wifi_by_coords(lat, lon)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bssid")
async def get_wifi_by_bssid(bssid: str):
    try:
        data = await query_wifi_by_bssid(bssid)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
