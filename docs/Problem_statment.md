# 👁️ GOD'S EYE (OMNIVISION) — Problem Statement & Usage Documentation

---

## 📌 1. Executive Summary & Problem Statement

### 1.1 Introduction
In the current threat landscape (2025–2026), security operations and intelligence analysis require rapid synthesis of digital footprints, infrastructure analysis, geospatial coordinates, and sentiment data. **God's Eye (OMNIVISION)** is a unified educational Open Source Intelligence (OSINT) platform engineered to solve the operational bottlenecks faced by security analysts, forensic investigators, and intelligence officers.

### 1.2 The Problem Statement
Modern OSINT and Cyber Threat Intelligence (CTI) workflows suffer from several structural deficiencies that hinder effective operations:

1. **Fragmentation of Tools & Data Silos:**
   Investigators must manually query dozens of separate websites and CLI scripts (e.g., Shodan, VirusTotal, AbuseIPDB, LeakCheck, OpenSky, search engines, and EXIF parsers). This results in high context-switching costs, duplicate data entry, and slow response times.
   
2. **Lack of Automated Data Correlation:**
   While individual indicators (such as an IP address, domain, username, email, face, or geolocated photo) are intrinsically linked, existing tools do not automatically chain these inputs. For example, resolving an email breach to a domain, looking up its WHOIS history, checking its hosting IP reputation, and scanning it for Shodan vulnerabilities is historically a manual, multi-tool process.
   
3. **The "Synthesis Gap" in generative AI:**
   Raw logs, DNS records, and API outputs are overwhelming. While generative AI models (like LLaMA 3.3 or Gemini) can synthesize data, standard workflows require analysts to manually copy and paste unstructured text, losing valuable metadata and slowing time-to-insight.
   
4. **Prohibitive Licensing & Accessibility Costs:**
   Enterprise intelligence platforms (e.g., Recorded Future, Maltego Enterprise, Silobreaker) carry massive license fees, preventing students, independent researchers, and budget-constrained Security Operations Centers (SOCs) from accessing professional-grade tooling.
   
5. **Lack of Educational Sandboxes:**
   Training junior security analysts and student researchers requires an environment that simulates advanced real-world workflows, enforces ethical boundaries (like ethics agreements), and tracks search history (logs) for accountability.

---

## 🎯 2. Target Users

God's Eye (OMNIVISION) is built with specialized modules designed for specific professional profiles within the intelligence and cybersecurity domains:

### 2.1 Cyber Threat Intelligence (CTI) Analysts
* **Objective:** Discover, analyze, and track malicious threat actors and command-and-control (C2) infrastructure.
* **How they use God's Eye:** They query suspicious IP addresses and domains using the **Cyber Intelligence** module. They monitor sentiment trends on Twitter/X or GDELT using the **News Monitor**, and correlate threat indicators using the **Intelligence Graph**.

### 2.2 Security Operations Center (SOC) & Incident Response (IR) Teams
* **Objective:** Verify and triage alerts (e.g., high-risk IP logins, suspicious file uploads, system compromise).
* **How they use God's Eye:** They run instant threat assessments through the **Threat Score Calculator**, check for compromised corporate accounts via the **Breach Checker**, and map malicious hostnames using the **Domain Investigator** to block active attacks.

### 2.3 Digital Forensics & Investigation (DFIR) Professionals
* **Objective:** Analyze digital evidence, determine origin points, and construct event timelines.
* **How they use God's Eye:** They upload suspect photographs to **Visual Intelligence** to extract camera metadata (EXIF) and GPS coordinates. They search suspected profiles using the **Identity Engine** to trace usernames and reverse-image match faces.

### 2.4 OSINT Investigators, Law Enforcement & Intelligence Officers
* **Objective:** Locate individuals, identify digital footprints, and perform geospatial monitoring.
* **How they use God's Eye:** They run automated name and reverse-image scans using the **Identity Engine**, perform bulk cross-platform lookups using **Username Recon**, and track aerial/naval assets using the **Geo Tracker** to support field operations.

### 2.5 Cybersecurity Students & Educators
* **Objective:** Learn and teach standard intelligence-gathering methodologies in a structured, legal, and ethical environment.
* **How they use God's Eye:** They follow pre-built, interactive checklists via the **OSINT Playbooks** to understand sequential investigation workflows and generate standardized PDFs using the **Reports** module.

---

## 🏗️ 3. System Architecture & Technical Specifications

God's Eye leverages a high-performance, async-parallel stack designed for local deployment:

```
                  ┌──────────────────────────────┐
                  │         USER BROWSER         │
                  └──────────────┬───────────────┘
                                 │ HTTP / JSON
                                 ▼
                  ┌──────────────────────────────┐
                  │    React 18 + Vite (5173)    │
                  └──────────────┬───────────────┘
                                 │ Axios Calls
                                 ▼
                  ┌──────────────────────────────┐
                  │   FastAPI + Uvicorn (8000)   │
                  └──────────────┬───────────────┘
                                 │
     ┌──────────────┬────────────┼─────────────┬──────────────┐
     ▼              ▼            ▼             ▼              ▼
┌─────────┐   ┌───────────┐┌───────────┐ ┌───────────┐  ┌───────────┐
│  /auth  │   │ /identity ││  /cyber   │ │   /geo    │  │   /recon  │
└─────────┘   └───────────┘└───────────┘ └───────────┘  └───────────┘
     │              │            │             │              │
     └──────────────┼────────────┼─────────────┼──────────────┘
                    │            │             │
                    ▼            ▼             ▼
             ┌────────────────────────────────────────┐
             │       45+ External APIs (Async)        │
             │  Groq (LLaMA 3.3), VirusTotal, Shodan, │
             │  OpenSky, LeakCheck, GDELT, etc.       │
             └────────────────────────────────────────┘
```

### 3.1 Tech Stack Breakdown
* **Frontend:** React 18, Vite, Tailwind CSS, Leaflet.js, OpenStreetMap, HTML5 Canvas/SVG graphs.
* **Backend:** Python 3.10+, FastAPI (Asynchronous ASGI), Uvicorn, Python PIL (Pillow), PyJWT, bcrypt, httpx.
* **AI Engine:** LLaMA 3.3 70B via Groq API (main intelligence analyst persona) and Google Gemini (backup).
* **Concurrency Model:** Uses `asyncio.gather()` to launch parallel API requests. A face scan that hits Luxand, Face++, SauceNAO, and Yandex simultaneously completes in **~5 seconds** instead of **~20 seconds** sequentially.

---

## 📖 4. Complete Usage Documentation (Module by Module)

### 4.1 Login & Authentication
* **Path:** `/login`
* **Access Control:** User credentials dictate access level:
  * `admin / admin123` (Full access, log monitoring, settings).
  * `researcher / research123` (Module access, audit logs, playbooks).
  * `student / student123` (Intelligence modules only, zero admin logs).
* **Usage:** Users must read and check the **Ethics Agreement** before initiating access. JWT tokens expire automatically after 8 hours.
* **Theme Switching (Stealth Mode):** Toggled in the Navbar.
  * *God's Eye Mode:* High-contrast black and crimson theme, modeled after military tactical interfaces.
  * *Analyst Mode:* High-contrast professional blue/grey layout, suitable for corporate or government briefing environments.

---

### 4.2 Module 1: System Dashboard
* **Path:** `/`
* **Features:**
  * Interactive 3D vector-style globe with rotating scanner sweep and real-time incident markers.
  * Live feed updating every 2.5 seconds with simulated and real threat feeds.
  * API health summary, system activity trackers, and quick navigation modules.
* **Operational Action:** Use the dashboard as the starting point of your shift to scan for globally trending cyber incidents or check overall API quota usage.

---

### 4.3 Module 2: Identity Engine
* **Path:** `/identity`
* **Features:**
  * **Face Scan:** Uploads a portrait and runs it through Luxand AI and Face++ to extract facial parameters (estimated age, gender, expressions, beauty score, emotion breakdown) and runs a parallel reverse image search using SauceNAO, Yandex, Google, and Bing.
  * **Person Keyword Search:** Queries global databases, news archives, and Reddit to find references to the target and pipes the raw text to LLaMA 3.3 to output a summarized profile.
* **Operational Action:** Identify unknown target portraits or perform background checks on physical targets.
  > [!TIP]
  > Ensure files are uploaded as JPEG or PNG. High-resolution images are automatically resized by Pillow to conserve bandwidth before API upload.

---

### 4.4 Module 3: Cyber Intelligence
* **Path:** `/cyber`
* **Features:**
  * **IP Tracker:** Fetches exact coordinates, ISP info, AbuseIPDB confidence score, and VirusTotal flags.
  * **Domain Investigator:** Pulls WHOIS registration records, name servers, Google DNS responses, and URLScan.io live page renders.
  * **Shodan Explorer:** Performs direct search queries on Shodan database (e.g., `webcam port:80` or `mongodb`).
  * **Breach Checker:** Looks up email addresses in LeakCheck.io to check for public database leaks.
* **Operational Action:** Triage security incidents by analyzing malicious IPs, investigating malicious links, or auditing vulnerable local ports.

---

### 4.5 Module 4: Geo Tracker
* **Path:** `/geo`
* **Features:**
  * **Live Flight Tracking:** Displays 10,000+ real-time aircraft positions using the OpenSky Network. Plots positions on an interactive Leaflet map. Click on any plane icon to view its Callsign, ICAO, altitude, velocity, and country of origin.
  * **Ship Tracker:** Integrates Live MarineTraffic WebSocket feed coordinates for marine surveillance.
  * **Satellite Hub:** Links to Sentinel Hub and NASA Worldview for coordinates to pull high-resolution satellite passes.
* **Operational Action:** Verify transport vectors or inspect physical coordinates for regional activity.

---

### 4.6 Module 5: News & Social Monitor
* **Path:** `/news`
* **Features:**
  * **Live Category Feed:** Categorized streams (Tech, Cyber Security, General, etc.) using NewsAPI.
  * **World Event Search (GDELT):** Searches GDELT database, which processes news from 150 countries in 65 languages.
  * **Sentiment Analysis:** Analyzes news articles, reporting POSITIVE, NEGATIVE, or NEUTRAL scores.
* **Operational Action:** Identify unfolding kinetic or digital conflicts, and monitor sentiment and news coverage regarding a client or asset.

---

### 4.7 Module 6: Visual Intelligence
* **Path:** `/visual`
* **Features:**
  * **EXIF Parser:** Parses uploaded photos to extract camera maker, model, capture timestamp, and editing software.
  * **GPS Forensics:** Extracts coordinates from image EXIF metadata and generates clickable Google Maps / OpenStreetMap mapping links.
  * **Risk Rating:** Classifies images as HIGH (GPS included), MEDIUM (EXIF metadata included), or LOW (EXIF clean).
* **Operational Action:** Analyze suspect images to confirm physical capture locations and verify timestamps.

---

### 4.8 Module 7: AI Brain & Auto Investigation
* **Path:** `/ai`
* **Features:**
  * **AI Chat:** Natural language portal where LLaMA 3.3 acts as a principal intelligence analyst.
  * **Auto Investigator:** Input a target (e.g., username, IP, location, or domain), and the system automatically queries multiple modules, merges the data, and outputs a formatted intelligence briefing.
* **Operational Action:** Synthesize data collections into operational reports instantly.

---

### 4.9 Module 8: Username Recon
* **Path:** `/recon`
* **Features:**
  * **Username Enumeration:** Scans 30+ major platforms in parallel (GitHub, Instagram, Reddit, TikTok, LinkedIn, YouTube, etc.) and lists direct profile links for found accounts.
  * **Breach Auditor:** Checks multi-source leak directories (LeakCheck, BreachDirectory, and optional HIBP) to identify compromised passwords.
* **Operational Action:** Establish the digital footprint of a target and identify vulnerable external accounts.

---

### 4.10 Module 9: Threat Score Calculator
* **Path:** `/threat-score`
* **Features:**
  * **Weighted Risk Calculation:** Combines 6 primary indicators:
    $$\text{Threat Score} = \text{VT Engines (30)} + \text{AbuseIPDB (25)} + \text{Domain Age (15)} + \text{Breaches (15)} + \text{GPS Metadata (10)} + \text{Sentiment (5)}$$
  * **Preset Configurations:** Features presets (e.g., Malicious IP, Clean Infrastructure, Phishing Domain) to demonstrate scoring categories.
  * Runs entirely on the frontend with **zero latency** and zero external API hits.
* **Operational Action:** Assign an objective, quantitative risk ranking to threat indicators before submitting them to command.

---

### 4.11 Module 10: Intelligence Graph
* **Path:** `/graph`
* **Features:**
  * **Maltego-Style Graph:** Renders an interactive relationship map of nodes. Input a target, and watch connections sprout between target details, reputation networks, and external references.
  * Animated pulsing nodes, panning/zooming, and detailed sidebars upon node click.
* **Operational Action:** Visualize complex entity relationships to present as evidence during briefing.

---

### 4.12 Module 11: OSINT Playbooks
* **Path:** `/playbooks`
* **Features:**
  * Contains 6 interactive incident playbooks: *Person Investigation*, *IP Threat Analysis*, *Domain Recon*, *Email Breach Investigation*, *Image Forensics*, and *Cyber Threat Hunt*.
  * Guided steps animate as the analyst checks them off. Click any step to jump to the required module.
* **Operational Action:** Establish standard operating procedures (SOPs) for junior SOC analysts and security team training.

---

### 4.13 Module 12: Reports
* **Path:** `/reports`
* **Features:**
  * Compiles findings from the Identity, Cyber, Geo, and News modules into structured reports.
  * **PDF Export:** Saves reports with a professional God's Eye header and educational watermark.
  * **JSON Export:** Downloads structured machine-readable JSON data for ingestion into other SIEM tools.
  * **TXT Export:** Exports plain-text files for copy-paste sharing.
* **Operational Action:** Generate standardized documentation to present to executive management, legal counsel, or law enforcement.

---

### 4.14 Module 13: Wireless Airspace Recon
* **Path:** `/wifi-recon`
* **Features:**
  * **Wigle.net Integration:** Maps nearby wireless hotspots and coordinates dynamically on an interactive dark Leaflet map.
  * Extracts SSID, BSSID (MAC Address), signal strength (QoS), encryption standards, and channels.
* **Operational Action:** Map nearby wireless signals and analyze open/secured networks during security audits.

---

### 4.15 Module 14: Crypto Wallet Tracker
* **Path:** `/crypto-tracker`
* **Features:**
  * **Etherscan & Blockcypher Integration:** Audits Ethereum and Bitcoin wallet balances and live transactions.
  * **Transfer Route Visualizer:** Graphs visual hop relays for financial forensics.
* **Operational Action:** Query blockchain ledgers and trace fund routes during financial investigations.

---

## 🔒 5. Security Architecture & Hardening

1. **API Key Isolation:**
   All 45+ API keys are stored in a local `.env` file, which is ignored by `.gitignore`. The keys are stripped of trailing `\r` carriage returns during startup using `os.getenv().strip()` to prevent issues on Windows systems.
2. **JWT Security Boundaries:**
   User sessions validate role-based access on every endpoint. Tokens carry an 8-hour expiry time. CORS is locked strictly to `http://localhost:5173` and `http://localhost:5174`.
3. **Audit Log Generation:**
   Every search is recorded in `backend/database/logs.json` with fields: `[timestamp, username, module, action, target]`. This provides administrators with complete visibility into analyst queries.

---

## 🛠️ 6. Troubleshooting & Setup Guide

### 6.1 Launch Instructions
1. Right-click [`LAUNCH_GODS_EYE.bat`](file:///c:/Users/kathu/Desktop/projects/God%27s_Eye/LAUNCH_GODS_EYE.bat), select **Properties**, check **Unblock**, and click **Apply**.
2. Double-click the bat file. This will spin up the backend (FastAPI on Port 8000) and the frontend (Vite on Port 5173) and open your browser automatically.
3. Access credentials:
   * **Admin:** `admin` / `admin123`
   * **Researcher:** `researcher` / `research123`
   * **Student:** `student` / `student123`

### 6.2 Common Issues & Resolutions
* **Blank Page on Load:** Vite takes up to 10 seconds to compile assets on the first load. Refresh the browser if it hangs.
* **Login Loop / JWT Errors:** Open the browser console (F12) and run `localStorage.clear(); location.reload()`. This clears expired sessions.
* **0 Aircraft Tracked:** The OpenSky Network session token has expired. Run [`STOP_GODS_EYE.bat`](file:///c:/Users/kathu/Desktop/projects/God%27s_Eye/STOP_GODS_EYE.bat) to terminate all server instances, then run `LAUNCH_GODS_EYE.bat` to refresh the session token.
* **Shodan Returns API Errors:** The Shodan free key is limited to 100 queries/month. Limit queries to demo scenarios only.

---

## ⚖️ 7. Ethical & Legal Guidelines

God's Eye processes **publicly available data sources only** and is built strictly for educational, research, and authorized defensive testing.

* **Permitted Uses:** Academic research, analyzing your own digital footprint, authorized defensive assessments, and educational demonstrations.
* **Prohibited Uses:** Stalking, target harassment, bypassing access credentials, commercial unauthorized scraping, or any actions violating local or international privacy laws.
* **2026 Synthetic Media Notice:** AI-generated deepfakes are increasingly common. Always verify faces, quotes, and sources using multiple independent tools. Exported reports feature a watermark reminding analysts of deepfake awareness.
