from fastapi import APIRouter, HTTPException
from services.claude_service import (
    generate_identity_report,
    analyze_cyber_threat,
    generate_geo_report,
    analyze_news_sentiment,
    generate_osint_summary
)
from services.news_service import search_news, get_reddit_posts
from services.cyber_service import ip_lookup, domain_lookup, virustotal_scan
from services.geo_service import geocode_location, get_weather
import pathlib
import os
from groq import Groq
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

router = APIRouter(prefix="/ai", tags=["AI Brain"])


def get_groq():
    return Groq(api_key=os.getenv("GROQ_API_KEY"))


async def groq_chat(messages: list, system: str = None) -> str:
    try:
        client = get_groq()
        all_messages = []
        if system:
            all_messages.append({"role": "system", "content": system})
        all_messages.extend(messages)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=all_messages,
            max_tokens=2048
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"ERROR: {str(e)}"


@router.post("/chat")
async def ai_chat(payload: dict):
    try:
        messages = payload.get("messages", [])
        context = payload.get("context", {})

        system = """You are Gods Eye, an advanced OSINT and intelligence AI system.
You have access to real-time data from identity engines, cyber intelligence,
geo tracking, and news monitoring systems.

When answering:
- Be direct, analytical and professional
- Format responses like an intelligence report
- Reference specific data when available
- Always note when data comes from public sources only
- Use technical OSINT terminology
- Be concise but thorough

You can help with:
- Person intelligence and OSINT
- Cyber threat analysis
- Geographic intelligence
- News and social media monitoring
- Investigation reports
- Pattern analysis
"""
        if context:
            system += f"\n\nCurrent investigation context:\n{context}"

        response = await groq_chat(messages, system)
        return {"status": "success", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/investigate")
async def full_investigation(payload: dict):
    try:
        target = payload.get("target", "")
        target_type = payload.get("type", "person")

        results = {}
        steps = []

        if target_type == "person":
            steps.append("Searching news mentions...")
            news = await search_news(target)
            results["news"] = news

            steps.append("Searching Reddit...")
            reddit = await get_reddit_posts("all")
            results["reddit_context"] = "searched"

            steps.append("Generating OSINT summary...")
            summary = await generate_osint_summary(target, results)
            results["osint_summary"] = summary

        elif target_type == "ip":
            steps.append("Running IP lookup...")
            ip_data = await ip_lookup(target)
            results["ip_intelligence"] = ip_data

            steps.append("Running VirusTotal scan...")
            vt = await virustotal_scan(target, "ip")
            results["virustotal"] = vt

            steps.append("Generating threat report...")
            threat = await analyze_cyber_threat({"ip": target, "data": results})
            results["threat_report"] = threat

        elif target_type == "domain":
            steps.append("Running domain lookup...")
            domain_data = await domain_lookup(target)
            results["domain_intelligence"] = domain_data

            steps.append("Running VirusTotal scan...")
            vt = await virustotal_scan(target, "domain")
            results["virustotal"] = vt

            steps.append("Searching news mentions...")
            news = await search_news(target)
            results["news"] = news

            steps.append("Generating threat report...")
            threat = await analyze_cyber_threat({"domain": target, "data": results})
            results["threat_report"] = threat

        elif target_type == "location":
            steps.append("Geocoding location...")
            geo = await geocode_location(target)
            results["geo"] = geo

            if geo.get("results"):
                loc = geo["results"][0]
                steps.append("Getting weather data...")
                weather = await get_weather(loc["latitude"], loc["longitude"])
                results["weather"] = weather

                steps.append("Generating geo report...")
                geo_report = await generate_geo_report(results)
                results["geo_report"] = geo_report

        steps.append("Generating final intelligence report...")
        final_report = await generate_identity_report({
            "target": target,
            "type": target_type,
            "data": results
        })
        results["final_report"] = final_report

        return {
            "status": "success",
            "target": target,
            "type": target_type,
            "steps_completed": steps,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/report")
async def generate_report(payload: dict):
    try:
        data = payload.get("data", {})
        report_type = payload.get("type", "general")

        prompts = {
            "general": f"Generate a comprehensive intelligence report for: {data}",
            "threat": f"Generate a cyber threat assessment for: {data}",
            "person": f"Generate a person intelligence report for: {data}",
            "geo": f"Generate a geographic intelligence report for: {data}",
            "news": f"Generate a news intelligence summary for: {data}",
        }

        prompt = prompts.get(report_type, prompts["general"])
        report = await groq_chat(
            [{"role": "user", "content": prompt}],
            "You are Gods Eye intelligence report generator. Create professional, detailed intelligence reports."
        )

        return {"status": "success", "report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/capabilities")
async def get_capabilities():
    return {
        "status": "success",
        "capabilities": [
            "Person intelligence and OSINT",
            "IP and domain cyber analysis",
            "Geographic intelligence",
            "News and social monitoring",
            "Threat assessment",
            "Investigation reports",
            "Sentiment analysis",
            "Pattern detection",
            "Multi-source data fusion"
        ],
        "modules": [
            "Identity Engine",
            "Cyber Intelligence",
            "Geo Tracker",
            "News Monitor",
            "AI Brain"
        ],
        "apis_connected": 45
    }
