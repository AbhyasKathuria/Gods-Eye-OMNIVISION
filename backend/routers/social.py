from fastapi import APIRouter, HTTPException
from services.social_service import (
    search_person,
    search_github,
    search_reddit_user,
    search_username_everywhere
)
from services.claude_service import generate_osint_summary

router = APIRouter(prefix="/social", tags=["Social Intel"])


@router.get("/person")
async def person_search(name: str):
    try:
        data = await search_person(name)
        # Generate AI summary
        try:
            summary = await generate_osint_summary(name, data)
            data["ai_summary"] = summary
        except Exception:
            data["ai_summary"] = None
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/github/{username}")
async def github_search(username: str):
    try:
        data = await search_github(username)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reddit/{username}")
async def reddit_search(username: str):
    try:
        data = await search_reddit_user(username)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/username/{username}")
async def username_search(username: str):
    try:
        data = await search_username_everywhere(username)
        found = [d for d in data if d.get("found")]
        return {
            "status": "success",
            "username": username,
            "found_count": len(found),
            "results": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
