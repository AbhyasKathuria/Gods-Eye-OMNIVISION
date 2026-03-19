from fastapi import APIRouter, HTTPException
from services.news_service import (
    get_top_news,
    search_news,
    get_mediastack_news,
    get_reddit_posts,
    search_reddit,
    get_gdelt_news,
    get_twitter_search,
    analyze_sentiment
)
from services.claude_service import analyze_news_sentiment
import pathlib
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

router = APIRouter(prefix="/news", tags=["News & Social Monitor"])


@router.get("/top")
async def top_news(category: str = "general", country: str = "us"):
    try:
        data = await get_top_news(category, country)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search")
async def news_search(query: str, sort_by: str = "publishedAt"):
    try:
        newsapi = await search_news(query, sort_by)
        gdelt = await get_gdelt_news(query)
        sentiment = await analyze_sentiment(query)
        ai_analysis = await analyze_news_sentiment({
            "query": query,
            "newsapi": newsapi,
            "gdelt": gdelt
        })
        return {
            "status": "success",
            "query": query,
            "newsapi": newsapi,
            "gdelt": gdelt,
            "sentiment": sentiment,
            "ai_analysis": ai_analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reddit")
async def reddit_feed(subreddit: str = "worldnews", sort: str = "hot"):
    try:
        data = await get_reddit_posts(subreddit, sort)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reddit/search")
async def reddit_search(query: str):
    try:
        data = await search_reddit(query)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/twitter")
async def twitter_search(query: str):
    try:
        data = await get_twitter_search(query)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mediastack")
async def mediastack_news(query: str = None, category: str = None):
    try:
        data = await get_mediastack_news(query, category)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/gdelt")
async def gdelt_news(query: str):
    try:
        data = await get_gdelt_news(query)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sentiment")
async def sentiment_analysis(text: str):
    try:
        basic = await analyze_sentiment(text)
        ai = await analyze_news_sentiment({"text": text})
        return {
            "status": "success",
            "basic": basic,
            "ai_analysis": ai
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
