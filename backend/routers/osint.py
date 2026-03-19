from fastapi import APIRouter, HTTPException
from services.osint_service import phone_lookup, email_lookup, darkweb_search

router = APIRouter(prefix="/osint", tags=["OSINT Intelligence"])


@router.get("/phone/{phone}")
async def investigate_phone(phone: str):
    try:
        data = await phone_lookup(phone)
        return {"status": "success", "phone": phone, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/email/{email}")
async def investigate_email(email: str):
    try:
        data = await email_lookup(email)
        return {"status": "success", "email": email, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/darkweb")
async def darkweb_intel(query: str):
    try:
        data = await darkweb_search(query)
        return {"status": "success", "query": query, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
