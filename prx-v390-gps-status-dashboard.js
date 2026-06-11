/* PRX V3.9.0 · GPS + Status Center + Dashboard Foundation
   Safe module: no service worker, no blocking network, no body-wide mutation observer. */
(function(){
  'use strict';
  if(window.__PRX390_DASHBOARD__) return;
  window.__PRX390_DASHBOARD__ = true;
  const VERSION='3.9.0';
  const STATUS_KEY='prx.status.v3511';
  const BOOKING_KEY='prx.booking.v377';
  const FAV_KEYS=['prx.favorites.v1','prx.favorites','prx.fav.v1'];
  const GPS_KEY='prx.gps.v390';
  window.PRX_APP_VERSION=VERSION;
  window.PRX_BUILD_NAME='GPS STATUS DASHBOARD';
  window.PRX_MODULE_STATUS=window.PRX_MODULE_STATUS||{};
  const $=(id)=>document.getElementById(id);
  const qs=(sel,root=document)=>root.querySelector(sel);
  const qsa=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
  function read(key, fallback){ try{ const v=localStorage.getItem(key); return v?JSON.parse(v):fallback; }catch(_){ return fallback; } }
  function write(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){ console.warn('[PRX 3.9.0] storage skipped',e); } }
  function toast(msg){ const t=$('toast'); if(t){ t.textContent=msg; t.classList.remove('hidden'); clearTimeout(t._prx390); t._prx390=setTimeout(()=>t.classList.add('hidden'),2200); } else console.log('[PRX]',msg); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function trails(){ return (window.PRX_DATA && Array.isArray(window.PRX_DATA.trails)) ? window.PRX_DATA.trails : []; }
  function pois(){ return Array.isArray(window.PRX_POIS) ? window.PRX_POIS : []; }
  function map(){ return window.PRX_LEAFLET_MAP || window.PRX_MAP || window.map || null; }
  function statusLabel(v){ return ({open:'Offen',limited:'Eingeschränkt',closed:'Geschlossen',check:'Prüfen',offen:'Offen','eingeschränkt':'Eingeschränkt','geschlossen':'Geschlossen','prüfen':'Prüfen'}[v]||'Prüfen'); }
  function statusClass(v){ v=String(v||'check'); if(v==='open'||v==='offen')return 'open'; if(v==='limited'||v==='eingeschränkt')return 'limited'; if(v==='closed'||v==='geschlossen')return 'closed'; return 'check'; }
  function getFavIds(){
    const set=new Set();
    FAV_KEYS.forEach(k=>{ const v=read(k,null); if(Array.isArray(v)) v.forEach(x=>set.add(String(x))); else if(v&&typeof v==='object') Object.entries(v).forEach(([id,on])=>{ if(on) set.add(String(id)); }); });
    try{ qsa('.fav,.is-fav,[data-favorite="true"]').forEach(el=>{ const card=el.closest('[data-id],[data-trail-id]'); const id=card?.dataset?.id || card?.dataset?.trailId; if(id)set.add(id); }); }catch(_){ }
    return Array.from(set);
  }
  function counts(){
    const st=read(STATUS_KEY,{}); const bk=read(BOOKING_KEY,{}); const cs={open:0,limited:0,closed:0,check:0};
    Object.values(st).forEach(v=>{ cs[statusClass(v)]++; });
    return {
      trails:trails().length,
      pois:pois().length,
      prxPois:pois().filter(p=>!p.sourceLabel || !/OpenStreetMap/i.test(p.sourceLabel)).length,
      booked:Object.values(bk).filter(Boolean).length,
      favorites:getFavIds().length,
      statuses:Object.keys(st).length,
      statusCounts:cs,
      osm: window.PRX_OSM_LIVE && typeof window.PRX_OSM_LIVE.getItems==='function' ? (window.PRX_OSM_LIVE.getItems()||[]).length : 0,
      gps: read(GPS_KEY,null)
    };
  }
  function injectCss(){ if($('prx390-style'))return; const s=document.createElement('style'); s.id='prx390-style'; s.textContent=`
    .prx390-modal{position:fixed;inset:0;z-index:9800;background:#041b15;color:#edf8f3;display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top) + 12px) 14px calc(env(safe-area-inset-bottom) + 12px);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",Arial,sans-serif;}
    .prx390-modal.hidden{display:none}.prx390-head{display:grid;grid-template-columns:54px 1fr 54px;align-items:center;gap:10px;margin-bottom:12px}.prx390-head h2{margin:0;text-align:center;font-size:25px;letter-spacing:-.03em}.prx390-x,.prx390-round{min-width:48px;height:48px;border-radius:999px;border:1px solid rgba(230,255,245,.18);background:rgba(255,255,255,.065);color:#edf8f3;font-weight:900;font-size:22px}.prx390-body{overflow:auto;-webkit-overflow-scrolling:touch;padding:8px 2px 110px}.prx390-section{margin:0 0 16px}.prx390-title{margin:20px 4px 9px;font-size:16px;color:#a9c7ba;text-transform:uppercase;letter-spacing:.06em}.prx390-card{border:1px solid rgba(220,255,240,.14);background:rgba(16,44,37,.88);border-radius:22px;padding:16px;box-shadow:0 18px 55px rgba(0,0,0,.28);}.prx390-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.prx390-stat{border:1px solid rgba(220,255,240,.12);border-radius:18px;padding:13px;background:rgba(255,255,255,.04)}.prx390-stat small{display:block;color:#a9c7ba;font-weight:800}.prx390-stat b{display:block;font-size:26px;margin-top:4px}.prx390-row{display:grid;grid-template-columns:38px 1fr auto;gap:12px;align-items:center;min-height:58px;border-bottom:1px solid rgba(220,255,240,.10);padding:8px 0}.prx390-row:last-child{border-bottom:0}.prx390-ico{width:36px;height:36px;border-radius:12px;background:rgba(53,215,166,.12);display:grid;place-items:center}.prx390-row strong{font-size:18px}.prx390-row small{display:block;color:#a9c7ba;line-height:1.35;margin-top:3px}.prx390-pill{border-radius:999px;padding:7px 10px;background:rgba(255,255,255,.07);font-weight:850;color:#edf8f3}.prx390-pill.open{background:rgba(0,210,70,.18);color:#caffd6}.prx390-pill.limited{background:rgba(255,210,30,.16);color:#fff1a6}.prx390-pill.closed{background:rgba(255,40,40,.16);color:#ffc2c2}.prx390-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}.prx390-actions button,.prx390-wide{border:1px solid rgba(220,255,240,.18);background:rgba(255,255,255,.065);color:#edf8f3;border-radius:16px;padding:13px 10px;font-weight:900;font-size:16px}.prx390-actions button.primary,.prx390-wide.primary{background:linear-gradient(180deg,#35d7a6,#25b986);color:#041b15;border:0}.prx390-gps-on{outline:2px solid rgba(53,215,166,.48)!important}.prx390-map-note{font-size:12px;color:#a9c7ba;margin-top:8px;line-height:1.35}.prx390-empty{color:#a9c7ba;line-height:1.45}.prx390-osm-loading{position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 88px);transform:translateX(-50%);z-index:9700;border:1px solid rgba(220,255,240,.18);background:rgba(4,27,21,.92);color:#edf8f3;border-radius:999px;padding:10px 14px;font-weight:900;box-shadow:0 12px 34px rgba(0,0,0,.35)}.prx390-osm-loading.hidden{display:none}.prx390-gps-btn span{font-size:13px;font-weight:950;letter-spacing:.02em}
  `; document.head.appendChild(s); }
  function ensureShell(){ if($('prx390Dashboard'))return; const d=document.createElement('section'); d.id='prx390Dashboard'; d.className='prx390-modal hidden'; d.innerHTML=`<header class="prx390-head"><button class="prx390-x" id="prx390Close">×</button><h2>Dashboard</h2><button class="prx390-round" id="prx390Refresh">↻</button></header><main class="prx390-body" id="prx390Body"></main>`; document.body.appendChild(d); $('prx390Close').onclick=()=>d.classList.add('hidden'); $('prx390Refresh').onclick=()=>renderDashboard(); }
  function renderDashboard(){ ensureShell(); const c=counts(); const gps=c.gps; const st=read(STATUS_KEY,{}); const bk=read(BOOKING_KEY,{}); const favs=getFavIds(); const statusRows=Object.entries(st).slice(0,8).map(([id,v])=>`<div class="prx390-row"><span class="prx390-ico">🚦</span><div><strong>${esc(id)}</strong><small>Status manuell gesetzt</small></div><span class="prx390-pill ${statusClass(v)}">${statusLabel(v)}</span></div>`).join('') || `<div class="prx390-empty">Noch keine manuellen Statuswerte gespeichert.</div>`;
    const bookingRows=Object.entries(bk).filter(([,v])=>v).slice(0,8).map(([id])=>`<div class="prx390-row"><span class="prx390-ico">🎟</span><div><strong>${esc(id)}</strong><small>Buchung/Reservierung vorgemerkt</small></div><span class="prx390-pill">vorgemerkt</span></div>`).join('') || `<div class="prx390-empty">Noch keine Buchungen vorgemerkt.</div>`;
    $('prx390Body').innerHTML=`
      <section class="prx390-section"><div class="prx390-grid"><div class="prx390-stat"><small>PR-Routen</small><b>${c.trails}</b></div><div class="prx390-stat"><small>POIs</small><b>${c.pois}</b></div><div class="prx390-stat"><small>Favoriten</small><b>${c.favorites}</b></div><div class="prx390-stat"><small>Buchungen</small><b>${c.booked}</b></div></div></section>
      <section class="prx390-section"><div class="prx390-title">Live / Karte</div><div class="prx390-card"><div class="prx390-row"><span class="prx390-ico">📍</span><div><strong>GPS Position</strong><small>${gps ? `zuletzt: ${new Date(gps.time).toLocaleString('de-DE')} · ±${Math.round(gps.accuracy||0)} m` : 'noch nicht erfasst'}</small></div><span class="prx390-pill">${gps?'aktiv':'aus'}</span></div><div class="prx390-row"><span class="prx390-ico">OSM</span><div><strong>OSM Live-POIs</strong><small>getrennte Community-Ebene</small></div><span class="prx390-pill">${c.osm}</span></div><div class="prx390-actions"><button class="primary" id="prx390GpsNow">GPS jetzt</button><button id="prx390OsmPanel">OSM öffnen</button></div><div class="prx390-map-note">GPS und OSM blockieren den App-Start nicht. Abfragen laufen nur nach Bedienaktion.</div></div></section>
      <section class="prx390-section"><div class="prx390-title">Status-Center</div><div class="prx390-card"><div class="prx390-grid"><div class="prx390-stat"><small>Offen</small><b>${c.statusCounts.open}</b></div><div class="prx390-stat"><small>Eingeschränkt</small><b>${c.statusCounts.limited}</b></div><div class="prx390-stat"><small>Geschlossen</small><b>${c.statusCounts.closed}</b></div><div class="prx390-stat"><small>Prüfen</small><b>${c.statusCounts.check}</b></div></div><div style="height:12px"></div>${statusRows}</div></section>
      <section class="prx390-section"><div class="prx390-title">Buchung</div><div class="prx390-card">${bookingRows}<div class="prx390-actions"><button id="prx390Simplifica">SIMplifica</button><button id="prx390Visit">Visit Madeira</button></div></div></section>
      <section class="prx390-section"><div class="prx390-title">Diagnose</div><div class="prx390-card"><div class="prx390-row"><span class="prx390-ico">⚙</span><div><strong>Version</strong><small>PRX ${VERSION} · GPS/Status/Dashboard Foundation</small></div><span class="prx390-pill">OK</span></div><div class="prx390-actions"><button id="prx390CopyDiag">Diagnose kopieren</button><button id="prx390RecoverMap">Karte reparieren</button></div></div></section>`;
    $('prx390GpsNow').onclick=()=>startGps(true);
    $('prx390OsmPanel').onclick=()=>{ if(window.PRX_OSM_LIVE&&window.PRX_OSM_LIVE.openPanel) window.PRX_OSM_LIVE.openPanel(); else toast('OSM-Modul nicht bereit'); };
    $('prx390Simplifica').onclick=()=>window.open('https://simplifica.madeira.gov.pt/','_blank');
    $('prx390Visit').onclick=()=>window.open('https://visitmadeira.com/de/ausfluege/naturliebhaber/aktivitaeten/wandern/','_blank');
    $('prx390RecoverMap').onclick=()=>recoverMap();
    $('prx390CopyDiag').onclick=copyDiag;
  }
  function openDashboard(){ renderDashboard(); $('prx390Dashboard').classList.remove('hidden'); }
  function copyDiag(){ const data={version:VERSION, counts:counts(), modules:window.PRX_MODULE_STATUS||{}, href:location.href, time:new Date().toISOString()}; navigator.clipboard?.writeText(JSON.stringify(data,null,2)).then(()=>toast('Diagnose kopiert')).catch(()=>toast('Kopieren nicht möglich')); }
  function ensureGpsButton(){ if($('prx390GpsBtn'))return; const tr=qs('.top-right')||qs('.top-controls'); if(!tr)return; const b=document.createElement('button'); b.id='prx390GpsBtn'; b.className='ctl prx390-gps-btn'; b.title='GPS Position'; b.innerHTML='<span>GPS</span>'; b.onclick=()=>startGps(false); tr.insertBefore(b, tr.firstChild); }
  let gpsMarker=null, gpsCircle=null;
  function startGps(openDash){ if(!navigator.geolocation){ toast('GPS nicht verfügbar'); return; } const b=$('prx390GpsBtn'); b&&b.classList.add('prx390-gps-on'); toast('GPS wird abgefragt…'); navigator.geolocation.getCurrentPosition(pos=>{ const data={lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy,time:Date.now()}; write(GPS_KEY,data); drawGps(data); toast('GPS-Position gesetzt'); if(openDash)renderDashboard(); }, err=>{ b&&b.classList.remove('prx390-gps-on'); toast(err.code===1?'GPS-Berechtigung verweigert':'GPS nicht ermittelbar'); }, {enableHighAccuracy:true,timeout:12000,maximumAge:30000}); }
  function drawGps(data){ const m=map(); if(!m||!window.L){ toast('Karte noch nicht bereit'); return; } try{ if(gpsMarker)gpsMarker.remove(); if(gpsCircle)gpsCircle.remove(); gpsMarker=L.marker([data.lat,data.lng],{title:'Eigene Position'}).addTo(m).bindPopup('Eigene Position · ±'+Math.round(data.accuracy||0)+' m'); gpsCircle=L.circle([data.lat,data.lng],{radius:Math.max(10,data.accuracy||30),color:'#35d7a6',weight:2,fillOpacity:.10}).addTo(m); m.setView([data.lat,data.lng], Math.max(m.getZoom()||13, 13), {animate:true}); $('prx390GpsBtn')?.classList.add('prx390-gps-on'); }catch(e){ console.warn('[PRX 3.9.0 GPS]',e); toast('GPS konnte nicht gezeichnet werden'); } }
  function recoverMap(){ const m=map(); if(m && typeof m.invalidateSize==='function'){ [0,80,220,500].forEach(t=>setTimeout(()=>m.invalidateSize({pan:false}),t)); toast('Karte neu berechnet'); }else toast('Karte nicht bereit'); }
  function attachNav(){ qsa('.nav').forEach(n=>{ if(n.dataset.nav==='dash'){ n.addEventListener('click',function(e){ e.preventDefault(); e.stopImmediatePropagation(); openDashboard(); }, true); } }); }
  function patchOsmLoading(){ const node=document.createElement('div'); node.id='prx390OsmLoading'; node.className='prx390-osm-loading hidden'; node.textContent='OSM Live-POIs werden geladen…'; document.body.appendChild(node); const origFetch=window.fetch; if(!origFetch || window.__PRX390_FETCH_PATCH__)return; window.__PRX390_FETCH_PATCH__=true; window.fetch=function(input,init){ const url=String(input&&input.url||input||''); const isOverpass=/overpass-api\.de\/api\/interpreter/.test(url); if(isOverpass)node.classList.remove('hidden'); const p=origFetch.apply(this,arguments); if(isOverpass) p.finally(()=>setTimeout(()=>node.classList.add('hidden'),250)); return p; } }
  function patchEmptyFilter(){ const end=qs('.journal-end'); if(!end)return; const observer=()=>{ const cards=qsa('.trail-card,.journal-card,[data-trail-id]', $('journalList')||document); const visible=cards.filter(c=>c.offsetParent!==null); if(cards.length && !visible.length){ end.innerHTML='Keine Routen entsprechen dem Filter.<br><button id="prx390ResetFilter" class="prx390-wide">Filter zurücksetzen</button>'; $('prx390ResetFilter')?.addEventListener('click',()=>{ try{localStorage.removeItem('prx.filters.v1');}catch(_){} location.reload(); }); } } ; setTimeout(observer,1200); document.addEventListener('click',()=>setTimeout(observer,160),true); }
  function init(){ injectCss(); ensureShell(); ensureGpsButton(); attachNav(); patchOsmLoading(); patchEmptyFilter(); const old=read(GPS_KEY,null); if(old && Date.now()-old.time<86400000) setTimeout(()=>drawGps(old),1800); window.PRX_MODULE_STATUS.v390={loaded:true,version:VERSION,features:['gps','status-center','dashboard','osm-loading']}; document.documentElement.setAttribute('data-prx-version',VERSION); recoverMap(); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
