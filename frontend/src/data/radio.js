export async function fetchRadioStations(userLat = null, userLon = null) {
  try {
    const response = await fetch('https://de1.api.radio-browser.info/json/stations/topclick/250');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const stations = data.filter(s => s.geo_lat && s.geo_long);
    if (stations.length === 0) {
      throw new Error("No geo-located stations in raw response");
    }
    
    let mapped = stations.map(s => ({
      name: s.name,
      country: s.country,
      url: s.url_resolved || s.url,
      tags: s.tags,
      latitude: parseFloat(s.geo_lat),
      longitude: parseFloat(s.geo_long),
      type: "LIVE"
    }));

    if (userLat !== null && userLon !== null) {
      // Calculate simple Euclidean distance
      mapped = mapped.map(s => {
        const d = Math.sqrt(Math.pow(s.latitude - userLat, 2) + Math.pow(s.longitude - userLon, 2));
        return { ...s, distance: d };
      });
      // Sort by distance and flag the closest 10 stations as local
      const sorted = [...mapped].sort((a, b) => a.distance - b.distance);
      const threshold = sorted.length >= 10 ? sorted[9].distance : Infinity;
      mapped = mapped.map(s => ({
        ...s,
        isLocal: s.distance <= threshold
      }));
    }

    return mapped;
  } catch (error) {
    console.error("Radio API error (falling back to static global stations):", error);
    const mock = [
      { name: "BBC World Service", country: "United Kingdom", url: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service", latitude: 51.5074, longitude: -0.1278, type: "ESTIMATE" },
      { name: "NPR News", country: "United States", url: "https://npr-ice.streamguys1.com/live.mp3", latitude: 38.9072, longitude: -77.0369, type: "ESTIMATE" },
      { name: "Radio Mirchi", country: "India", url: "http://peridot.streamguys.com:7150/Mirchi", latitude: 19.0760, longitude: 72.8777, type: "ESTIMATE" }
    ];
    if (userLat !== null && userLon !== null) {
      return mock.map(s => {
        const d = Math.sqrt(Math.pow(s.latitude - userLat, 2) + Math.pow(s.longitude - userLon, 2));
        return { ...s, distance: d, isLocal: d < 30 };
      });
    }
    return mock;
  }
}

export function plotRadioStations(map, stations, L) {
  if (!map || !L || !stations.length) return [];
  const markers = [];
  
  stations.forEach(s => {
    if (!s.latitude || !s.longitude) return;
    const isLocal = !!s.isLocal;
    const color = isLocal ? "#00ffff" : "#ff00ff";
    const size = isLocal ? 24 : 18;
    const border = isLocal ? "2px solid #00ffff" : "1px solid #ff00ff";
    const label = isLocal ? "LOCAL RADIO NODE" : "GLOBAL RADIO NODE";
    const iconHtml = isLocal
      ? `<div style="color:#00ffff;font-size:16px;background:#0d0000;border:${border};border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px #00ffff;cursor:pointer">📡</div>`
      : `<div style="color:#ff00ff;font-size:12px;background:#0d0000;border:${border};border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;cursor:pointer">📻</div>`;

    const icon = L.divIcon({
      html: iconHtml,
      className: "",
      iconSize: [size, size],
    });
    
    const marker = L.marker([s.latitude, s.longitude], { icon }).bindPopup(`
      <div style="background:#0d0000;color:${color};font-family:Courier New;font-size:11px;padding:8px;border:1px solid ${color};width:200px">
        <div style="font-weight:bold;margin-bottom:4px">${label}</div>
        <div>NAME: ${s.name}</div>
        <div>COUNTRY: ${s.country}</div>
        <div style="margin-top:6px">
          <audio src="${s.url}" controls style="width:180px;height:30px;background:#000" />
        </div>
      </div>
    `).addTo(map);
    
    markers.push(marker);
  });
  
  return markers;
}
