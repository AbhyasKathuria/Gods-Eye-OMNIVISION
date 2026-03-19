import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = "http://localhost:8000";
const TABS = ["LIVE FLIGHTS", "SHIP TRACKER", "LOCATION SEARCH", "SATELLITE VIEW", "WEATHER"];

export default function GeoTracker() {
  const [activeTab, setActiveTab] = useState("LIVE FLIGHTS");
  const [input, setInput] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (activeTab === "LIVE FLIGHTS") {
      loadFlights();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "LIVE FLIGHTS" && !leafletMapRef.current && mapRef.current) {
      initMap();
    }
  }, [activeTab, flights]);

  const initMap = () => {
    if (leafletMapRef.current) return;
    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => createMap();
      document.head.appendChild(script);
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    } else {
      createMap();
    }
  };

  const createMap = () => {
    if (!mapRef.current || leafletMapRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "OpenStreetMap"
    }).addTo(map);
    leafletMapRef.current = map;
    plotFlights(map, flights);
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

  const loadFlights = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/geo/flights`);
      const flightData = res.data.data.flights || [];
      setFlights(flightData);
      setResults(res.data.data);
      if (leafletMapRef.current) {
        plotFlights(leafletMapRef.current, flightData);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!input.trim() && !lat && !lon) return;
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      let res;
      switch (activeTab) {
        case "LOCATION SEARCH":
          res = await axios.get(`${API}/geo/geocode?query=${encodeURIComponent(input)}`);
          setResults(res.data.data);
          break;
        case "SATELLITE VIEW":
          if (lat && lon) {
            res = await axios.get(`${API}/geo/reverse?lat=${lat}&lon=${lon}`);
            setResults(res.data);
          }
          break;
        case "WEATHER":
          if (lat && lon) {
            res = await axios.get(`${API}/geo/weather?lat=${lat}&lon=${lon}`);
            setResults(res.data.data);
          } else {
            const geo = await axios.get(`${API}/geo/geocode?query=${encodeURIComponent(input)}`);
            if (geo.data.data.results?.length > 0) {
              const loc = geo.data.data.results[0];
              res = await axios.get(`${API}/geo/weather?lat=${loc.latitude}&lon=${loc.longitude}`);
              setResults(res.data.data);
            }
          }
          break;
        case "LIVE FLIGHTS":
          if (input) {
            res = await axios.get(`${API}/geo/flights/${input.toUpperCase()}`);
            setResults(res.data.data);
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
      <div style={{ padding: "8px 0", marginBottom: "8px" }}>
        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}>
          LIVE FLIGHT TRACKER — {results?.total || 0} AIRCRAFT DETECTED
        </div>
      </div>
      <div ref={mapRef} style={{
        flex: 1, minHeight: "400px",
        border: "1px solid #440000",
        background: "#0d0000"
      }} />
      {results?.showing && (
        <div style={{ color: "#440000", fontSize: "11px", marginTop: "8px" }}>
          DISPLAYING {results.showing} OF {results.total} AIRCRAFT
        </div>
      )}
    </div>
  );

  const renderShips = () => {
    const ships = results?.data;
    return (
      <div>
        <div style={s.section}>
          <div style={s.title}>LIVE SHIP TRACKER</div>
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
  };

  const renderLocationSearch = () => (
    <div>
      {results?.results?.map((loc, i) => (
        <div key={i} style={{ ...s.section, cursor: "pointer" }}
          onClick={async () => {
            const res = await axios.get(`${API}/geo/reverse?lat=${loc.latitude}&lon=${loc.longitude}`);
            setSelectedFlight(res.data);
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
          <div style={{ color: "#330000", fontSize: "10px", marginTop: "4px" }}>
            Click to get full location intelligence
          </div>
        </div>
      ))}

      {selectedFlight && (
        <div>
          <div style={{ ...s.section, borderColor: "#ff0000" }}>
            <div style={s.title}>LOCATION INTELLIGENCE</div>
            <div style={s.row}>
              <span style={s.label}>ADDRESS: </span>
              <span style={s.value}>{selectedFlight.location?.display_name?.slice(0, 100)}</span>
            </div>
          </div>
          {selectedFlight.weather && (
            <div style={s.section}>
              <div style={s.title}>WEATHER DATA</div>
              <div style={s.grid2}>
                {[
                  ["CITY", selectedFlight.weather.city],
                  ["COUNTRY", selectedFlight.weather.country],
                  ["TEMP", `${selectedFlight.weather.temperature}C`],
                  ["FEELS LIKE", `${selectedFlight.weather.feels_like}C`],
                  ["HUMIDITY", `${selectedFlight.weather.humidity}%`],
                  ["WIND", `${selectedFlight.weather.wind_speed}m/s`],
                  ["CONDITIONS", selectedFlight.weather.weather],
                ].map(([k, v]) => v && (
                  <div key={k} style={s.row}>
                    <span style={s.label}>{k}: </span>
                    <span style={s.value}>{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedFlight.satellite && (
            <div style={s.section}>
              <div style={s.title}>SATELLITE IMAGERY LINKS</div>
              {Object.entries(selectedFlight.satellite).filter(([k]) => k !== "status").map(([k, v]) => (
                <div key={k} style={{ marginBottom: "6px" }}>
                  <a href={v} target="_blank" rel="noreferrer"
                    style={{ color: "#ff4400", fontSize: "11px", textDecoration: "none" }}>
                    {k.toUpperCase().replace("_", " ")} VIEW
                  </a>
                </div>
              ))}
            </div>
          )}
          {selectedFlight.ai_report && (
            <div style={{ ...s.section, borderColor: "#ff0000" }}>
              <div style={s.title}>AI GEO INTELLIGENCE REPORT</div>
              <pre style={{ color: "#882222", fontSize: "11px",
                whiteSpace: "pre-wrap", fontFamily: "Courier New", lineHeight: "1.6" }}>
                {selectedFlight.ai_report}
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
          <div style={s.title}>SATELLITE IMAGERY</div>
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
      {results?.location && (
        <div style={s.section}>
          <div style={s.title}>LOCATION DATA</div>
          <div style={s.row}>
            <span style={s.label}>ADDRESS: </span>
            <span style={s.value}>{results.location.display_name?.slice(0, 100)}</span>
          </div>
        </div>
      )}
      {results?.weather && (
        <div style={s.section}>
          <div style={s.title}>WEATHER</div>
          <div style={s.grid2}>
            {[
              ["CITY", results.weather.city],
              ["TEMP", `${results.weather.temperature}C`],
              ["CONDITIONS", results.weather.weather],
              ["WIND", `${results.weather.wind_speed}m/s`],
            ].map(([k, v]) => v && (
              <div key={k} style={s.row}>
                <span style={s.label}>{k}: </span>
                <span style={s.value}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {results?.ai_report && (
        <div style={{ ...s.section, borderColor: "#ff0000" }}>
          <div style={s.title}>AI GEO REPORT</div>
          <pre style={{ color: "#882222", fontSize: "11px",
            whiteSpace: "pre-wrap", fontFamily: "Courier New", lineHeight: "1.6" }}>
            {results.ai_report}
          </pre>
        </div>
      )}
    </div>
  );

  const renderWeather = () => (
    <div>
      {results && (
        <div style={s.section}>
          <div style={s.title}>WEATHER INTELLIGENCE</div>
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
      case "LIVE FLIGHTS": return renderFlights();
      case "SHIP TRACKER": return renderShips();
      case "LOCATION SEARCH": return renderLocationSearch();
      case "SATELLITE VIEW": return renderSatellite();
      case "WEATHER": return renderWeather();
      default: return null;
    }
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#000000" }}>

      {/* Left Panel */}
      <div style={{
        width: "260px", display: "flex", flexDirection: "column",
        gap: "12px", padding: "12px", borderRight: "1px solid #440000",
        background: "#030000", overflowY: "auto"
      }}>
        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px",
          paddingBottom: "8px", borderBottom: "1px solid #440000" }}>
          GEO TRACKER
        </div>

        <div>
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" }}>
            SELECT MODULE
          </div>
          {TABS.map(tab => (
            <button key={tab} onClick={() => {
              setActiveTab(tab);
              setResults(null);
              setInput("");
              setSelectedFlight(null);
              if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
              }
            }}
              style={{
                width: "100%", padding: "8px", marginBottom: "4px",
                fontSize: "11px", letterSpacing: "1px", cursor: "pointer",
                fontFamily: "Courier New", textAlign: "left",
                background: activeTab === tab ? "#1a0000" : "#060000",
                border: `1px solid ${activeTab === tab ? "#ff0000" : "#330000"}`,
                color: activeTab === tab ? "#ff0000" : "#552222",
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

          {activeTab !== "SATELLITE VIEW" && (
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

          <button onClick={activeTab === "LIVE FLIGHTS" && !input ? loadFlights : handleSearch}
            disabled={loading}
            style={{
              width: "100%", padding: "8px", marginTop: "6px",
              fontSize: "11px", letterSpacing: "1px", cursor: "pointer",
              fontFamily: "Courier New",
              background: "#1a0000", border: "1px solid #ff0000", color: "#ff0000",
            }}>
            {loading ? "LOADING..." :
             activeTab === "LIVE FLIGHTS" && !input ? "LOAD LIVE FLIGHTS" :
             activeTab === "SHIP TRACKER" ? "LOAD SHIP TRACKER" :
             "SEARCH"}
          </button>
        </div>

        {/* Quick Tests */}
        <div style={{ borderTop: "1px solid #220000" }} />
        <div style={{ color: "#882222", fontSize: "11px", letterSpacing: "1px" }}>
          QUICK TESTS
        </div>
        {[
          { label: "Mumbai Weather", action: () => { setActiveTab("WEATHER"); setInput("Mumbai"); }},
          { label: "Delhi Location", action: () => { setActiveTab("LOCATION SEARCH"); setInput("New Delhi"); }},
          { label: "India Satellite", action: () => { setActiveTab("SATELLITE VIEW"); setLat("28.6139"); setLon("77.2090"); }},
        ].map((t, i) => (
          <button key={i} onClick={t.action}
            style={{
              width: "100%", padding: "6px 8px", marginBottom: "4px",
              fontSize: "11px", cursor: "pointer", fontFamily: "Courier New",
              textAlign: "left", background: "#060000",
              border: "1px solid #330000", color: "#552222",
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
            <div style={{ color: "#440000", fontSize: "11px" }}>DATA LOADED</div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

          {!results && !loading && !error && activeTab !== "SHIP TRACKER" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", color: "#220000" }}>
              <div style={{ fontSize: "48px", color: "#1a0000", marginBottom: "16px" }}>[ @ ]</div>
              <div style={{ fontSize: "13px", letterSpacing: "3px" }}>SELECT MODULE AND SEARCH</div>
              <div style={{ fontSize: "11px", marginTop: "8px", color: "#150000" }}>
                Flights / Ships / Locations / Satellite / Weather
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", gap: "12px" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}
                className="animate-pulse">
                ACQUIRING SATELLITE DATA...
              </div>
              <div style={{ color: "#440000", fontSize: "11px" }}>
                Connecting to geo intelligence network
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: "12px", border: "1px solid #ff0000", background: "#0d0000" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", marginBottom: "4px" }}>GEO ERROR</div>
              <div style={{ color: "#882222", fontSize: "11px" }}>{error}</div>
            </div>
          )}

          {activeTab === "SHIP TRACKER" && renderShips()}
          {!loading && results && activeTab !== "SHIP TRACKER" && renderResults()}
          {!loading && !results && activeTab === "LIVE FLIGHTS" && renderFlights()}
        </div>
      </div>
    </div>
  );
}
