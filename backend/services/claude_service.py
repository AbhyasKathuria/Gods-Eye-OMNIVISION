import os
import pathlib
import json
import re
import logging
from groq import Groq
from dotenv import load_dotenv

logger = logging.getLogger("godseye.ai")

# Robust .env discovery across project root and backend dirs
for p in [
    pathlib.Path(__file__).resolve().parents[2] / ".env",
    pathlib.Path(__file__).resolve().parents[1] / ".env",
    pathlib.Path.cwd() / ".env",
    pathlib.Path.cwd() / "backend" / ".env"
]:
    if p.exists():
        load_dotenv(dotenv_path=p)

def get_groq():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment or .env file")
    return Groq(api_key=api_key)

MODELS_CASCADE = [
    os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b"),
    "openai/gpt-oss-120b",
    "groq/compound-mini",
    "qwen/qwen3.6-27b"
]

def clean_llm_response(text: str) -> str:
    """Strips internal reasoning scratchpad tags like <think>...</think> from output."""
    if not text:
        return ""
    cleaned = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
    cleaned = re.sub(r'</?think>', '', cleaned)
    return cleaned.strip()

async def safe_groq_completion(messages: list, system: str = None, max_tokens: int = 1500, temperature: float = 0.5) -> str:
    """
    Executes a chat completion against Groq with automatic model cascade,
    dynamic token limits, 429 rate limit fallback, and think-tag filtering.
    """
    try:
        client = get_groq()
    except Exception as e:
        return f"ERROR: Groq client initialization failed: {str(e)}"

    all_messages = []
    if system:
        all_messages.append({"role": "system", "content": system})
    all_messages.extend(messages)

    candidate_models = []
    for m in MODELS_CASCADE:
        if m and m not in candidate_models:
            candidate_models.append(m)

    last_error = None
    for model in candidate_models:
        # Enforce conservative token caps for restricted models
        if "qwen3.6" in model:
            effective_tokens = min(max_tokens, 900)
        else:
            effective_tokens = min(max_tokens, 2048)

        try:
            response = client.chat.completions.create(
                model=model,
                messages=all_messages,
                max_tokens=effective_tokens,
                temperature=temperature
            )
            raw = response.choices[0].message.content or ""
            return clean_llm_response(raw)
        except Exception as e:
            err_msg = str(e)
            last_error = err_msg
            logger.warning(f"Groq completion failed on model {model}: {err_msg}. Cascading to next model...")
            continue

    # Final emergency attempt with low token limit and lightweight model
    try:
        emergency = client.chat.completions.create(
            model="groq/compound-mini",
            messages=all_messages,
            max_tokens=400,
            temperature=0.3
        )
        return clean_llm_response(emergency.choices[0].message.content or "")
    except Exception:
        pass

    return f"ERROR: AI intelligence service temporarily rate-limited. Details: {last_error}"

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
        return await safe_groq_completion(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500
        )
    except Exception as e:
        return f"ERROR GENERATING REPORT: {str(e)}"


async def analyze_cyber_threat(data: dict) -> str:
    try:
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
        return await safe_groq_completion(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1200
        )
    except Exception as e:
        return f"ERROR: {str(e)}"


async def analyze_news_sentiment(data: dict) -> str:
    try:
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
        return await safe_groq_completion(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024
        )
    except Exception as e:
        return f"ERROR: {str(e)}"


async def generate_geo_report(data: dict) -> str:
    try:
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
        return await safe_groq_completion(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024
        )
    except Exception as e:
        return f"ERROR: {str(e)}"


async def generate_osint_summary(query: str, data: dict) -> str:
    try:
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
        return await safe_groq_completion(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500
        )
    except Exception as e:
        return f"ERROR: {str(e)}"