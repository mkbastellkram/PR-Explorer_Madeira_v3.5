(() => {
'use strict';

const D = window.PRX_DATA || {trails:[],tracks:{},drives:{},home:{lat:32.6377707,lon:-16.9363596,name:'Home'}};
const $ = id => document.getElementById(id);
const trails = (D.trails || []).map((t, idx) => ({
  ...t,
  id: t.id || `PR${t.number || idx+1}`,
  number: String(t.number || t.id || idx+1).replace('PR',''),
  name: t.name || t.titel || `PR ${idx+1}`,
  level: String(t.level || t.difficulty || '').toLowerCase(),
  status: String(t.status || t.ampel || 'offen').toLowerCase()
}));

let activeFilter = 'all';
let activeTrail = null;
let map = null;
let mapLayers = {};
let mapStarted = false;
let scrollTimer = null;
let audio = null;
let audioEnabled = false;

function fmt(v, suffix=''){
  if(v === undefined || v === null || v === '') return '–';
  return String(v) + suffix;
}
function statusClass(t){
  const s = t.status || '';
  if(s.includes('geschlossen') || s.includes('rot')) return 'stop';
  if(s.includes('eingeschränkt') || s.includes('gelb') || s.includes('warn')) return 'warn';
  return 'ok';
}
function statusText(t){
  const s = t.status || '';
  if(s.includes('geschlossen') || s.includes('rot')) return 'geschlossen';
  if(s.includes('eingeschränkt') || s.includes('gelb') || s.includes('warn')) return 'eingeschränkt';
  return 'offen';
}
function coords(t){
  const lat = t.lat ?? t.startLat ?? t.start_lat ?? t.latitude;
  const lon = t.lon ?? t.lng ?? t.startLon ?? t.start_lng ?? t.longitude;
  if(Number.isFinite(Number(lat)) && Number.isFinite(Number(lon))) return [Number(lat), Number(lon)];
  return null;
}
function filteredTrails(){
  if(activeFilter === 'all') return trails;
  if(activeFilter === 'fav') return trails.filter(t => localStorage.getItem('prxFav_'+t.id)==='1');
  return trails.filter(t => String(t.level||'').includes(activeFilter));
}
function renderJournal(){
  const root = $('journal');
  const list = filteredTrails();
  root.innerHTML = '';
  if(!list.length){
    root.innerHTML = '<div class="card"><div class="thumb"></div><div><h3>Keine Treffer</h3><p class="note">Filter zurücksetzen.</p></div></div>';
    return;
  }
  list.forEach(t => {
    const el = document.createElement('article');
    el.className = 'card';
    el.tabIndex = 0;
    el.innerHTML = `
      <div class="thumb"></div>
      <div>
        <h3>PR${t.number} · ${escapeHtml(t.name)}</h3>
        <div class="meta">
          <span class="badge ${statusClass(t)}">${statusText(t)}</span>
          <span class="badge">${escapeHtml(t.region || 'Madeira')}</span>
          <span class="badge">${fmt(t.length || t.km, ' km')}</span>
          <span class="badge">${fmt(t.duration || t.dauer || t.driveMin, t.driveMin ? ' min Anfahrt' : '')}</span>
        </div>
        <p class="note">${escapeHtml(t.description || t.beschreibung || 'Antippen öffnet Karte und Detailansicht.')}</p>
      </div>`;
    el.addEventListener('click', () => openTrail(t));
    el.addEventListener('keydown', e => { if(e.key==='Enter') openTrail(t); });
    root.appendChild(el);
  });
}
function escapeHtml(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
function toast(msg){
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.add('hidden'), 1600);
}
function ensureMap(){
  if(mapStarted) return;
  mapStarted = true;
  document.body.classList.add('map-ready');

  map = L.map('map', {
    zoomControl:false,
    attributionControl:false,
    preferCanvas:true
  }).setView([32.75,-16.95], 10);

  mapLayers.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19}).addTo(map);
  L.control.attribution({position:'bottomright'}).addTo(map);

  trails.forEach(t => {
    const c = coords(t);
    if(!c) return;
    const marker = L.circleMarker(c, {
      radius: 14,
      color:'#fff',
      weight:3,
      fillColor:'#05221d',
      fillOpacity:.96
    }).addTo(map);
    marker.bindTooltip(`PR${t.number}`, {permanent:true, direction:'center', className:'pr-label'});
    marker.on('click', () => openTrail(t, true));
  });
  setTimeout(()=>map.invalidateSize(),80);
  setTimeout(()=>map.invalidateSize(),400);
  setTimeout(()=>map.invalidateSize(),900);
}
function openTrail(t, fromMap=false){
  activeTrail = t;
  ensureMap();
  setDockMode('map');
  openSheet(t);
  const c = coords(t);
  if(c){
    map.setView(c, 13, {animate: !fromMap});
  }
  toast(`PR${t.number} geöffnet`);
}
function openSheet(t){
  $('detailSheet').classList.remove('hidden');
  $('sheetTitle').textContent = `PR${t.number} · ${t.name}`;
  $('sheetSub').textContent = t.region || 'Madeira';
  $('sheetStatus').className = 'status-dot';
  const sc = statusClass(t);
  $('sheetStatus').style.background = sc==='stop'?'#ff3b30':(sc==='warn'?'#ff9500':'#42d39c');
  $('sheetFacts').innerHTML = `
    <div class="fact"><span>Status</span><strong>${statusText(t)}</strong></div>
    <div class="fact"><span>Länge</span><strong>${fmt(t.length || t.km, ' km')}</strong></div>
    <div class="fact"><span>Dauer</span><strong>${fmt(t.duration || t.dauer || '–')}</strong></div>
    <div class="fact"><span>Region</span><strong>${escapeHtml(t.region || '–')}</strong></div>
    <div class="fact"><span>Level</span><strong>${escapeHtml(t.level || '–')}</strong></div>
    <div class="fact"><span>Anfahrt</span><strong>${fmt(t.driveMin || t.drive_min, ' min')}</strong></div>
  `;
}
function setDockMode(mode){
  document.querySelectorAll('.nav').forEach(b => b.classList.toggle('active', b.dataset.mode===mode));
}
function bind(){
  $('introBtn').addEventListener('click', () => {
    $('intro').classList.add('hidden');
    if(audioEnabled) playIntroSound();
    setTimeout(()=>window.scrollTo({top:1, behavior:'smooth'}), 50);
  });
  $('soundBtn').addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    $('soundBtn').textContent = audioEnabled ? 'Naturklang: an' : 'Naturklang: aus';
    $('soundBtn').setAttribute('aria-pressed', String(audioEnabled));
    if(audioEnabled) initAudioPreview();
  });
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      renderJournal();
    });
  });
  document.querySelectorAll('.nav').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      setDockMode(mode);
      if(mode === 'map') {
        ensureMap();
        if(activeTrail && coords(activeTrail)) map.setView(coords(activeTrail), 13);
        toast('Karte');
      } else if(mode === 'journal') {
        window.scrollTo({top:0, behavior:'smooth'});
      } else {
        toast(mode === 'trip' ? 'Reise später' : 'Dashboard später');
      }
    });
  });
  $('sheetClose').addEventListener('click', () => $('detailSheet').classList.add('hidden'));
  $('fitBtn').addEventListener('click', () => {
    if(activeTrail && coords(activeTrail) && map){
      map.setView(coords(activeTrail), 14);
      setTimeout(()=>map.invalidateSize(),80);
    }
  });
  $('favBtn').addEventListener('click', () => {
    if(!activeTrail) return;
    const key = 'prxFav_'+activeTrail.id;
    const now = localStorage.getItem(key)==='1' ? '0' : '1';
    localStorage.setItem(key, now);
    toast(now==='1'?'Favorit gesetzt':'Favorit entfernt');
  });
  $('tripBtn').addEventListener('click', () => toast('Zur Reise gesammelt'));
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', () => { if(map) setTimeout(()=>map.invalidateSize(),120); });
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', () => { if(map) setTimeout(()=>map.invalidateSize(),120); });
  }
}
function onScroll(){
  document.body.classList.add('is-scrolling');
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(()=>document.body.classList.remove('is-scrolling'), 520);
}
function initAudioPreview(){
  // iOS erlaubt Audio nur nach User-Geste. Datei ist optional.
  if(audio) return;
  audio = new Audio('./assets/audio/madeira_intro_ambience.mp3');
  audio.volume = .45;
  audio.loop = false;
}
function playIntroSound(){
  try{
    initAudioPreview();
    audio.currentTime = 0;
    audio.play().catch(()=>{});
  }catch(e){}
}
function boot(){
  renderJournal();
  bind();
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();