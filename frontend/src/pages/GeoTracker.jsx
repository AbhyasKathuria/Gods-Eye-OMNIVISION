import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { fetchEarthquakes, plotEarthquakes } from "../data/earthquakes";
import { fetchBikeshare, plotBikeshare } from "../data/bikeshare";
import { fetchSatellites, plotSatellites } from "../data/satellites";
import { fetchMilitaryFlights, plotMilitaryFlights } from "../data/militaryFlights";
import { fetchRadioStations, plotRadioStations } from "../data/radio";

const API = "http://localhost:8000";
const TABS = [
  "LIVE FLIGHTS",
  "MILITARY FLIGHTS",
  "SHIP TRACKER",
  "EARTHQUAKES",
  "SATELLITE ORBITS",
  "BIKESHARE",
  "RADIO BROWSER",
  "CCTV MONITOR",
  "LOCATION SEARCH",
  "SATELLITE VIEW",
  "WEATHER"
];

const STYLES = ["NORMAL", "NVG", "FLIR", "NOIR", "CRT"];

const CAMERAS_FALLBACK = [
  { id: "CURATED-BLR-01", name: "Bengaluru West (Dodda Banaswadi Snapshot)", lat: 13.0145, lon: 77.64935, angle: 45, radius: 0.003, source: "windy", sourceLabel: "BENGALURU OPTICAL", feedType: "refreshing_image", streamUrl: null, imageUrl: "https://imgproxy.windy.com/_/preview/plain/current/1793900066/original.jpg?v=2", lastUpdated: "2026-09-06T03:14:36.000Z", refreshIntervalSeconds: 60, verified: true, verifiedAt: "2026-09-06T13:48:58.950Z", city: "Bengaluru", country: "India" },
  { id: "CURATED-BLR-02", name: "Bengaluru Kempegowda Intl Airport (Tarmac & Apron)", lat: 13.1986, lon: 77.7066, angle: 90, radius: 0.0035, source: "closed_circuit", sourceLabel: "BLR AIRPORT SECURITY", feedType: "satellite_telemetry", streamUrl: null, imageUrl: null, lastUpdated: null, refreshIntervalSeconds: null, verified: true, verifiedAt: "2026-09-06T13:48:58.950Z", city: "Bengaluru", country: "India" },
  { id: "CURATED-BLR-03", name: "Bengaluru Electronic City Elevated Tollway", lat: 12.8452, lon: 77.6602, angle: 135, radius: 0.0035, source: "closed_circuit", sourceLabel: "ELECTRONIC CITY NODE", feedType: "satellite_telemetry", streamUrl: null, imageUrl: null, lastUpdated: null, refreshIntervalSeconds: null, verified: true, verifiedAt: "2026-09-06T13:48:58.950Z", city: "Bengaluru", country: "India" },
  { id: "CURATED-BLR-04", name: "Bengaluru Hebbal Flyover & Outer Ring Road", lat: 13.0359, lon: 77.597, angle: 180, radius: 0.0035, source: "closed_circuit", sourceLabel: "HEBBAL JUNCTION SENSOR", feedType: "satellite_telemetry", streamUrl: null, imageUrl: null, lastUpdated: null, refreshIntervalSeconds: null, verified: true, verifiedAt: "2026-09-06T13:48:58.950Z", city: "Bengaluru", country: "India" },
  { id: "CURATED-BLR-05", name: "Bengaluru MG Road / Brigade Road Corridor", lat: 12.9742, lon: 77.6083, angle: 270, radius: 0.0035, source: "closed_circuit", sourceLabel: "MG ROAD METRO NODE", feedType: "satellite_telemetry", streamUrl: null, imageUrl: null, lastUpdated: null, refreshIntervalSeconds: null, verified: true, verifiedAt: "2026-09-06T13:48:58.950Z", city: "Bengaluru", country: "India" },
  { id: "CURATED-BLR-06", name: "Bengaluru North - Presidency University Gate (Doddaballapur Rd)", lat: 13.1678, lon: 77.5342, angle: 45, radius: 0.0035, source: "closed_circuit", sourceLabel: "PRESIDENCY SECURITY NODE", feedType: "satellite_telemetry", streamUrl: null, imageUrl: null, lastUpdated: null, refreshIntervalSeconds: null, verified: true, verifiedAt: "2026-09-06T14:00:00.000Z", city: "Bengaluru", country: "India" },
  { id: "CURATED-BLR-07", name: "Bengaluru North - Rajankunte Junction / Railway Signal", lat: 13.1812, lon: 77.5315, angle: 90, radius: 0.0035, source: "closed_circuit", sourceLabel: "RAJANKUNTE TRAFFIC SENSOR", feedType: "satellite_telemetry", streamUrl: null, imageUrl: null, lastUpdated: null, refreshIntervalSeconds: null, verified: true, verifiedAt: "2026-09-06T14:00:00.000Z", city: "Bengaluru", country: "India" },
  { id: "CURATED-BLR-08", name: "Bengaluru North - Yelahanka NES Circle & Doddaballapur Rd Junction", lat: 13.1007, lon: 77.5963, angle: 180, radius: 0.0035, source: "closed_circuit", sourceLabel: "YELAHANKA JUNCTION SENSOR", feedType: "satellite_telemetry", streamUrl: null, imageUrl: null, lastUpdated: null, refreshIntervalSeconds: null, verified: true, verifiedAt: "2026-09-06T14:00:00.000Z", city: "Bengaluru", country: "India" },
  { id: "CURATED-BLR-09", name: "Bengaluru North - Kogilu Cross / Bellary Rd (NH-44 Airport Corridor)", lat: 13.1115, lon: 77.6080, angle: 135, radius: 0.0035, source: "closed_circuit", sourceLabel: "NH-44 EXPRESSWAY SENSOR", feedType: "satellite_telemetry", streamUrl: null, imageUrl: null, lastUpdated: null, refreshIntervalSeconds: null, verified: true, verifiedAt: "2026-09-06T14:00:00.000Z", city: "Bengaluru", country: "India" },
  { id: "CURATED-MAA-01", name: "Chennai (Nungambakkam Live Cam)", lat: 13.06372, lon: 80.23031, angle: 135, radius: 0.003, source: "windy", sourceLabel: "CHENNAI OPTICAL", feedType: "refreshing_image", streamUrl: null, imageUrl: "https://imgproxy.windy.com/_/preview/plain/current/1755858646/original.jpg?v=2", lastUpdated: "2026-09-06T13:16:19.000Z", refreshIntervalSeconds: 60, verified: true, verifiedAt: "2026-09-06T13:48:58.950Z", city: "Chennai", country: "India" },
  { id: "CURATED-HYD-01", name: "Hyderabad City Center Cam", lat: 17.37528, lon: 78.47444, angle: 60, radius: 0.003, source: "windy", sourceLabel: "HYDERABAD OPTICAL", feedType: "refreshing_image", streamUrl: null, imageUrl: "https://imgproxy.windy.com/_/preview/plain/current/1793908737/original.jpg?v=2", lastUpdated: "2026-09-06T13:25:58.000Z", refreshIntervalSeconds: 60, verified: true, verifiedAt: "2026-09-06T13:48:58.950Z", city: "Hyderabad", country: "India" },
  { id: "CURATED-TRV-01", name: "Tiruvannamalai (Arunachala Hill & Temple Cam)", lat: 12.24056, lon: 79.05757, angle: 90, radius: 0.003, source: "windy", sourceLabel: "TAMIL NADU OPTICAL", feedType: "refreshing_image", streamUrl: null, imageUrl: "https://imgproxy.windy.com/_/preview/plain/current/1234953077/original.jpg?v=2", lastUpdated: "2026-09-06T12:56:16.000Z", refreshIntervalSeconds: 60, verified: true, verifiedAt: "2026-09-06T13:48:58.950Z", city: "Tiruvannamalai", country: "India" },
  { id: "CURATED-LON-01", name: "Piccadilly Circus & Shaftesbury Avenue (London)", lat: 51.5101, lon: -0.134, angle: 225, radius: 0.003, source: "tfl_jamcam", sourceLabel: "TFL TRAFFIC VIDEO", feedType: "live_video", streamUrl: "https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/00001.07380.mp4", imageUrl: "https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/00001.07380.jpg", lastUpdated: null, refreshIntervalSeconds: null, verified: true, verifiedAt: "2026-09-06T13:48:58.950Z", city: "London", country: "United Kingdom" },
  { id: "CURATED-NYC-01", name: "New York City - Manhattan Skyline & Hudson River", lat: 40.758, lon: -73.9855, angle: 180, radius: 0.003, source: "windy", sourceLabel: "NYC OPTICAL WEBCAM", feedType: "refreshing_image", streamUrl: null, imageUrl: "https://imgproxy.windy.com/_/preview/plain/current/1793878134/original.jpg?v=2", lastUpdated: "2026-09-06T13:48:58.950Z", refreshIntervalSeconds: 60, verified: true, verifiedAt: "2026-09-06T13:48:58.950Z", city: "New York", country: "United States" }
];

function DataIntegrityBadge({ state }) {
  const badgeStyles = {
    "LIVE": { color: "#00ff00", borderColor: "#00aa00", bg: "rgba(0,50,0,0.4)" },
    "SIMULATED": { color: "#ff0055", borderColor: "#cc0044", bg: "rgba(50,0,10,0.4)" },
    "ESTIMATE": { color: "#ffff00", borderColor: "#aaaa00", bg: "rgba(50,50,0,0.4)" },
    "THIRD-PARTY": { color: "#00ffff", borderColor: "#00aaaa", bg: "rgba(0,50,50,0.4)" }
  };
  
  const current = badgeStyles[state] || badgeStyles["LIVE"];
  
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 6px",
      fontSize: "9px",
      fontWeight: "bold",
      fontFamily: "Courier New",
      letterSpacing: "1px",
      border: `1px solid ${current.borderColor}`,
      background: current.bg,
      color: current.color,
      borderRadius: "2px",
      marginLeft: "8px",
      boxShadow: `0 0 4px ${current.color}`
    }}>
      {state}
    </span>
  );
}

export default function GeoTracker() {
  const [activeTab, setActiveTab] = useState("LIVE FLIGHTS");
  const [activeStyle, setActiveStyle] = useState("NORMAL");
  const [input, setInput] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Maps & Telemetry
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  const [userCoords, setUserCoords] = useState(null);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const cctvPolygonRef = useRef(null);
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const activeStyleRef = useRef(activeStyle);
  activeStyleRef.current = activeStyle;
  const loadDataRef = useRef(null);
  const cctvDebounceRef = useRef(null);
  const cctvRefreshTimerRef = useRef(null);
  const cctvAbortRef = useRef(null);
  const lastCctvFetchRef = useRef({ lat: null, lon: null, zoom: null });

  // Dual-mode basemap layers (Vector Tactical vs. High-Res Orbital Satellite)
  const vectorTileLayerRef = useRef(null);
  const satelliteTileLayerRef = useRef(null);
  const satelliteLabelsLayerRef = useRef(null);
  const [isSatelliteBasemap, setIsSatelliteBasemap] = useState(false);

  // Smart Coordinate Normalizer & Auto-Correction (handles 206139 -> 20.6139, 772090 -> 77.2090, comma pairs)
  const parseCoord = (val, isLat = true) => {
    if (val === null || val === undefined) return null;
    let sVal = String(val).trim();
    if (!sVal) return null;
    if (sVal.includes(",") || sVal.includes(" ")) {
      const parts = sVal.split(/[,\s]+/).filter(Boolean);
      if (parts.length >= 2) {
        return isLat ? parseFloat(parts[0]) : parseFloat(parts[1]);
      }
    }
    let num = parseFloat(sVal);
    if (isNaN(num)) return null;
    // Auto-insert decimal point if user omitted it (e.g. 206139 -> 20.6139)
    if (isLat && Math.abs(num) > 90) {
      const str = Math.abs(num).toString().replace(".", "");
      if (str.length >= 4) {
        const fixed = parseFloat(str.slice(0, 2) + "." + str.slice(2));
        if (fixed <= 90) return (num < 0 ? -1 : 1) * fixed;
      }
    }
    if (!isLat && Math.abs(num) > 180) {
      const str = Math.abs(num).toString().replace(".", "");
      if (str.length >= 4) {
        const fixed = parseFloat(str.slice(0, 2) + "." + str.slice(2));
        if (fixed <= 180) return (num < 0 ? -1 : 1) * fixed;
      }
    }
    return num;
  };

  // Instant Tile Layer Switcher
  const setBasemapMode = (toSatellite) => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (toSatellite) {
      if (vectorTileLayerRef.current && map.hasLayer(vectorTileLayerRef.current)) {
        map.removeLayer(vectorTileLayerRef.current);
      }
      if (satelliteTileLayerRef.current && !map.hasLayer(satelliteTileLayerRef.current)) {
        satelliteTileLayerRef.current.addTo(map);
      }
      if (satelliteLabelsLayerRef.current && !map.hasLayer(satelliteLabelsLayerRef.current)) {
        satelliteLabelsLayerRef.current.addTo(map);
      }
      setIsSatelliteBasemap(true);
    } else {
      if (satelliteTileLayerRef.current && map.hasLayer(satelliteTileLayerRef.current)) {
        map.removeLayer(satelliteTileLayerRef.current);
      }
      if (satelliteLabelsLayerRef.current && map.hasLayer(satelliteLabelsLayerRef.current)) {
        map.removeLayer(satelliteLabelsLayerRef.current);
      }
      if (vectorTileLayerRef.current && !map.hasLayer(vectorTileLayerRef.current)) {
        vectorTileLayerRef.current.addTo(map);
      }
      setIsSatelliteBasemap(false);
    }
  };
  
  // Voice Command State
  const [micActive, setMicActive] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState("");
  const [speechError, setSpeechError] = useState("");
  const [recognition, setRecognition] = useState(null);
  const getHeaderTitle = () => {
    switch (activeTab) {
      case "LIVE FLIGHTS":
        return `LIVE FLIGHT TRACKER — ${results?.total || results?.flights?.length || 0} AIRCRAFT DETECTED`;
      case "MILITARY FLIGHTS":
        return `TACTICAL AIR PATROLS — ${results?.count || 0} TARGETS ACQUIRED`;
      case "EARTHQUAKES":
        return `SEISMIC ACTIVITY MONITOR — ${results?.count || 0} RECENT EVENTS PLOTTED`;
      case "SATELLITE ORBITS":
        return `ORBITAL TELEMETRY — ${results?.count || 0} SATELLITES TRACKED`;
      case "BIKESHARE":
        return `BIKESHARE NETWORK — ${results?.count || 0} STATIONS ONLINE`;
      case "RADIO BROWSER":
        return `GLOBAL RADIO NODES — ${results?.count || 0} STATIONS LOADED`;
      case "CCTV MONITOR":
        return `TACTICAL CCTV CAMERA FEEDS — ${results?.cameras || 0} SENSORS DETECTED`;
      case "SATELLITE VIEW":
        return `HIGH-RESOLUTION ORBITAL SATELLITE IMAGERY — ESRI WORLD OPTICS`;
      default:
        return "TACTICAL GEO INTELLIGENCE MONITOR";
    }
  };

  const getHeaderBadgeState = () => {
    switch (activeTab) {
      case "LIVE FLIGHTS":
        return "LIVE";
      case "MILITARY FLIGHTS":
        return results?.flights?.[0]?.type === "LIVE" ? "LIVE" : "ESTIMATE";
      case "EARTHQUAKES":
        return results?.events?.[0]?.properties?.place ? "LIVE" : "SIMULATED";
      case "SATELLITE ORBITS":
        return "LIVE";
      case "BIKESHARE":
        return results?.stations?.[0]?.station_id ? "LIVE" : "SIMULATED";
      case "RADIO BROWSER":
        return results?.stations?.[0]?.type === "LIVE" ? "LIVE" : "SIMULATED";
      case "CCTV MONITOR":
        return results?.cameras > 0 ? "LIVE" : "SIMULATED";
      case "SATELLITE VIEW":
        return "LIVE";
      default:
        return "LIVE";
    }
  };
  // URL query updates
  const updateQueryParams = (lt, ln, zm, tb, st) => {
    const params = new URLSearchParams();
    params.set("lat", lt.toFixed(5));
    params.set("lon", ln.toFixed(5));
    params.set("z", zm.toString());
    params.set("tab", tb);
    params.set("style", st);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  // Deserialize query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const z = params.get("z");
    const latParam = params.get("lat");
    const lonParam = params.get("lon");
    const tab = params.get("tab");
    const style = params.get("style");
    
    if (tab && TABS.includes(tab.toUpperCase())) {
      setActiveTab(tab.toUpperCase());
    }
    if (style && STYLES.includes(style.toUpperCase())) {
      setActiveStyle(style.toUpperCase());
    }
    if (z) setMapZoom(parseInt(z, 10));
    if (latParam && lonParam) {
      setMapCenter([parseFloat(latParam), parseFloat(lonParam)]);
    }
  }, []);

  // Web Speech API initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';
      
      rec.onstart = () => {
        setMicActive(true);
        setSpeechError("");
      };
      
      rec.onend = () => {
        setMicActive(false);
      };
      
      rec.onerror = (e) => {
        setSpeechError("Voice error: " + e.error);
        setMicActive(false);
      };
      
      rec.onresult = async (e) => {
        const text = e.results[0][0].transcript.toLowerCase();
        setVoiceCommand(text);
        handleVoiceCommand(text);
      };
      
      setRecognition(rec);
    }
  }, []);

  const toggleMic = () => {
    if (!recognition) {
      setSpeechError("Speech recognition not supported in this browser.");
      return;
    }
    if (micActive) {
      try {
        recognition.stop();
      } catch (err) {
        console.warn("Speech stop warning:", err);
      }
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.warn("Speech start warning:", err);
      }
    }
  };

  const handleVoiceCommand = async (command) => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;
    
    if (command.includes("zoom in")) {
      map.zoomIn();
    } else if (command.includes("zoom out")) {
      map.zoomOut();
    } else if (command.includes("night vision") || command.includes("nvg")) {
      setActiveStyle("NVG");
    } else if (command.includes("thermal") || command.includes("flir")) {
      setActiveStyle("FLIR");
    } else if (command.includes("noir")) {
      setActiveStyle("NOIR");
    } else if (command.includes("crt") || command.includes("scanline")) {
      setActiveStyle("CRT");
    } else if (command.includes("normal") || command.includes("standard")) {
      setActiveStyle("NORMAL");
    } else if (command.includes("reset system") || command.includes("reset map")) {
      resetGlobe();
    } else if (command.includes("show earthquakes") || command.includes("earthquake")) {
      setActiveTab("EARTHQUAKES");
    } else if (command.includes("show flights") || command.includes("flight")) {
      setActiveTab("LIVE FLIGHTS");
    } else if (command.includes("show military") || command.includes("military")) {
      setActiveTab("MILITARY FLIGHTS");
    } else if (command.includes("show satellites") || command.includes("orbit")) {
      setActiveTab("SATELLITE ORBITS");
    } else if (command.includes("show bike") || command.includes("bikeshare")) {
      setActiveTab("BIKESHARE");
    } else if (command.includes("show radio") || command.includes("radio")) {
      setActiveTab("RADIO BROWSER");
    } else if (command.includes("show cctv") || command.includes("cctv")) {
      setActiveTab("CCTV MONITOR");
    } else if (command.startsWith("go to ") || command.startsWith("fly to ")) {
      const location = command.replace("go to ", "").replace("fly to ", "").trim();
      if (location) {
        setLoading(true);
        try {
          const res = await axios.get(`${API}/geo/geocode?query=${encodeURIComponent(location)}`);
          const results = res.data.data.results;
          if (results && results.length > 0) {
            const first = results[0];
            map.flyTo([first.latitude, first.longitude], 12);
          }
        } catch (e) {
          console.error("Voice geocoding error:", e);
        }
        setLoading(false);
      }
    }
  };

  const resetGlobe = () => {
    setActiveStyle("NORMAL");
    setMapCenter([20, 0]);
    setMapZoom(2);
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([20, 0], 2);
    }
  };

  const getMapFilter = () => {
    switch (activeStyle) {
      case "NVG":
        return "brightness(0.9) contrast(1.4) sepia(1) hue-rotate(85deg) saturate(2) grayscale(0.1)";
      case "FLIR":
        return "invert(1) hue-rotate(180deg) saturate(2.5) contrast(1.6) brightness(0.95)";
      case "NOIR":
        return "grayscale(1) contrast(1.8) brightness(1.1)";
      case "CRT":
        return "grayscale(0.4) brightness(1.1) contrast(1.3)";
      default:
        return "none";
    }
  };

  const plotFlights = (map, flightData) => {
    if (!map || !window.L) return;
    const L = window.L;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    flightData.forEach(f => {
      if (!f.latitude || !f.longitude) return;
      const icon = L.divIcon({
        html: `<div style="color:#ff0000;font-size:14px;transform:rotate(${f.heading || 0}deg)">&#9992;</div>`,
        className: "",
        iconSize: [20, 20],
      });
      const marker = L.marker([f.latitude, f.longitude], { icon })
        .bindPopup(`
          <div style="background:#0d0000;color:#ff2222;font-family:Courier New;font-size:11px;padding:8px;border:1px solid #ff0000">
            <div style="color:#ff0000;margin-bottom:4px">${f.callsign || f.icao || "UNKNOWN"}</div>
            <div>COUNTRY: ${f.country || "N/A"}</div>
            <div>ALT: ${f.altitude ? Math.round(f.altitude) + "m" : "N/A"}</div>
            <div>SPEED: ${f.velocity ? Math.round(f.velocity) + "m/s" : "N/A"}</div>
            <div>HEADING: ${f.heading ? Math.round(f.heading) + "deg" : "N/A"}</div>
            <div>ON GROUND: ${f.on_ground ? "YES" : "NO"}</div>
          </div>
        `)
        .addTo(map);
      markersRef.current.push(marker);
    });
  };

  const plotCctvCameras = (map, camerasList, L) => {
    if (!map || !L) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (cctvPolygonRef.current) {
      cctvPolygonRef.current.remove();
      cctvPolygonRef.current = null;
    }
    
    const cameras = camerasList || [];
    
    cameras.forEach(cam => {
      const source = cam.source || "CURATED";
      const sourceLabel = cam.sourceLabel || (source === "WINDY" ? "WINDY LIVE" : source === "TFL" ? "TFL TRAFFIC" : source === "OSM" ? "OSM SENSOR" : "CCTV FEED");
      const badgeColor = source === "WINDY" ? "#00e5ff" : source === "TFL" ? "#00ff66" : source === "OSM" ? "#ff0055" : "#ffaa00";

      const icon = L.divIcon({
        html: `<div style="color:${badgeColor};font-size:16px;font-weight:bold;text-shadow:0 0 6px ${badgeColor}">📹</div>`,
        className: "",
        iconSize: [20, 20],
      });
      
      const marker = L.marker([cam.lat, cam.lon], { icon }).addTo(map);
      markersRef.current.push(marker);

      const feedType = cam.feedType || (
        (cam.streamType === "youtube" || (cam.videoUrl && (cam.videoUrl.includes("youtube.com") || cam.videoUrl.includes("youtu.be")))) ? "live_youtube" :
        (cam.streamType === "hls" || cam.streamType === "mp4" || (cam.videoUrl && (cam.videoUrl.includes(".m3u8") || cam.videoUrl.includes(".mp4")))) ? "live_video" :
        "refreshing_image"
      );

      const streamUrl = cam.streamUrl || cam.videoUrl;
      const imageUrl = cam.imageUrl || cam.realImg || cam.thumbnail;
      const isVerified = cam.verified !== false;
      const isHls = feedType === "live_video" && Boolean(streamUrl) && streamUrl.includes(".m3u8");

      let mediaTag = "";
      const fallbackSatAction = `this.style.display='none';const s=document.getElementById('cctv-sat-${cam.id}');if(s)s.style.display='block';const bs=document.getElementById('cctv-btn-sat-${cam.id}');if(bs){bs.style.background='#00ffff';bs.style.color='#000';}const br=document.getElementById('cctv-btn-real-${cam.id}');if(br){br.style.background='transparent';br.style.color='${badgeColor}';}const bg=document.getElementById('cctv-feedbadge-${cam.id}');if(bg){bg.innerText='● SATELLITE BACKUP';bg.style.color='#00ffff';bg.style.borderColor='#00aaaa';}`;
      if (feedType === "live_video" && streamUrl) {
        const posterAttr = imageUrl ? `poster="${imageUrl}"` : "";
        const fallbackAction = imageUrl
          ? `if('${imageUrl}'){this.outerHTML='<img id=\\'cctv-media-${cam.id}\\' src=\\'${imageUrl}\\' style=\\'display:block;width:100%;height:100%;object-fit:cover;\\' />';}else{${fallbackSatAction}}`
          : fallbackSatAction;
        mediaTag = `<video id="cctv-media-${cam.id}" autoplay loop muted playsinline preload="auto" ${posterAttr} style="display:block;width:100%;height:100%;object-fit:cover;" onerror="${fallbackAction}"><source src="${streamUrl}" type="${isHls ? 'application/x-mpegURL' : 'video/mp4'}" /></video>`;
      } else if (feedType === "refreshing_image" && imageUrl) {
        mediaTag = `<img id="cctv-media-${cam.id}" src="${imageUrl}" style="display:block;width:100%;height:100%;object-fit:cover;" onerror="${fallbackSatAction}" />`;
      } else if (feedType === "live_youtube" && streamUrl) {
        mediaTag = `<iframe id="cctv-media-${cam.id}" src="${streamUrl}" style="display:block;width:100%;height:100%;border:none;pointer-events:auto;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="eager"></iframe>`;
      } else {
        mediaTag = `<div id="cctv-media-${cam.id}" style="display:none"></div>`;
      }

      // Type-specific honest badge
      let feedTypeBadge = "";
      if (feedType === "live_video") {
        feedTypeBadge = `<div id="cctv-feedbadge-${cam.id}" style="position:absolute;top:6px;left:6px;background:rgba(0,0,0,0.85);color:#00ff66;font-size:9px;font-weight:bold;padding:2px 6px;border:1px solid #00aa44;z-index:15;pointer-events:none;letter-spacing:0.5px">● LIVE</div>`;
      } else if (feedType === "refreshing_image") {
        feedTypeBadge = `<div id="cctv-feedbadge-${cam.id}" style="position:absolute;top:6px;left:6px;background:rgba(0,0,0,0.85);color:#00e5ff;font-size:8px;font-weight:bold;padding:2px 6px;border:1px solid #0088aa;z-index:15;pointer-events:none;letter-spacing:0.5px">STILL SNAPSHOT</div>`;
      } else if (feedType === "live_youtube") {
        feedTypeBadge = `<div id="cctv-feedbadge-${cam.id}" style="position:absolute;top:6px;left:6px;background:rgba(0,0,0,0.85);color:#ff0055;font-size:8px;font-weight:bold;padding:2px 6px;border:1px solid #cc0044;z-index:15;pointer-events:none;letter-spacing:0.5px">LIVE VIA YOUTUBE</div>`;
      } else {
        feedTypeBadge = `<div id="cctv-feedbadge-${cam.id}" style="position:absolute;top:6px;left:6px;background:rgba(0,0,0,0.85);color:#00ffff;font-size:8px;font-weight:bold;padding:2px 6px;border:1px solid #00aaaa;z-index:15;pointer-events:none;letter-spacing:0.5px">● SATELLITE TELEMETRY</div>`;
      }

      const verifiedBadge = !isVerified ? `<span style="background:rgba(255,170,0,0.18);color:#ffaa00;border:1px solid #cc8800;padding:1px 5px;font-size:8px;margin-left:6px;border-radius:2px;font-weight:bold">UNVERIFIED SOURCE</span>` : "";
      const hasLiveStream = Boolean(streamUrl || imageUrl);

      const satUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${cam.lon - 0.003},${cam.lat - 0.002},${cam.lon + 0.003},${cam.lat + 0.002}&bboxSR=4326&imageSR=4326&size=604,360&f=image`;
      const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${cam.lat},${cam.lon}`;

      const buttonsHtml = hasLiveStream ? `
        <div id="cctv-btn-real-${cam.id}" style="flex:1;text-align:center;padding:5px 2px;background:${badgeColor};color:#000;cursor:pointer;font-weight:bold;transition:all 0.2s">📹 CAMERA VIEW</div>
        <div id="cctv-btn-sat-${cam.id}" style="flex:1;text-align:center;padding:5px 2px;background:transparent;color:#00ffff;cursor:pointer;font-weight:bold;transition:all 0.2s">🛰️ SATELLITE</div>
        <div id="cctv-btn-tac-${cam.id}" style="flex:1;text-align:center;padding:5px 2px;background:transparent;color:${badgeColor};cursor:pointer;font-weight:bold;transition:all 0.2s">🎯 RADAR</div>
      ` : `
        <div id="cctv-btn-sat-${cam.id}" style="flex:1;text-align:center;padding:5px 2px;background:#00ffff;color:#000;cursor:pointer;font-weight:bold;transition:all 0.2s">🛰️ SATELLITE VIEW</div>
        <div id="cctv-btn-tac-${cam.id}" style="flex:1;text-align:center;padding:5px 2px;background:transparent;color:${badgeColor};cursor:pointer;font-weight:bold;transition:all 0.2s">🎯 TACTICAL RADAR</div>
      `;

      marker.bindPopup(`
        <div style="background:#050505;color:#00ff00;font-family:Courier New;font-size:10px;padding:10px;border:1px solid ${badgeColor};width:320px;box-shadow:0 0 16px rgba(0,0,0,0.95)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <div style="display:flex;align-items:center">
              <span style="color:${badgeColor};font-weight:bold;letter-spacing:1px;font-size:9px">[${sourceLabel}]</span>
              ${verifiedBadge}
            </div>
            <span style="font-size:8px;color:#888">${cam.country || cam.city || "ONLINE"}</span>
          </div>
          <div style="font-size:8px;color:#777;margin-bottom:2px">ID: ${cam.id}</div>
          <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:bold;color:#fff;margin-bottom:2px;font-size:11px" title="${cam.name}">
            ${cam.name}
          </div>
          ${!hasLiveStream ? `<div style="font-size:8px;color:#00ff88;margin-bottom:6px;letter-spacing:0.5px">🔒 CLOSED-CIRCUIT LAN SENSOR (NO PUBLIC WEB STREAM)</div>` : `<div style="font-size:8px;color:#888;margin-bottom:6px">DIRECT OPTICAL STREAM</div>`}
          
          <!-- View Toggles -->
          <div style="display:flex;margin:5px 0;border:1px solid #333;font-size:8px;background:#0d0d0d;font-family:Courier New">
            ${buttonsHtml}
          </div>
          
          <div style="margin-top:5px;position:relative;height:180px;background:#000;overflow:hidden;border:1px solid #222">
            <canvas id="cctv-canvas-${cam.id}" width="302" height="180" style="display:none"></canvas>
            ${mediaTag}
            <img id="cctv-sat-${cam.id}" src="${satUrl}" alt="Satellite View" style="display:${hasLiveStream ? 'none' : 'block'};width:100%;height:100%;object-fit:cover;" />
            
            <div id="cctv-fallback-${cam.id}" style="display:none;position:absolute;inset:0;background:#0d0d0d;color:#888;align-items:center;justify-content:center;flex-direction:column;font-family:Courier New;font-size:10px;text-align:center;padding:12px;z-index:12">
              <div style="font-size:18px;color:#ff5555;margin-bottom:6px">⚠</div>
              <div style="color:#aaa;font-weight:bold;letter-spacing:1px">FEED UNAVAILABLE</div>
              <div style="color:#555;font-size:8px;margin-top:4px">Sensor currently offline or stream unreachable</div>
            </div>

            <!-- Scanline layer -->
            <div style="position:absolute;inset:0;background:linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.22) 50%);background-size:100% 4px;pointer-events:none;z-index:10;"></div>

            <!-- Type badge -->
            ${feedTypeBadge}

            <!-- Separate system clock -->
            <div id="cctv-clock-${cam.id}" style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,0.85);color:#888;font-size:8px;padding:2px 5px;border:1px solid #333;z-index:15;pointer-events:none;font-family:Courier New">SYS: --:--:--</div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:8px;color:#888">
            <span id="cctv-refresh-${cam.id}" style="color:#00ff00;cursor:pointer;text-decoration:underline">🔄 REFRESH</span>
            <a href="${streetViewUrl}" target="_blank" rel="noreferrer" style="color:#ffaa00;text-decoration:none;font-weight:bold;border:1px solid #664400;padding:1px 4px;border-radius:2px;background:rgba(255,170,0,0.1)">🌐 STREET VIEW ↗</a>
            <span style="color:#666">LAT: ${cam.lat.toFixed(3)} LON: ${cam.lon.toFixed(3)}</span>
            ${cam.webcamUrl ? `<a href="${cam.webcamUrl}" target="_blank" rel="noreferrer" style="color:#00e5ff;text-decoration:none;font-weight:bold">SOURCE ↗</a>` : `<span style="color:#555">PHYSICAL SENSOR</span>`}
          </div>
        </div>
      `);

      marker.on("popupopen", () => {
        if (cctvPolygonRef.current) {
          cctvPolygonRef.current.remove();
        }
        
        const lat = cam.lat;
        const lon = cam.lon;
        const startRad = (cam.angle - 22.5) * Math.PI / 180;
        const endRad = (cam.angle + 22.5) * Math.PI / 180;
        
        const pt1 = [lat + cam.radius * Math.sin(startRad), lon + cam.radius * Math.cos(startRad)];
        const pt2 = [lat + cam.radius * Math.sin(endRad), lon + cam.radius * Math.cos(endRad)];
        
        const polygon = L.polygon([[lat, lon], pt1, pt2], {
          color: badgeColor,
          fillColor: badgeColor,
          fillOpacity: 0.22,
          weight: 1
        }).addTo(map);
        
        cctvPolygonRef.current = polygon;

        // Toggle and live refresh handling
        setTimeout(() => {
          const btnTac = document.getElementById(`cctv-btn-tac-${cam.id}`);
          const btnReal = document.getElementById(`cctv-btn-real-${cam.id}`);
          const btnSat = document.getElementById(`cctv-btn-sat-${cam.id}`);
          const canvas = document.getElementById(`cctv-canvas-${cam.id}`);
          const media = document.getElementById(`cctv-media-${cam.id}`);
          const sat = document.getElementById(`cctv-sat-${cam.id}`);
          const btnRefresh = document.getElementById(`cctv-refresh-${cam.id}`);

          // Real-time ticking updates
          const updateStatus = () => {
            const clk = document.getElementById(`cctv-clock-${cam.id}`);
            if (clk) {
              const now = new Date();
              clk.textContent = `SYS: ${now.toLocaleTimeString()}`;
            }
            const fr = document.getElementById(`cctv-freshness-${cam.id}`);
            if (fr) {
              if (cam.lastUpdated) {
                const diffSec = Math.max(0, Math.floor((Date.now() - new Date(cam.lastUpdated).getTime()) / 1000));
                if (diffSec < 60) fr.textContent = `Updated ${diffSec}s ago`;
                else if (diffSec < 3600) fr.textContent = `Updated ${Math.floor(diffSec / 60)}m ago`;
                else fr.textContent = `Updated ${Math.floor(diffSec / 3600)}h ago`;
              } else {
                fr.textContent = "STILL SNAPSHOT";
              }
            }
          };
          updateStatus();
          const tickerInterval = setInterval(updateStatus, 1000);

          const fallbackToSatellite = () => {
            if (media) media.style.display = "none";
            if (sat) sat.style.display = "block";
            if (canvas) canvas.style.display = "none";
            if (btnSat) {
              btnSat.style.background = "#00ffff";
              btnSat.style.color = "#000";
            }
            if (btnReal) {
              btnReal.style.background = "transparent";
              btnReal.style.color = badgeColor;
            }
            const fb = document.getElementById(`cctv-fallback-${cam.id}`);
            if (fb) fb.style.display = "none";
            const badge = document.getElementById(`cctv-feedbadge-${cam.id}`);
            if (badge) {
              badge.innerText = "● SATELLITE BACKUP (OPTICAL OFFLINE)";
              badge.style.color = "#00ffff";
              badge.style.borderColor = "#00aaaa";
            }
          };

          // Video stream initialization (HLS and native MP4)
          if (media && media.tagName === "VIDEO") {
            media.defaultMuted = true;
            media.muted = true;
            media.playsInline = true;
            media.setAttribute("muted", "");
            media.setAttribute("playsinline", "");
            media.setAttribute("autoplay", "");

            if (isHls) {
              if (window.Hls && window.Hls.isSupported()) {
                try {
                  const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 30
                  });
                  hls.loadSource(streamUrl);
                  hls.attachMedia(media);
                  hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                    const playPromise = media.play();
                    if (playPromise !== undefined) {
                      playPromise.catch(() => {
                        media.muted = true;
                        media.play().catch(() => {});
                      });
                    }
                  });
                  hls.on(window.Hls.Events.ERROR, (e, data) => {
                    if (data && data.fatal) {
                      try { hls.destroy(); } catch (hlsErr) {}
                      if (imageUrl) {
                        media.outerHTML = `<img id="cctv-media-${cam.id}" src="${imageUrl}" style="display:block;width:100%;height:100%;object-fit:cover;" />`;
                      } else {
                        fallbackToSatellite();
                      }
                    }
                  });
                } catch (err) {
                  fallbackToSatellite();
                }
              } else if (media.canPlayType("application/vnd.apple.mpegurl")) {
                media.src = streamUrl;
                media.play().catch(() => {});
              }
            } else {
              // Standard native MP4 video loop
              const p = media.play();
              if (p !== undefined) {
                p.catch(() => {
                  media.muted = true;
                  media.play().catch(() => {});
                });
              }
            }
          }

          // YouTube iframe autoplay and error listener
          if (media && media.tagName === "IFRAME") {
            const triggerYtPlay = () => {
              try {
                media.contentWindow?.postMessage(JSON.stringify({ event: "listening" }), "*");
                media.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "mute", args: [] }), "*");
                media.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "playVideo", args: [] }), "*");
              } catch (e) {}
            };

            media.addEventListener("load", () => {
              triggerYtPlay();
              setTimeout(triggerYtPlay, 200);
              setTimeout(triggerYtPlay, 600);
              setTimeout(triggerYtPlay, 1500);
            });
            triggerYtPlay();
            setTimeout(triggerYtPlay, 300);
            setTimeout(triggerYtPlay, 1000);

            const ytMsgHandler = (evt) => {
              try {
                const data = typeof evt.data === "string" ? JSON.parse(evt.data) : evt.data;
                if (data && (data.event === "onError" || (data.info && data.info.playerState === -1 && data.info.error))) {
                  fallbackToSatellite();
                }
              } catch (err) {}
            };
            window.addEventListener("message", ytMsgHandler);
          }

          // Live frame auto-refresh timer for image webcams
          if (cctvRefreshTimerRef.current) clearInterval(cctvRefreshTimerRef.current);
          if (media && media.tagName === "IMG" && imageUrl) {
            const base = imageUrl.split("?")[0];
            const intervalSec = cam.refreshIntervalSeconds || 60;
            cctvRefreshTimerRef.current = setInterval(() => {
              if (!document.getElementById(`cctv-media-${cam.id}`)) {
                clearInterval(cctvRefreshTimerRef.current);
                clearInterval(tickerInterval);
                return;
              }
              media.src = `${base}?t=${Date.now()}`;
              cam.lastUpdated = new Date().toISOString();
              updateStatus();
            }, intervalSec * 1000);
          }

          if (btnRefresh) {
            btnRefresh.onclick = () => {
              if (media && media.tagName === "IMG" && imageUrl) {
                const base = imageUrl.split("?")[0];
                media.src = `${base}?t=${Date.now()}`;
                cam.lastUpdated = new Date().toISOString();
                updateStatus();
              } else if (media && media.tagName === "VIDEO") {
                media.currentTime = 0;
                media.play().catch(() => {});
              } else if (media && media.tagName === "IFRAME") {
                const currentSrc = media.src;
                media.src = currentSrc;
              }
            };
          }

          if (btnSat && sat && media && canvas) {
            btnSat.onclick = () => {
              sat.style.display = "block";
              media.style.display = "none";
              canvas.style.display = "none";
              const fb = document.getElementById(`cctv-fallback-${cam.id}`);
              if (fb) fb.style.display = "none";
              btnSat.style.background = "#00ffff";
              btnSat.style.color = "#000";
              if (btnReal) {
                btnReal.style.background = "transparent";
                btnReal.style.color = badgeColor;
              }
              if (btnTac) {
                btnTac.style.background = "transparent";
                btnTac.style.color = badgeColor;
              }
            };
          }

          if (btnReal && sat && media && canvas) {
            btnReal.onclick = () => {
              media.style.display = "block";
              sat.style.display = "none";
              canvas.style.display = "none";
              btnReal.style.background = badgeColor;
              btnReal.style.color = "#000";
              if (btnSat) {
                btnSat.style.background = "transparent";
                btnSat.style.color = "#00ffff";
              }
              if (btnTac) {
                btnTac.style.background = "transparent";
                btnTac.style.color = badgeColor;
              }
            };
          }

          if (btnTac && sat && media && canvas) {
            btnTac.onclick = () => {
              canvas.style.display = "block";
              media.style.display = "none";
              sat.style.display = "none";
              const fb = document.getElementById(`cctv-fallback-${cam.id}`);
              if (fb) fb.style.display = "none";
              btnTac.style.background = badgeColor;
              btnTac.style.color = "#000";
              if (btnReal) {
                btnReal.style.background = "transparent";
                btnReal.style.color = badgeColor;
              }
              if (btnSat) {
                btnSat.style.background = "transparent";
                btnSat.style.color = "#00ffff";
              }
            };
          }

          // Initialize canvas animation inside the popup
          if (canvas) {
            const ctx = canvas.getContext("2d");
            let animationId;
            
            const targets = [
              { x: Math.random() * 280, y: Math.random() * 150, dx: (Math.random() - 0.5) * 1.5, dy: (Math.random() - 0.5) * 1.5, label: "TGT-ALPHA" },
              { x: Math.random() * 280, y: Math.random() * 150, dx: (Math.random() - 0.5) * 1.5, dy: (Math.random() - 0.5) * 1.5, label: "TGT-BRAVO" }
            ];

            const draw = () => {
              if (!document.getElementById(`cctv-canvas-${cam.id}`)) {
                cancelAnimationFrame(animationId);
                return;
              }
              
              // Base tactical dark background
              ctx.fillStyle = "#020f02";
              ctx.fillRect(0, 0, 302, 180);
              
              // Dynamic grain noise
              ctx.fillStyle = "rgba(0, 255, 0, 0.06)";
              for (let i = 0; i < 50; i++) {
                ctx.fillRect(Math.random() * 302, Math.random() * 180, 1, 1);
              }
              
              // Tactical crosshair scope grid lines
              ctx.strokeStyle = "rgba(0, 255, 0, 0.12)";
              ctx.lineWidth = 0.5;
              
              for (let x = 30; x < 302; x += 30) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 180); ctx.stroke();
              }
              for (let y = 30; y < 180; y += 30) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(302, y); ctx.stroke();
              }
              
              // Center crosshair
              ctx.strokeStyle = "rgba(0, 255, 0, 0.25)";
              ctx.beginPath(); ctx.moveTo(151, 80); ctx.lineTo(151, 100); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(141, 90); ctx.lineTo(161, 90); ctx.stroke();
              ctx.beginPath(); ctx.arc(151, 90, 40, 0, 2 * Math.PI); ctx.stroke();

              // Targets simulation
              targets.forEach(t => {
                t.x += t.dx;
                t.y += t.dy;
                if (t.x < 15 || t.x > 280) t.dx *= -1;
                if (t.y < 20 || t.y > 155) t.dy *= -1;
                
                ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
                ctx.strokeRect(t.x - 6, t.y - 6, 12, 12);
                
                ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
                ctx.font = "8px monospace";
                ctx.fillText(t.label, t.x + 10, t.y - 2);
                ctx.fillText("LOCK: 99%", t.x + 10, t.y + 7);
              });
              
              // Radar sweep bar line
              const scanY = (Date.now() / 25) % 180;
              ctx.strokeStyle = "rgba(0, 255, 0, 0.4)";
              ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(302, scanY); ctx.stroke();
              
              // System labels
              ctx.fillStyle = "#00ff00";
              ctx.font = "8px Courier New";
              ctx.fillText("SYS: SECURE_SENSOR_GRID", 8, 14);
              ctx.fillText("AZ: " + Math.round((Date.now() / 150) % 360) + "°", 240, 14);
              ctx.fillText("REC 🔴", 8, 172);
              ctx.fillText(new Date().toLocaleTimeString(), 220, 172);
              
              animationId = requestAnimationFrame(draw);
            };
            draw();
          }
        }, 50);
      });

      marker.on("popupclose", () => {
        if (cctvRefreshTimerRef.current) {
          clearInterval(cctvRefreshTimerRef.current);
          cctvRefreshTimerRef.current = null;
        }
        if (cctvPolygonRef.current) {
          cctvPolygonRef.current.remove();
          cctvPolygonRef.current = null;
        }
      });
    });
  };

  const createMap = () => {
    if (!mapRef.current || leafletMapRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, {
      center: mapCenter,
      zoom: mapZoom,
      zoomControl: true,
    });

    // Standard dark tactical vector layer
    const vectorLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "OpenStreetMap",
      className: "vector-tile",
      maxZoom: 19
    });
    vectorTileLayerRef.current = vectorLayer;

    // High-resolution natural-color orbital satellite layer (Esri World Imagery)
    const satLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Esri World Imagery, Maxar, Earthstar Geographics",
      className: "satellite-tile",
      maxZoom: 19
    });
    satelliteTileLayerRef.current = satLayer;

    // Tactical boundary lines & road labels overlay
    const satLabels = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", {
      className: "satellite-label-tile",
      maxZoom: 19
    });
    satelliteLabelsLayerRef.current = satLabels;

    if (activeTabRef.current === "SATELLITE VIEW") {
      satLayer.addTo(map);
      satLabels.addTo(map);
      setIsSatelliteBasemap(true);
    } else {
      vectorLayer.addTo(map);
      setIsSatelliteBasemap(false);
    }
    
    leafletMapRef.current = map;

    // Redraw map tiles after rendering layout
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
    
    // Map event listeners
    map.on("mousemove", (e) => {
      const el = document.getElementById("hud-cursor-coords");
      if (el) {
        el.textContent = `CURSOR: [${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}]`;
      }
    });
    
    map.on("moveend", () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      setMapCenter([center.lat, center.lng]);
      setMapZoom(zoom);
      
      // Update localStorage for AIBrain context
      localStorage.setItem("ge_map_center", JSON.stringify({ lat: center.lat, lon: center.lng }));
      localStorage.setItem("ge_map_zoom", zoom.toString());
      localStorage.setItem("ge_map_tab", activeTabRef.current);
      
      // Update URL query params
      updateQueryParams(center.lat, center.lng, zoom, activeTabRef.current, activeStyleRef.current);

      // Debounced camera reload when panning/zooming in CCTV MONITOR mode
      if (activeTabRef.current === "CCTV MONITOR") {
        const last = lastCctvFetchRef.current;
        const zoomDelta = last.zoom !== null ? Math.abs(zoom - last.zoom) : 99;
        const distDelta = (last.lat !== null && last.lon !== null)
          ? Math.sqrt(Math.pow(center.lat - last.lat, 2) + Math.pow(center.lng - last.lon, 2))
          : 99;

        // If in global view (zoom <= 4) and already loaded, skip reloading on minor pans
        if (zoom <= 4 && last.zoom !== null && last.zoom <= 4 && distDelta < 5.0) {
          return;
        }

        // Only reload if zoom changed or moved significantly (> 1.2 degrees)
        if (zoomDelta < 1 && distDelta < 1.2) {
          return;
        }

        if (cctvDebounceRef.current) clearTimeout(cctvDebounceRef.current);
        cctvDebounceRef.current = setTimeout(() => {
          if (activeTabRef.current === "CCTV MONITOR" && loadDataRef.current) {
            loadDataRef.current(true);
          }
        }, 800);
      }
    });
  };

  const initMap = () => {
    createMap();
  };

  const loadData = async (isSilent = false) => {
    const currentTab = activeTabRef.current;
    if (!isSilent) {
      setLoading(true);
      setResults(null);
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
    }
    setError(null);
    
    if (cctvPolygonRef.current) {
      cctvPolygonRef.current.remove();
      cctvPolygonRef.current = null;
    }

    // Safety watchdog: guarantee loading state resolves even if slow network
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 25000);
    
    try {
      const map = leafletMapRef.current;
      const L = window.L;
      
      let data = [];
      switch (currentTab) {
        case "LIVE FLIGHTS":
          const res = await axios.get(`${API}/geo/flights`, { timeout: 25000 });
          if (activeTabRef.current !== currentTab) return;
          data = res.data?.data?.flights || [];
          setResults(res.data?.data);
          if (map && L) {
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];
            plotFlights(map, data);
          }
          break;
        case "MILITARY FLIGHTS":
          data = await fetchMilitaryFlights();
          if (activeTabRef.current !== currentTab) return;
          setResults({ flights: data, count: data.length });
          if (map && L) {
            markersRef.current.forEach(m => m.remove());
            const markers = plotMilitaryFlights(map, data, L);
            markersRef.current = markers;
          }
          break;
        case "EARTHQUAKES":
          data = await fetchEarthquakes();
          if (activeTabRef.current !== currentTab) return;
          setResults({ events: data, count: data.length });
          if (map && L) {
            markersRef.current.forEach(m => m.remove());
            const markers = plotEarthquakes(map, data, L);
            markersRef.current = markers;
          }
          break;
        case "SATELLITE ORBITS":
          data = await fetchSatellites();
          if (activeTabRef.current !== currentTab) return;
          setResults({ satellites: data, count: data.length });
          if (map && L) {
            markersRef.current.forEach(m => m.remove());
            const markers = plotSatellites(map, data, L);
            markersRef.current = markers;
          }
          break;
        case "BIKESHARE":
          data = await fetchBikeshare();
          if (activeTabRef.current !== currentTab) return;
          setResults({ stations: data, count: data.length });
          if (map && L) {
            markersRef.current.forEach(m => m.remove());
            const markers = plotBikeshare(map, data, L);
            markersRef.current = markers;
            map.setView([30.2680, -97.7420], 13);
          }
          break;
        case "RADIO BROWSER":
          const uLat = userCoords ? userCoords[0] : null;
          const uLon = userCoords ? userCoords[1] : null;
          data = await fetchRadioStations(uLat, uLon);
          if (activeTabRef.current !== currentTab) return;
          setResults({ stations: data, count: data.length });
          if (map && L) {
            markersRef.current.forEach(m => m.remove());
            const markers = plotRadioStations(map, data, L);
            markersRef.current = markers;
            if (uLat !== null && uLon !== null) {
              map.setView([uLat, uLon], 5);
            }
          }
          break;
        case "CCTV MONITOR":
          if (map && L) {
            const currentZoom = map.getZoom();
            const currentCenter = map.getCenter();
            
            // Dynamic query radius based on map zoom:
            // zoom <= 3: Global world-view (radius 15,000 km -> queries global streams across continents)
            // zoom 4-6: Continental view (radius 2,500 km)
            // zoom 7-9: Regional/State view (radius 400 km)
            // zoom 10+: City/Metro view (radius 70 km)
            let radiusKm = 70;
            if (currentZoom <= 3) radiusKm = 15000;
            else if (currentZoom <= 6) radiusKm = 2500;
            else if (currentZoom <= 9) radiusKm = 400;

            // Abort previous in-flight request before launching new one
            if (cctvAbortRef.current) {
              try { cctvAbortRef.current.abort(); } catch (abErr) {}
            }
            const abortController = new AbortController();
            cctvAbortRef.current = abortController;

            lastCctvFetchRef.current = {
              lat: currentCenter.lat,
              lon: currentCenter.lng,
              zoom: currentZoom
            };

            let loadedCams = [];
            try {
              const res = await axios.get(
                `${API}/geo/cameras?lat=${currentCenter.lat.toFixed(4)}&lon=${currentCenter.lng.toFixed(4)}&radius=${radiusKm}&limit=120`,
                {
                  timeout: 12000,
                  signal: abortController.signal
                }
              );
              if (res.data && res.data.status === "success" && Array.isArray(res.data.data)) {
                loadedCams = res.data.data;
              }
            } catch (err) {
              if (axios.isCancel(err) || err.name === "CanceledError" || err.code === "ERR_CANCELED") {
                return; // Silently skip superseded/aborted requests
              }
              console.warn("Live camera fetch issue, using cached/fallback feeds:", err.message);
            }

            // Fallback to verified cameras if backend returned 0
            if (!loadedCams || loadedCams.length === 0) {
              loadedCams = [...CAMERAS_FALLBACK];
            } else if (currentZoom <= 4) {
              // Ensure key regional hubs are also visible on global view
              CAMERAS_FALLBACK.forEach(f => {
                const duplicate = loadedCams.some(c => 
                  c.id === f.id || 
                  (Math.abs(c.lat - f.lat) < 0.05 && Math.abs(c.lon - f.lon) < 0.05)
                );
                if (!duplicate) {
                  loadedCams.push(f);
                }
              });
            }

            if (activeTabRef.current !== currentTab) return;

            plotCctvCameras(map, loadedCams, L);
            setResults({ cameras: loadedCams.length });

            // If cameras were detected, ensure at least one camera marker is visible on screen
            if (loadedCams.length > 0 && markersRef.current.length > 0) {
              const bounds = map.getBounds();
              const hasVisible = loadedCams.some(c => bounds.contains([c.lat, c.lon]));
              if (!hasVisible) {
                try {
                  const featureGroup = L.featureGroup(markersRef.current);
                  map.fitBounds(featureGroup.getBounds().pad(0.15), { maxZoom: 13 });
                } catch (fitErr) {}
              }
            }
          }
          break;
        case "SATELLITE VIEW":
          setBasemapMode(true);
          const rawLat = parseCoord(lat, true);
          const rawLon = parseCoord(lon, false);
          const currentCenter = map ? map.getCenter() : { lat: 28.6139, lng: 77.2090 };
          const targetLat = rawLat !== null ? rawLat : (userCoords ? userCoords[0] : currentCenter.lat);
          const targetLon = rawLon !== null ? rawLon : (userCoords ? userCoords[1] : currentCenter.lng);

          setLat(targetLat.toFixed(4));
          setLon(targetLon.toFixed(4));

          try {
            const revRes = await axios.get(`${API}/geo/reverse?lat=${targetLat.toFixed(4)}&lon=${targetLon.toFixed(4)}`, { timeout: 15000 });
            if (activeTabRef.current !== currentTab) return;
            setResults(revRes.data);
          } catch (e) {
            setResults({
              location: { display_name: `Target Coordinates [${targetLat.toFixed(4)}, ${targetLon.toFixed(4)}]` },
              satellite: {
                google_maps: `https://www.google.com/maps/@${targetLat},${targetLon},15z/data=!3m1!1e3`,
                openstreetmap: `https://www.openstreetmap.org/#map=15/${targetLat}/${targetLon}`,
                sentinel_hub: `https://apps.sentinel-hub.com/eo-browser/?zoom=12&lat=${targetLat}&lng=${targetLon}`,
                nasa_worldview: `https://worldview.earthdata.nasa.gov/?v=${targetLon-1},${targetLat-1},${targetLon+1},${targetLat+1}`
              }
            });
          }

          if (map && L) {
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];

            const satIcon = L.divIcon({
              html: `
                <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center">
                  <div style="position:absolute;inset:0;border:2px solid #00ffff;border-radius:50%;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;opacity:0.6"></div>
                  <div style="position:absolute;inset:4px;border:1px dashed #00ffff;border-radius:50%"></div>
                  <div style="width:8px;height:8px;background:#00ffff;border-radius:50%;box-shadow:0 0 8px #00ffff"></div>
                </div>
              `,
              className: "",
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            });

            const satMarker = L.marker([targetLat, targetLon], { icon: satIcon }).addTo(map);
            satMarker.bindPopup(`
              <div style="background:#050505;color:#00ffff;font-family:Courier New;font-size:10px;padding:8px;border:1px solid #00aaaa;width:220px;box-shadow:0 0 12px rgba(0,255,255,0.4)">
                <div style="font-weight:bold;color:#00ffff;margin-bottom:4px;letter-spacing:1px">🛰️ SATELLITE TARGET LOCK</div>
                <div style="font-size:8px;color:#aaa;margin-bottom:4px">LAT: ${targetLat.toFixed(4)} | LON: ${targetLon.toFixed(4)}</div>
                <div style="font-size:8px;color:#00ff88;margin-bottom:6px">SENSOR: ESRI HIGH-RES ORBITAL OPTICS</div>
                <a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${targetLat},${targetLon}" target="_blank" rel="noreferrer"
                  style="display:inline-block;padding:2px 6px;background:#ffaa00;color:#000;text-decoration:none;font-weight:bold;border-radius:2px;font-size:8px">
                  🌐 STREET VIEW 360° ↗
                </a>
              </div>
            `);
            markersRef.current.push(satMarker);

            if (map.getZoom() < 8) {
              map.flyTo([targetLat, targetLon], 14, { duration: 1.5 });
            }
          }
          break;
        case "SHIP TRACKER":
          // Handled via iframe rendering
          break;
        default:
          break;
      }
    } catch (e) {
      if (activeTabRef.current === currentTab) {
        setError(e.message);
      }
    } finally {
      clearTimeout(safetyTimer);
      if (activeTabRef.current === currentTab) {
        setLoading(false);
      }
    }
  };

  loadDataRef.current = loadData;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords([latitude, longitude]);
        },
        (error) => {
          console.warn("Geolocation query failed or was denied:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    activeTabRef.current = activeTab;
    if (activeTab === "SATELLITE VIEW") {
      setBasemapMode(true);
    } else {
      setBasemapMode(false);
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (!leafletMapRef.current && mapRef.current) {
      initMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (leafletMapRef.current) {
      setTimeout(() => {
        leafletMapRef.current.invalidateSize();
      }, 100);
    }
  }, [activeTab, loading]);

  const handleSearch = async (overrideInput = null, overrideLat = null, overrideLon = null, overrideTab = null) => {
    const searchInput = (typeof overrideInput === "string") ? overrideInput : input;
    const searchLat = (typeof overrideLat === "string" || typeof overrideLat === "number") ? overrideLat : lat;
    const searchLon = (typeof overrideLon === "string" || typeof overrideLon === "number") ? overrideLon : lon;
    const searchTab = (typeof overrideTab === "string") ? overrideTab : activeTab;

    if (!searchInput.trim() && !searchLat && !searchLon) return;
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      let res;
      switch (searchTab) {
        case "LOCATION SEARCH":
          res = await axios.get(`${API}/geo/geocode?query=${encodeURIComponent(searchInput)}`);
          setResults(res.data.data);
          if (res.data.data.results?.length > 0 && leafletMapRef.current && window.L) {
            const first = res.data.data.results[0];
            const map = leafletMapRef.current;
            const L = window.L;
            
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];
            
            const icon = L.divIcon({
              html: `<div style="color:#ff3300;font-size:24px;font-weight:bold;text-shadow:0 0 6px #f00">📍</div>`,
              className: "",
              iconSize: [24, 24],
              iconAnchor: [12, 24]
            });
            
            const marker = L.marker([first.latitude, first.longitude], { icon }).addTo(map);
            marker.bindPopup(`
              <div style="background:#000;color:#00ff00;font-family:Courier New;font-size:10px;padding:8px;border:1px solid #ff4400;width:180px">
                <div style="color:#ff4400;font-weight:bold;margin-bottom:4px">📍 LOCATION IDENTIFIED</div>
                <div style="font-weight:bold;color:#fff">${first.name}</div>
                <div>LAT: ${first.latitude.toFixed(4)}</div>
                <div>LON: ${first.longitude.toFixed(4)}</div>
                <div style="font-size:8px;color:#888;margin-top:4px">OMNIVISION GEOPOS TARGET</div>
              </div>
            `);
            markersRef.current.push(marker);
            
            map.flyTo([first.latitude, first.longitude], 14);
            setTimeout(() => {
              marker.openPopup();
            }, 1000);
          }
          break;
        case "SATELLITE VIEW":
          let finalLat = null;
          let finalLon = null;

          // Check if user entered a place name (e.g. "Taj Mahal", "Presidency University", "Times Square")
          if (searchInput && searchInput.trim()) {
            try {
              const geoRes = await axios.get(`${API}/geo/geocode?query=${encodeURIComponent(searchInput.trim())}`);
              if (geoRes.data?.data?.results?.length > 0) {
                const first = geoRes.data.data.results[0];
                finalLat = first.latitude;
                finalLon = first.longitude;
              }
            } catch (err) {}
          }

          // Otherwise parse coordinates from lat/lon inputs
          if (finalLat === null || finalLon === null) {
            finalLat = parseCoord(searchLat, true);
            finalLon = parseCoord(searchLon, false);
          }

          // If still null, fall back to current map center
          if (finalLat === null || finalLon === null) {
            const curCenter = leafletMapRef.current ? leafletMapRef.current.getCenter() : { lat: 28.6139, lng: 77.2090 };
            finalLat = curCenter.lat;
            finalLon = curCenter.lng;
          }

          if (Math.abs(finalLat) > 90 || Math.abs(finalLon) > 180) {
            setError("COORDINATE RANGE ERROR: Latitude must be between -90 and 90, Longitude between -180 and 180 (e.g. 28.6139, 77.2090)");
            setLoading(false);
            return;
          }

          setLat(finalLat.toFixed(4));
          setLon(finalLon.toFixed(4));
          setBasemapMode(true);

          try {
            res = await axios.get(`${API}/geo/reverse?lat=${finalLat.toFixed(4)}&lon=${finalLon.toFixed(4)}`);
            setResults(res.data);
          } catch (e) {
            res = {
              data: {
                location: { display_name: `Target Coordinates [${finalLat.toFixed(4)}, ${finalLon.toFixed(4)}]` },
                satellite: {
                  google_maps: `https://www.google.com/maps/@${finalLat},${finalLon},15z/data=!3m1!1e3`,
                  openstreetmap: `https://www.openstreetmap.org/#map=15/${finalLat}/${finalLon}`,
                  sentinel_hub: `https://apps.sentinel-hub.com/eo-browser/?zoom=12&lat=${finalLat}&lng=${finalLon}`,
                  nasa_worldview: `https://worldview.earthdata.nasa.gov/?v=${finalLon-1},${finalLat-1},${finalLon+1},${finalLat+1}`
                }
              }
            };
            setResults(res.data);
          }

          if (leafletMapRef.current && window.L) {
            const map = leafletMapRef.current;
            const L = window.L;

            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];

            const satIcon = L.divIcon({
              html: `
                <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center">
                  <div style="position:absolute;inset:0;border:2px solid #00ffff;border-radius:50%;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;opacity:0.6"></div>
                  <div style="position:absolute;inset:4px;border:1px dashed #00ffff;border-radius:50%"></div>
                  <div style="width:8px;height:8px;background:#00ffff;border-radius:50%;box-shadow:0 0 8px #00ffff"></div>
                </div>
              `,
              className: "",
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            });

            const marker = L.marker([finalLat, finalLon], { icon: satIcon }).addTo(map);
            marker.bindPopup(`
              <div style="background:#050505;color:#00ffff;font-family:Courier New;font-size:10px;padding:8px;border:1px solid #00aaaa;width:220px;box-shadow:0 0 12px rgba(0,255,255,0.4)">
                <div style="font-weight:bold;color:#00ffff;margin-bottom:4px;letter-spacing:1px">🛰️ SATELLITE TARGET ACQUIRED</div>
                <div style="font-size:9px;color:#fff;margin-bottom:4px">${res?.data?.location?.display_name || 'ORBITAL TARGET LOCK'}</div>
                <div style="font-size:8px;color:#aaa;margin-bottom:4px">LAT: ${finalLat.toFixed(4)} | LON: ${finalLon.toFixed(4)}</div>
                <div style="font-size:8px;color:#00ff88;margin-bottom:6px">OPTICAL GROUND SENSOR: ACTIVE</div>
                <a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${finalLat},${finalLon}" target="_blank" rel="noreferrer"
                  style="display:inline-block;padding:2px 6px;background:#ffaa00;color:#000;text-decoration:none;font-weight:bold;border-radius:2px;font-size:8px">
                  🌐 STREET VIEW 360° ↗
                </a>
              </div>
            `);
            markersRef.current.push(marker);

            map.flyTo([finalLat, finalLon], 15, { duration: 1.5 });
            setTimeout(() => {
              marker.openPopup();
            }, 1200);
          }
          break;
        case "WEATHER":
          if (searchLat && searchLon) {
            res = await axios.get(`${API}/geo/weather?lat=${searchLat}&lon=${searchLon}`);
            setResults(res.data.data);
            if (leafletMapRef.current) {
              leafletMapRef.current.flyTo([parseFloat(searchLat), parseFloat(searchLon)], 10);
            }
          } else {
            const geo = await axios.get(`${API}/geo/geocode?query=${encodeURIComponent(searchInput)}`);
            if (geo.data.data.results?.length > 0) {
              const loc = geo.data.data.results[0];
              res = await axios.get(`${API}/geo/weather?lat=${loc.latitude}&lon=${loc.longitude}`);
              setResults(res.data.data);
              if (leafletMapRef.current) {
                leafletMapRef.current.flyTo([loc.latitude, loc.longitude], 10);
              }
            }
          }
          break;
        default:
          break;
      }
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    }
    setLoading(false);
  };

  const s = {
    section: { marginBottom: "16px", padding: "12px", border: "1px solid #440000", background: "#060000" },
    title: { color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "8px" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" },
    row: { fontSize: "11px", marginBottom: "4px" },
    label: { color: "#ff4400" },
    value: { color: "#882222" },
  };

  const renderFlights = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "8px 0", marginBottom: "8px", display: "flex", alignItems: "center" }}>
        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}>
          {getHeaderTitle()}
        </div>
        <DataIntegrityBadge state={getHeaderBadgeState()} />
      </div>
      <div style={{ position: "relative", flex: 1, minHeight: "450px" }}>
        {/* Tactical HUD Loading Indicator Overlay */}
        {loading && (
          <div style={{
            position: "absolute",
            top: "14px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1200,
            pointerEvents: "none",
            background: "rgba(5, 0, 0, 0.90)",
            border: "1px solid #ff0000",
            borderRadius: "2px",
            padding: "6px 16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 0 16px rgba(255, 0, 0, 0.5)",
            fontFamily: "Courier New"
          }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ff0000" }} className="animate-ping" />
            <span style={{ color: "#ff0000", fontSize: "10px", letterSpacing: "2px", fontWeight: "bold" }}>
              ACQUIRING SATELLITE TELEMETRY...
            </span>
          </div>
        )}

        {/* Leaflet Map */}
        <div ref={mapRef} style={{
          height: "100%", width: "100%",
          border: "1px solid #440000",
          background: "#0d0000",
          filter: getMapFilter()
        }} />
        {/* CRT Scanline & noise effects */}
        {activeStyle === "CRT" && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1000,
            background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)",
            backgroundSize: "100% 4px"
          }} />
        )}
        {activeStyle === "NVG" && (
          <>
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1000,
              background: "radial-gradient(circle, transparent 50%, rgba(0,20,0,0.6) 100%)"
            }} />
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1000,
              background: "linear-gradient(rgba(0, 255, 0, 0.05) 50%, rgba(0, 0, 0, 0.15) 50%)",
              backgroundSize: "100% 6px"
            }} />
          </>
        )}
        {/* Radar Sweep Effect */}
        {(activeStyle === "NVG" || activeStyle === "FLIR" || activeStyle === "CRT") && (
          <div style={{
            position: "absolute", left: 0, right: 0, height: "2px",
            background: activeStyle === "FLIR" ? "rgba(255,100,0,0.4)" : "rgba(0,255,0,0.3)",
            animation: "radarSweepLine 4s linear infinite",
            pointerEvents: "none", zIndex: 1001
          }} />
        )}
        {/* Tactical HUD Overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 999,
          display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "12px",
          fontFamily: "Courier New", fontSize: "10px", color: activeStyle === "FLIR" ? "#ff4400" : "#00ffcc"
        }} className={activeStyle === "FLIR" ? "hud-grid" : "hud-grid-cyan"}>
          
          {/* Top Panel HUD */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.75)", padding: "4px 8px", border: "1px solid rgba(0,255,200,0.3)" }}>
            <div>SYSTEM: OMNIVISION_V1 // {isSatelliteBasemap || activeTab === "SATELLITE VIEW" ? "ORBITAL_SATELLITE_OPTICS" : "VECTOR_TACTICAL_GRID"}</div>
            <div>SECTOR: {activeTab}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div>ZOOM: {mapZoom}x</div>
              <button onClick={() => setBasemapMode(!isSatelliteBasemap)}
                style={{
                  padding: "2px 6px",
                  fontSize: "8px",
                  fontFamily: "Courier New",
                  fontWeight: "bold",
                  cursor: "pointer",
                  background: isSatelliteBasemap ? "#00ffff" : "#0d0000",
                  color: isSatelliteBasemap ? "#000" : "#00ffff",
                  border: "1px solid #00ffff",
                  borderRadius: "2px",
                  pointerEvents: "auto"
                }}>
                {isSatelliteBasemap ? "🛰️ SATELLITE ACTIVE" : "🛰️ SATELLITE OVERLAY"}
              </button>
            </div>
          </div>
          
          {/* Center crosshair */}
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            color: activeStyle === "FLIR" ? "#ff4400" : "#00ffcc", fontSize: "20px", fontWeight: "lighter"
          }}>
            ⌖
          </div>

          {/* Vertical Elevation Mock Rulers */}
          <div style={{ position: "absolute", left: "10px", top: "20%", bottom: "20%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {[100, 80, 60, 40, 20, 0].map(val => (
              <div key={val}>-{val}</div>
            ))}
          </div>
          <div style={{ position: "absolute", right: "10px", top: "20%", bottom: "20%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {[100, 80, 60, 40, 20, 0].map(val => (
              <div key={val}>-{val}</div>
            ))}
          </div>

          {/* Bottom Panel HUD */}
          <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.6)", padding: "4px 8px", border: "1px solid rgba(0,255,200,0.2)" }}>
            <div>SECTOR CTR: [{mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}]</div>
            <div id="hud-cursor-coords">CURSOR: [0.0000, 0.0000]</div>
            <div>GRID_LOCK: SEC_ALPHA</div>
          </div>
        </div>
      </div>
      {results?.showing && (
        <div style={{ color: "#440000", fontSize: "11px", marginTop: "8px" }}>
          DISPLAYING {results.showing} OF {results.total} AIRCRAFT
        </div>
      )}
    </div>
  );

  const renderShips = () => (
    <div>
      <div style={s.section}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <div style={s.title}>LIVE SHIP TRACKER</div>
          <DataIntegrityBadge state="THIRD-PARTY" />
        </div>
        <div style={{ color: "#882222", fontSize: "11px", marginBottom: "12px" }}>
          Real-time AIS vessel tracking via MarineTraffic
        </div>
        <iframe
          src="https://www.marinetraffic.com/en/ais/embed/zoom:3/centery:20/centerx:77/maptype:0/shownames:false/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:/showmenu:false/remember:false"
          style={{
            width: "100%", height: "500px",
            border: "1px solid #440000",
            background: "#0d0000"
          }}
          title="Ship Tracker"
        />
      </div>
    </div>
  );

  const renderLocationSearch = () => (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
        <div style={s.title}>LOCATION INTELLIGENCE PRESENTS</div>
        <DataIntegrityBadge state="THIRD-PARTY" />
      </div>
      {results?.results?.map((loc, i) => (
        <div key={i} style={{ ...s.section, cursor: "pointer" }}
          onClick={async () => {
            const res = await axios.get(`${API}/geo/reverse?lat=${loc.latitude}&lon=${loc.longitude}`);
            setResults(res.data);
            if (leafletMapRef.current && window.L) {
              const map = leafletMapRef.current;
              const L = window.L;
              
              markersRef.current.forEach(m => m.remove());
              markersRef.current = [];
              
              const icon = L.divIcon({
                html: `<div style="color:#ff3300;font-size:24px;font-weight:bold;text-shadow:0 0 6px #f00">📍</div>`,
                className: "",
                iconSize: [24, 24],
                iconAnchor: [12, 24]
              });
              
              const marker = L.marker([loc.latitude, loc.longitude], { icon }).addTo(map);
              marker.bindPopup(`
                <div style="background:#000;color:#00ff00;font-family:Courier New;font-size:10px;padding:8px;border:1px solid #ff4400;width:180px">
                  <div style="color:#ff4400;font-weight:bold;margin-bottom:4px">📍 LOCATION SELECTED</div>
                  <div style="font-weight:bold;color:#fff">${loc.name}</div>
                  <div>LAT: ${loc.latitude.toFixed(4)}</div>
                  <div>LON: ${loc.longitude.toFixed(4)}</div>
                </div>
              `);
              markersRef.current.push(marker);
              
              map.flyTo([loc.latitude, loc.longitude], 14);
              setTimeout(() => {
                marker.openPopup();
              }, 1000);
            }
          }}>
          <div style={{ color: "#ff4400", fontSize: "11px", marginBottom: "6px" }}>
            RESULT {i + 1}
          </div>
          <div style={s.row}>
            <span style={s.label}>NAME: </span>
            <span style={s.value}>{loc.name?.slice(0, 80)}</span>
          </div>
          <div style={s.row}>
            <span style={s.label}>TYPE: </span>
            <span style={s.value}>{loc.type}</span>
          </div>
          <div style={s.grid2}>
            <div style={s.row}>
              <span style={s.label}>LAT: </span>
              <span style={s.value}>{loc.latitude?.toFixed(4)}</span>
            </div>
            <div style={s.row}>
              <span style={s.label}>LON: </span>
              <span style={s.value}>{loc.longitude?.toFixed(4)}</span>
            </div>
          </div>
        </div>
      ))}

      {results?.location && (
        <div>
          <div style={{ ...s.section, borderColor: "#ff0000" }}>
            <div style={s.title}>LOCATION INTELLIGENCE</div>
            <div style={s.row}>
              <span style={s.label}>ADDRESS: </span>
              <span style={s.value}>{results.location?.display_name?.slice(0, 100)}</span>
            </div>
          </div>
          {results.weather && (
            <div style={s.section}>
              <div style={s.title}>WEATHER DATA</div>
              <div style={s.grid2}>
                {[
                  ["CITY", results.weather.city],
                  ["COUNTRY", results.weather.country],
                  ["TEMP", `${results.weather.temperature}C`],
                  ["FEELS LIKE", `${results.weather.feels_like}C`],
                  ["HUMIDITY", `${results.weather.humidity}%`],
                  ["WIND", `${results.weather.wind_speed}m/s`],
                  ["CONDITIONS", results.weather.weather],
                ].map(([k, v]) => v && (
                  <div key={k} style={s.row}>
                    <span style={s.label}>{k}: </span>
                    <span style={s.value}>{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {results.satellite && (
            <div style={s.section}>
              <div style={s.title}>SATELLITE IMAGERY LINKS</div>
              {Object.entries(results.satellite).filter(([k]) => k !== "status").map(([k, v]) => (
                <div key={k} style={{ marginBottom: "6px" }}>
                  <a href={v} target="_blank" rel="noreferrer"
                    style={{ color: "#ff4400", fontSize: "11px", textDecoration: "none" }}>
                    {k.toUpperCase().replace("_", " ")} VIEW
                  </a>
                </div>
              ))}
            </div>
          )}
          {results.ai_report && (
            <div style={{ ...s.section, borderColor: "#ff0000" }}>
              <div style={s.title}>AI GEO INTELLIGENCE REPORT</div>
              <pre style={{ color: "#882222", fontSize: "11px",
                whiteSpace: "pre-wrap", fontFamily: "Courier New", lineHeight: "1.6" }}>
                {results.ai_report}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSatellite = () => (
    <div>
      <div style={s.section}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <div style={{ ...s.title, color: "#00ffff" }}>🛰️ ORBITAL SATELLITE RECON</div>
          <DataIntegrityBadge state="LIVE" />
        </div>
        
        <div style={{ color: "#00ffcc", fontSize: "10px", marginBottom: "8px", fontWeight: "bold" }}>
          TARGET: {results?.location?.display_name || `SECTOR [${lat || "28.6139"}, ${lon || "77.2090"}]`}
        </div>

        <div style={{ padding: "8px", background: "rgba(0,255,255,0.06)", border: "1px solid #008888", marginBottom: "10px" }}>
          <div style={{ color: "#00ffff", fontSize: "9px", fontWeight: "bold", marginBottom: "3px" }}>
            PRIMARY SENSOR: ESRI WORLD IMAGERY (SUB-METER OPTICS)
          </div>
          <div style={{ color: "#88aaaa", fontSize: "8px", lineHeight: "1.3" }}>
            Sub-meter aerial and commercial satellite imagery from Maxar, Airbus, GeoEye, and USGS. Active orbital telemetry rendered directly on the primary viewport.
          </div>
        </div>

        {/* Telemetry Grid */}
        <div style={{ ...s.grid2, marginBottom: "10px" }}>
          <div style={s.row}><span style={s.label}>LATITUDE: </span><span style={{ color: "#00ffff" }}>{lat || "28.6139"}</span></div>
          <div style={s.row}><span style={s.label}>LONGITUDE: </span><span style={{ color: "#00ffff" }}>{lon || "77.2090"}</span></div>
          <div style={s.row}><span style={s.label}>ZOOM LEVEL: </span><span style={{ color: "#00ffff" }}>{mapZoom}x</span></div>
          <div style={s.row}><span style={s.label}>GROUND RES: </span><span style={{ color: "#00ff66" }}>~0.3m/px</span></div>
        </div>

        {/* Zoom Controls */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
          <button onClick={() => { if (leafletMapRef.current) leafletMapRef.current.zoomIn(); }}
            style={{ flex: 1, padding: "6px", background: "#002222", border: "1px solid #00ffff", color: "#00ffff", fontSize: "9px", fontFamily: "Courier New", cursor: "pointer", fontWeight: "bold" }}>
            ➕ ZOOM IN (OPTICAL)
          </button>
          <button onClick={() => { if (leafletMapRef.current) leafletMapRef.current.zoomOut(); }}
            style={{ flex: 1, padding: "6px", background: "#002222", border: "1px solid #00ffff", color: "#00ffff", fontSize: "9px", fontFamily: "Courier New", cursor: "pointer", fontWeight: "bold" }}>
            ➖ ZOOM OUT
          </button>
        </div>

        {/* Quick Target Presets */}
        <div style={{ color: "#ffaa00", fontSize: "9px", fontWeight: "bold", marginBottom: "6px", letterSpacing: "1px" }}>
          ORBITAL TARGET PRESETS
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginBottom: "12px" }}>
          {[
            { name: "🇪🇬 Pyramids", lat: "29.9792", lon: "31.1342" },
            { name: "🇮🇳 Taj Mahal", lat: "27.1751", lon: "78.0421" },
            { name: "🇮🇳 Presidency Univ", lat: "13.1678", lon: "77.5342" },
            { name: "🇺🇸 Pentagon", lat: "38.8719", lon: "-77.0563" },
            { name: "🇦🇪 Palm Dubai", lat: "25.1124", lon: "55.1390" },
            { name: "🇫🇷 Eiffel Tower", lat: "48.8584", lon: "2.2945" },
          ].map(p => (
            <button key={p.name} onClick={() => {
              setLat(p.lat);
              setLon(p.lon);
              handleSearch("", p.lat, p.lon, "SATELLITE VIEW");
            }}
              style={{
                padding: "4px 6px",
                background: "#080808",
                border: "1px solid #443300",
                color: "#ffaa00",
                fontSize: "8px",
                fontFamily: "Courier New",
                cursor: "pointer",
                textAlign: "left"
              }}>
              {p.name}
            </button>
          ))}
        </div>

        {/* Deep Recon External Portals */}
        <div style={{ color: "#00ffcc", fontSize: "9px", fontWeight: "bold", marginBottom: "6px", letterSpacing: "1px" }}>
          EXTERNAL RECON PLATFORMS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <a href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat || "28.6139"},${lon || "77.2090"}`} target="_blank" rel="noreferrer"
            style={{ display: "block", padding: "6px 8px", background: "rgba(255,170,0,0.1)", border: "1px solid #ffaa00", color: "#ffaa00", fontSize: "9px", textDecoration: "none", fontWeight: "bold" }}>
            🌐 GOOGLE STREET VIEW 360° ↗
          </a>
          <a href={`https://apps.sentinel-hub.com/eo-browser/?zoom=14&lat=${lat || "28.6139"}&lng=${lon || "77.2090"}`} target="_blank" rel="noreferrer"
            style={{ display: "block", padding: "6px 8px", background: "rgba(0,255,255,0.1)", border: "1px solid #00ffff", color: "#00ffff", fontSize: "9px", textDecoration: "none", fontWeight: "bold" }}>
            🛰️ SENTINEL-2 MULTISPECTRAL BROWSER ↗
          </a>
          <a href={`https://worldview.earthdata.nasa.gov/?v=${(parseFloat(lon)||77.2)-0.5},${(parseFloat(lat)||28.6)-0.5},${(parseFloat(lon)||77.2)+0.5},${(parseFloat(lat)||28.6)+0.5}`} target="_blank" rel="noreferrer"
            style={{ display: "block", padding: "6px 8px", background: "rgba(0,255,100,0.1)", border: "1px solid #00ff66", color: "#00ff66", fontSize: "9px", textDecoration: "none", fontWeight: "bold" }}>
            🌍 NASA EARTH OBSERVATORY WORLDVIEW ↗
          </a>
        </div>
      </div>

      {results?.weather && (
        <div style={s.section}>
          <div style={s.title}>LOCAL SENSOR WEATHER</div>
          <div style={s.grid2}>
            <div style={s.row}><span style={s.label}>TEMP: </span><span style={{ color: "#00ff66" }}>{results.weather.temperature}°C</span></div>
            <div style={s.row}><span style={s.label}>HUMIDITY: </span><span style={{ color: "#00ff66" }}>{results.weather.humidity}%</span></div>
            <div style={s.row}><span style={s.label}>WIND: </span><span style={{ color: "#00ff66" }}>{results.weather.wind_speed} m/s</span></div>
            <div style={s.row}><span style={s.label}>CONDITIONS: </span><span style={{ color: "#00ff66" }}>{results.weather.weather}</span></div>
          </div>
        </div>
      )}
    </div>
  );

  const renderWeather = () => (
    <div>
      {results && (
        <div style={s.section}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
            <div style={s.title}>WEATHER INTELLIGENCE</div>
            <DataIntegrityBadge state="LIVE" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
            {[
              ["CITY", results.city],
              ["COUNTRY", results.country],
              ["TEMPERATURE", `${results.temperature}C`],
              ["FEELS LIKE", `${results.feels_like}C`],
              ["HUMIDITY", `${results.humidity}%`],
              ["PRESSURE", `${results.pressure}hPa`],
              ["WIND SPEED", `${results.wind_speed}m/s`],
              ["VISIBILITY", `${results.visibility}m`],
              ["CONDITIONS", results.weather],
            ].map(([k, v]) => v && (
              <div key={k} style={{ padding: "8px", border: "1px solid #330000",
                background: "#0d0000" }}>
                <div style={{ color: "#ff4400", fontSize: "10px", marginBottom: "4px" }}>{k}</div>
                <div style={{ color: "#ff2222", fontSize: "13px", fontWeight: "bold" }}>{String(v)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderResults = () => {
    switch (activeTab) {
      case "LIVE FLIGHTS":
      case "MILITARY FLIGHTS":
      case "EARTHQUAKES":
      case "SATELLITE ORBITS":
      case "BIKESHARE":
      case "RADIO BROWSER":
      case "CCTV MONITOR":
        return renderFlights();
      case "SHIP TRACKER": return renderShips();
      case "LOCATION SEARCH": return renderLocationSearch();
      case "SATELLITE VIEW": return renderSatellite();
      case "WEATHER": return renderWeather();
      default: return null;
    }
  };

  const getIntegrityStateForTab = () => {
    switch (activeTab) {
      case "LIVE FLIGHTS": return "LIVE";
      case "MILITARY FLIGHTS": return results?.flights?.[0]?.type === "LIVE" ? "LIVE" : "ESTIMATE";
      case "EARTHQUAKES": return "LIVE";
      case "SATELLITE ORBITS": return results?.satellites?.[0]?.type === "LIVE" ? "LIVE" : "ESTIMATE";
      case "BIKESHARE": return results?.stations?.[0]?.status?.num_bikes_available !== undefined ? "LIVE" : "ESTIMATE";
      case "RADIO BROWSER": return "LIVE";
      case "CCTV MONITOR": return "SIMULATED";
      case "SHIP TRACKER": return "THIRD-PARTY";
      case "LOCATION SEARCH": return "THIRD-PARTY";
      case "SATELLITE VIEW": return "THIRD-PARTY";
      case "WEATHER": return "LIVE";
      default: return "LIVE";
    }
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#000000" }}>
      <style>{`
        @keyframes scanlineMove { 0% { top: 0%; } 100% { top: 100%; } }
        @keyframes radarSweepLine { 0% { top: 0%; } 100% { top: 100%; } }
        .hud-grid {
          background-image: 
            linear-gradient(rgba(255, 68, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 68, 0, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .hud-grid-cyan {
          background-image: 
            linear-gradient(rgba(0, 255, 200, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 200, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      {/* Left Panel */}
      <div style={{
        width: "280px", display: "flex", flexDirection: "column",
        gap: "12px", padding: "12px", borderRight: "1px solid #440000",
        background: "#030000", overflowY: "auto"
      }}>
        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px",
          paddingBottom: "8px", borderBottom: "1px solid #440000", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>GEO TRACKER</span>
          <DataIntegrityBadge state={getIntegrityStateForTab()} />
        </div>

        {/* Tactical Controls & Shaders */}
        <div style={s.section}>
          <div style={s.title}>SURVEILLANCE MODE</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
            {STYLES.map(st => (
              <button key={st} onClick={() => {
                setActiveStyle(st);
                updateQueryParams(mapCenter[0], mapCenter[1], mapZoom, activeTab, st);
              }}
                style={{
                  padding: "6px", fontSize: "9px", fontFamily: "Courier New", cursor: "pointer",
                  background: activeStyle === st ? "#ff0033" : "#0d0000",
                  border: `1px solid ${activeStyle === st ? "#ff0033" : "#330000"}`,
                  color: activeStyle === st ? "#000" : "#ff4444"
                }}>
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Command Button */}
        <div style={s.section}>
          <div style={s.title}>OMNIVOICE SPEECH ASSISTANT</div>
          <button onClick={toggleMic}
            style={{
              width: "100%", padding: "8px", background: micActive ? "#ff0000" : "#0d0000",
              border: `1px solid ${micActive ? "#ff0000" : "#ff3333"}`,
              color: micActive ? "#000" : "#ff3333", cursor: "pointer", fontFamily: "Courier New",
              fontSize: "11px", letterSpacing: "1px", fontWeight: "bold"
            }}>
            {micActive ? "🎙️ LISTENING..." : "🎙️ START SPEECH ASSISTANT"}
          </button>
          {voiceCommand && (
            <div style={{ color: "#88ff88", fontSize: "9px", marginTop: "6px", fontStyle: "italic" }}>
              COMMAND: "{voiceCommand}"
            </div>
          )}
          {speechError && (
            <div style={{ color: "#ff3333", fontSize: "9px", marginTop: "6px" }}>
              {speechError}
            </div>
          )}
          <div style={{ fontSize: "8px", color: "#440000", marginTop: "4px", lineHeight: "1.2" }}>
            e.g. "zoom in", "night vision", "standard mode", "show earthquakes", "fly to London"
          </div>
        </div>

        {/* Globe Actions */}
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={resetGlobe}
            style={{
              flex: 1, padding: "8px", background: "#0d0000", border: "1px solid #ff3333",
              color: "#ff3333", cursor: "pointer", fontFamily: "Courier New", fontSize: "10px"
            }}>
            RESET GLOBE
          </button>
          <button onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url);
            alert("Share link copied to clipboard!");
          }}
            style={{
              flex: 1, padding: "8px", background: "#0d0000", border: "1px solid #00ffcc",
              color: "#00ffcc", cursor: "pointer", fontFamily: "Courier New", fontSize: "10px"
            }}>
            SHARE VIEW
          </button>
        </div>

        <div style={{ borderTop: "1px solid #220000" }} />

        <div>
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" }}>
            SELECT MODULE
          </div>
          {TABS.map(tab => (
            <button key={tab} onClick={() => {
              setActiveTab(tab);
              setResults(null);
              setInput("");
              if (leafletMapRef.current) {
                // Keep the same map instance, do not remove
              }
            }}
              style={{
                width: "100%", padding: "6px 8px", marginBottom: "4px",
                fontSize: "10px", letterSpacing: "1px", cursor: "pointer",
                fontFamily: "Courier New", textAlign: "left",
                background: activeTab === tab ? "#1a0000" : "#060000",
                border: `1px solid ${activeTab === tab ? "#ff0000" : "#220000"}`,
                color: activeTab === tab ? "#ff0000" : "#662222",
              }}>
              {tab}
            </button>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #220000" }} />

        {/* Input */}
        <div>
          <div style={{ color: activeTab === "SATELLITE VIEW" ? "#00ffff" : "#882222", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" }}>
            {activeTab === "LIVE FLIGHTS" ? "SEARCH CALLSIGN" :
             activeTab === "LOCATION SEARCH" ? "SEARCH LOCATION" :
             activeTab === "WEATHER" ? "CITY NAME OR COORDS" :
             activeTab === "SATELLITE VIEW" ? "TARGET RECON LOCATION" :
             "COORDINATES"}
          </div>

          {activeTab === "SATELLITE VIEW" && (
            <div style={{ marginBottom: "6px" }}>
              <div style={{ fontSize: "9px", color: "#888", marginBottom: "3px", letterSpacing: "0.5px" }}>
                SEARCH BY NAME / LANDMARK:
              </div>
              <input
                type="text"
                placeholder="e.g. Taj Mahal, Pentagon, Dubai"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                style={{
                  width: "100%", marginBottom: "6px", background: "#060000",
                  border: "1px solid #005555", borderLeft: "3px solid #00ffff",
                  color: "#00ffff", fontFamily: "Courier New",
                  fontSize: "11px", padding: "6px 10px"
                }}
              />
              <div style={{ fontSize: "9px", color: "#888", marginBottom: "3px", letterSpacing: "0.5px" }}>
                OR ENTER DIRECT COORDINATES:
              </div>
              <div style={{ display: "flex", gap: "4px", marginBottom: "2px" }}>
                <input
                  type="text"
                  placeholder="Lat (e.g. 28.6139)"
                  value={lat}
                  onChange={e => setLat(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  style={{
                    flex: 1, background: "#060000",
                    border: "1px solid #440000", borderLeft: "3px solid #ff0000",
                    color: "#ff2222", fontFamily: "Courier New",
                    fontSize: "11px", padding: "6px 8px"
                  }}
                />
                <input
                  type="text"
                  placeholder="Lon (e.g. 77.2090)"
                  value={lon}
                  onChange={e => setLon(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  style={{
                    flex: 1, background: "#060000",
                    border: "1px solid #440000", borderLeft: "3px solid #ff0000",
                    color: "#ff2222", fontFamily: "Courier New",
                    fontSize: "11px", padding: "6px 8px"
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === "WEATHER" && (
            <div style={{ marginBottom: "6px" }}>
              <input
                type="text"
                placeholder="Latitude e.g. 28.6139"
                value={lat}
                onChange={e => setLat(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                style={{
                  width: "100%", marginBottom: "4px", background: "#060000",
                  border: "1px solid #440000", borderLeft: "3px solid #ff0000",
                  color: "#ff2222", fontFamily: "Courier New",
                  fontSize: "11px", padding: "6px 10px"
                }}
              />
              <input
                type="text"
                placeholder="Longitude e.g. 77.2090"
                value={lon}
                onChange={e => setLon(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                style={{
                  width: "100%", background: "#060000",
                  border: "1px solid #440000", borderLeft: "3px solid #ff0000",
                  color: "#ff2222", fontFamily: "Courier New",
                  fontSize: "11px", padding: "6px 10px"
                }}
              />
            </div>
          )}

          {activeTab !== "SATELLITE VIEW" && activeTab !== "SHIP TRACKER" && activeTab !== "MILITARY FLIGHTS" && activeTab !== "EARTHQUAKES" && activeTab !== "SATELLITE ORBITS" && activeTab !== "BIKESHARE" && activeTab !== "RADIO BROWSER" && activeTab !== "CCTV MONITOR" && (
            <input
              type="text"
              placeholder={
                activeTab === "LIVE FLIGHTS" ? "Callsign e.g. BAW123" :
                activeTab === "WEATHER" ? "City e.g. Mumbai" :
                "Location e.g. New Delhi"
              }
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{
                width: "100%", background: "#060000",
                border: "1px solid #440000", borderLeft: "3px solid #ff0000",
                color: "#ff2222", fontFamily: "Courier New",
                fontSize: "11px", padding: "8px 12px"
              }}
            />
          )}

          {activeTab !== "SHIP TRACKER" && (
            <button onClick={activeTab === "LIVE FLIGHTS" && !input ? loadData : handleSearch}
              disabled={loading}
              style={{
                width: "100%", padding: "8px", marginTop: "6px",
                fontSize: "11px", letterSpacing: "1px", cursor: "pointer",
                fontFamily: "Courier New",
                background: activeTab === "SATELLITE VIEW" ? "#001a1a" : "#1a0000",
                border: `1px solid ${activeTab === "SATELLITE VIEW" ? "#00ffff" : "#ff0000"}`,
                color: activeTab === "SATELLITE VIEW" ? "#00ffff" : "#ff0000",
                boxShadow: activeTab === "SATELLITE VIEW" ? "0 0 6px rgba(0,255,255,0.3)" : "none"
              }}>
              {loading ? "ACQUIRING..." :
               activeTab === "LIVE FLIGHTS" && !input ? "LOAD DATA LAYER" :
               activeTab === "SATELLITE VIEW" ? "🛰️ ACQUIRE SATELLITE TARGET" :
               activeTab === "MILITARY FLIGHTS" || activeTab === "EARTHQUAKES" || activeTab === "SATELLITE ORBITS" || activeTab === "BIKESHARE" || activeTab === "RADIO BROWSER" || activeTab === "CCTV MONITOR" ? "RELOAD DATA LAYER" :
               "SEARCH"}
            </button>
          )}

          {activeTab === "CCTV MONITOR" && userCoords && (
            <button onClick={async () => {
              if (leafletMapRef.current && userCoords) {
                const map = leafletMapRef.current;
                map.setView(userCoords, 13);
                if (cctvDebounceRef.current) clearTimeout(cctvDebounceRef.current);
                lastCctvFetchRef.current = { lat: null, lon: null, zoom: null };
                setTimeout(() => {
                  if (loadDataRef.current) loadDataRef.current();
                }, 100);
              }
            }}
              disabled={loading}
              style={{
                width: "100%", padding: "8px", marginTop: "6px",
                fontSize: "11px", letterSpacing: "1px", cursor: "pointer",
                fontFamily: "Courier New",
                background: "#001a1a", border: "1px solid #00ffff", color: "#00ffff",
                boxShadow: "0 0 4px #00ffff"
              }}>
              SCAN CAMERAS NEAR ME 🛰️
            </button>
          )}
        </div>

        {/* Quick Tests */}
        <div style={{ borderTop: "1px solid #220000" }} />
        <div style={{ color: "#882222", fontSize: "11px", letterSpacing: "1px" }}>
          QUICK PRESETS
        </div>
        {[
          { label: "[CAMERAS] 🌐 Global Grid (40+ Countries)", action: () => { setActiveTab("CCTV MONITOR"); if (leafletMapRef.current) leafletMapRef.current.setView([20, 0], 2); }},
          { label: "[CAMERAS] 🇮🇳 Bengaluru North / Presidency Univ", action: () => { setActiveTab("CCTV MONITOR"); if (leafletMapRef.current) leafletMapRef.current.setView([13.1678, 77.5342], 13); }},
          { label: "[CAMERAS] 🇮🇳 Bengaluru Video Feeds", action: () => { setActiveTab("CCTV MONITOR"); if (leafletMapRef.current) leafletMapRef.current.setView([12.9716, 77.5946], 13); }},
          { label: "[CAMERAS] 🇬🇧 London Traffic (800+ MP4s)", action: () => { setActiveTab("CCTV MONITOR"); if (leafletMapRef.current) leafletMapRef.current.setView([51.5074, -0.1278], 12); }},
          { label: "[CAMERAS] 🇺🇸 New York City Live Cams", action: () => { setActiveTab("CCTV MONITOR"); if (leafletMapRef.current) leafletMapRef.current.setView([40.7580, -73.9855], 13); }},
          { label: "[CAMERAS] 🇯🇵 Tokyo Scramble Crossing", action: () => { setActiveTab("CCTV MONITOR"); if (leafletMapRef.current) leafletMapRef.current.setView([35.6595, 139.7005], 14); }},
          { label: "[CAMERAS] 🇺🇸 Austin Texas Traffic Cones", action: () => { setActiveTab("CCTV MONITOR"); if (leafletMapRef.current) leafletMapRef.current.setView([30.2680, -97.7420], 13); }},
          { label: "[FLIGHTS] US Airspace Feed", action: () => { setActiveTab("LIVE FLIGHTS"); setInput(""); if (leafletMapRef.current) leafletMapRef.current.setView([39.8283, -98.5795], 4); }},
          { label: "[MILITARY] Area 51 Tracks", action: () => { setActiveTab("MILITARY FLIGHTS"); setInput(""); if (leafletMapRef.current) leafletMapRef.current.setView([37.235, -115.811], 10); }},
          { label: "[SHIPS] English Channel Traffic", action: () => { setActiveTab("SHIP TRACKER"); }},
          { label: "[SEISMIC] Pacific Ring of Fire", action: () => { setActiveTab("EARTHQUAKES"); if (leafletMapRef.current) leafletMapRef.current.setView([20, 0], 2); }},
          { label: "[ORBITS] ISS Satellite Path", action: () => { setActiveTab("SATELLITE ORBITS"); if (leafletMapRef.current) leafletMapRef.current.setView([20, 0], 2); }},
          { label: "[BIKES] Austin B-Cycle Hubs", action: () => { setActiveTab("BIKESHARE"); if (leafletMapRef.current) leafletMapRef.current.setView([30.2680, -97.7420], 13); }},
          { label: "[RADIO] London Nodes", action: () => { setActiveTab("RADIO BROWSER"); if (leafletMapRef.current) leafletMapRef.current.setView([51.5074, -0.1278], 10); }},
          { label: "[SEARCH] Find Presidency University", action: () => { setActiveTab("LOCATION SEARCH"); setInput("Presidency University Bangalore"); handleSearch("Presidency University Bangalore", null, null, "LOCATION SEARCH"); }},
          { label: "[SATELLITE] Pyramids of Giza", action: () => { setActiveTab("SATELLITE VIEW"); setLat("29.9792"); setLon("31.1342"); handleSearch("", "29.9792", "31.1342", "SATELLITE VIEW"); }},
          { label: "[WEATHER] Mumbai Scanner", action: () => { setActiveTab("WEATHER"); setInput("Mumbai"); handleSearch("Mumbai", null, null, "WEATHER"); }},
        ].map((t, i) => (
          <button key={i} onClick={t.action}
            style={{
              width: "100%", padding: "6px 8px", marginBottom: "4px",
              fontSize: "10px", cursor: "pointer", fontFamily: "Courier New",
              textAlign: "left", background: "#060000",
              border: "1px solid #220000", color: "#662222",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #330000",
          background: "#060000", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}>
            {activeTab}
          </div>
          {results && (
            <div style={{ color: "#440000", fontSize: "11px" }}>OMNIVISION DATA DEPLOYED</div>
          )}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "row", overflow: "hidden", background: "#000" }}>
          {/* Metadata Overlay Panel (Left Side of split view) */}
          {["LOCATION SEARCH", "SATELLITE VIEW", "WEATHER"].includes(activeTab) && !loading && (
            <div style={{ 
              width: "350px", 
              overflowY: "auto", 
              padding: "16px", 
              borderRight: "1px solid #220000",
              background: "#030000" 
            }}>
              {activeTab === "LOCATION SEARCH" && renderLocationSearch()}
              {activeTab === "SATELLITE VIEW" && renderSatellite()}
              {activeTab === "WEATHER" && renderWeather()}
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
            {error && (
              <div style={{ padding: "12px", border: "1px solid #ff0000", background: "#0d0000", marginBottom: "8px" }}>
                <div style={{ color: "#ff0000", fontSize: "11px", marginBottom: "4px" }}>GEO OVERLAY ERROR</div>
                <div style={{ color: "#882222", fontSize: "11px" }}>{error}</div>
              </div>
            )}

            {/* Always mount and display map container for all map modules */}
            <div style={{ 
              display: ["LIVE FLIGHTS", "MILITARY FLIGHTS", "EARTHQUAKES", "SATELLITE ORBITS", "BIKESHARE", "RADIO BROWSER", "CCTV MONITOR", "LOCATION SEARCH", "SATELLITE VIEW", "WEATHER"].includes(activeTab) ? "block" : "none", 
              height: "100%",
              width: "100%",
              position: "relative"
            }}>
              {renderFlights()}
            </div>

            {activeTab === "SHIP TRACKER" && (
              loading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "12px" }}>
                  <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }} className="animate-pulse">
                    ACQUIRING MARITIME TELEMETRY...
                  </div>
                  <div style={{ color: "#440000", fontSize: "11px" }}>
                    Resolving AIS vessel handshake
                  </div>
                </div>
              ) : renderShips()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
