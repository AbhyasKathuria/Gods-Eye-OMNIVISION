import axios from 'axios';

export async function fetchEarthquakes() {
  try {
    const response = await axios.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
    return response.data.features || [];
  } catch (error) {
    console.error("Earthquakes API error:", error);
    return [];
  }
}

export function plotEarthquakes(map, earthquakes, L) {
  if (!map || !L || !earthquakes.length) return [];
  const markers = [];
  
  earthquakes.forEach(eq => {
    const coords = eq.geometry?.coordinates;
    if (!coords || coords.length < 2) return;
    const [lon, lat] = coords;
    const mag = eq.properties?.mag || 1;
    const place = eq.properties?.place || "Unknown Location";
    const time = new Date(eq.properties?.time).toLocaleString();
    
    const marker = L.circleMarker([lat, lon], {
      color: '#ff5500',
      fillColor: '#ff0000',
      fillOpacity: Math.min(0.8, mag * 0.15),
      radius: Math.max(5, mag * 2.5)
    }).bindPopup(`
      <div style="background:#0d0000;color:#ff3333;font-family:Courier New;font-size:11px;padding:8px;border:1px solid #ff5500">
        <div style="font-weight:bold;margin-bottom:4px">SEISMIC EVENT</div>
        <div>MAGNITUDE: ${mag}</div>
        <div>PLACE: ${place}</div>
        <div>TIME: ${time}</div>
      </div>
    `, { autoPan: false }).addTo(map);
    
    markers.push(marker);
  });
  
  return markers;
}
