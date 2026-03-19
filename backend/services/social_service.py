import httpx
import os
import pathlib
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


async def search_github(username: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"https://api.github.com/users/{username}",
                headers={
                    "Authorization": f"token {os.getenv('GITHUB_TOKEN')}",
                    "Accept": "application/vnd.github.v3+json"
                }
            )
            if resp.status_code == 200:
                d = resp.json()
                repos_resp = await client.get(
                    f"https://api.github.com/users/{username}/repos",
                    headers={"Authorization": f"token {os.getenv('GITHUB_TOKEN')}"},
                    params={"sort": "updated", "per_page": 5}
                )
                repos = []
                if repos_resp.status_code == 200:
                    for r in repos_resp.json():
                        repos.append({
                            "name": r.get("name"),
                            "description": r.get("description"),
                            "stars": r.get("stargazers_count"),
                            "language": r.get("language"),
                            "url": r.get("html_url")
                        })
                return {
                    "found": True,
                    "platform": "GitHub",
                    "username": d.get("login"),
                    "name": d.get("name"),
                    "bio": d.get("bio"),
                    "location": d.get("location"),
                    "company": d.get("company"),
                    "email": d.get("email"),
                    "followers": d.get("followers"),
                    "following": d.get("following"),
                    "public_repos": d.get("public_repos"),
                    "avatar": d.get("avatar_url"),
                    "profile_url": d.get("html_url"),
                    "created": d.get("created_at"),
                    "blog": d.get("blog"),
                    "twitter": d.get("twitter_username"),
                    "top_repos": repos
                }
            return {"found": False, "platform": "GitHub"}
    except Exception as e:
        return {"found": False, "platform": "GitHub", "error": str(e)}


async def search_reddit_user(username: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"https://www.reddit.com/user/{username}/about.json",
                headers={"User-Agent": "GodsEye/1.0"}
            )
            if resp.status_code == 200:
                d = resp.json().get("data", {})
                return {
                    "found": True,
                    "platform": "Reddit",
                    "username": d.get("name"),
                    "karma": d.get("total_karma"),
                    "post_karma": d.get("link_karma"),
                    "comment_karma": d.get("comment_karma"),
                    "created": d.get("created_utc"),
                    "is_gold": d.get("is_gold"),
                    "profile_url": f"https://reddit.com/u/{username}",
                }
            return {"found": False, "platform": "Reddit"}
    except Exception as e:
        return {"found": False, "platform": "Reddit", "error": str(e)}


async def search_linkedin(name: str) -> dict:
    """Search LinkedIn via GDELT and direct URL guessing"""
    results = []
    try:
        # Method 1: GDELT news search for LinkedIn mentions
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://api.gdeltproject.org/api/v2/doc/doc",
                params={
                    "query": f"{name} linkedin",
                    "mode": "artlist",
                    "maxrecords": 5,
                    "format": "json",
                    "sort": "DateDesc"
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                for a in data.get("articles", []):
                    url = a.get("url", "")
                    if "linkedin.com" in url:
                        results.append({
                            "url": url,
                            "title": a.get("title"),
                            "source": "GDELT"
                        })

        # Method 2: Try common LinkedIn URL patterns
        parts = name.lower().split()
        first = parts[0] if parts else ""
        last = parts[-1] if len(parts) > 1 else ""

        url_guesses = []
        if first and last:
            url_guesses = [
                f"https://www.linkedin.com/in/{first}-{last}",
                f"https://www.linkedin.com/in/{first}{last}",
                f"https://www.linkedin.com/in/{first}-{last}-",
                f"https://www.linkedin.com/pub/{first}-{last}/",
            ]

        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            for url in url_guesses:
                try:
                    resp = await client.get(
                        url,
                        headers={
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                        }
                    )
                    if resp.status_code == 200 and "linkedin" in resp.url.host:
                        results.append({
                            "url": str(resp.url),
                            "title": f"LinkedIn profile for {name}",
                            "source": "URL_GUESS"
                        })
                        break
                except Exception:
                    continue

        # Method 3: Build search URL for manual check
        search_url = f"https://www.google.com/search?q=%22{name.replace(' ', '+')}%22+site%3Alinkedin.com%2Fin"

        if results:
            return {
                "found": True,
                "platform": "LinkedIn",
                "name": name,
                "profiles": results,
                "search_url": search_url,
                "note": "Profiles found via public data"
            }
        else:
            return {
                "found": True,
                "platform": "LinkedIn",
                "name": name,
                "profiles": [],
                "search_url": search_url,
                "note": "Use search URL to find profile manually"
            }

    except Exception as e:
        return {
            "found": False,
            "platform": "LinkedIn",
            "error": str(e),
            "search_url": f"https://www.google.com/search?q=%22{name.replace(' ', '+')}%22+site%3Alinkedin.com%2Fin"
        }


async def search_instagram_public(username: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            resp = await client.get(
                f"https://www.instagram.com/{username}/",
                headers={"User-Agent": "Mozilla/5.0"}
            )
            if resp.status_code == 200:
                return {
                    "found": True,
                    "platform": "Instagram",
                    "username": username,
                    "profile_url": f"https://www.instagram.com/{username}/",
                }
            return {"found": False, "platform": "Instagram"}
    except Exception as e:
        return {"found": False, "platform": "Instagram", "error": str(e)}


async def check_username_exists(username: str, platform: str, url: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=8, follow_redirects=True) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            found = resp.status_code == 200
            return {
                "found": found,
                "platform": platform,
                "username": username,
                "profile_url": url if found else None,
            }
    except Exception:
        return {"found": False, "platform": platform}


async def search_username_everywhere(username: str) -> list:
    platforms = [
        ("Instagram", f"https://www.instagram.com/{username}/"),
        ("Twitter/X", f"https://twitter.com/{username}"),
        ("TikTok", f"https://www.tiktok.com/@{username}"),
        ("YouTube", f"https://www.youtube.com/@{username}"),
        ("Pinterest", f"https://www.pinterest.com/{username}/"),
        ("Tumblr", f"https://{username}.tumblr.com/"),
        ("Medium", f"https://medium.com/@{username}"),
        ("Dev.to", f"https://dev.to/{username}"),
        ("Twitch", f"https://www.twitch.tv/{username}"),
        ("Steam", f"https://steamcommunity.com/id/{username}"),
        ("Spotify", f"https://open.spotify.com/user/{username}"),
        ("SoundCloud", f"https://soundcloud.com/{username}"),
        ("Behance", f"https://www.behance.net/{username}"),
        ("Dribbble", f"https://dribbble.com/{username}"),
        ("Gitlab", f"https://gitlab.com/{username}"),
        ("Keybase", f"https://keybase.io/{username}"),
        ("Replit", f"https://replit.com/@{username}"),
        ("Kaggle", f"https://www.kaggle.com/{username}"),
        ("HackerNews", f"https://news.ycombinator.com/user?id={username}"),
        ("LinkedIn", f"https://www.linkedin.com/in/{username}"),
    ]

    results = []
    async with httpx.AsyncClient(timeout=8, follow_redirects=True) as client:
        for platform, url in platforms:
            try:
                resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
                if resp.status_code == 200:
                    results.append({
                        "found": True,
                        "platform": platform,
                        "username": username,
                        "profile_url": url
                    })
                else:
                    results.append({"found": False, "platform": platform})
            except Exception:
                results.append({"found": False, "platform": platform})

    return results


async def google_dork_person(name: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://api.gdeltproject.org/api/v2/doc/doc",
                params={
                    "query": name,
                    "mode": "artlist",
                    "maxrecords": 5,
                    "format": "json",
                    "sort": "DateDesc"
                }
            )
            results = []
            if resp.status_code == 200:
                data = resp.json()
                for a in data.get("articles", [])[:5]:
                    results.append({
                        "title": a.get("title"),
                        "url": a.get("url"),
                        "source": a.get("domain"),
                        "date": a.get("seendate"),
                    })
            return {"status": "success", "name": name, "news_mentions": results}
    except Exception as e:
        return {"error": str(e)}


async def search_person(name: str) -> dict:
    results = {
        "name": name,
        "github": None,
        "reddit": None,
        "linkedin": None,
        "social_links": [],
        "news": None,
    }

    # Generate username guesses from name
    clean = name.lower().replace(" ", "")
    clean_dot = name.lower().replace(" ", ".")
    clean_under = name.lower().replace(" ", "_")
    parts = name.lower().split()
    first = parts[0] if parts else clean
    last = parts[-1] if len(parts) > 1 else ""

    usernames_to_try = list(set([
        clean, clean_dot, clean_under,
        first,
        f"{first}{last}",
        f"{first}.{last}",
        f"{first}_{last}",
        f"{first[0]}{last}" if last else first,
    ]))

    # GitHub search
    for uname in usernames_to_try[:3]:
        gh = await search_github(uname)
        if gh.get("found"):
            results["github"] = gh
            break

    # Reddit search
    for uname in usernames_to_try[:3]:
        rd = await search_reddit_user(uname)
        if rd.get("found"):
            results["reddit"] = rd
            break

    # LinkedIn search
    results["linkedin"] = await search_linkedin(name)

    # Username existence check on all platforms
    for uname in usernames_to_try[:2]:
        platform_results = await search_username_everywhere(uname)
        for r in platform_results:
            if r.get("found"):
                results["social_links"].append(r)

    # Remove duplicates by platform
    seen_platforms = set()
    unique_links = []
    for link in results["social_links"]:
        if link["platform"] not in seen_platforms:
            seen_platforms.add(link["platform"])
            unique_links.append(link)
    results["social_links"] = unique_links

    # News mentions
    results["news"] = await google_dork_person(name)

    return results
