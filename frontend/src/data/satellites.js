export async function fetchSatellites() {
  try {
    const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const iss = await response.json();
    
    const time = Date.now() / 1000;
    const sentinelLat = 50 * Math.sin(time / 1000);
    const sentinelLon = (time / 10) % 360 - 180;
    
    const hubbleLat = -28.5 * Math.sin(time / 800 + 1);
    const hubbleLon = (time / 8) % 360 - 180;
    
    return [
      {
        name: "ISS (ZARYA)",
        lat: parseFloat(iss.latitude),
        lon: parseFloat(iss.longitude),
        altitude: parseFloat(iss.altitude),
        velocity: parseFloat(iss.velocity),
        type: "LIVE"
      },
      {
        name: "SENTINEL-1A",
        lat: sentinelLat,
        lon: sentinelLon,
        altitude: 693.0,
        velocity: 27500.0,
        type: "ESTIMATE"
      },
      {
        name: "HUBBLE SPACE TELESCOPE",
        lat: hubbleLat,
        lon: hubbleLon,
        altitude: 540.0,
        velocity: 27300.0,
        type: "ESTIMATE"
      }
    ];
  } catch (error) {
    console.error("Satellites API error (falling back to estimations):", error);
    const time = Date.now() / 1000;
    return [
      {
        name: "ISS (ZARYA)",
        lat: 51.64 * Math.sin(time / 1200),
        lon: (time / 15) % 360 - 180,
        altitude: 420.0,
        velocity: 27600.0,
        type: "ESTIMATE"
      },
      {
        name: "SENTINEL-1A",
        lat: 50 * Math.sin(time / 1000),
        lon: (time / 10) % 360 - 180,
        altitude: 693.0,
        velocity: 27500.0,
        type: "ESTIMATE"
      }
    ];
  }
}

export function plotSatellites(map, satellites, L) {
  if (!map || !L || !satellites.length) return [];
  const markers = [];
  
  satellites.forEach(sat => {
    const lat = sat.lat;
    const lon = sat.lon;
    if (lat === undefined || lon === undefined) return;
    
    const isLive = sat.type === "LIVE";
    
    const points = [];
    const period = sat.name.includes("ISS") ? 1200 : sat.name.includes("SENTINEL") ? 1000 : 800;
    const time = Date.now() / 1000;
    const inclination = sat.name.includes("ISS") ? 51.64 : sat.name.includes("SENTINEL") ? 50 : 28.5;
    
    for (let i = -180; i <= 180; i += 10) {
      const pLat = inclination * Math.sin((time + i * 5) / period);
      const pLon = (lon + i) % 360;
      const normalizedLon = pLon > 180 ? pLon - 360 : pLon < -180 ? pLon + 360 : pLon;
      points.push([pLat, normalizedLon]);
    }
    
    points.sort((a, b) => a[1] - b[1]);
    
    const polyline = L.polyline(points, {
      color: isLive ? '#00ff00' : '#ffff00',
      dashArray: '5, 10',
      weight: 1,
      opacity: 0.4
    }).addTo(map);
    
    markers.push(polyline);
    
    const icon = L.divIcon({
      html: `<div style="color:${isLive ? '#00ff00' : '#ffff00'};font-size:14px;font-weight:bold;transform:rotate(45deg)">✦</div>`,
      className: "",
      iconSize: [16, 16],
    });
    
    const marker = L.marker([lat, lon], { icon }).bindPopup(`
      <div style="background:#0d0000;color:${isLive ? '#00ff00' : '#ffff00'};font-family:Courier New;font-size:11px;padding:8px;border:1px solid ${isLive ? '#00ff00' : '#ffff00'}">
        <div style="font-weight:bold;margin-bottom:4px">ORBITAL SATELLITE</div>
        <div>NAME: ${sat.name}</div>
        <div>LATITUDE: ${lat.toFixed(4)}</div>
        <div>LONGITUDE: ${lon.toFixed(4)}</div>
        <div>ALTITUDE: ${sat.altitude.toFixed(1)} km</div>
        <div>VELOCITY: ${sat.velocity.toFixed(0)} km/h</div>
      </div>
    `, { autoPan: false }).addTo(map);
    
    markers.push(marker);
  });
  
  return markers;
}
