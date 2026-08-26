from pydantic_settings import BaseSettings
from typing import Optional
import pathlib

class Settings(BaseSettings):
    # API Keys
    CLAUDE_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    
    # OSINT & Geolocation
    NOMINATIM_URL: str = "https://nominatim.openstreetmap.org"
    OVERPASS_URL: str = "https://overpass-api.de/api/interpreter"
    OPENCAGE_API_KEY: Optional[str] = None
    WHAT3WORDS_API_KEY: Optional[str] = None
    LEAFLET: str = "enabled"
    
    # Satellite
    SENTINEL_CLIENT_ID: Optional[str] = None
    SENTINEL_CLIENT_SECRET: Optional[str] = None
    SENTINEL_API_KEY: Optional[str] = None
    
    # Live Tracking
    OPENSKY_CLIENT_ID: Optional[str] = None
    OPENSKY_CLIENT_SECRET: Optional[str] = None
    AISSTREAM_API_KEY: Optional[str] = None
    
    # Cyber & Security
    SHODAN_API_KEY: Optional[str] = None
    VIRUSTOTAL_API_KEY: Optional[str] = None
    WHOISXML_API_KEY: Optional[str] = None
    ABUSEIPDB_API_KEY: Optional[str] = None
    URLSCAN_API_KEY: Optional[str] = None
    GREYNOISE_API_KEY: Optional[str] = None
    CENSYS_API_ID: Optional[str] = None
    CENSYS_API_SECRET: Optional[str] = None
    ZOOMEYE_API_KEY: Optional[str] = None
    ISMALICIOUS_API_KEY: Optional[str] = None
    INTELX_API_KEY: Optional[str] = None
    DEHASHED_API_KEY: Optional[str] = None
    URLHAUS_URL: str = "https://urlhaus-api.abuse.ch/v1"
    TALOS_ENABLED: str = "true"
    TALOS_URL: str = "https://talosintelligence.com"
    RAPIDAPI_KEY: Optional[str] = None
    
    # News & Social
    NEWS_API_KEY: Optional[str] = None
    MEDIASTACK_API_KEY: Optional[str] = None
    GDELT_URL: str = "https://api.gdeltproject.org/api/v2"
    TWITTER_CONSUMER_KEY: Optional[str] = None
    TWITTER_CONSUMER_SECRET: Optional[str] = None
    TWITTER_BEARER_TOKEN: Optional[str] = None
    GITHUB_TOKEN: Optional[str] = None
    TELEGRAM_API_ID: Optional[str] = None
    TELEGRAM_API_HASH: Optional[str] = None
    REDDIT_PUBLIC_URL: str = "https://www.reddit.com"
    
    # Identity & Face
    PIMEYES_URL: str = "https://pimeyes.com/en/user/search"
    PIMEYES_ENABLED: str = "true"
    FACECHECK_SECRET_ID: Optional[str] = None
    FACECHECK_ACCOUNT_ID: Optional[str] = None
    FACECHECK_API_KEY: Optional[str] = None
    SAUCENAO_API_KEY: Optional[str] = None
    LEAKCHECK_API_KEY: Optional[str] = None
    GOOGLE_VISION_API_KEY: Optional[str] = None
    LUXAND_API_KEY: Optional[str] = None
    FACEPP_API_KEY: Optional[str] = None
    FACEPP_API_SECRET: Optional[str] = None
    
    # Network & IP
    IPGEO_API_KEY: Optional[str] = None
    IPINFO_TOKEN: Optional[str] = None
    ABSTRACT_PHONE_KEY: Optional[str] = None
    ABSTRACT_EMAIL_KEY: Optional[str] = None
    ABSTRACT_IP_KEY: Optional[str] = None
    ABSTRACT_COMPANY_KEY: Optional[str] = None
    
    # Weather
    OPENWEATHER_API_KEY: Optional[str] = None
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    
    # Dynamic expansion
    WIGLE_API_ENCODED: Optional[str] = None
    WIGLE_API_NAME: Optional[str] = None
    WIGLE_API_TOKEN: Optional[str] = None
    ETHERSCAN_API_KEY: Optional[str] = None
    BLOCKCYPHER_TOKEN: Optional[str] = None
    ALIENVAULT_OTX_KEY: Optional[str] = None
    
    # Auth
    JWT_SECRET: str = "godseyeomnivision2025supersecret"
    
    class Config:
        env_file = str(pathlib.Path(__file__).parent.parent / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
