export type MapPoint = { name: string; lat: number; lng: number };

// Builds a self-contained Leaflet + OpenStreetMap page that plots numbered
// pins. Rendered in an <iframe> on web and a WebView on native — works with no
// API key. Coordinates are approximate and meant to be verified.
export function buildMapHtml(points: MapPoint[]): string {
  const data = JSON.stringify(points.map((p) => [p.lat, p.lng, p.name]));
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#map{height:100%;margin:0;background:#EDE8DE}.leaflet-container{font-family:sans-serif}
.pin{background:#C8392B;color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)}</style>
</head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var pts=${data};
var map=L.map('map',{scrollWheelZoom:false}).setView([40.84,14.25],13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
var ms=pts.map(function(p,i){
  var icon=L.divIcon({className:'',html:'<div class="pin">'+(i+1)+'</div>',iconSize:[22,22],iconAnchor:[11,11]});
  return L.marker([p[0],p[1]],{icon:icon}).addTo(map).bindPopup((i+1)+'. '+p[2]);
});
if(ms.length){try{map.fitBounds(L.featureGroup(ms).getBounds().pad(0.25));}catch(e){}}
</script></body></html>`;
}
