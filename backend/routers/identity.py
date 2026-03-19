from fastapi import APIRouter, UploadFile, File, HTTPException
from services.image_service import (
    reverse_image_search,
    extract_exif,
    analyze_face_metadata,
    search_face_facecheck,
    yandex_reverse_search,
    luxand_face_analyze,
    facepp_detect
)
from services.claude_service import generate_identity_report, generate_osint_summary
import httpx
import os
import asyncio
import pathlib
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

router = APIRouter(prefix="/identity", tags=["Identity Engine"])


@router.post("/face-search")
async def face_search(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        results, luxand, facepp = await asyncio.gather(
            reverse_image_search(contents, file.filename),
            luxand_face_analyze(contents),
            facepp_detect(contents),
        )

        exif = extract_exif(contents)
        metadata_intel = analyze_face_metadata(exif)

        return {
            "status": "success",
            "results": results,
            "exif": exif,
            "metadata_intelligence": metadata_intel,
            "luxand": luxand,
            "facepp": facepp,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/facecheck")
async def facecheck_search(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        results = await search_face_facecheck(contents)
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/yandex-search")
async def yandex_search(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        result = await yandex_reverse_search(contents)
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/exif")
async def exif_extract(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        data = extract_exif(contents)
        intel = analyze_face_metadata(data)
        return {
            "status": "success",
            "exif": data,
            "intelligence": intel
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/report")
async def identity_report(data: dict):
    try:
        report = await generate_identity_report(data)
        return {"status": "success", "report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search")
async def search_person(query: str):
    try:
        results = []

        async with httpx.AsyncClient(timeout=15) as client:
            news_resp = await client.get(
                "https://newsapi.org/v2/everything",
                params={
                    "q": query,
                    "pageSize": 8,
                    "sortBy": "relevancy",
                    "apiKey": os.getenv("NEWS_API_KEY")
                }
            )
            if news_resp.status_code == 200:
                articles = news_resp.json().get("articles", [])
                for a in articles:
                    results.append({
                        "source": "NEWS",
                        "title": a.get("title"),
                        "description": a.get("description"),
                        "url": a.get("url"),
                        "date": a.get("publishedAt"),
                        "outlet": a.get("source", {}).get("name")
                    })

            reddit_resp = await client.get(
                "https://www.reddit.com/search.json",
                params={"q": query, "limit": 5, "sort": "relevance"},
                headers={"User-Agent": "GodsEye/1.0"}
            )
            if reddit_resp.status_code == 200:
                posts = reddit_resp.json().get("data", {}).get("children", [])
                for p in posts:
                    post_data = p.get("data", {})
                    results.append({
                        "source": "REDDIT",
                        "title": post_data.get("title"),
                        "description": post_data.get("selftext", "")[:200],
                        "url": f"https://reddit.com{post_data.get('permalink')}",
                        "date": None,
                        "outlet": post_data.get("subreddit_name_prefixed")
                    })

        summary = await generate_osint_summary(query, {"results": results})

        return {
            "status": "success",
            "query": query,
            "total": len(results),
            "results": results,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))