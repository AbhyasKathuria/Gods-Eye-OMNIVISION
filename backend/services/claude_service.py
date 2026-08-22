import os
import pathlib
import json
from groq import Groq
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def get_groq():
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not found")
    return Groq(api_key=GROQ_API_KEY)

def truncate_data_dict(data, max_chars=6000) -> str:
    """
    Cleans and truncates complex threat/OSINT dictionaries to fit within 
    LLM prompt boundaries and prevent 413 'Request Entity Too Large' errors.
    """
    try:
        if not data:
            return "No data collected."
            
        raw_str = str(data)
        if len(raw_str) <= max_chars:
            return raw_str
            
        if isinstance(data, dict):
            truncated = {}
            for k, v in data.items():
                if isinstance(v, list):
                    # For lists (like news articles or transactions), keep only the first 5 records
                    truncated[k] = v[:5]
                elif isinstance(v, str):
                    # Truncate extremely long single string values
                    truncated[k] = v[:800] + "... [TRUNCATED]" if len(v) > 800 else v
                elif isinstance(v, dict):
                    # Recurse one level down
                    sub_dict = {}
                    for sk, sv in v.items():
                        if isinstance(sv, list):
                            sub_dict[sk] = sv[:5]
                        elif isinstance(sv, str):
                            sub_dict[sk] = sv[:500] + "... [TRUNCATED]" if len(sv) > 500 else sv
                        else:
                            sub_dict[sk] = sv
                    truncated[k] = sub_dict
                else:
                    truncated[k] = v
            
            res_str = json.dumps(truncated, indent=2, default=str)
            if len(res_str) > max_chars:
                return res_str[:max_chars] + "\n... [TRUNCATED DUE TO SIZE]"
            return res_str
            
        return raw_str[:max_chars] + "\n... [TRUNCATED]"
    except Exception as e:
        return f"Error truncating data: {str(e)}\nRaw preview: {str(data)[:2000]}"

async def generate_identity_report(data: dict) -> str:
    try:
        client = get_groq()
        clean_data = truncate_data_dict(data)
        prompt = f"""
You are Gods Eye, an advanced OSINT intelligence system.
Based on the following publicly available data, generate a detailed intelligence report.

Data collected:
{clean_data}

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
            model="qwen/qwen3.6-27b",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"ERROR GENERATING REPORT: {str(e)}"


async def analyze_cyber_threat(data: dict) -> str:
    try:
        client = get_groq()
        clean_data = truncate_data_dict(data)
        prompt = f"""
You are Gods Eye cyber intelligence module.
Analyze this threat data and provide a detailed assessment:

{clean_data}

Provide:
1. THREAT LEVEL (Critical/High/Medium/Low)
2. THREAT TYPE
3. INDICATORS OF COMPROMISE
4. RECOMMENDED ACTIONS
5. SIMILAR KNOWN THREATS

Be specific and professional.
"""
        response = client.chat.completions.create(
            model="qwen/qwen3.6-27b",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"ERROR: {str(e)}"


async def analyze_news_sentiment(data: dict) -> str:
    try:
        client = get_groq()
        clean_data = truncate_data_dict(data)
        prompt = f"""
Analyze the sentiment and key themes from these news articles:
{clean_data}

Provide:
1. OVERALL SENTIMENT
2. KEY THEMES
3. NOTABLE MENTIONS
4. RISK INDICATORS
"""
        response = client.chat.completions.create(
            model="qwen/qwen3.6-27b",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"ERROR: {str(e)}"


async def generate_geo_report(data: dict) -> str:
    try:
        client = get_groq()
        clean_data = truncate_data_dict(data)
        prompt = f"""
You are Gods Eye geo intelligence module.
Analyze this location and tracking data:

{clean_data}

Provide:
1. LOCATION SUMMARY
2. MOVEMENT PATTERNS
3. POINTS OF INTEREST
4. RISK ASSESSMENT
"""
        response = client.chat.completions.create(
            model="qwen/qwen3.6-27b",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"ERROR: {str(e)}"


async def generate_osint_summary(query: str, data: dict) -> str:
    try:
        client = get_groq()
        clean_data = truncate_data_dict(data)
        prompt = f"""
You are Gods Eye OSINT module.
Target: {query}

Collected data from public sources:
{clean_data}

Generate a complete OSINT summary including:
1. IDENTITY OVERVIEW
2. ONLINE PRESENCE
3. ASSOCIATED ENTITIES
4. TIMELINE OF ACTIVITY
5. INTELLIGENCE GAPS
6. CONFIDENCE LEVEL
"""
        response = client.chat.completions.create(
            model="qwen/qwen3.6-27b",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"ERROR: {str(e)}"