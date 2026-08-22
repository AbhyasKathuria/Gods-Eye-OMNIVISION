from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import identity, cyber, geo, news, ai, auth, visual, recon, sigint, crypto
import os

load_dotenv("../.env")

print("GROQ KEY LOADED:", bool(os.getenv("GROQ_API_KEY")))
print("NEWS KEY LOADED:", bool(os.getenv("NEWS_API_KEY")))

app = FastAPI(
    title="Gods Eye API",
    description="OMNIVISION Intelligence Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(identity.router)
app.include_router(cyber.router)
app.include_router(geo.router)
app.include_router(news.router)
app.include_router(ai.router)
app.include_router(visual.router)
app.include_router(recon.router)
app.include_router(sigint.router)
app.include_router(crypto.router)


@app.get("/")
async def root():
    return {
        "status": "Gods Eye is Online",
        "version": "1.0.0",
        "modules": ["identity", "cyber", "geo", "news", "visual", "ai", "recon"]
    }


@app.get("/health")
async def health():
    return {
        "status": "online",
        "keys": {
            "groq": bool(os.getenv("GROQ_API_KEY")),
            "news": bool(os.getenv("NEWS_API_KEY")),
            "shodan": bool(os.getenv("SHODAN_API_KEY")),
            "virustotal": bool(os.getenv("VIRUSTOTAL_API_KEY")),
            "opensky": bool(os.getenv("OPENSKY_CLIENT_ID")),
            "openweather": bool(os.getenv("OPENWEATHER_API_KEY")),
            "mediastack": bool(os.getenv("MEDIASTACK_API_KEY")),
            "twitter": bool(os.getenv("TWITTER_BEARER_TOKEN")),
            "abuseipdb": bool(os.getenv("ABUSEIPDB_API_KEY")),
            "saucenao": bool(os.getenv("SAUCENAO_API_KEY")),
            "wigle": bool(os.getenv("WIGLE_API_ENCODED")),
            "etherscan": bool(os.getenv("ETHERSCAN_API_KEY")),
            "blockcypher": bool(os.getenv("BLOCKCYPHER_TOKEN")),
            "alienvault": bool(os.getenv("ALIENVAULT_OTX_KEY")),
        }
    }
