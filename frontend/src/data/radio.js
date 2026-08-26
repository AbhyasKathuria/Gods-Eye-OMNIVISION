export async function fetchRadioStations() {
  try {
    const response = await fetch('https://de1.api.radio-browser.info/json/stations/topclick/30');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data
      .filter(s => s.geo_lat && s.geo_long)
      .map(s => ({
        name: s.name,
        country: s.country,
        url: s.url_resolved || s.url,
        tags: s.tags,
        latitude: parseFloat(s.geo_lat),
        longitude: parseFloat(s.geo_long),
        type: "LIVE"
      }));
  } catch (error) {
    console.error("Radio API error (falling back to static global stations):", error);
    return [
      { name: "BBC World Service", country: "United Kingdom", url: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service", latitude: 51.5074, longitude: -0.1278, type: "ESTIMATE" },
      { name: "NPR News", country: "United States", url: "https://npr-ice.streamguys1.com/live.mp3", latitude: 38.9072, longitude: -77.0369, type: "ESTIMATE" },
      { name: "Radio Mirchi", country: "India", url: "http://peridot.streamguys.com:7150/Mirchi", latitude: 19.0760, longitude: 72.8777, type: "ESTIMATE" }
    ];
  }
}

export function plotRadioStations(map, stations, L) {
  if (!map || !L || !stations.length) return [];
  const markers = [];
  
  stations.forEach(s => {
    if (!s.latitude || !s.longitude) return;
    const icon = L.divIcon({
      html: `<div style="color:#ff00ff;font-size:12px;background:#0d0000;border:1px solid #ff00ff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center">📻</div>`,
      className: "",
      iconSize: [18, 18],
    });
    
    const marker = L.marker([s.latitude, s.longitude], { icon }).bindPopup(`
      <div style="background:#0d0000;color:#ff00ff;font-family:Courier New;font-size:11px;padding:8px;border:1px solid #ff00ff">
        <div style="font-weight:bold;margin-bottom:4px">GLOBAL RADIO NODE</div>
        <div>NAME: ${s.name}</div>
        <div>COUNTRY: ${s.country}</div>
        <div style="margin-top:6px">
          <audio src="${s.url}" controls style="width:160px;height:30px;background:#000" />
        </div>
      </div>
    `).addTo(map);
    
    markers.push(marker);
  });
  
  return markers;
}
