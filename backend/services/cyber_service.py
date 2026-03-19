import httpx
import os
import pathlib
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


async def ip_lookup(ip: str) -> dict:
    results = {}

    # IPGeolocation
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://api.ipgeolocation.io/ipgeo",
                params={
                    "apiKey": os.getenv("IPGEO_API_KEY"),
                    "ip": ip
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                results["geolocation"] = {
                    "ip": data.get("ip"),
                    "country": data.get("country_name"),
                    "country_code": data.get("country_code2"),
                    "city": data.get("city"),
                    "region": data.get("state_prov"),
                    "latitude": data.get("latitude"),
                    "longitude": data.get("longitude"),
                    "isp": data.get("isp"),
                    "org": data.get("organization"),
                    "timezone": data.get("time_zone", {}).get("name"),
                    "is_proxy": data.get("security", {}).get("is_proxy"),
                    "is_tor": data.get("security", {}).get("is_tor"),
                    "threat_score": data.get("security", {}).get("threat_score"),
                }
    except Exception as e:
        results["geolocation_error"] = str(e)

    # IPInfo
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"https://ipinfo.io/{ip}/json",
                headers={"Authorization": f"Bearer {os.getenv('IPINFO_TOKEN')}"}
            )
            if resp.status_code == 200:
                data = resp.json()
                results["ipinfo"] = {
                    "hostname": data.get("hostname"),
                    "org": data.get("org"),
                    "abuse": data.get("abuse"),
                }
    except Exception as e:
        results["ipinfo_error"] = str(e)

    # AbuseIPDB
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://api.abuseipdb.com/api/v2/check",
                headers={
                    "Key": os.getenv("ABUSEIPDB_API_KEY"),
                    "Accept": "application/json"
                },
                params={
                    "ipAddress": ip,
                    "maxAgeInDays": 90,
                    "verbose": True
                }
            )
            if resp.status_code == 200:
                data = resp.json().get("data", {})
                results["abuse"] = {
                    "abuse_score": data.get("abuseConfidenceScore"),
                    "total_reports": data.get("totalReports"),
                    "last_reported": data.get("lastReportedAt"),
                    "is_whitelisted": data.get("isWhitelisted"),
                    "usage_type": data.get("usageType"),
                    "isp": data.get("isp"),
                    "domain": data.get("domain"),
                    "country": data.get("countryCode"),
                }
    except Exception as e:
        results["abuse_error"] = str(e)

    return results


async def domain_lookup(domain: str) -> dict:
    results = {}

    # WhoisXML
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://www.whoisxmlapi.com/whoisserver/WhoisService",
                params={
                    "apiKey": os.getenv("WHOISXML_API_KEY"),
                    "domainName": domain,
                    "outputFormat": "JSON"
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                record = data.get("WhoisRecord", {})
                results["whois"] = {
                    "domain": record.get("domainName"),
                    "registrar": record.get("registrarName"),
                    "created": record.get("createdDate"),
                    "expires": record.get("expiresDate"),
                    "updated": record.get("updatedDate"),
                    "status": record.get("status"),
                    "name_servers": record.get("nameServers", {}).get("hostNames", []),
                    "registrant": record.get("registrant", {}).get("organization"),
                    "country": record.get("registrant", {}).get("country"),
                }
    except Exception as e:
        results["whois_error"] = str(e)

    # URLScan
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            submit_resp = await client.post(
                "https://urlscan.io/api/v1/scan/",
                headers={
                    "API-Key": os.getenv("URLSCAN_API_KEY"),
                    "Content-Type": "application/json"
                },
                json={"url": f"https://{domain}", "visibility": "public"}
            )
            if submit_resp.status_code == 200:
                scan_data = submit_resp.json()
                results["urlscan"] = {
                    "scan_id": scan_data.get("uuid"),
                    "result_url": scan_data.get("result"),
                    "api_url": scan_data.get("api"),
                    "visibility": scan_data.get("visibility"),
                }
    except Exception as e:
        results["urlscan_error"] = str(e)

    # DNS lookup
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://dns.google/resolve",
                params={"name": domain, "type": "A"}
            )
            if resp.status_code == 200:
                data = resp.json()
                answers = data.get("Answer", [])
                results["dns"] = {
                    "a_records": [a.get("data") for a in answers if a.get("type") == 1],
                    "status": data.get("Status"),
                    "authenticated": data.get("AD"),
                }
    except Exception as e:
        results["dns_error"] = str(e)

    return results


async def virustotal_scan(target: str, scan_type: str = "url") -> dict:
    try:
        api_key = os.getenv("VIRUSTOTAL_API_KEY")
        headers = {"x-apikey": api_key}

        async with httpx.AsyncClient(timeout=30) as client:
            if scan_type == "ip":
                resp = await client.get(
                    f"https://www.virustotal.com/api/v3/ip_addresses/{target}",
                    headers=headers
                )
            elif scan_type == "domain":
                resp = await client.get(
                    f"https://www.virustotal.com/api/v3/domains/{target}",
                    headers=headers
                )
            else:
                import base64
                url_id = base64.urlsafe_b64encode(
                    target.encode()).decode().strip("=")
                resp = await client.get(
                    f"https://www.virustotal.com/api/v3/urls/{url_id}",
                    headers=headers
                )

            if resp.status_code == 200:
                data = resp.json().get("data", {})
                attrs = data.get("attributes", {})
                stats = attrs.get("last_analysis_stats", {})
                return {
                    "status": "success",
                    "malicious": stats.get("malicious", 0),
                    "suspicious": stats.get("suspicious", 0),
                    "harmless": stats.get("harmless", 0),
                    "undetected": stats.get("undetected", 0),
                    "reputation": attrs.get("reputation"),
                    "last_analysis": attrs.get("last_analysis_date"),
                    "tags": attrs.get("tags", []),
                    "categories": attrs.get("categories", {}),
                }
            else:
                return {"error": f"VirusTotal error: {resp.status_code}"}
    except Exception as e:
        return {"error": str(e)}


async def breach_check(email: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://leakcheck.io/api/public",
                params={"check": email},
                headers={"X-API-Key": os.getenv("LEAKCHECK_API_KEY")}
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "status": "success",
                    "found": data.get("found", 0),
                    "sources": data.get("sources", []),
                    "query": data.get("query"),
                }
            else:
                return {"error": f"LeakCheck error: {resp.status_code}"}
    except Exception as e:
        return {"error": str(e)}


async def shodan_lookup(query: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(
                "https://api.shodan.io/shodan/host/search",
                params={
                    "key": os.getenv("SHODAN_API_KEY"),
                    "query": query,
                    "minify": True
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                matches = data.get("matches", [])
                results = []
                for m in matches[:10]:
                    results.append({
                        "ip": m.get("ip_str"),
                        "port": m.get("port"),
                        "org": m.get("org"),
                        "country": m.get("location", {}).get("country_name"),
                        "city": m.get("location", {}).get("city"),
                        "os": m.get("os"),
                        "hostnames": m.get("hostnames", []),
                        "product": m.get("product"),
                        "version": m.get("version"),
                        "cpe": m.get("cpe", []),
                    })
                return {
                    "status": "success",
                    "total": data.get("total", 0),
                    "results": results
                }
            else:
                return {"error": f"Shodan error: {resp.status_code} {resp.text}"}
    except Exception as e:
        return {"error": str(e)}


async def urlhaus_check(url: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://urlhaus-api.abuse.ch/v1/url/",
                data={"url": url}
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "status": data.get("query_status"),
                    "threat": data.get("threat"),
                    "url_status": data.get("url_status"),
                    "date_added": data.get("date_added"),
                    "tags": data.get("tags", []),
                    "blacklists": data.get("blacklists", {}),
                }
            else:
                return {"error": f"URLhaus error: {resp.status_code}"}
    except Exception as e:
        return {"error": str(e)}
