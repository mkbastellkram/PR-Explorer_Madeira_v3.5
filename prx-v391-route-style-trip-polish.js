/* PRX V3.9.1 · Route Style & Trip Polish
   Zweck:
   - iOS-native weiße Track-Farbkarte vermeiden: eigene dunkle Inline-Farbwahl für GPX/KML.
   - Linien-Presets aktivieren, ohne neue Daten/Ordner.
   - sanfte Karten-Neuvermessung ohne harte Tile-Resets.
*/
(function(){
  'use strict';
  const VERSION='3.9.1';
  const LINE_KEY='prx.lineStyle.v377';
  const TRIP_KEY='prx.trip.v370';
  window.PRX_APP_VERSION=VERSION;
  window.PRX_MODULES=window.PRX_MODULES||{};
  window.PRX_MODULES.routeStyleTripPolish={version:VERSION,loaded:true};

  const $=(id)=>document.getElementById(id);
  const qs=(s,r=document)=>r.querySelector(s);
  const qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=(s)=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  function toast(msg){let t=$('toast'); if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t)} t.textContent=msg; t.classList.remove('hidden'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.add('hidden'),1500)}
  function read(key,def){try{return Object.assign({},def,JSON.parse(localStorage.getItem(key)||'{}'))}catch(e){return Object.assign({},def)}}
  function write(key,obj){try{localStorage.setItem(key,JSON.stringify(obj))}catch(e){}}
  function lineDefault(){return {gpx:{color:'#ff3b30',weight:5,opacity:.95},kml:{color:'#007aff',weight:5,opacity:.86},outline:{color:'#ffffff',extraWeight:1,opacity:.55},kmlStyle:'solid'}}
  function loadLine(){const d=lineDefault(); const r=read(LINE_KEY,d); r.gpx=Object.assign({},d.gpx,r.gpx||{}); r.kml=Object.assign({},d.kml,r.kml||{}); r.outline=Object.assign({},d.outline,r.outline||{}); return r;}
  function saveLine(line,label){write(LINE_KEY,line); document.dispatchEvent(new CustomEvent('prx-line-style-changed',{detail:line})); toast(label||'Linien gespeichert'); scheduleMap('line-style');}
  const palettes={
    gpx:['#ff3b30','#ff453a','#d70015','#ff7a00','#ffd60a','#bf5af2','#ffffff'],
    kml:['#007aff','#0a84ff','#64d2ff','#00c7be','#32d74b','#5e5ce6','#ffffff'],
    outline:['#ffffff','#f2f2f7','#d1d1d6','#000000','#0b3027']
  };
  const presets={
    standard:{label:'Standard',line:{gpx:{color:'#ff3b30',weight:5,opacity:.95},kml:{color:'#007aff',weight:5,opacity:.86},outline:{color:'#ffffff',extraWeight:1,opacity:.55},kmlStyle:'solid'}},
    sat:{label:'Satellit kontrast',line:{gpx:{color:'#ff453a',weight:6,opacity:1},kml:{color:'#64d2ff',weight:6,opacity:.95},outline:{color:'#ffffff',extraWeight:2,opacity:.85},kmlStyle:'solid'}},
    outdoor:{label:'Outdoor ruhig',line:{gpx:{color:'#ff7a00',weight:5,opacity:.95},kml:{color:'#00c7be',weight:5,opacity:.9},outline:{color:'#ffffff',extraWeight:1.5,opacity:.65},kmlStyle:'solid'}},
    night:{label:'Nacht',line:{gpx:{color:'#ffd60a',weight:5,opacity:.95},kml:{color:'#64d2ff',weight:5,opacity:.9},outline:{color:'#000000',extraWeight:2,opacity:.55},kmlStyle:'dash'}}
  };
  function injectCss(){ if($('prx391-css'))return; const st=document.createElement('style'); st.id='prx391-css'; st.textContent=`
    .prx391-line-surface{margin-top:10px;border:1px solid rgba(220,255,240,.18);border-radius:20px;background:rgba(5,28,22,.86);padding:12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}
    .prx391-line-surface h4{margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:rgba(237,248,243,.66)}
    .prx391-palette{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 10px}
    .prx391-swatch{width:34px;height:34px;border-radius:12px;border:2px solid rgba(255,255,255,.22);box-shadow:0 8px 18px rgba(0,0,0,.25);padding:0;background:var(--c);position:relative}
    .prx391-swatch.active:after{content:'✓';position:absolute;inset:0;display:grid;place-items:center;color:#061711;font-weight:950;text-shadow:0 1px 0 rgba(255,255,255,.55)}
    .prx391-hex-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;margin-top:8px}
    .prx391-hex-row input{width:100%;border:1px solid rgba(220,255,240,.18);border-radius:14px;background:rgba(0,0,0,.24);color:#edf8f3;padding:10px 12px;font-weight:850;font-size:16px;text-transform:uppercase}
    .prx391-hex-row button,.prx391-preset{border:1px solid rgba(220,255,240,.20);border-radius:14px;background:rgba(255,255,255,.07);color:#edf8f3;padding:10px 12px;font-weight:900}
    .prx391-native-color{display:none!important}
    .prx391-presets{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0 4px}
    .prx391-note{font-size:12px;line-height:1.35;color:#a9c7ba;margin-top:8px}
    .settings-row.line-editor{overflow:hidden!important;contain:layout paint;border-radius:22px!important}
    .settings-row.line-editor label{min-height:40px}
    body.prx391-map-settle #map .leaflet-tile-container{transition:transform .10s linear!important}
  `; document.head.appendChild(st); }
  function normalizeHex(v){ v=String(v||'').trim(); if(!v)return null; if(v[0]!=='#')v='#'+v; if(/^#[0-9a-fA-F]{3}$/.test(v)) v='#'+v[1]+v[1]+v[2]+v[2]+v[3]+v[3]; return /^#[0-9a-fA-F]{6}$/.test(v)?v.toLowerCase():null; }
  function setColor(path,color){color=normalizeHex(color); if(!color){toast('Ungültige Farbe');return;} const line=loadLine(); const [g,k]=path.split('.'); line[g]=line[g]||{}; line[g][k]=color; saveLine(line,'Farbe gespeichert'); enhanceLineEditors();}
  function setPreset(key){const p=presets[key]; if(!p)return; const d=lineDefault(); const line=JSON.parse(JSON.stringify(Object.assign({},d,p.line))); line.gpx=Object.assign({},d.gpx,p.line.gpx||{}); line.kml=Object.assign({},d.kml,p.line.kml||{}); line.outline=Object.assign({},d.outline,p.line.outline||{}); saveLine(line,'Preset: '+p.label); enhanceLineEditors();}
  function colorSurface(path,current){ const group=path.split('.')[0]; const pal=palettes[group]||palettes.gpx; current=normalizeHex(current)||'#ffffff'; const swatches=pal.map(c=>`<button type="button" class="prx391-swatch ${normalizeHex(c)===current?'active':''}" style="--c:${esc(c)}" data-prx391-color="${esc(path)}" data-color="${esc(c)}" aria-label="${esc(c)}"></button>`).join(''); return `<div class="prx391-line-surface" data-prx391-surface="${esc(path)}"><h4>Farbe ohne iOS-Systemkarte</h4><div class="prx391-palette">${swatches}</div><div class="prx391-hex-row"><input data-prx391-hex="${esc(path)}" value="${esc(current.toUpperCase())}" inputmode="text" spellcheck="false"><button type="button" data-prx391-apply="${esc(path)}">Setzen</button></div><div class="prx391-note">Die Farbfelder selbst bleiben farbecht; nur die tragende Einstellkarte folgt dem PRX-Layout.</div></div>`; }
  function enhanceLineEditors(){ injectCss(); const editors=qsa('.settings-row.line-editor'); if(!editors.length)return; const line=loadLine(); editors.forEach(ed=>{ const inp=qs('input[type="color"][data-line]',ed); if(inp && !ed.dataset.prx391Enhanced){ const path=inp.dataset.line; const val=(path==='gpx.color'?line.gpx.color:path==='kml.color'?line.kml.color:inp.value); inp.classList.add('prx391-native-color'); inp.tabIndex=-1; inp.setAttribute('aria-hidden','true'); inp.insertAdjacentHTML('afterend', colorSurface(path,val)); ed.dataset.prx391Enhanced='1'; }
      if(ed.textContent.includes('KML Linienart') && !ed.dataset.prx391Presets){ ed.insertAdjacentHTML('afterbegin', `<div class="prx391-line-surface"><h4>Linien-Presets</h4><div class="prx391-presets">${Object.entries(presets).map(([k,p])=>`<button type="button" class="prx391-preset" data-prx391-preset="${k}">${esc(p.label)}</button>`).join('')}</div></div>`); ed.dataset.prx391Presets='1'; }
    }); bindLineUi(); }
  function bindLineUi(){ qsa('[data-prx391-color]').forEach(b=>{ if(b._prx391)return; b._prx391=true; b.addEventListener('click',()=>setColor(b.dataset.prx391Color,b.dataset.color)); }); qsa('[data-prx391-apply]').forEach(b=>{ if(b._prx391)return; b._prx391=true; b.addEventListener('click',()=>{ const inp=qs(`[data-prx391-hex="${CSS.escape(b.dataset.prx391Apply)}"]`); setColor(b.dataset.prx391Apply, inp&&inp.value); }); }); qsa('[data-prx391-hex]').forEach(i=>{ if(i._prx391)return; i._prx391=true; i.addEventListener('keydown',e=>{ if(e.key==='Enter') setColor(i.dataset.prx391Hex,i.value); }); }); qsa('[data-prx391-preset]').forEach(b=>{ if(b._prx391)return; b._prx391=true; b.addEventListener('click',()=>setPreset(b.dataset.prx391Preset)); }); }
  function scheduleMap(reason){ const m=window.PRX_LEAFLET_MAP; document.body.classList.add('prx391-map-settle'); [60,180,420,900].forEach(t=>setTimeout(()=>{try{m&&m.invalidateSize&&m.invalidateSize({pan:false,animate:false});}catch(e){}},t)); setTimeout(()=>document.body.classList.remove('prx391-map-settle'),1200); window.PRX_MODULES.routeStyleTripPolish.lastMapSettle=reason||'manual'; }
  function addTripTinyPolish(){ const t=read(TRIP_KEY,{start:'2026-06-22',end:'2026-07-05'}); if(!t.start||!t.end)return; window.PRX_MODULES.routeStyleTripPolish.tripRange=t.start+' bis '+t.end; }
  function observe(){ const mo=new MutationObserver((muts)=>{ let needed=false; for(const m of muts){ if(m.addedNodes&&m.addedNodes.length){ needed=true; break; } } if(needed) setTimeout(enhanceLineEditors,60); }); mo.observe(document.body,{childList:true,subtree:true}); document.addEventListener('click',()=>setTimeout(enhanceLineEditors,120),true); }
  function init(){ injectCss(); observe(); enhanceLineEditors(); addTripTinyPolish(); scheduleMap('v391-start'); window.PRX_ROUTE_STYLE_PRESETS=presets; window.PRX_MODULES.routeStyleTripPolish.ready=true; }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
