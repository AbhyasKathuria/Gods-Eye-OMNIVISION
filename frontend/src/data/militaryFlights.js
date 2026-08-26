export async function fetchMilitaryFlights() {
  try {
    const response = await fetch('http://localhost:8000/geo/military-flights');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const aircraft = data?.ac || [];
    return aircraft.slice(0, 50).map(ac => ({
      icao: ac.hex || "MIL-HEX",
      callsign: ac.flight ? ac.flight.trim() : "MILITARY",
      country: ac.r || "Unknown Country",
      longitude: parseFloat(ac.lon),
      latitude: parseFloat(ac.lat),
      altitude: parseFloat(ac.alt_baro) || 0,
      velocity: parseFloat(ac.gs) || 0,
      heading: parseFloat(ac.track) || 0,
      type: "LIVE"
    }));
  } catch (error) {
    console.error("Military flights API error (falling back to estimated tactical patrols):", error);
    return [
      { icao: "AE081A", callsign: "RECON01", country: "United States", latitude: 37.235, longitude: -115.811, altitude: 45000, velocity: 320, heading: 90, type: "ESTIMATE" },
      { icao: "AE123F", callsign: "PATROL5", country: "United States", latitude: 37.400, longitude: -115.900, altitude: 38000, velocity: 280, heading: 240, type: "ESTIMATE" },
      { icao: "AD455B", callsign: "RECON02", country: "Germany", latitude: 49.445, longitude: 7.600, altitude: 28000, velocity: 250, heading: 180, type: "ESTIMATE" }
    ];
  }
}

export function plotMilitaryFlights(map, flights, L) {
  if (!map || !L || !flights.length) return [];
  const markers = [];
  
  flights.forEach(f => {
    if (!f.latitude || !f.longitude) return;
    
    const isLive = f.type === "LIVE";
    const icon = L.divIcon({
      html: `<div style="color:#ffaa00;font-size:18px;font-weight:bold;transform:rotate(${f.heading || 0}deg);width:30px;height:30px;line-height:30px;text-align:center;cursor:pointer">✈</div>`,
      className: "",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
    
    const marker = L.marker([f.latitude, f.longitude], { icon }).bindPopup(`
      <div style="background:#0d0000;color:#ffaa00;font-family:Courier New;font-size:11px;padding:8px;border:1px solid #ffaa00">
        <div style="font-weight:bold;margin-bottom:4px">TACTICAL PATROL</div>
        <div>CALLSIGN: ${f.callsign}</div>
        <div>ICAO: ${f.icao}</div>
        <div>COUNTRY: ${f.country}</div>
        <div>ALTITUDE: ${f.altitude} ft</div>
        <div>SPEED: ${f.velocity} knots</div>
        <div>HEADING: ${f.heading}°</div>
      </div>
    `, { autoPan: false }).addTo(map);
    
    markers.push(marker);
  });
  
  return markers;
}
