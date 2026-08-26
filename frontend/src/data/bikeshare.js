export async function fetchBikeshare() {
  try {
    const infoResponse = await fetch('https://gbfs.bcycle.com/bcycle_austin/station_information.json');
    if (!infoResponse.ok) {
      throw new Error(`HTTP error! station_information status: ${infoResponse.status}`);
    }
    const infoData = await infoResponse.json();

    const statusResponse = await fetch('https://gbfs.bcycle.com/bcycle_austin/station_status.json');
    if (!statusResponse.ok) {
      throw new Error(`HTTP error! station_status status: ${statusResponse.status}`);
    }
    const statusData = await statusResponse.json();
    
    const stationsInfo = infoData?.data?.stations || [];
    const stationsStatus = statusData?.data?.stations || [];
    
    const statusMap = {};
    stationsStatus.forEach(s => {
      statusMap[s.station_id] = s;
    });
    
    if (stationsInfo.length === 0) {
      throw new Error("No stations found in raw response");
    }
    
    return stationsInfo.map(info => ({
      ...info,
      status: statusMap[info.station_id] || {}
    }));
  } catch (error) {
    console.error("Bikeshare API error (falling back to static Austin stations):", error);
    return [
      { name: "Downtown Station (6th & Congress)", lat: 30.2680, lon: -97.7420, status: { num_bikes_available: 12, num_docks_available: 8 } },
      { name: "Capitol Station (11th & Congress)", lat: 30.2730, lon: -97.7420, status: { num_bikes_available: 4, num_docks_available: 16 } },
      { name: "Zilker Park Station", lat: 30.2640, lon: -97.7710, status: { num_bikes_available: 8, num_docks_available: 12 } },
      { name: "UT Austin Station", lat: 30.2850, lon: -97.7380, status: { num_bikes_available: 15, num_docks_available: 5 } }
    ];
  }
}

export function plotBikeshare(map, stations, L) {
  if (!map || !L || !stations.length) return [];
  const markers = [];
  
  stations.forEach(s => {
    const lat = s.lat || s.latitude;
    const lon = s.lon || s.longitude;
    if (!lat || !lon) return;
    
    const name = s.name || "Bikeshare Dock";
    const available = s.status?.num_bikes_available !== undefined ? s.status.num_bikes_available : 5;
    const docks = s.status?.num_docks_available !== undefined ? s.status.num_docks_available : 10;
    
    const icon = L.divIcon({
      html: `<div style="color:#00ffff;font-size:10px;background:#060000;border:1px solid #00ffff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-weight:bold">${available}</div>`,
      className: "",
      iconSize: [18, 18],
    });
    
    const marker = L.marker([lat, lon], { icon }).bindPopup(`
      <div style="background:#0d0000;color:#00ffff;font-family:Courier New;font-size:11px;padding:8px;border:1px solid #00ffff">
        <div style="font-weight:bold;margin-bottom:4px">BIKESHARE HUB</div>
        <div>STATION: ${name}</div>
        <div>AVAILABLE BIKES: ${available}</div>
        <div>OPEN DOCKS: ${docks}</div>
      </div>
    `).addTo(map);
    
    markers.push(marker);
  });
  
  return markers;
}
