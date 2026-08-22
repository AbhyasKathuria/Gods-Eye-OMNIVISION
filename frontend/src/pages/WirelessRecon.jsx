import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function WirelessRecon() {
  const [lat, setLat] = useState("13.1678");
  const [lon, setLon] = useState("77.5350");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Clean up map when component unmounts
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const createMap = (center, zoom) => {
    if (!mapRef.current || leafletMapRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
    });

    // Dark-themed tactical tiles from CartoDB Dark Matter
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "OpenStreetMap & CartoDB"
    }).addTo(map);

    leafletMapRef.current = map;
  };

  const initMap = (center = [13.1678, 77.5350], zoom = 15) => {
    if (!mapRef.current) return;
    if (leafletMapRef.current) {
      leafletMapRef.current.setView(center, zoom);
      return;
    }

    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => createMap(center, zoom);
      document.head.appendChild(script);
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    } else {
      createMap(center, zoom);
    }
  };

  const plotWifiBeacons = (wifiData) => {
    if (!leafletMapRef.current || !window.L) return;
    const L = window.L;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (wifiData.length === 0) return;

    wifiData.forEach(n => {
      if (!n.lat || !n.lon) return;

      // Draw red pulsing indicator
      const icon = L.divIcon({
        html: `<div style="
          width: 12px; height: 12px; border-radius: 50%;
          background: #ff0000; border: 2px solid #fff;
          box-shadow: 0 0 8px #ff0000;
          animation: pulse 1.5s infinite;
        "></div>`,
        className: "",
        iconSize: [12, 12],
      });

      const latStr = n.lat ? n.lat.toFixed(4) : "N/A";
      const lonStr = n.lon ? n.lon.toFixed(4) : "N/A";

      const marker = L.marker([n.lat, n.lon], { icon })
        .bindPopup(`
          <div style="background:#0d0000;color:#ff2222;font-family:Courier New;font-size:11px;padding:8px;border:1px solid #ff0000;min-width:180px">
            <div style="color:#ff0000;font-weight:bold;margin-bottom:4px;font-size:12px;border-bottom:1px solid #440000;padding-bottom:2px">${n.ssid || "HIDDEN SSID"}</div>
            <div>BSSID: <span style="color:#aaa">${n.bssid}</span></div>
            <div>ENCRYPTION: <span style="color:#ff6600">${n.encryption || "OPEN"}</span></div>
            <div>CHANNEL: <span style="color:#aaa">${n.channel || "N/A"}</span></div>
            <div>TYPE: <span style="color:#aaa">${n.type || "WIFI"}</span></div>
            <div>COORD: <span style="color:#aaa">${latStr}, ${lonStr}</span></div>
          </div>
        `)
        .addTo(leafletMapRef.current);

      markersRef.current.push(marker);
    });

    // Zoom and pan to coordinates
    leafletMapRef.current.setView([parseFloat(lat), parseFloat(lon)], 16);
  };

  const handleScan = async () => {
    if (!lat || !lon) return;
    setLoading(true);
    setResults(null);
    setError(null);

    // Initialize map immediately
    initMap([parseFloat(lat), parseFloat(lon)], 15);

    try {
      const res = await axios.get(`${API}/sigint/wifi`, {
        params: { lat: parseFloat(lat), lon: parseFloat(lon) }
      });
      if (res.data.status === "success") {
        setResults(res.data);
        // Delay plotting slightly to ensure map ref has registered
        setTimeout(() => {
          plotWifiBeacons(res.data.networks);
        }, 100);
      } else {
        setError(res.data.message || "Failed to query SIGINT parameters");
      }
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    }
    setLoading(false);
  };

  const s = {
    section: { marginBottom: "16px", padding: "12px", border: "1px solid #440000", background: "#060000" },
    title: { color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "8px" },
    row: { fontSize: "11px", marginBottom: "4px" },
    label: { color: "#ff4400" },
    value: { color: "#882222" },
  };

  // Init map on load
  useEffect(() => {
    initMap();
  }, []);

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#000000" }}>
      {/* Left Input Sidebar */}
      <div style={{
        width: "280px", display: "flex", flexDirection: "column",
        gap: "12px", padding: "12px", borderRight: "1px solid #440000",
        background: "#030000", overflowY: "auto"
      }}>
        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px",
          paddingBottom: "8px", borderBottom: "1px solid #440000" }}>
          WIRELESS RECON
        </div>

        <div>
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" }}>
            LATITUDE COORDINATE
          </div>
          <input
            type="text"
            placeholder="13.1678"
            value={lat}
            onChange={e => setLat(e.target.value)}
            style={{
              width: "100%", background: "#060000",
              border: "1px solid #440000", borderLeft: "3px solid #ff0000",
              color: "#ff2222", fontFamily: "Courier New",
              fontSize: "11px", padding: "8px 12px"
            }}
          />
        </div>

        <div>
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" }}>
            LONGITUDE COORDINATE
          </div>
          <input
            type="text"
            placeholder="77.5350"
            value={lon}
            onChange={e => setLon(e.target.value)}
            style={{
              width: "100%", background: "#060000",
              border: "1px solid #440000", borderLeft: "3px solid #ff0000",
              color: "#ff2222", fontFamily: "Courier New",
              fontSize: "11px", padding: "8px 12px"
            }}
          />
        </div>

        <button onClick={handleScan} disabled={loading}
          style={{
            width: "100%", padding: "8px", marginTop: "6px",
            fontSize: "11px", letterSpacing: "1px", cursor: "pointer",
            fontFamily: "Courier New",
            background: "#1a0000",
            border: "1px solid #ff0000",
            color: "#ff0000",
          }}>
          {loading ? "SCANNING AIRSPACE..." : "LOAD WIRELESS BEACONS"}
        </button>

        <div style={{ borderTop: "1px solid #220000" }} />
        <div style={{ color: "#882222", fontSize: "11px", letterSpacing: "1px" }}>
          TACTICAL PRESETS
        </div>
        {[
          { label: "Presidency University", lat: "13.1678", lon: "77.5350" },
          { label: "Bengaluru Airport", lat: "13.1986", lon: "77.7066" },
          { label: "London Parliament", lat: "51.4998", lon: "-0.1246" },
        ].map((p, i) => (
          <button key={i} onClick={() => { setLat(p.lat); setLon(p.lon); }}
            style={{
              width: "100%", padding: "6px 8px", marginBottom: "4px",
              fontSize: "11px", cursor: "pointer", fontFamily: "Courier New",
              textAlign: "left", background: "#060000",
              border: "1px solid #330000", color: "#552222",
            }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Right Map View */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Map Container */}
        <div ref={mapRef} style={{ flex: 1, background: "#0c0c0c" }} />

        {/* Results Metadata Summary Footer */}
        {results && (
          <div style={{
            height: "180px", borderTop: "1px solid #330000",
            background: "#030000", overflowY: "auto", padding: "12px"
          }}>
            <div style={{ color: "#ff0000", fontSize: "10px", letterSpacing: "2px", marginBottom: "8px" }}>
              WIRELESS HARVEST: {results.count} NETWORKS FOUND
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", fontFamily: "Courier New" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #330000", color: "#ff4400", textAlign: "left" }}>
                    <th style={{ padding: "4px" }}>SSID</th>
                    <th style={{ padding: "4px" }}>BSSID (MAC)</th>
                    <th style={{ padding: "4px" }}>ENCRYPTION</th>
                    <th style={{ padding: "4px" }}>CHANNEL</th>
                    <th style={{ padding: "4px", textAlign: "right" }}>COORD</th>
                  </tr>
                </thead>
                <tbody>
                  {results.networks.map((n, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #110000", color: "#aaa" }}>
                      <td style={{ padding: "4px", color: "#ff2222" }}>{n.ssid || "HIDDEN"}</td>
                      <td style={{ padding: "4px" }}>{n.bssid}</td>
                      <td style={{ padding: "4px" }}>{n.encryption || "OPEN"}</td>
                      <td style={{ padding: "4px" }}>{n.channel || "N/A"}</td>
                      <td style={{ padding: "4px", textAlign: "right", color: "#888" }}>
                        {n.lat ? n.lat.toFixed(4) : "N/A"}, {n.lon ? n.lon.toFixed(4) : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: "12px", borderTop: "1px solid #ff0000", background: "#0d0000" }}>
            <div style={{ color: "#ff0000", fontSize: "11px" }}>SIGINT AIRSPACE ERROR</div>
            <div style={{ color: "#882222", fontSize: "11px", marginTop: "2px" }}>{error}</div>
          </div>
        )}
      </div>
    </div>
  );
}
