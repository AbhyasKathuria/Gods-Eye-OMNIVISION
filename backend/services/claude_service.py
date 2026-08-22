import os
import pathlib
from groq import Groq
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def get_groq():
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not found")
    return Groq(api_key=GROQ_API_KEY)

async def generate_identity_report(data: dict) -> str:
    try:
        client = get_groq()
        prompt = f"""
You are Gods Eye, an advanced OSINT intelligence system.
Based on the following publicly available data, generate a detailed intelligence report.

Data collected:
{data}

Generate a structured intelligence report with these sections:
1. SUBJECT SUMMARY
2. DIGITAL FOOTPRINT
3. PUBLIC PRESENCE
4. LOCATION INDICATORS
5. THREAT ASSESSMENT
6. RECOMMENDED NEXT STEPS

Format it like a real intelligence report.
Be specific, analytical and professional.
Mark all data as sourced from PUBLIC SOURCES ONLY.
"""
        response = client.chat.completions.create(
            model="groq/compound",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"ERROR GENERATING REPORT: {str(e)}"


async def analyze_cyber_threat(data: dict) -> str:
    try:
        client = get_groq()
        prompt = f"""
You are Gods Eye cyber intelligence module.
Analyze this threat data and provide a detailed assessment:

{data}

Provide:
1. THREAT LEVEL (Critical/High/Medium/Low)
2. THREAT TYPE
3. INDICATORS OF COMPROMISE
4. RECOMMENDED ACTIONS
5. SIMILAR KNOWN THREATS

Be specific and professional.
"""
        response = client.chat.completions.create(
            model="groq/compound",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"ERROR: {str(e)}"


async def analyze_news_sentiment(data: dict) -> str:
    try:
        client = get_groq()
        prompt = f"""
Analyze the sentiment and key themes from these news articles:
{data}

Provide:
1. OVERALL SENTIMENT
2. KEY THEMES
3. NOTABLE MENTIONS
4. RISK INDICATORS
"""
        response = client.chat.completions.create(
            model="groq/compound",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"ERROR: {str(e)}"


async def generate_geo_report(data: dict) -> str:
    try:
        client = get_groq()
        prompt = f"""
You are Gods Eye geo intelligence module.
Analyze this location and tracking data:

{data}

Provide:
1. LOCATION SUMMARY
2. MOVEMENT PATTERNS
3. POINTS OF INTEREST
4. RISK ASSESSMENT
"""
        response = client.chat.completions.create(
            model="groq/compound",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"ERROR: {str(e)}"


async def generate_osint_summary(query: str, data: dict) -> str:
    try:
        client = get_groq()
        prompt = f"""
You are Gods Eye OSINT module.
Target: {query}

Collected data from public sources:
{data}

Generate a complete OSINT summary including:
1. IDENTITY OVERVIEW
2. ONLINE PRESENCE
3. ASSOCIATED ENTITIES
4. TIMELINE OF ACTIVITY
5. INTELLIGENCE GAPS
6. CONFIDENCE LEVEL
"""
        response = client.chat.completions.create(
            model="groq/compound",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"ERROR: {str(e)}"