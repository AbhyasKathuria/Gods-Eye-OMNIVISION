# 👁 GOD'S EYE — OMNIVISION Intelligence Platform

> *"I can find anyone, anywhere, anytime."* — Ramsey, Fast & Furious 7

An advanced educational OSINT (Open Source Intelligence) platform inspired by the God's Eye device from the Fast & Furious franchise. Built with React + FastAPI, powered by 45+ free APIs, driven by LLaMA 3.3 70B AI, and featuring a dual-theme UI with stealth mode.

**Developed by Abhyas Kathuria — Presidency University, Bangalore**

---

## 🚀 Quick Start

```bash
# 1. Double-click LAUNCH_GODS_EYE.bat
# 2. Click "Run" on SmartScreen warning
# 3. Browser opens at http://localhost:5173
# 4. Login: admin / admin123
```

---

## 🏗️ System Architecture

```
USER BROWSER
    │
    ▼
REACT 18 + VITE (Frontend — Port 5173)
    │  Axios HTTP calls
    ▼
FASTAPI + UVICORN (Backend — Port 8000)
    │
    ├── /auth       JWT Authentication + Role Control
    ├── /identity   Face + OSINT Engine
    ├── /cyber      IP / Domain / Breach / Shodan / VT
    ├── /geo        Flights / Ships / Weather / Satellite
    ├── /news       News / Reddit / Sentiment / GDELT
    ├── /visual     Image Analysis + EXIF + GPS
    ├── /ai         LLaMA 3.3 70B via Groq
    └── /recon      Username / Breach / Threat Score / Health
         │
         ▼
    45+ EXTERNAL APIs
    (OpenSky, VirusTotal, Shodan, NewsAPI, Groq, LeakCheck, etc.)
```

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python FastAPI + Uvicorn (async) |
| Maps | Leaflet.js + OpenStreetMap |
| AI Engine | Groq API (LLaMA 3.3 70B) |
| Auth | JWT (PyJWT) + bcrypt + Role-based access |
| HTTP Client | httpx with asyncio.gather() |
| Image Processing | Pillow (PIL) |
| Graph Visualization | Custom SVG + CSS animations |
| Theme System | React Context API (dual theme) |
| APIs | 45+ free-tier integrations |

---

## 📁 Project Structure

```
God's_Eye/
├── LAUNCH_GODS_EYE.bat              ← One-click launcher
├── STOP_GODS_EYE.bat                ← Force stop all servers
├── .env                             ← All 45+ API keys
│
├── frontend/
│   └── src/
│       ├── components/
│       │   └── dashboard/
│       │       ├── GodsEyeLogo.jsx  ← Animated blinking eye + cursor tracking
│       │       ├── Navbar.jsx       ← With stealth mode toggle
│       │       └── Sidebar.jsx      ← Theme-aware navigation
│       ├── context/
│       │   ├── AuthContext.jsx      ← JWT auth state
│       │   └── ThemeContext.jsx     ← Red/Blue theme switching
│       └── pages/
│           ├── Dashboard.jsx        ← Globe + live feed + module cards
│           ├── IdentityEngine.jsx   ← Face scan + person search
│           ├── CyberIntel.jsx       ← IP / Domain / Shodan / VT
│           ├── GeoTracker.jsx       ← Flights / Ships / Weather
│           ├── NewsMonitor.jsx      ← News / Reddit / Sentiment
│           ├── VisualIntel.jsx      ← Image analysis + EXIF + GPS
│           ├── AIBrain.jsx          ← Chat + Auto Investigation
│           ├── UsernameRecon.jsx    ← 30+ platforms + breach check
│           ├── ThreatScore.jsx      ← 0-100 instant risk calculator
│           ├── APIHealth.jsx        ← Real-time API status
│           ├── IntelGraph.jsx       ← Maltego-style node graph
│           ├── Playbooks.jsx        ← 6 investigation templates
│           ├── Reports.jsx          ← PDF / JSON / TXT export
│           ├── Login.jsx
│           ├── Logs.jsx
│           └── Settings.jsx
│
└── backend/
    ├── main.py
    ├── routers/
    │   ├── auth.py, identity.py, cyber.py
    │   ├── geo.py, news.py, visual.py
    │   ├── ai.py, recon.py
    └── services/
        ├── auth_service.py, image_service.py
        ├── cyber_service.py, geo_service.py
        ├── news_service.py, visual_service.py
        ├── claude_service.py
        └── recon_service.py
```

---

## 🧠 Intelligence Modules (12)

### 1. Dashboard `/`
- Animated globe with radar sweep + threat hotspots
- Live threat feed auto-updating every 2.5 seconds
- 9 module quick-access cards
- 3-tab right panel: FEED / STATUS / ACTIONS
- API status mini-dashboard
- Live IST clock

### 2. Identity Engine `/identity`
- Face upload → Luxand AI + Face++ (age, gender, emotions, beauty score)
- Yandex / Google / Bing / SauceNAO reverse image search
- FaceCheck.id facial recognition
- EXIF metadata + GPS coordinate extraction
- Person search across NewsAPI + Reddit
- AI-generated OSINT intelligence report

### 3. Cyber Intelligence `/cyber`
- IP tracker (IPGeolocation + IPInfo + AbuseIPDB)
- Domain investigator (WhoisXML + URLScan + Google DNS)
- VirusTotal scanner (URL / IP / Domain — 70+ engines)
- Shodan device explorer
- Breach checker (LeakCheck.io)
- AI threat assessment

### 4. Geo Tracker `/geo`
- Live flight tracker (OpenSky Network — 10,000+ aircraft real-time)
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
- Real-time ping of all 14 major APIs
- ONLINE / DEGRADED / OFFLINE with latency (ms)
- Overall health percentage gauge
- Auto-refresh every 30 seconds
- Quota exhaustion warnings

### 11. Intelligence Graph `/graph`
- Maltego-style node relationship visualization
- 4 types: PERSON / IP / DOMAIN / EMAIL
- Drag to pan, scroll to zoom, click nodes for details
- Animated edges and pulsing nodes
- Shows full intelligence correlation chain

### 12. OSINT Playbooks `/playbooks`
- 6 pre-built investigation templates:
  - Person Investigation (6 steps)
  - IP Threat Analysis (7 steps)
  - Domain Reconnaissance (7 steps)
  - Email Breach Investigation (6 steps)
  - Image Forensics (6 steps)
  - Cyber Threat Hunt (7 steps)
- Animated step execution
- Click any step to navigate directly to that module

### + Reports `/reports`
- 5 report types (Person, Cyber, Geo, News, General)
- AI-powered generation via LLaMA 3.3 70B
- **Export as PDF** — God's Eye branding + educational watermark
- **Export as JSON** — structured machine-readable
- **Export as TXT** — plain text
- 10 reports auto-saved in sidebar

---

## 🎨 Dual Theme UI

| Theme | Trigger | Style |
|-------|---------|-------|
| GOD'S EYE MODE | Default | Dark red/black — high contrast OSINT |
| ANALYST MODE | Click toggle in Navbar | Professional blue/grey |

Theme saved to localStorage — persists across sessions.

---

## 🔑 Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN — full access |
| researcher | research123 | RESEARCHER — modules + logs |
| student | student123 | STUDENT — modules only |

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

- **Async parallel**: `asyncio.gather()` — all APIs simultaneously, not sequentially
- **JWT auth**: 8-hour expiry, role in token payload
- **Key protection**: All 45+ keys in `.env` only — never in source, never in frontend
- **Input sanitization**: All inputs sanitized before external API calls
- **Activity logging**: Every search logged with user, timestamp (IST), module, target
- **CORS**: Restricted to localhost:5173 and localhost:5174 only
- **Graceful degradation**: If one API fails, others return results independently

---

## 🌐 API Integrations (45+)

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
- URLhaus — malware URLs — unlimited
- IntelX, DeHashed, ZoomEye

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

**Python:** `fastapi uvicorn httpx python-dotenv pillow pyjwt groq`

**Node:** `react vite axios react-router-dom tailwindcss`

---

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| Blank page on load | Wait 10s for Vite to compile, then refresh |
| Login loop | F12 → `localStorage.clear(); location.reload()` |
| 0 aircraft tracked | Restart backend (OpenSky OAuth2 token refresh) |
| SmartScreen warning | Click Run — or right-click → Properties → Unblock |
| Port in use | Run STOP_GODS_EYE.bat first |
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
| 🔴 High | Docker containerization (Mac/Linux support) |
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
| Total APIs Integrated | 45+ |
| Intelligence Modules | 12 |
| Lines of Code | ~12,000+ |
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

**God's Eye — OMNIVISION Intelligence Platform v1.0**
*Presidency University, Bangalore — Educational & Legal Use Only*
