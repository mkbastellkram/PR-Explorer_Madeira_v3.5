(() => {
'use strict';
const D = window.PRX_DATA || {trails:[],tracks:{},drives:{},pois:[],home:{}};
const $ = id => document.getElementById(id);
const trails = (D.trails || []).map((t,i)=>({
  ...t,
  id:t.id || `PR${t.number || i+1}`,
  number:String(t.number || t.id || i+1).replace('PR',''),
  name:t.name || t.titel || `PR ${i+1}`,
  status:String(t.status || t.ampel || 'offen').toLowerCase(),
  level:String(t.level || t.difficulty || '').toLowerCase()
}));
let map=null, mapReady=false, active=null, solo=false, markers=new Map(), activeTrack=null, activeDrive=null, activePoiLayer=null;
let carouselTimer=null;

function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function coord(t){
  const lat=t.lat??t.startLat??t.start_lat??t.latitude;
  const lon=t.lon??t.lng??t.startLon??t.start_lng??t.longitude;
  if(Number.isFinite(Number(lat))&&Number.isFinite(Number(lon)))return[Number(lat),Number(lon)];
  return null;
}
function badgeClass(t){const s=t.status||'';if(s.includes('rot')||s.includes('geschlossen'))return'stop';if(s.includes('gelb')||s.includes('eingesch'))return'warn';return'ok'}
function statusText(t){const s=t.status||'';if(s.includes('rot')||s.includes('geschlossen'))return'geschlossen';if(s.includes('gelb')||s.includes('eingesch'))return'eingeschränkt';return'offen'}
function fmt(v,s=''){return(v===undefined||v===null||v==='')?'–':String(v)+s}

function renderJournal(){
 const root=$('journalList'); root.innerHTML='';
 trails.forEach(t=>{
   const el=document.createElement('article');
   el.className='jcard';
   el.dataset.id=t.id;
   el.innerHTML=`<div class="thumb"></div><div><h2>PR${t.number} · ${escapeHtml(t.name)}</h2><div class="meta"><span class="badge ${badgeClass(t)}">${statusText(t)}</span><span class="badge">${escapeHtml(t.region||'Madeira')}</span><span class="badge">${fmt(t.length||t.km,' km')}</span><span class="badge">${fmt(t.duration||t.dauer||t.driveMin,t.driveMin?' min':'')}</span></div><p class="note">${escapeHtml(t.description||t.beschreibung||'Antippen öffnet die schwebende Detailseite.')}</p></div>`;
   el.addEventListener('click',()=>openDetailFromJournal(t,el));
   root.appendChild(el);
 });
}
function setNav(mode){document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.nav===mode))}
function setState(s){document.body.classList.remove('state-journal','state-detail','state-peek','state-map-overview','state-solo','detail-half');document.body.classList.add(s)}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.remove('hidden');clearTimeout(t._tm);t._tm=setTimeout(()=>t.classList.add('hidden'),1500)}

function ensureMap(){
 if(mapReady)return;
 mapReady=true; document.body.classList.add('map-ready');
 map=L.map('map',{zoomControl:false,attributionControl:false,preferCanvas:true}).setView([32.75,-16.95],10);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
 L.control.attribution({position:'bottomright'}).addTo(map);
 trails.forEach(t=>{
   const c=coord(t); if(!c)return;
   const icon=L.divIcon({className:'',html:`<div class="pr-marker" data-id="${t.id}">PR${t.number}</div>`,iconSize:[34,34],iconAnchor:[17,17]});
   const m=L.marker(c,{icon}).addTo(map);
   m.on('click',()=>pinTapped(t));
   markers.set(t.id,m);
 });
 setTimeout(()=>map.invalidateSize(),80); setTimeout(()=>map.invalidateSize(),420); setTimeout(()=>map.invalidateSize(),900);
}
function openDetailFromJournal(t,el){
 active=t; solo=false;
 document.querySelectorAll('.jcard').forEach(c=>c.classList.remove('selected','follow'));
 el.classList.add('selected');
 setTimeout(()=>{document.body.classList.add('detail-half');document.querySelectorAll('.jcard:not(.selected)').forEach(c=>c.classList.add('follow'))},260);
 ensureMap();
 populateDetail(t);
 setState('state-detail');
 setNav('journal');
 $('detailShell').classList.remove('hidden');
}
function populateDetail(t){
 $('detailTitle').textContent=`PR${t.number} · ${t.name}`;
 $('detailSub').textContent=t.region||'Madeira';
 $('detailBadge').style.background=badgeClass(t)==='stop'?'#ff3b30':badgeClass(t)==='warn'?'#ff9500':'#42d39c';
 $('detailFacts').innerHTML=`<div class="fact"><span>Status</span><strong>${statusText(t)}</strong></div><div class="fact"><span>Länge</span><strong>${fmt(t.length||t.km,' km')}</strong></div><div class="fact"><span>Dauer</span><strong>${fmt(t.duration||t.dauer)}</strong></div><div class="fact"><span>Region</span><strong>${escapeHtml(t.region||'–')}</strong></div><div class="fact"><span>Level</span><strong>${escapeHtml(t.level||'–')}</strong></div><div class="fact"><span>Anfahrt</span><strong>${fmt(t.driveMin||t.drive_min,' min')}</strong></div>`;
 $('detailDescription').textContent=t.description||t.beschreibung||'Variable Detailseite. Spätere Erweiterungen können hier beliebig wachsen.';
}
function mapOverview(){
 ensureMap(); active=null; solo=false; clearContext();
 setState('state-map-overview'); setNav('map'); $('carousel').classList.add('hidden'); $('detailShell').classList.add('hidden');
 document.querySelectorAll('.pr-marker').forEach(p=>p.classList.remove('dim','active'));
 setTimeout(()=>{map.invalidateSize(); fitAllPins()},120);
}
function pinTapped(t){
 active=t; solo=false; populateDetail(t); showCarousel(t); setState('state-peek'); setNav('map');
 markers.forEach((m,id)=>{const el=m.getElement()?.querySelector('.pr-marker'); if(el){el.classList.toggle('active',id===t.id);el.classList.toggle('dim',id!==t.id)}});
 $('detailShell').classList.remove('hidden');
}
function enterPeek(){
 if(!active)return; ensureMap(); setState('state-peek'); setNav('map'); showCarousel(active); activateSolo(active,true);
}
function activateSolo(t,smooth=false){
 active=t; solo=true; setState('state-solo'); setNav('map'); populateDetail(t); $('detailShell').classList.remove('hidden');
 markers.forEach((m,id)=>{const el=m.getElement()?.querySelector('.pr-marker'); if(el){el.classList.toggle('active',id===t.id);el.classList.remove('dim'); m.getElement().style.display=id===t.id?'':'none';}});
 showContext(t); if(smooth) fitActive(t);
}
function restoreAllPins(){markers.forEach(m=>{if(m.getElement())m.getElement().style.display='';const el=m.getElement()?.querySelector('.pr-marker');if(el)el.classList.remove('active','dim')})}
function showCarousel(t){
 const c=$('carousel'), track=$('carouselTrack'); c.classList.remove('hidden'); track.innerHTML='';
 trails.forEach(tr=>{
   const el=document.createElement('article'); el.className='ccard'+(tr.id===t.id?' active':''); el.dataset.id=tr.id;
   el.innerHTML=`<h3>PR${tr.number} · ${escapeHtml(tr.name)}</h3><p>${escapeHtml(tr.region||'Madeira')} · ${fmt(tr.length||tr.km,' km')} · ${statusText(tr)}</p>`;
   el.addEventListener('click',()=>activateSolo(tr,true));
   track.appendChild(el);
 });
 const activeCard=track.querySelector(`[data-id="${t.id}"]`); if(activeCard)setTimeout(()=>activeCard.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'}),40);
 track.onscroll=()=>{clearTimeout(carouselTimer);carouselTimer=setTimeout(()=>{const center=track.scrollLeft+track.clientWidth/2;let best=null,dist=1e9;track.querySelectorAll('.ccard').forEach(card=>{const d=Math.abs(card.offsetLeft+card.offsetWidth/2-center);if(d<dist){dist=d;best=card}});if(best){const tr=trails.find(x=>x.id===best.dataset.id); if(tr&&(!active||tr.id!==active.id))activateSolo(tr,true);}},180)};
}
function clearContext(){if(activeTrack){map.removeLayer(activeTrack);activeTrack=null} if(activeDrive){map.removeLayer(activeDrive);activeDrive=null} if(activePoiLayer){map.removeLayer(activePoiLayer);activePoiLayer=null} restoreAllPins()}
function lineFromTrail(t,kind){
 const c=coord(t); if(!c)return null;
 const [lat,lng]=c; const k=kind==='drive'?0.045:0.018;
 return [[lat-k,lng-k*.8],[lat-k*.2,lng+k],[lat+k*.5,lng+k*.2],[lat+k,lng-k*.7]];
}
function showContext(t){
 ensureMap(); clearContext();
 const track=lineFromTrail(t,'track'), drive=lineFromTrail(t,'drive');
 if(track)activeTrack=L.polyline(track,{color:'#ff3b30',weight:5,opacity:.95}).addTo(map);
 if(drive)activeDrive=L.polyline(drive,{color:'#007aff',weight:5,opacity:.80,dashArray:'8 8'}).addTo(map);
 const c=coord(t);
 if(c){activePoiLayer=L.layerGroup([L.circleMarker([c[0]+.008,c[1]+.008],{radius:8,color:'#fff',fillColor:'#42d39c',fillOpacity:1,weight:2}).bindTooltip('POI', {permanent:false})]).addTo(map)}
}
function fitActive(t){
 ensureMap(); const items=[]; if(activeTrack)items.push(...activeTrack.getLatLngs()); if(activeDrive)items.push(...activeDrive.getLatLngs()); const c=coord(t); if(c)items.push(L.latLng(c[0],c[1])); if(!items.length)return;
 const b=L.latLngBounds(items); map.fitBounds(b,{paddingTopLeft:[28,90],paddingBottomRight:[28,230],animate:true,duration:.7});
}
function fitAllPins(){
 const pts=[]; trails.forEach(t=>{const c=coord(t); if(c)pts.push(c)}); if(pts.length)map.fitBounds(pts,{padding:[32,32]});
}

function bind(){
 $('mapBtn').addEventListener('click',()=>{ if(document.body.classList.contains('state-journal')) mapOverview(); else enterPeek(); });
 $('detailMapBtn').addEventListener('click',enterPeek);
 $('detailGrip').addEventListener('click',enterPeek);
 $('detailClose').addEventListener('click',()=>{setState('state-journal');$('detailShell').classList.add('hidden');$('carousel').classList.add('hidden');restoreAllPins();clearContext();setNav('journal')});
 $('filterBtn').addEventListener('click',()=>toast('Filter später'));
 $('optionBtn').addEventListener('click',()=>toast('Optionen später'));
 $('shareBtn').addEventListener('click',()=>toast('Teilen später'));
 $('settingsBtn').addEventListener('click',()=>toast('Einstellungen später'));
 document.querySelectorAll('.nav').forEach(n=>n.addEventListener('click',()=>{const mode=n.dataset.nav;if(mode==='map')mapOverview();else if(mode==='journal'){setState('state-journal');setNav('journal');$('detailShell').classList.add('hidden');$('carousel').classList.add('hidden');restoreAllPins();clearContext();window.scrollTo({top:0,behavior:'smooth'})}else toast(mode==='trip'?'Reise später':'Dashboard später')}));
 window.addEventListener('resize',()=>{if(map)setTimeout(()=>map.invalidateSize(),120)});
 if(window.visualViewport)window.visualViewport.addEventListener('resize',()=>{if(map)setTimeout(()=>map.invalidateSize(),120)});
}
function boot(){renderJournal();bind();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();