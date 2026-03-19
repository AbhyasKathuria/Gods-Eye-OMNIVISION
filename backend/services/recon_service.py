import httpx
import asyncio
import os
from dotenv import load_dotenv
import pathlib

env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

SITES = [
    {"name": "GitHub", "url": "https://github.com/{}"},
    {"name": "Twitter/X", "url": "https://twitter.com/{}"},
    {"name": "Instagram", "url": "https://www.instagram.com/{}/"},
    {"name": "Reddit", "url": "https://www.reddit.com/user/{}"},
    {"name": "TikTok", "url": "https://www.tiktok.com/@{}"},
    {"name": "YouTube", "url": "https://www.youtube.com/@{}"},
    {"name": "LinkedIn", "url": "https://www.linkedin.com/in/{}"},
    {"name": "Pinterest", "url": "https://www.pinterest.com/{}"},
    {"name": "Tumblr", "url": "https://www.tumblr.com/{}"},
    {"name": "Medium", "url": "https://medium.com/@{}"},
    {"name": "Dev.to", "url": "https://dev.to/{}"},
    {"name": "Twitch", "url": "https://www.twitch.tv/{}"},
    {"name": "Steam", "url": "https://steamcommunity.com/id/{}"},
    {"name": "SoundCloud", "url": "https://soundcloud.com/{}"},
    {"name": "Patreon", "url": "https://www.patreon.com/{}"},
    {"name": "Keybase", "url": "https://keybase.io/{}"},
    {"name": "Gitlab", "url": "https://gitlab.com/{}"},
    {"name": "Bitbucket", "url": "https://bitbucket.org/{}"},
    {"name": "HackerNews", "url": "https://news.ycombinator.com/user?id={}"},
    {"name": "ProductHunt", "url": "https://www.producthunt.com/@{}"},
    {"name": "Behance", "url": "https://www.behance.net/{}"},
    {"name": "Dribbble", "url": "https://dribbble.com/{}"},
    {"name": "Replit", "url": "https://replit.com/@{}"},
    {"name": "Kaggle", "url": "https://www.kaggle.com/{}"},
    {"name": "HuggingFace", "url": "https://huggingface.co/{}"},
    {"name": "CodePen", "url": "https://codepen.io/{}"},
    {"name": "Linktree", "url": "https://linktr.ee/{}"},
    {"name": "Substack", "url": "https://{}.substack.com"},
    {"name": "Spotify", "url": "https://open.spotify.com/user/{}"},
    {"name": "Gravatar", "url": "https://en.gravatar.com/{}"},
]


async def check_single(client: httpx.AsyncClient, site: dict, username: str) -> dict:
    url = site["url"].format(username)
    try:
        resp = await client.get(url, timeout=3, follow_redirects=True,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})
        found = resp.status_code == 200
        return {"site": site["name"], "url": url, "found": found, "status_code": resp.status_code}
    except Exception as e:
        return {"site": site["name"], "url": url, "found": False, "status_code": None, "error": str(e)[:50]}


async def username_recon(username: str) -> dict:
    found_on = []
    not_found = []

    async with httpx.AsyncClient(timeout=4) as client:
        tasks = [check_single(client, site, username) for site in SITES]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    for r in results:
        if isinstance(r, Exception):
            continue
        if r.get("found"):
            found_on.append(r)
        else:
            not_found.append(r["site"])

    return {
        "username": username,
        "total_checked": len(SITES),
        "found_count": len(found_on),
        "found_on": found_on,
        "not_found": not_found,
        "summary": f"Found '{username}' on {len(found_on)} of {len(SITES)} platforms"
    }


async def check_email_breach(email: str) -> dict:
    results = {
        "email": email,
        "sources": [],
        "total_breaches": 0,
        "all_breaches": [],
        "search_links": {
            "dehashed": f"https://dehashed.com/search?query={email}",
            "intelx": f"https://intelx.io/?s={email}",
            "leakpeek": f"https://leakpeek.com/v/?q={email}",
            "breachdirectory": f"https://breachdirectory.org/",
            "haveibeensold": f"https://haveibeensold.app/",
        }
    }

    # === SOURCE 1: LeakCheck.io ===
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://leakcheck.io/api/public",
                params={"check": email},
                headers={"X-API-Key": os.getenv("LEAKCHECK_API_KEY", "").strip()}
            )
            if resp.status_code == 200:
                data = resp.json()
                found = data.get("found", 0)
                sources = data.get("sources", [])
                results["sources"].append({
                    "name": "LeakCheck.io",
                    "status": "found" if found > 0 else "clean",
                    "breach_count": found,
                    "breaches": [
                        {"name": s if isinstance(s, str) else s.get("name", str(s))}
                        for s in sources[:10]
                    ]
                })
                results["total_breaches"] += found
                for s in sources:
                    name = s if isinstance(s, str) else s.get("name", str(s))
                    if name not in results["all_breaches"]:
                        results["all_breaches"].append(name)
            else:
                results["sources"].append({
                    "name": "LeakCheck.io",
                    "status": "error",
                    "error": f"HTTP {resp.status_code} — {resp.text[:80]}"
                })
    except Exception as e:
        results["sources"].append({
            "name": "LeakCheck.io",
            "status": "error",
            "error": str(e)[:80]
        })

    # === SOURCE 2: BreachDirectory via RapidAPI ===
    rapidapi_key = os.getenv("RAPIDAPI_KEY", "").strip()
    if rapidapi_key:
        try:
            async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
                resp = await client.get(
                    "https://breachdirectory.p.rapidapi.com/",
                    params={"func": "auto", "term": email},
                    headers={
                        "X-RapidAPI-Key": rapidapi_key,
                        "X-RapidAPI-Host": "breachdirectory.p.rapidapi.com"
                    }
                )
                if resp.status_code == 200:
                    data = resp.json()
                    found_list = data.get("result", [])
                    results["sources"].append({
                        "name": "BreachDirectory",
                        "status": "found" if found_list else "clean",
                        "breach_count": len(found_list),
                        "breaches": [
                            {"name": r.get("sources", ["Unknown"])[0]
                             if r.get("sources") else "Unknown"}
                            for r in found_list[:5]
                        ]
                    })
                    results["total_breaches"] += len(found_list)
                elif resp.status_code == 403:
                    # 403 = not subscribed to this API on RapidAPI
                    results["sources"].append({
                        "name": "BreachDirectory",
                        "status": "error",
                        "error": "Not subscribed — go to rapidapi.com, search BreachDirectory, click Subscribe (free)"
                    })
                elif resp.status_code == 401:
                    results["sources"].append({
                        "name": "BreachDirectory",
                        "status": "error",
                        "error": "Invalid RapidAPI key"
                    })
                else:
                    results["sources"].append({
                        "name": "BreachDirectory",
                        "status": "error",
                        "error": f"HTTP {resp.status_code} — {resp.text[:100]}"
                    })
        except Exception as e:
            results["sources"].append({
                "name": "BreachDirectory",
                "status": "error",
                "error": str(e)[:80]
            })
    else:
        results["sources"].append({
            "name": "BreachDirectory",
            "status": "no_key",
            "note": "Add RAPIDAPI_KEY to .env for BreachDirectory access (free tier available)"
        })

    # === SOURCE 3: HIBP ===
    hibp_key = os.getenv("HIBP_API_KEY", "").strip()
    if hibp_key:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(
                    f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}",
                    headers={"hibp-api-key": hibp_key, "User-Agent": "GodsEye-OSINT"},
                    params={"truncateResponse": "false"}
                )
                if resp.status_code == 200:
                    breaches = resp.json()
                    results["sources"].append({
                        "name": "HaveIBeenPwned",
                        "status": "found",
                        "breach_count": len(breaches),
                        "breaches": [
                            {"name": b.get("Name"), "date": b.get("BreachDate"),
                             "records": b.get("PwnCount"),
                             "data_types": b.get("DataClasses", [])[:4]}
                            for b in breaches[:8]
                        ]
                    })
                    results["total_breaches"] += len(breaches)
                elif resp.status_code == 404:
                    results["sources"].append({
                        "name": "HaveIBeenPwned",
                        "status": "clean",
                        "breach_count": 0
                    })
                else:
                    results["sources"].append({
                        "name": "HaveIBeenPwned",
                        "status": "error",
                        "error": f"HTTP {resp.status_code}"
                    })
        except Exception as e:
            results["sources"].append({
                "name": "HaveIBeenPwned",
                "status": "error",
                "error": str(e)[:60]
            })
    else:
        results["sources"].append({
            "name": "HaveIBeenPwned",
            "status": "no_key",
            "note": "Add HIBP_API_KEY to .env for full HIBP access ($3.50/month)"
        })

    results["risk_level"] = (
        "HIGH" if results["total_breaches"] > 3
        else "MEDIUM" if results["total_breaches"] > 0
        else "CLEAN"
    )
    return results


async def calculate_threat_score(data: dict) -> dict:
    score = 0
    factors = []
    breakdown = {}

    vt_malicious = data.get("vt_malicious", 0)
    if vt_malicious > 0:
        vt_score = min(30, vt_malicious * 5)
        score += vt_score
        factors.append(f"VirusTotal: {vt_malicious} malicious engines (+{vt_score})")
        breakdown["virustotal"] = vt_score

    abuse_score = data.get("abuse_score", 0)
    if abuse_score > 0:
        abuse_points = int(abuse_score * 0.25)
        score += abuse_points
        factors.append(f"AbuseIPDB score {abuse_score}% (+{abuse_points})")
        breakdown["abuseipdb"] = abuse_points

    domain_age_days = data.get("domain_age_days", 365)
    if domain_age_days < 7:
        age_score = 15
    elif domain_age_days < 30:
        age_score = 10
    elif domain_age_days < 90:
        age_score = 5
    else:
        age_score = 0
    if age_score > 0:
        score += age_score
        factors.append(f"Domain age {domain_age_days} days (+{age_score})")
        breakdown["domain_age"] = age_score

    breach_count = data.get("breach_count", 0)
    if breach_count > 0:
        breach_score = min(15, breach_count * 3)
        score += breach_score
        factors.append(f"Found in {breach_count} data breaches (+{breach_score})")
        breakdown["breaches"] = breach_score

    has_gps = data.get("has_gps", False)
    if has_gps:
        score += 10
        factors.append("GPS coordinates exposed in image metadata (+10)")
        breakdown["gps_exposure"] = 10

    sentiment = data.get("sentiment", "NEUTRAL")
    if sentiment == "NEGATIVE":
        score += 5
        factors.append("Negative sentiment in news coverage (+5)")
        breakdown["sentiment"] = 5

    score = min(100, score)

    if score >= 75:
        level, color = "CRITICAL", "#ff0000"
    elif score >= 50:
        level, color = "HIGH", "#ff4400"
    elif score >= 25:
        level, color = "MEDIUM", "#ff8800"
    else:
        level, color = "LOW", "#00aa44"

    return {
        "score": score, "level": level, "color": color,
        "factors": factors, "breakdown": breakdown,
        "recommendation": (
            "IMMEDIATE ACTION REQUIRED — Multiple critical threat indicators detected." if score >= 75
            else "HIGH RISK — Significant threat indicators present. Investigate further." if score >= 50
            else "MODERATE RISK — Some threat indicators present. Monitor closely." if score >= 25
            else "LOW RISK — No significant threat indicators detected."
        )
    }
