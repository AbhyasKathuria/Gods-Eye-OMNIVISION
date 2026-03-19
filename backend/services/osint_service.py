import httpx
import os
import pathlib
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


# Timezone map by country code
COUNTRY_TIMEZONES = {
    "IN": "Asia/Kolkata (UTC+5:30)",
    "US": "Multiple zones (UTC-5 to UTC-8)",
    "GB": "Europe/London (UTC+0)",
    "AU": "Multiple zones (UTC+8 to UTC+11)",
    "DE": "Europe/Berlin (UTC+1)",
    "FR": "Europe/Paris (UTC+1)",
    "JP": "Asia/Tokyo (UTC+9)",
    "CN": "Asia/Shanghai (UTC+8)",
    "RU": "Multiple zones (UTC+2 to UTC+12)",
    "BR": "America/Sao_Paulo (UTC-3)",
    "CA": "Multiple zones (UTC-3 to UTC-8)",
    "SG": "Asia/Singapore (UTC+8)",
    "AE": "Asia/Dubai (UTC+4)",
    "SA": "Asia/Riyadh (UTC+3)",
    "PK": "Asia/Karachi (UTC+5)",
    "BD": "Asia/Dhaka (UTC+6)",
    "NG": "Africa/Lagos (UTC+1)",
    "ZA": "Africa/Johannesburg (UTC+2)",
    "MX": "America/Mexico_City (UTC-6)",
    "AR": "America/Argentina/Buenos_Aires (UTC-3)",
}

# Known spam number prefixes (educational purposes)
SPAM_PREFIXES = [
    "18005", "18006", "18007", "18008", "18009",  # US toll-free often used for spam
    "9000", "9001", "9002",  # Generic premium numbers
]

# Indian carrier prefixes
INDIA_CARRIER_PREFIXES = {
    "70": "Vodafone Idea", "71": "Vodafone Idea", "72": "Airtel",
    "73": "Airtel", "74": "Vodafone Idea", "75": "Vodafone Idea",
    "76": "Reliance Jio", "77": "Vodafone Idea", "78": "Airtel",
    "79": "Reliance Jio", "80": "Reliance Jio", "81": "Airtel",
    "82": "Reliance Jio", "83": "Reliance Jio", "84": "Airtel",
    "85": "Reliance Jio", "86": "Airtel", "87": "Vodafone Idea",
    "88": "Reliance Jio", "89": "Airtel", "90": "Airtel",
    "91": "Vodafone Idea", "92": "Airtel", "93": "BSNL",
    "94": "Vodafone Idea", "95": "Airtel", "96": "Reliance Jio",
    "97": "Airtel", "98": "Vodafone Idea", "99": "Airtel",
}


def analyze_phone_locally(phone: str, country_code: str = None, carrier: str = None, line_type: str = None) -> dict:
    """Local analysis without API — provides extra intelligence"""
    analysis = {}
    clean = phone.replace("+", "").replace(" ", "").replace("-", "")

    # Timezone
    if country_code and country_code in COUNTRY_TIMEZONES:
        analysis["timezone"] = COUNTRY_TIMEZONES[country_code]
    elif country_code:
        analysis["timezone"] = f"Unknown for {country_code}"

    # Line type assessment
    if line_type:
        if line_type == "mobile":
            analysis["whatsapp_likely"] = True
            analysis["sms_capable"] = True
            analysis["can_receive_calls"] = True
        elif line_type == "landline":
            analysis["whatsapp_likely"] = False
            analysis["sms_capable"] = False
            analysis["can_receive_calls"] = True
        elif line_type == "voip":
            analysis["whatsapp_likely"] = False
            analysis["sms_capable"] = True
            analysis["can_receive_calls"] = True
            analysis["voip_warning"] = "VoIP numbers are commonly used for spam/scams"

    # Number portability check (basic)
    if country_code == "IN" and len(clean) >= 12:
        # Indian numbers: +91 XXXXXXXXXX
        local = clean[2:] if clean.startswith("91") else clean
        if len(local) == 10:
            prefix = local[:2]
            detected_carrier = INDIA_CARRIER_PREFIXES.get(prefix)
            if detected_carrier and carrier and detected_carrier != carrier:
                analysis["ported"] = True
                analysis["original_carrier"] = detected_carrier
                analysis["ported_note"] = f"Number prefix suggests {detected_carrier} but currently on {carrier} — likely ported"
            else:
                analysis["ported"] = False
                if detected_carrier:
                    analysis["original_carrier"] = detected_carrier

    # Spam likelihood
    spam_score = 0
    spam_reasons = []

    if line_type == "voip":
        spam_score += 40
        spam_reasons.append("VoIP number")
    if line_type == "landline" and country_code == "IN":
        spam_score += 20
        spam_reasons.append("Landline used for calls")
    for prefix in SPAM_PREFIXES:
        if clean.startswith(prefix):
            spam_score += 30
            spam_reasons.append("Known spam prefix pattern")

    if spam_score == 0:
        spam_score = 5  # Base low risk for valid mobile numbers
        spam_reasons.append("No spam indicators detected")

    analysis["spam_score"] = min(spam_score, 100)
    analysis["spam_level"] = "HIGH" if spam_score > 60 else "MEDIUM" if spam_score > 30 else "LOW"
    analysis["spam_reasons"] = spam_reasons

    # Number format validation
    analysis["number_length"] = len(clean)
    analysis["format_valid"] = 10 <= len(clean) <= 15

    return analysis


async def phone_lookup(phone: str) -> dict:
    results = {}
    clean_phone = phone.strip().replace(" ", "").replace("-", "")

    # AbstractAPI Phone Intelligence
    try:
        api_key = os.getenv("ABSTRACT_PHONE_KEY", "")
        if api_key:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(
                    "https://phoneintelligence.abstractapi.com/v1/",
                    params={"api_key": api_key, "phone": clean_phone}
                )
                if resp.status_code == 200:
                    d = resp.json()
                    fmt = d.get("phone_format", {})
                    carrier = d.get("phone_carrier", {})
                    location = d.get("phone_location", {})

                    country_code = location.get("country_code") if isinstance(location, dict) else None
                    carrier_name = carrier.get("name") if isinstance(carrier, dict) else carrier
                    line_type = carrier.get("line_type") if isinstance(carrier, dict) else None

                    results["validation"] = {
                        "phone": d.get("phone_number"),
                        "valid": carrier.get("line_type") is not None,
                        "format_local": fmt.get("national") if isinstance(fmt, dict) else fmt,
                        "format_international": fmt.get("international") if isinstance(fmt, dict) else fmt,
                        "country": location.get("country_name") if isinstance(location, dict) else location,
                        "country_code": country_code,
                        "location": location.get("region") if isinstance(location, dict) else None,
                        "type": line_type,
                        "carrier": carrier_name,
                    }

                    # Enhanced local analysis
                    results["enhanced"] = analyze_phone_locally(
                        clean_phone, country_code, carrier_name, line_type
                    )
                else:
                    results["validation_error"] = f"API error {resp.status_code}"
                    # Still do local analysis with what we have
                    results["enhanced"] = analyze_phone_locally(clean_phone)
    except Exception as e:
        results["validation_error"] = str(e)
        results["enhanced"] = analyze_phone_locally(clean_phone)

    # AbuseIPDB-style check via NumVerify for spam reports
    try:
        # Check if number appears in any public spam databases
        async with httpx.AsyncClient(timeout=10) as client:
            # Check spam via should-i-answer style lookup
            resp = await client.get(
                f"https://www.shouldianswer.com/phone-number/{clean_phone}",
                headers={"User-Agent": "Mozilla/5.0"},
                follow_redirects=True
            )
            if resp.status_code == 200 and "spam" in resp.text.lower():
                results["spam_report"] = {
                    "found": True,
                    "source": "ShouldIAnswer",
                    "url": f"https://www.shouldianswer.com/phone-number/{clean_phone}"
                }
    except Exception:
        pass

    # Social search links
    phone_digits = clean_phone.replace("+", "").replace(" ", "")
    results["social_search"] = {
        "truecaller": f"https://www.truecaller.com/search/in/{clean_phone}",
        "whatsapp": f"https://wa.me/{phone_digits}",
        "google": f"https://www.google.com/search?q=%22{clean_phone}%22",
        "facebook": f"https://www.facebook.com/search/top?q={clean_phone}",
        "eyecon": f"https://www.eyecon.mobi/search/{phone_digits}",
        "spy_dialer": f"https://www.spydialer.com/default.aspx?phone={phone_digits}",
        "sync_me": f"https://sync.me/search/?number={clean_phone}",
    }

    return results


async def email_lookup(email: str) -> dict:
    results = {}

    try:
        api_key = os.getenv("ABSTRACT_EMAIL_KEY", "")
        if api_key:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(
                    "https://emailreputation.abstractapi.com/v1/",
                    params={"api_key": api_key, "email": email}
                )
                if resp.status_code == 200:
                    d = resp.json()
                    def get_val(field):
                        v = d.get(field)
                        return v.get("value") if isinstance(v, dict) else v
                    results["validation"] = {
                        "email": d.get("email"),
                        "deliverability": d.get("deliverability"),
                        "quality_score": d.get("quality_score"),
                        "is_valid_format": get_val("is_valid_format"),
                        "is_free_email": get_val("is_free_email"),
                        "is_disposable_email": get_val("is_disposable_email"),
                        "is_role_email": get_val("is_role_email"),
                        "is_catchall_email": get_val("is_catchall_email"),
                        "is_mx_found": get_val("is_mx_found"),
                        "is_smtp_valid": get_val("is_smtp_valid"),
                    }
    except Exception as e:
        results["validation_error"] = str(e)

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get("https://leakcheck.io/api/public", params={"check": email})
            if resp.status_code == 200:
                d = resp.json()
                results["breaches"] = {"found": d.get("found", 0), "sources": d.get("sources", [])}
    except Exception as e:
        results["breach_error"] = str(e)

    try:
        import hashlib
        email_hash = hashlib.md5(email.lower().strip().encode()).hexdigest()
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"https://www.gravatar.com/{email_hash}.json")
            if resp.status_code == 200:
                d = resp.json()
                entry = d.get("entry", [{}])[0]
                results["gravatar"] = {
                    "found": True,
                    "display_name": entry.get("displayName"),
                    "username": entry.get("preferredUsername"),
                    "location": entry.get("currentLocation"),
                    "about": entry.get("aboutMe"),
                    "profile_url": entry.get("profileUrl"),
                    "accounts": [{"domain": a.get("domain"), "username": a.get("username")} for a in entry.get("accounts", [])]
                }
            else:
                results["gravatar"] = {"found": False}
    except Exception:
        results["gravatar"] = {"found": False}

    results["social_search"] = {
        "google": f"https://www.google.com/search?q=%22{email}%22",
        "google_linkedin": f"https://www.google.com/search?q=%22{email}%22+site%3Alinkedin.com",
        "google_github": f"https://www.google.com/search?q=%22{email}%22+site%3Agithub.com",
        "google_facebook": f"https://www.google.com/search?q=%22{email}%22+site%3Afacebook.com",
    }
    return results


async def darkweb_search(query: str) -> dict:
    results = {}

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get("https://leakcheck.io/api/public", params={"check": query})
            if resp.status_code == 200:
                d = resp.json()
                sources = d.get("sources", [])
                clean_sources = []
                for s in sources:
                    if isinstance(s, str):
                        clean_sources.append(s)
                    elif isinstance(s, dict):
                        name = s.get("name", "Unknown")
                        date = s.get("date", "")
                        clean_sources.append(f"{name} ({date})" if date else name)
                results["leakcheck"] = {"found": d.get("found", 0), "sources": clean_sources, "query": d.get("query")}
    except Exception as e:
        results["leakcheck_error"] = str(e)

    try:
        check_url = query if query.startswith("http") else f"http://{query}"
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post("https://urlhaus-api.abuse.ch/v1/url/", data={"url": check_url})
            if resp.status_code == 200:
                d = resp.json()
                if d.get("query_status") != "no_results":
                    results["urlhaus"] = {
                        "status": d.get("query_status"),
                        "threat": d.get("threat"),
                        "url_status": d.get("url_status"),
                        "tags": d.get("tags", []),
                    }
    except Exception:
        pass

    try:
        intelx_key = os.getenv("INTELX_API_KEY", "")
        if intelx_key and intelx_key not in ["your_key_here", ""]:
            async with httpx.AsyncClient(timeout=20) as client:
                search_resp = await client.post(
                    "https://2.intelx.io/intelligent/search",
                    headers={"x-key": intelx_key, "Content-Type": "application/json"},
                    json={"term": query, "maxresults": 10, "media": 0, "target": 0, "timeout": 10}
                )
                if search_resp.status_code == 200:
                    search_id = search_resp.json().get("id")
                    if search_id:
                        import asyncio
                        await asyncio.sleep(2)
                        result_resp = await client.get(
                            "https://2.intelx.io/intelligent/search/result",
                            headers={"x-key": intelx_key},
                            params={"id": search_id, "limit": 10}
                        )
                        if result_resp.status_code == 200:
                            data = result_resp.json()
                            records = [{"name": r.get("name"), "date": r.get("date"), "bucket": r.get("bucket")} for r in data.get("records", [])[:10]]
                            results["intelx"] = {"found": len(records) > 0, "total": data.get("total", 0), "records": records}
    except Exception as e:
        results["intelx_error"] = str(e)

    results["threat_intel"] = {
        "virustotal": f"https://www.virustotal.com/gui/search/{query}",
        "threatcrowd": f"https://www.threatcrowd.org/searchApi/v2/domain/report/?domain={query}",
        "otx_alienvault": f"https://otx.alienvault.com/indicator/domain/{query}",
        "shodan": f"https://www.shodan.io/search?query={query}",
    }

    results["onion_search"] = {
        "ahmia": f"https://ahmia.fi/search/?q={query}",
        "note": "Ahmia indexes Tor hidden services. Click to search the dark web."
    }

    return results
