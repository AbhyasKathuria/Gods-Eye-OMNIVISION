import httpx
import os
import pathlib
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


async def get_top_news(category: str = "general", country: str = "us") -> dict:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://newsapi.org/v2/top-headlines",
                params={
                    "apiKey": os.getenv("NEWS_API_KEY"),
                    "category": category,
                    "country": country,
                    "pageSize": 20
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                articles = []
                for a in data.get("articles", []):
                    articles.append({
                        "title": a.get("title"),
                        "description": a.get("description"),
                        "url": a.get("url"),
                        "source": a.get("source", {}).get("name"),
                        "published": a.get("publishedAt"),
                        "image": a.get("urlToImage"),
                        "author": a.get("author"),
                    })
                return {
                    "status": "success",
                    "total": data.get("totalResults", 0),
                    "articles": articles
                }
            else:
                return {"error": f"NewsAPI error: {resp.status_code} {resp.text}"}
    except Exception as e:
        return {"error": str(e)}


async def search_news(query: str, sort_by: str = "publishedAt") -> dict:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://newsapi.org/v2/everything",
                params={
                    "apiKey": os.getenv("NEWS_API_KEY"),
                    "q": query,
                    "sortBy": sort_by,
                    "pageSize": 20,
                    "language": "en"
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                articles = []
                for a in data.get("articles", []):
                    articles.append({
                        "title": a.get("title"),
                        "description": a.get("description"),
                        "url": a.get("url"),
                        "source": a.get("source", {}).get("name"),
                        "published": a.get("publishedAt"),
                        "image": a.get("urlToImage"),
                        "author": a.get("author"),
                    })
                return {
                    "status": "success",
                    "total": data.get("totalResults", 0),
                    "query": query,
                    "articles": articles
                }
            else:
                return {"error": f"NewsAPI error: {resp.status_code} {resp.text}"}
    except Exception as e:
        return {"error": str(e)}


async def get_mediastack_news(query: str = None, category: str = None) -> dict:
    try:
        params = {
            "access_key": os.getenv("MEDIASTACK_API_KEY"),
            "languages": "en",
            "limit": 20,
            "sort": "published_desc"
        }
        if query:
            params["keywords"] = query
        if category:
            params["categories"] = category

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "http://api.mediastack.com/v1/news",
                params=params
            )
            if resp.status_code == 200:
                data = resp.json()
                articles = []
                for a in data.get("data", []):
                    articles.append({
                        "title": a.get("title"),
                        "description": a.get("description"),
                        "url": a.get("url"),
                        "source": a.get("source"),
                        "published": a.get("published_at"),
                        "image": a.get("image"),
                        "category": a.get("category"),
                        "country": a.get("country"),
                    })
                return {
                    "status": "success",
                    "total": data.get("pagination", {}).get("total", 0),
                    "articles": articles
                }
            else:
                return {"error": f"MediaStack error: {resp.status_code}"}
    except Exception as e:
        return {"error": str(e)}


async def get_reddit_posts(subreddit: str = "worldnews", sort: str = "hot") -> dict:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"https://www.reddit.com/r/{subreddit}/{sort}.json",
                params={"limit": 25},
                headers={"User-Agent": "GodsEye/1.0"}
            )
            if resp.status_code == 200:
                data = resp.json()
                posts = []
                for p in data.get("data", {}).get("children", []):
                    post = p.get("data", {})
                    posts.append({
                        "title": post.get("title"),
                        "score": post.get("score"),
                        "url": f"https://reddit.com{post.get('permalink')}",
                        "external_url": post.get("url"),
                        "subreddit": post.get("subreddit_name_prefixed"),
                        "comments": post.get("num_comments"),
                        "created": post.get("created_utc"),
                        "author": post.get("author"),
                        "flair": post.get("link_flair_text"),
                        "selftext": post.get("selftext", "")[:300],
                    })
                return {
                    "status": "success",
                    "subreddit": subreddit,
                    "posts": posts
                }
            else:
                return {"error": f"Reddit error: {resp.status_code}"}
    except Exception as e:
        return {"error": str(e)}


async def search_reddit(query: str, sort: str = "relevance") -> dict:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://www.reddit.com/search.json",
                params={"q": query, "sort": sort, "limit": 25},
                headers={"User-Agent": "GodsEye/1.0"}
            )
            if resp.status_code == 200:
                data = resp.json()
                posts = []
                for p in data.get("data", {}).get("children", []):
                    post = p.get("data", {})
                    posts.append({
                        "title": post.get("title"),
                        "score": post.get("score"),
                        "url": f"https://reddit.com{post.get('permalink')}",
                        "subreddit": post.get("subreddit_name_prefixed"),
                        "comments": post.get("num_comments"),
                        "created": post.get("created_utc"),
                        "author": post.get("author"),
                        "selftext": post.get("selftext", "")[:300],
                    })
                return {
                    "status": "success",
                    "query": query,
                    "posts": posts
                }
            else:
                return {"error": f"Reddit error: {resp.status_code}"}
    except Exception as e:
        return {"error": str(e)}


async def get_gdelt_news(query: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(
                "https://api.gdeltproject.org/api/v2/doc/doc",
                params={
                    "query": query,
                    "mode": "artlist",
                    "maxrecords": 20,
                    "format": "json",
                    "sort": "DateDesc"
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                articles = []
                for a in data.get("articles", []):
                    articles.append({
                        "title": a.get("title"),
                        "url": a.get("url"),
                        "source": a.get("domain"),
                        "published": a.get("seendate"),
                        "language": a.get("language"),
                        "country": a.get("sourcecountry"),
                        "tone": a.get("tone"),
                    })
                return {
                    "status": "success",
                    "query": query,
                    "articles": articles
                }
            else:
                return {"error": f"GDELT error: {resp.status_code}"}
    except Exception as e:
        return {"error": str(e)}


async def get_twitter_search(query: str) -> dict:
    try:
        bearer_token = os.getenv("TWITTER_BEARER_TOKEN")
        if not bearer_token:
            return {"error": "Twitter bearer token not configured"}

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://api.twitter.com/2/tweets/search/recent",
                params={
                    "query": f"{query} -is:retweet lang:en",
                    "max_results": 20,
                    "tweet.fields": "created_at,author_id,public_metrics,lang"
                },
                headers={"Authorization": f"Bearer {bearer_token}"}
            )
            if resp.status_code == 200:
                data = resp.json()
                tweets = []
                for t in data.get("data", []):
                    metrics = t.get("public_metrics", {})
                    tweets.append({
                        "id": t.get("id"),
                        "text": t.get("text"),
                        "created": t.get("created_at"),
                        "likes": metrics.get("like_count"),
                        "retweets": metrics.get("retweet_count"),
                        "replies": metrics.get("reply_count"),
                        "url": f"https://twitter.com/i/web/status/{t.get('id')}",
                    })
                return {
                    "status": "success",
                    "query": query,
                    "tweets": tweets
                }
            else:
                return {"error": f"Twitter error: {resp.status_code} {resp.text}"}
    except Exception as e:
        return {"error": str(e)}


async def analyze_sentiment(text: str) -> dict:
    words_positive = ["good", "great", "excellent", "positive", "success", "win",
                      "best", "amazing", "wonderful", "fantastic", "happy", "love"]
    words_negative = ["bad", "terrible", "negative", "fail", "worst", "disaster",
                      "horrible", "awful", "hate", "crisis", "attack", "threat",
                      "war", "conflict", "death", "kill", "bomb", "terror"]
    words_neutral = ["said", "according", "reported", "announced", "stated"]

    text_lower = text.lower()
    pos = sum(1 for w in words_positive if w in text_lower)
    neg = sum(1 for w in words_negative if w in text_lower)

    if pos > neg:
        sentiment = "POSITIVE"
        score = min(100, pos * 20)
    elif neg > pos:
        sentiment = "NEGATIVE"
        score = min(100, neg * 20)
    else:
        sentiment = "NEUTRAL"
        score = 50

    return {
        "sentiment": sentiment,
        "score": score,
        "positive_indicators": pos,
        "negative_indicators": neg,
    }
