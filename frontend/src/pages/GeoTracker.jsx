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
  { id: "CAM-01", name: "6th & Congress Ave Intersection (Austin)", lat: 30.2680, lon: -97.7420, angle: 45, radius: 0.003, realImg: "/feeds/feed1.gif" },
  { id: "CAM-02", name: "Texas State Capitol North (Austin)", lat: 30.2750, lon: -97.7405, angle: 180, radius: 0.0032, realImg: "/feeds/feed2.gif" },
  { id: "CAM-03", name: "Zilker Park Pedestrian Gate (Austin)", lat: 30.2640, lon: -97.7710, angle: 290, radius: 0.0035, realImg: "/feeds/feed3.gif" },
  { id: "CAM-04", name: "Presidency University Gate 1 (Bangalore)", lat: 13.1682, lon: 77.5354, angle: 45, radius: 0.003, realImg: "/feeds/feed4.gif" },
  { id: "CAM-05", name: "Presidency University Library (Bangalore)", lat: 13.1687, lon: 77.5359, angle: 135, radius: 0.0025, realImg: "/feeds/feed5.gif" },
  { id: "CAM-06", name: "Trafalgar Square South Cam (London)", lat: 51.5080, lon: -0.1280, angle: 220, radius: 0.0035, realImg: "/feeds/feed1.gif" },
  { id: "CAM-07", name: "Tower Bridge East Bypass (London)", lat: 51.5055, lon: -0.0754, angle: 90, radius: 0.0038, realImg: "/feeds/feed2.gif" },
  { id: "CAM-08", name: "Shibuya Crossing Main Feed (Tokyo)", lat: 35.6595, lon: 139.7005, angle: 315, radius: 0.003, realImg: "/feeds/feed4.gif" },
  { id: "CAM-09", name: "Tokyo Skytree Observatory (Tokyo)", lat: 35.7100, lon: 139.8107, angle: 180, radius: 0.004, realImg: "/feeds/feed5.gif" },
  { id: "CAM-10", name: "Eiffel Tower Esplanade (Paris)", lat: 48.8583, lon: 2.2945, angle: 120, radius: 0.0035, realImg: "/feeds/feed1.gif" },
  { id: "CAM-11", name: "Champs-Élysées East Flow (Paris)", lat: 48.8700, lon: 2.3050, angle: 270, radius: 0.0036, realImg: "/feeds/feed2.gif" },
  { id: "CAM-12", name: "Opera House Forecourt (Sydney)", lat: -33.8568, lon: 151.2153, angle: 45, radius: 0.0032, realImg: "/feeds/feed4.gif" }
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
        return "SIMULATED";
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
      const icon = L.divIcon({
        html: `<div style="color:#ff0033;font-size:16px;font-weight:bold;text-shadow:0 0 4px #f00">📹</div>`,
        className: "",
        iconSize: [20, 20],
      });
      
      const marker = L.marker([cam.lat, cam.lon], { icon }).addTo(map);
      markersRef.current.push(marker);
      
      marker.bindPopup(`
        <div style="background:#000;color:#00ff00;font-family:Courier New;font-size:10px;padding:8px;border:1px solid #ff0033;width:200px">
          <div style="color:#ff0033;font-weight:bold;margin-bottom:4px">CCTV FEED (SIMULATED)</div>
          <div>CAMERA ID: ${cam.id}</div>
          <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">LOC: ${cam.name}</div>
          
          <!-- Tactical / Real View Toggles -->
          <div style="display:flex;margin:6px 0;border:1px solid #440000;font-size:8px;background:#0d0000;font-family:Courier New">
            <div id="cctv-btn-tac-${cam.id}" style="flex:1;text-align:center;padding:3px;background:#ff0033;color:#000;cursor:pointer;font-weight:bold;transition:all 0.2s">TACTICAL</div>
            <div id="cctv-btn-real-${cam.id}" style="flex:1;text-align:center;padding:3px;color:#ff0033;cursor:pointer;transition:all 0.2s">REAL VIEW</div>
          </div>
          
          <div style="margin-top:6px;position:relative;height:80px;background:#000;overflow:hidden;border:1px solid #333">
            <canvas id="cctv-canvas-${cam.id}" width="182" height="80" style="display:block"></canvas>
            ${cam.realImg && (cam.realImg.includes("youtube.com") || cam.realImg.includes("youtube-nocookie.com")) ? `
              <iframe id="cctv-img-${cam.id}" src="${cam.realImg}" style="display:none;width:100%;height:100%;border:none;" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            ` : `
              <img id="cctv-img-${cam.id}" src="${cam.realImg}" style="display:none;width:100%;height:100%;object-fit:cover;filter:contrast(1.1) brightness(0.9)" />
            `}
          </div>
          <div style="font-size:8px;color:#888;margin-top:4px">CONE OF VIEWSHED DISPLAYED ON MAP</div>
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
          color: "#ff0033",
          fillColor: "#ff0000",
          fillOpacity: 0.25,
          weight: 1
        }).addTo(map);
        
        cctvPolygonRef.current = polygon;

        // Toggle handling
        setTimeout(() => {
          const btnTac = document.getElementById(`cctv-btn-tac-${cam.id}`);
          const btnReal = document.getElementById(`cctv-btn-real-${cam.id}`);
          const canvas = document.getElementById(`cctv-canvas-${cam.id}`);
          const img = document.getElementById(`cctv-img-${cam.id}`);

          if (btnTac && btnReal && canvas && img) {
            btnTac.onclick = () => {
              canvas.style.display = "block";
              img.style.display = "none";
              btnTac.style.background = "#ff0033";
              btnTac.style.color = "#000";
              btnTac.style.fontWeight = "bold";
              btnReal.style.background = "transparent";
              btnReal.style.color = "#ff0033";
            };

            btnReal.onclick = () => {
              canvas.style.display = "none";
              img.style.display = "block";
              btnReal.style.background = "#ff0033";
              btnReal.style.color = "#000";
              btnReal.style.fontWeight = "bold";
              btnTac.style.background = "transparent";
              btnTac.style.color = "#ff0033";
            };
          }

          // Initialize canvas animation inside the popup
          if (canvas) {
            const ctx = canvas.getContext("2d");
            let animationId;
            
            const targets = [
              { x: Math.random() * 182, y: Math.random() * 80, dx: (Math.random() - 0.5) * 1.5, dy: (Math.random() - 0.5) * 1.5, label: "TGT-ALPHA" },
              { x: Math.random() * 182, y: Math.random() * 80, dx: (Math.random() - 0.5) * 1.5, dy: (Math.random() - 0.5) * 1.5, label: "TGT-BETA" }
            ];

            const draw = () => {
              if (!document.getElementById(`cctv-canvas-${cam.id}`)) {
                cancelAnimationFrame(animationId);
                return;
              }
              
              // Base green background
              ctx.fillStyle = "#020f02";
              ctx.fillRect(0, 0, 182, 80);
              
              // Dynamic grain noise
              ctx.fillStyle = "rgba(0, 255, 0, 0.07)";
              for (let i = 0; i < 40; i++) {
                ctx.fillRect(Math.random() * 182, Math.random() * 80, 1, 1);
              }
              
              // Tactical crosshair scope grid lines
              ctx.strokeStyle = "rgba(0, 255, 0, 0.12)";
              ctx.lineWidth = 0.5;
              
              for (let x = 20; x < 182; x += 20) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 80); ctx.stroke();
              }
              for (let y = 15; y < 80; y += 15) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(182, y); ctx.stroke();
              }
              
              // Targets simulation
              targets.forEach(t => {
                t.x += t.dx;
                t.y += t.dy;
                if (t.x < 10 || t.x > 172) t.dx *= -1;
                if (t.y < 10 || t.y > 70) t.dy *= -1;
                
                ctx.strokeStyle = "rgba(0, 255, 0, 0.7)";
                ctx.strokeRect(t.x - 5, t.y - 5, 10, 10);
                
                ctx.fillStyle = "rgba(0, 255, 0, 0.7)";
                ctx.font = "6px monospace";
                ctx.fillText(t.label, t.x + 8, t.y - 2);
                ctx.fillText("LOCK: 98%", t.x + 8, t.y + 4);
              });
              
              // Radar sweep bar line
              const scanY = (Date.now() / 20) % 80;
              ctx.strokeStyle = "rgba(0, 255, 0, 0.35)";
              ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(182, scanY); ctx.stroke();
              
              // System labels
              ctx.fillStyle = "#00ff00";
              ctx.font = "7px Courier New";
              ctx.fillText("SYS: SECURE_FEED", 6, 10);
              ctx.fillText("AZ: " + Math.round((Date.now() / 150) % 360) + "°", 130, 10);
              ctx.fillText("REC 🔴", 6, 74);
              ctx.fillText(new Date().toLocaleTimeString(), 120, 74);
              
              animationId = requestAnimationFrame(draw);
            };
            draw();
          }
        }, 50);
      });

      marker.on("popupclose", () => {
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
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "OpenStreetMap"
    }).addTo(map);
    
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
      localStorage.setItem("ge_map_tab", activeTab);
      
      // Update URL query params
      updateQueryParams(center.lat, center.lng, zoom, activeTab, activeStyle);
    });

    loadData();
  };

  const initMap = () => {
    createMap();
  };

  const loadData = async () => {
    const initiatedTab = activeTab;
    setLoading(true);
    setError(null);
    setResults(null);
    
    if (cctvPolygonRef.current) {
      cctvPolygonRef.current.remove();
      cctvPolygonRef.current = null;
    }
    
    try {
      const map = leafletMapRef.current;
      const L = window.L;
      
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      
      let data = [];
      switch (activeTab) {
        case "LIVE FLIGHTS":
          const res = await axios.get(`${API}/geo/flights`);
          if (activeTabRef.current !== initiatedTab) return;
          data = res.data.data.flights || [];
          setResults(res.data.data);
          if (map && L) {
            plotFlights(map, data);
          }
          break;
        case "MILITARY FLIGHTS":
          data = await fetchMilitaryFlights();
          if (activeTabRef.current !== initiatedTab) return;
          setResults({ flights: data, count: data.length });
          if (map && L) {
            const markers = plotMilitaryFlights(map, data, L);
            markersRef.current = markers;
          }
          break;
        case "EARTHQUAKES":
          data = await fetchEarthquakes();
          if (activeTabRef.current !== initiatedTab) return;
          setResults({ events: data, count: data.length });
          if (map && L) {
            const markers = plotEarthquakes(map, data, L);
            markersRef.current = markers;
          }
          break;
        case "SATELLITE ORBITS":
          data = await fetchSatellites();
          if (activeTabRef.current !== initiatedTab) return;
          setResults({ satellites: data, count: data.length });
          if (map && L) {
            const markers = plotSatellites(map, data, L);
            markersRef.current = markers;
          }
          break;
        case "BIKESHARE":
          data = await fetchBikeshare();
          if (activeTabRef.current !== initiatedTab) return;
          setResults({ stations: data, count: data.length });
          if (map && L) {
            const markers = plotBikeshare(map, data, L);
            markersRef.current = markers;
            map.setView([30.2680, -97.7420], 13);
          }
          break;
        case "RADIO BROWSER":
          const uLat = userCoords ? userCoords[0] : null;
          const uLon = userCoords ? userCoords[1] : null;
          data = await fetchRadioStations(uLat, uLon);
          if (activeTabRef.current !== initiatedTab) return;
          setResults({ stations: data, count: data.length });
          if (map && L) {
            const markers = plotRadioStations(map, data, L);
            markersRef.current = markers;
            if (uLat !== null && uLon !== null) {
              map.setView([uLat, uLon], 5);
            }
          }
          break;
        case "CCTV MONITOR":
          if (map && L) {
            const currentZoomBefore = map.getZoom();
            if (userCoords && currentZoomBefore <= 3) {
              map.setView(userCoords, 14);
            }
            const currentCenter = map.getCenter();
            let osmCams = [];
            try {
              const res = await axios.get(`${API}/geo/cameras?lat=${currentCenter.lat}&lon=${currentCenter.lng}`);
              if (res.data && res.data.status === "success") {
                osmCams = res.data.data || [];
              }
            } catch (err) {
              console.warn("Failed to fetch real-time OSM cameras, using fallback only", err);
            }

            // Fallback mock generator near active viewport coordinates if OSM is empty
            if (osmCams.length === 0) {
              const lat = currentCenter.lat;
              const lon = currentCenter.lng;
              const mockFeeds = [
                { suffix: "01", name: "Main Street & Highway Intersection", gif: "/feeds/feed1.gif" },
                { suffix: "02", name: "Commercial Center Traffic Flow", gif: "/feeds/feed2.gif" },
                { suffix: "03", name: "Pedestrian Crossing Safety Feed", gif: "/feeds/feed3.gif" },
                { suffix: "04", name: "Secured Area Access Cam", gif: "/feeds/feed5.gif" }
              ];
              
              osmCams = mockFeeds.map((feed, idx) => {
                const offsetLat = (idx === 0 ? 0.001 : idx === 1 ? -0.0012 : idx === 2 ? 0.0008 : -0.0009);
                const offsetLon = (idx === 0 ? 0.0015 : idx === 1 ? 0.0018 : idx === 2 ? -0.0015 : -0.002);
                return {
                  id: `CAM-GPS-${feed.suffix}`,
                  name: `${feed.name} (Local)`,
                  lat: lat + offsetLat,
                  lon: lon + offsetLon,
                  angle: idx * 90 + 45,
                  radius: 0.003,
                  realImg: feed.gif
                };
              });
            }

            if (activeTabRef.current !== initiatedTab) return;

            // Merge fallback cameras with OSM cameras, filtering duplicates
            const allCams = [...osmCams];
            CAMERAS_FALLBACK.forEach(f => {
              const duplicate = allCams.some(c => 
                c.id === f.id || 
                (Math.abs(c.lat - f.lat) < 0.0001 && Math.abs(c.lon - f.lon) < 0.0001)
              );
              if (!duplicate) {
                allCams.push(f);
              }
            });

            plotCctvCameras(map, allCams, L);
            setResults({ cameras: allCams.length });

            const currentZoom = map.getZoom();
            if (currentZoom > 3) {
              const distToBlr = Math.sqrt(Math.pow(currentCenter.lat - 13.1682, 2) + Math.pow(currentCenter.lng - 77.5354, 2));
              const distToAus = Math.sqrt(Math.pow(currentCenter.lat - 30.2680, 2) + Math.pow(currentCenter.lng - (-97.7420), 2));
              
              if (distToBlr < distToAus && distToBlr < 1.0) {
                map.setView([13.1682, 77.5354], 15);
              } else if (distToAus < 1.0) {
                map.setView([30.2680, -97.7420], 13);
              } else if (osmCams.length > 0) {
                let closest = osmCams[0];
                let minDist = Infinity;
                osmCams.forEach(c => {
                  const dist = Math.sqrt(Math.pow(currentCenter.lat - c.lat, 2) + Math.pow(currentCenter.lng - c.lon, 2));
                  if (dist < minDist) {
                    minDist = dist;
                    closest = c;
                  }
                });
                map.setView([closest.lat, closest.lon], 15);
              }
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
      if (activeTabRef.current === initiatedTab) {
        setError(e.message);
      }
    }
    if (activeTabRef.current === initiatedTab) {
      setLoading(false);
    }
  };

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
    const searchInput = overrideInput !== null ? overrideInput : input;
    const searchLat = overrideLat !== null ? overrideLat : lat;
    const searchLon = overrideLon !== null ? overrideLon : lon;
    const searchTab = overrideTab !== null ? overrideTab : activeTab;

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
          if (searchLat && searchLon) {
            res = await axios.get(`${API}/geo/reverse?lat=${searchLat}&lon=${searchLon}`);
            setResults(res.data);
            if (leafletMapRef.current) {
              leafletMapRef.current.flyTo([parseFloat(searchLat), parseFloat(searchLon)], 14);
            }
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
          <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.6)", padding: "4px 8px", border: "1px solid rgba(0,255,200,0.2)" }}>
            <div>SYSTEM: OMNIVISION_V1 // SATELLITE_FEED</div>
            <div>SECTOR: {activeTab}</div>
            <div>ZOOM: {mapZoom}x</div>
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
      {results?.satellite && (
        <div style={s.section}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
            <div style={s.title}>SATELLITE IMAGERY PRESENTS</div>
            <DataIntegrityBadge state="THIRD-PARTY" />
          </div>
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "12px" }}>
            Coordinates: {lat}, {lon}
          </div>
          {Object.entries(results.satellite)
            .filter(([k]) => k !== "status" && k !== "latitude" && k !== "longitude")
            .map(([k, v]) => (
              <div key={k} style={{ marginBottom: "8px" }}>
                <a href={v} target="_blank" rel="noreferrer"
                  style={{ color: "#ff4400", fontSize: "11px", textDecoration: "none" }}>
                  {k.toUpperCase().replace(/_/g, " ")} VIEW
                </a>
              </div>
            ))}
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
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" }}>
            {activeTab === "LIVE FLIGHTS" ? "SEARCH CALLSIGN" :
             activeTab === "LOCATION SEARCH" ? "SEARCH LOCATION" :
             activeTab === "WEATHER" ? "CITY NAME OR COORDS" :
             "COORDINATES"}
          </div>

          {(activeTab === "SATELLITE VIEW" || activeTab === "WEATHER") && (
            <div style={{ marginBottom: "6px" }}>
              <input
                type="text"
                placeholder="Latitude e.g. 28.6139"
                value={lat}
                onChange={e => setLat(e.target.value)}
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
                background: "#1a0000", border: "1px solid #ff0000", color: "#ff0000",
              }}>
              {loading ? "ACQUIRING..." :
               activeTab === "LIVE FLIGHTS" && !input ? "LOAD DATA LAYER" :
               activeTab === "MILITARY FLIGHTS" || activeTab === "EARTHQUAKES" || activeTab === "SATELLITE ORBITS" || activeTab === "BIKESHARE" || activeTab === "RADIO BROWSER" || activeTab === "CCTV MONITOR" ? "RELOAD DATA LAYER" :
               "SEARCH"}
            </button>
          )}

          {activeTab === "CCTV MONITOR" && userCoords && (
            <button onClick={async () => {
              if (leafletMapRef.current) {
                leafletMapRef.current.flyTo(userCoords, 14);
                setTimeout(() => {
                  loadData();
                }, 450);
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
          { label: "[FLIGHTS] US Airspace Feed", action: () => { setActiveTab("LIVE FLIGHTS"); setInput(""); if (leafletMapRef.current) leafletMapRef.current.setView([39.8283, -98.5795], 4); }},
          { label: "[MILITARY] Area 51 Tracks", action: () => { setActiveTab("MILITARY FLIGHTS"); setInput(""); if (leafletMapRef.current) leafletMapRef.current.setView([37.235, -115.811], 10); }},
          { label: "[SHIPS] English Channel Traffic", action: () => { setActiveTab("SHIP TRACKER"); }},
          { label: "[SEISMIC] Pacific Ring of Fire", action: () => { setActiveTab("EARTHQUAKES"); if (leafletMapRef.current) leafletMapRef.current.setView([20, 0], 2); }},
          { label: "[ORBITS] ISS Satellite Path", action: () => { setActiveTab("SATELLITE ORBITS"); if (leafletMapRef.current) leafletMapRef.current.setView([20, 0], 2); }},
          { label: "[BIKES] Austin B-Cycle Hubs", action: () => { setActiveTab("BIKESHARE"); if (leafletMapRef.current) leafletMapRef.current.setView([30.2680, -97.7420], 13); }},
          { label: "[RADIO] London Nodes", action: () => { setActiveTab("RADIO BROWSER"); if (leafletMapRef.current) leafletMapRef.current.setView([51.5074, -0.1278], 10); }},
          { label: "[SURVEILLANCE] Austin CCTV Cones", action: () => { setActiveTab("CCTV MONITOR"); if (leafletMapRef.current) leafletMapRef.current.setView([30.2680, -97.7420], 13); }},
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

        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", gap: "12px" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}
                className="animate-pulse">
                ACQUIRING SATELLITE TELEMETRY...
              </div>
              <div style={{ color: "#440000", fontSize: "11px" }}>
                Resolving data integrity handshake
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: "12px", border: "1px solid #ff0000", background: "#0d0000" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", marginBottom: "4px" }}>GEO OVERLAY ERROR</div>
              <div style={{ color: "#882222", fontSize: "11px" }}>{error}</div>
            </div>
          )}

          {/* Always mount map container in the DOM, but hide it if not a map tab or loading */}
          <div style={{ 
            display: (["LIVE FLIGHTS", "MILITARY FLIGHTS", "EARTHQUAKES", "SATELLITE ORBITS", "BIKESHARE", "RADIO BROWSER", "CCTV MONITOR", "LOCATION SEARCH", "SATELLITE VIEW", "WEATHER"].includes(activeTab) && !loading) ? "block" : "none", 
            height: "100%" 
          }}>
            {renderFlights()}
          </div>

          {!loading && activeTab === "SHIP TRACKER" && renderShips()}
          {!loading && activeTab === "LOCATION SEARCH" && renderLocationSearch()}
          {!loading && activeTab === "SATELLITE VIEW" && renderSatellite()}
          {!loading && activeTab === "WEATHER" && renderWeather()}
        </div>
      </div>
    </div>
  );
}
