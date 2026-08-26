# 👁 GOD'S EYE — OMNIVISION Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI Build](https://github.com/AbhyasKathuria/Gods-Eye-OMNIVISION/actions/workflows/ci.yml/badge.svg)](https://github.com/AbhyasKathuria/Gods-Eye-OMNIVISION/actions)
[![Backend Tests](https://img.shields.io/badge/Tests-13%20Passed-brightgreen.svg)](backend/tests/)
[![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](backend/requirements.txt)
[![Docker Support](https://img.shields.io/badge/Docker-Supported-blue.svg)](docker-compose.yml)

> *"I can find anyone, anywhere, anytime."* — Ramsey, Fast & Furious 7

An advanced educational OSINT (Open Source Intelligence) platform inspired by the God's Eye device from the Fast & Furious franchise. Built with React + FastAPI, powered by 45+ free APIs, driven by LLaMA 3.3 70B AI, and featuring a dual-theme UI with stealth mode.

**Developed by Abhyas Kathuria — Presidency University, Bangalore**

---

## ⚖️ Scope & Responsible Use Statement

This platform is an educational Open Source Intelligence (OSINT) tool designed to demonstrate intelligence gathering, reconnaissance algorithms, and cybersecurity analysis interfaces. It aggregates public data feeds and official API interfaces.

**This software is explicitly NOT designed for, nor should it be used for:**
*   Unauthorized surveillance of non-consenting individuals.
*   Stalking, harassment, or doxxing.
*   Any activities that violate regional or international privacy laws.

By deploying or using this platform, you agree to restrict all search actions to educational environments, consented scenarios, or public/authorized research targets. The authors are not responsible for any misuse.

---

## 🚀 Quick Start

**Windows:**
```bash
# 1. Double-click LAUNCH_GODS_EYE.bat
# 2. Click "Run" on SmartScreen warning
# 3. Browser opens at http://localhost:5173
# 4. Login: admin / admin123 (First-run forces password update)
```

**macOS / Linux:**
```bash
# 1. Run in terminal: ./launch_gods_eye.sh
# 2. Browser opens at http://localhost:5173
# 3. Login: admin / admin123 (First-run forces password update)
```

**Docker (Cross-Platform Containerization):**
```bash
# 1. Build and boot all services: docker-compose up --build
# 2. Browser opens at http://localhost:5173
# 3. Login: admin / admin123 (First-run forces password update)
```

---

## 🏗️ System Architecture

```
USER BROWSER
    │
    ▼
REACT 18 + VITE (Frontend — Port 5173)
    │  Axios HTTP calls (with Map Telemetry Grounding context for AIBrain)
    ▼
FASTAPI + UVICORN (Backend — Port 8000)
    │
    ├── /auth       JWT Authentication + bcrypt Secure Hash Control
    ├── /identity   Face + OSINT Engine
    ├── /cyber      IP / Domain / Breach / Shodan / VT / URLhaus
    ├── /geo        Flights / Earthquakes / Satellites / Radio / Weather
    ├── /news       News / Reddit / Sentiment / GDELT
    ├── /visual     Image Analysis + EXIF + GPS
    ├── /ai         LLaMA 3.3 70B via Groq
    └── /recon      Username / Breach / Threat Score / Health
         │
         ▼
    50+ Curated Open & Curated APIs
    (OpenSky, VirusTotal, Shodan, NewsAPI, Groq, LeakCheck, USGS, CelesTrak, URLhaus)
```

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python FastAPI + Uvicorn (async) |
| Containerization | Docker + Docker Compose |
| Maps | Leaflet.js + OpenStreetMap |
| AI Engine | Groq API (LLaMA 3.3 70B) |
| Auth | JWT (PyJWT) + bcrypt Salted Password Hashing |
| HTTP Client | httpx with asyncio.gather() |
| Testing | pytest + pytest-asyncio |
| Image Processing | Pillow (PIL) |
| Graph Visualization | Custom SVG + CSS animations |
| Theme System | React Context API (dual theme) |
| APIs | 50+ free-tier integrations |

---

## 📁 Project Structure

```
God's_Eye/
├── LAUNCH_GODS_EYE.bat              ← Windows One-click launcher
├── launch_gods_eye.sh               ← macOS/Linux launcher script
├── STOP_GODS_EYE.bat                ← Windows stop script
├── stop_gods_eye.sh                 ← macOS/Linux stop script
├── docker-compose.yml               ← Docker multi-service composition
├── .dockerignore                    ← Build exclusions template
├── .env.example                     ← Template for API keys configuration
├── .env                             ← Local environment file (gitignored)
├── LICENSE                          ← MIT License documentation
├── SECURITY.md                      ← Security vulnerabilities reporting process
├── .github/workflows/
│   └── ci.yml                       ← CI pipeline running tests and builds on pushes/PRs
│
├── frontend/
│   ├── Dockerfile                   ← Vite static asset build environment
│   └── src/
│       ├── components/
│       │   └── dashboard/
│       │       ├── GodsEyeLogo.jsx  ← Animated blinking eye + cursor tracking
│       │       ├── Navbar.jsx       ← With stealth mode toggle
│       │       └── Sidebar.jsx      ← Theme-aware navigation
│       ├── context/
│       │   ├── AuthContext.jsx      ← JWT auth state + bcrypt resets
│       │   └── ThemeContext.jsx     ← Red/Blue theme switching
│       ├── data/
│       │   ├── earthquakes.js       ← USGS Earthquake data integration
│       │   ├── bikeshare.js         ← GBFS City Bikeshare stats
│       │   ├── satellites.js        ← Live ISS Tracking & Orbit Calculations
│       │   ├── militaryFlights.js   ← Keyless military aviation ADS-B tracks
│       │   └── radio.js             ← Geolocated Radio Browser streaming list
│       └── pages/
│           ├── Dashboard.jsx        ← Globe + live feed + module cards
│           ├── IdentityEngine.jsx   ← Face scan + person search (cleared of real portraits)
│           ├── CyberIntel.jsx       ← IP / Domain / Shodan / VT / URLhaus
│           ├── GeoTracker.jsx       ← Visual Modes (NVG, FLIR, Noir, CRT) + HUD + Layers
│           ├── NewsMonitor.jsx      ← News / Reddit / Sentiment
│           ├── VisualIntel.jsx      ← Image analysis + EXIF + GPS
│           ├── AIBrain.jsx          ← Chat + Telemetry Grounding Context
│           ├── UsernameRecon.jsx    ← 30+ platforms + breach check
│           ├── ThreatScore.jsx      ← 0-100 instant risk calculator
│           ├── APIHealth.jsx        ← Real-time API status
│           ├── IntelGraph.jsx       ← Relationship nodes graph
│           ├── Playbooks.jsx        ← 6 investigation templates
│           ├── Reports.jsx          ← PDF / JSON / TXT export
│           ├── Login.jsx            ← Secure password intercept portal
│           ├── Logs.jsx
│           └── Settings.jsx
│
└── backend/
    ├── Dockerfile                   ← Python slim backend image builder
    ├── requirements.txt             ← Managed Python dependencies
    ├── main.py
    ├── routers/
    │   ├── auth.py, identity.py, cyber.py
    │   ├── geo.py, news.py, visual.py
    │   ├── ai.py, recon.py
    ├── services/
    │   ├── auth_service.py, image_service.py
    │   ├── cyber_service.py, geo_service.py
    │   ├── news_service.py, visual_service.py
    │   ├── claude_service.py
    │   └── recon_service.py
    └── tests/
        ├── __init__.py
        ├── test_auth.py             ← Auth & bcrypt validation suite
        └── test_services.py         ← Geocoder, OSINT, & cyber mock validation suite
```

---

## 🧠 Intelligence Modules (14)

### 1. Dashboard `/`
- Animated globe with radar sweep + threat hotspots
- Live threat feed auto-updating every 2.5 seconds
- 11 module quick-access cards
- 3-tab right panel: FEED / STATUS / ACTIONS
- API status mini-dashboard
- Live IST clock

### 2. Identity Engine `/identity`
- **Recent Investigations Search History:** Local memory search history card grid (persists on reload, single-click search).
- Face upload → Luxand AI + Face++ (age, gender, emotions, beauty score)
- Yandex / Google / Bing / SauceNAO reverse image search
- FaceCheck.id facial recognition
- EXIF metadata + GPS coordinate extraction
- Person search across NewsAPI + Reddit
- AI-generated OSINT intelligence report
- *Completely clean of real people's portraits in sample fixtures, utilizing generic avatars.*

### 3. Cyber Intelligence `/cyber`
- **AlienVault OTX Pulse Checker:** Integrates Open Threat Exchange pulses for scanned IPs/domains.
- **URLhaus malware scanner:** Queries host-level threat status, active malicious URLs count, and Spamhaus blacklist metrics.
- IP tracker (IPGeolocation + IPInfo + AbuseIPDB)
- Domain investigator (WhoisXML + URLScan + Google DNS + URLhaus)
- VirusTotal scanner (URL / IP / Domain — 70+ engines)
- Shodan device explorer
- Breach checker (LeakCheck.io)
- AI threat assessment

### 4. Geo Tracker `/geo`
- **Tactical Visual Reskins:** NVG (Night Vision), FLIR (Thermal Gradients), Noir (Gray Surveillance), and CRT scanlines with animated sweeps.
- **Tactical HUD:** Interactive display tracking coordinates under the cursor, map sector centers, zoom scales, and elevation/speed rulers.
- **Micro-mobility (Bikeshare):** Austin B-cycle dock capacity and available bikes tracking (GBFS).
- **USGS Earthquakes:** Real-time seismic events mapping (last 24h).
- **Satellite Orbit Tracker:** Calculates orbital rings and track vectors for ISS, Sentinel-1A, and Hubble.
- **ADSB Military Flights:** Intercepts active military flights via adsb.lol / adsb.one.
- **Radio Broadcast Nodes:** Maps geolocated worldwide audio streams with embed players.
- **CCTV Networks:** Plottable cameras with viewshed polygon visual scopes and simulated scanline video feeds.
- **Data Integrity Badges:** Every layer carries visual status indicators (`LIVE`, `SIMULATED`, `ESTIMATE`, `THIRD-PARTY`).
- Live civilian flight tracker (OpenSky Network — 10,000+ aircraft real-time)
- Ship tracker (MarineTraffic embed)
- Location search + reverse geocode (Nominatim)
- Weather intelligence (OpenWeatherMap)
- Satellite imagery links (Google, Sentinel Hub, NASA Worldview)
- AI geo intelligence report

### 5. News Monitor `/news`
- Live top headlines by category (NewsAPI — 1000+ sources)
- News search + GDELT global database (65 languages, 150 countries)
- Reddit community monitor (public JSON)
- Twitter/X search
- Sentiment analysis (basic + AI-powered)
- MediaStack 7500+ sources

### 6. Visual Intelligence `/visual`
- Reverse image search (SauceNAO)
- Full EXIF metadata extraction
- GPS coordinate extraction with Google Maps / OSM links
- Risk level assessment (HIGH / MEDIUM / LOW)
- URL-based reverse search links

### 7. AI Brain `/ai`
- Natural language intelligence chat (LLaMA 3.3 70B)
- **Map Grounding Context:** Telemetry variables (lat, lon, zoom, active layer) flow automatically from Leaflet to Groq payload context.
- Auto-investigation: PERSON / IP / DOMAIN / LOCATION
- Multi-source data fusion
- Conversation history within session
- AI-generated intelligence reports

### 8. Username Recon `/recon`
- Check any username across 30+ platforms simultaneously
- Platforms: GitHub, Instagram, Twitter, Reddit, TikTok, LinkedIn, YouTube, Twitch, Steam, and more
- FOUND with direct profile link / NOT FOUND per platform
- Multi-source breach check: LeakCheck.io + BreachDirectory + optional HIBP
- Manual search links: DeHashed, IntelX, LeakPeek, HaveIBeenSold

### 9. Threat Score Calculator `/threat-score`
- Unified 0-100 risk score from 6 threat indicators
- **Instant — pure frontend calculation, zero API calls, zero loading**
- Visual gauge: LOW / MEDIUM / HIGH / CRITICAL
- Score breakdown per factor
- Pre-built presets for common scenarios

### 10. API Health Dashboard `/api-health`
- Real-time ping of all 18 major APIs (including Wigle, Etherscan, Blockcypher, AlienVault)
- ONLINE / DEGRADED / OFFLINE with latency (ms)
- Overall health percentage gauge
- Auto-refresh every 30 seconds
- Quota exhaustion warnings

### 11. Intelligence Graph `/graph`
- Renders Maltego-style relationship maps dynamically (IPs, Domains, Emails, Names) using animated SVGs
- Drag to pan, scroll to zoom, click nodes for details
- Animated edges and pulsing nodes
- Shows full intelligence correlation chain

### 12. OSINT Playbooks `/playbooks`
- 6 pre-built incident SOP templates with checkmarks

### 13. Wireless Airspace Recon `/wifi-recon`
- **Wigle.net Wi-Fi Mapping:** Queries nearby Wi-Fi network coordinates on an interactive dark Leaflet map.
- Extracts SSID, BSSID (MAC Address), signal strength (QoS), encryption, and channels.

### 14. Crypto Wallet Tracker `/crypto-tracker`
- **Ledger Wallet Auditing:** Connects to Etherscan (ETH) and Blockcypher (BTC) to check balances and transaction tables.
- **Transfer Route Visualizer:** Graphs visual hop relays for financial forensics.

### + Reports `/reports`
- 5 report types (Person, Cyber, Geo, News, General)
- AI-powered generation via LLaMA 3.3 70B
- **Export as PDF** — God's Eye branding + educational watermark
- **Export as JSON** — structured machine-readable
- **Export as TXT** — plain text
- 10 reports auto-saved in sidebar

---

## 🎙️ OmniVoice Speech Control (Web Speech API)

Geo Tracker features a vocal interface using the native browser speech engine. 

**Recognized Controls:**
*   *"zoom in"* / *"zoom out"*
*   *"night vision"* / *"thermal mode"* / *"standard mode"*
*   *"show earthquakes"* / *"show satellites"* / *"show radio"* / *"show flights"*
*   *"fly to [location name]"* (e.g. *"fly to Mumbai"*)
*   *"reset system"*

---

## 🎨 Dual Theme UI

| Theme | Trigger | Style |
|-------|---------|-------|
| GOD'S EYE MODE | Default | Dark red/black — high contrast OSINT |
| ANALYST MODE | Click toggle in Navbar | Professional blue/grey |

Theme saved to localStorage — persists across sessions.

---

## 🔐 Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN — full access |
| researcher | research123 | RESEARCHER — modules + logs |
| student | student123 | STUDENT — modules only |

*Note: Accessing default credentials on a first launch triggers a mandatory security update modal that blocks operations until the password is customized.*

---

## 📊 Threat Risk Scoring Model

| Signal | Max Points | Trigger |
|--------|-----------|---------|
| VirusTotal malicious engines | 30 pts | Each engine = 5pts |
| AbuseIPDB confidence score | 25 pts | Score% × 0.25 |
| Domain age (new = risky) | 15 pts | Under 7 days = 15pts, under 30 = 10pts |
| Data breach presence | 15 pts | Each breach = 3pts (max 5) |
| GPS in image metadata | 10 pts | GPS found = 10pts |
| Negative news sentiment | 5 pts | Sentiment = NEGATIVE |

**Ranges:** `0-24 = LOW` | `25-49 = MEDIUM` | `50-74 = HIGH` | `75-100 = CRITICAL`

---

## 🔐 Security Architecture

- **bcrypt Salted Cryptography**: Replaces insecure raw hashes for local account protection.
- **Startup Seeding & Git Security**: Auto-generates local user store `database/users.json` dynamically if missing, keeping it out of git history via `.gitignore`.
- **First-Run Enforcement Interception**: Prevents default login bypasses.
- **Async parallel**: `asyncio.gather()` — all APIs simultaneously, not sequentially.
- **JWT auth**: 8-hour expiry, role in token payload.
- **Key protection**: All 45+ keys in `.env` only — never in source, never in frontend.
- **Input sanitization**: All inputs sanitized before external API calls.
- **Activity logging**: Every search logged with user, timestamp (IST), module, target.
- **CORS**: Restricted to localhost:5173 and localhost:5174 only.
- **Graceful degradation**: If one API fails, others return results independently.

---

## 🌐 API Integrations (50+)

<details>
<summary>Click to expand full list</summary>

**AI**
- Groq API (LLaMA 3.3 70B) — main engine
- Google Gemini — backup AI

**Identity, Face & Breach**
- Luxand.cloud — face analysis — 500/month free
- Face++ — face detection + beauty score — free tier
- SauceNAO — reverse image search — 100/day free
- FaceCheck.id — face to social media — free credits
- LeakCheck.io — breach checker Source 1 — free key
- BreachDirectory (RapidAPI) — breach Source 2 — free tier
- HaveIBeenPwned — breach Source 3 — optional $3.50/month

**Cyber Intelligence**
- Shodan — device scanner — 100/month free
- VirusTotal — 70+ engine scanner — 500/day free
- AbuseIPDB — IP reputation — 1000/day free
- WhoisXML — domain WHOIS — 500/month free
- URLScan.io — website scanner — 5000/day free
- Censys — internet scanning — 250/month
- GreyNoise — IP noise analysis — free community
- URLhaus — malware domains database — free, keyless

**Geo & Tracking**
- OpenSky Network — live flights OAuth2 — free
- AISStream — live ships WebSocket — free
- OpenWeatherMap — weather — 1000/day free
- Nominatim / OSM — geocoding — unlimited
- Overpass API — map data — unlimited
- Sentinel Hub — satellite — 30,000 units/month
- OpenCage — geocoding backup — 2500/day
- What3Words — 3m precision — free tier
- IPGeolocation.io — IP geo — 1000/day
- IPInfo.io — IP intel
- USGS Earthquakes — seismic data — free, keyless
- CelesTrak / WhereTheISS — ISS orbital data — free, keyless
- adsb.lol / adsb.one — military flight vectors — free, keyless
- Radio Browser — geolocated radio streaming nodes — free, keyless

**News & Social**
- NewsAPI — 1000+ sources — 100/day
- GDELT Project — world events — unlimited
- MediaStack — 7500+ sources — 500/month
- Reddit (public JSON) — unlimited
- Twitter/X API — free basic
- GitHub API — 60/hour
- Telegram API

**Verification**
- AbstractAPI — Phone, Email, IP, Company

</details>

---

## 📋 Requirements

```
Python 3.10+
Node.js 18+
4GB RAM minimum (8GB recommended)
Internet connection required
```

**Python (pip):**
`fastapi uvicorn httpx python-dotenv pillow pyjwt groq bcrypt pydantic-settings pytest pytest-asyncio`

**Node (npm):**
`react vite axios react-router-dom tailwindcss`

---

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| Blank page on load | Wait 10s for Vite to compile, then refresh |
| Login loop | F12 → `localStorage.clear(); location.reload()` |
| 0 aircraft tracked | Restart backend (OpenSky OAuth2 token refresh) |
| SmartScreen warning | Click Run — or right-click → Properties → Unblock |
| Port in use | Run STOP_GODS_EYE.bat / stop_gods_eye.sh |
| API keys not loading | No spaces around `=` in .env. Restart backend. |
| BreachDirectory NO KEY | Subscribe free on rapidapi.com |
| Username recon slow | Normal — 30 sites × 3s = max 15s |
| Face scan no results | Check Luxand/Face++ monthly quota. Use JPEG. |
| Shodan error | 100/month limit exhausted |
| News feed empty | NewsAPI 100/day limit. Resets midnight UTC. |
| Intel Graph empty | Frontend only — check browser console for errors |
| Theme not switching | F12 → `localStorage.clear()` then refresh |

---

## 🗺️ Future Roadmap

| Priority | Feature |
|----------|---------|
| 🔴 High | Deepfake detection integration |
| 🔴 High | Mobile responsive design |
| 🟡 Medium | OSINT alert/monitoring system |
| 🟡 Medium | Browser extension |
| 🟢 Low | Multi-LLM support (OpenAI/Ollama) |
| 🟢 Low | Real-time collaboration |

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| Total APIs Integrated | 50+ |
| Intelligence Modules | 14 |
| Lines of Code | ~14,000+ |
| Live Aircraft Tracked | 10,000+ real-time |
| News Sources | 1,000+ |
| Platforms (Username Recon) | 30+ |
| Breach Databases | 3 sources |
| Export Formats | PDF, JSON, TXT |
| OSINT Playbooks | 6 templates |
| UI Themes | 2 (Red + Blue) |
| Build Phases | 10 phases |

---

> ⚠️ **2026 Ethics Notice:** AI-generated synthetic media (deepfakes) is increasingly common. Always cross-verify faces, quotes, and claims from multiple independent sources. God's Eye analyzes publicly available data only.

---

*"Knowledge is power. Responsible knowledge is wisdom."*

**God's Eye — OMNIVISION Intelligence Platform v2.0**
*Presidency University, Bangalore — Educational & Legal Use Only*
