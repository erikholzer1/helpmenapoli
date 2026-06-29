import { transitMapLines } from '@/constants/transitMap';

// Builds a self-contained Leaflet page that draws the Naples metro lines and
// funiculars from real OSM coordinates (constants/transitMap.ts). Rendered in
// an <iframe> on web and a WebView on native. No API key.
export function buildTransitMapHtml(): string {
  const data = JSON.stringify(transitMapLines);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=2"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  html,body,#map{height:100%;margin:0;background:#EDE8DE}
  .leaflet-container{font-family:'Helvetica Neue',sans-serif}
  .stop{border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.25)}
  .legend{position:absolute;bottom:8px;left:8px;z-index:1000;background:rgba(255,255,255,.94);
    border-radius:10px;padding:8px 10px;font-size:11px;line-height:1.5;box-shadow:0 1px 6px rgba(0,0,0,.2)}
  .legend b{display:flex;align-items:center;gap:6px;font-weight:600;color:#2a2118}
  .swatch{width:14px;height:4px;border-radius:2px;display:inline-block}
  .locate{position:absolute;top:78px;right:10px;z-index:1000;width:34px;height:34px;border:none;
    border-radius:8px;background:#fff;box-shadow:0 1px 5px rgba(0,0,0,.35);cursor:pointer;font-size:17px;line-height:34px;text-align:center}
  .me{background:#1976D2;border:2px solid #fff;border-radius:50%;width:16px;height:16px;box-shadow:0 0 0 2px rgba(25,118,210,.4)}
</style></head><body><div id="map"></div>
<div class="legend" id="legend"></div>
<button class="locate" id="locate" title="Find my location">◎</button>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var lines=${data};
var map=L.map('map',{scrollWheelZoom:false,zoomControl:true}).setView([40.85,14.24],12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap'}).addTo(map);
var all=[];
lines.forEach(function(line){
  var paths=line.segments?line.segments:(line.stations?[line.stations]:[]);
  paths.forEach(function(stops){
    var latlngs=stops.map(function(s){return [s.lat,s.lng];});
    if(latlngs.length>1){
      L.polyline(latlngs,{color:line.color,weight:5,opacity:.85,lineJoin:'round'}).addTo(map);
    }
    stops.forEach(function(s){
      all.push([s.lat,s.lng]);
      L.marker([s.lat,s.lng],{icon:L.divIcon({className:'',
        html:'<div class="stop" style="width:9px;height:9px;background:'+line.color+'"></div>',
        iconSize:[9,9],iconAnchor:[5,5]})}).addTo(map).bindPopup(line.label+' — '+s.name);
    });
  });
});
if(all.length){try{map.fitBounds(L.latLngBounds(all).pad(0.08));}catch(e){}}
var lg=lines.map(function(l){return '<b><span class="swatch" style="background:'+l.color+'"></span>'+l.label+'</b>';}).join('');
document.getElementById('legend').innerHTML=lg;
// Find-my-location (uses the device geolocation via the web/webview layer — no extra dependency)
var meMarker=null,meCircle=null;
document.getElementById('locate').onclick=function(){map.locate({setView:true,maxZoom:15,enableHighAccuracy:true});};
map.on('locationfound',function(e){
  if(meMarker){map.removeLayer(meMarker);map.removeLayer(meCircle);}
  meMarker=L.marker(e.latlng,{icon:L.divIcon({className:'',html:'<div class="me"></div>',iconSize:[16,16],iconAnchor:[8,8]})}).addTo(map).bindPopup('You are here');
  meCircle=L.circle(e.latlng,{radius:e.accuracy/2,color:'#1976D2',weight:1,fillOpacity:.08}).addTo(map);
});
map.on('locationerror',function(){var b=document.getElementById('locate');b.textContent='⚠';setTimeout(function(){b.textContent='◎';},2000);});
</script></body></html>`;
}
