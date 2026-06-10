(function(){
  'use strict';
  const VERSION = '3.8.5';
  const BUILD = 'MODULE INTAKE & START DIAGNOSIS';
  const startedAt = Date.now();
  window.PRX_APP_VERSION = VERSION;
  window.PRX_BUILD_NAME = BUILD;
  window.PRX_MODULE_STATUS = window.PRX_MODULE_STATUS || {};

  const MODULES = [
    ['data.js','PR-/GPX-/KML-Daten'],
    ['poi-data.js','POI-Daten'],
    ['app.js','Kern-App'],
    ['prx-v372-nav-recovery.js','Navigation Recovery'],
    ['prx-v373-settings-symbol-system.js','Settings/Symbol System'],
    ['prx-v374-modal-isolation.js','Modal Isolation'],
    ['prx-v375-settings-options-trip-deepening.js','Options/Trip Deepening'],
    ['prx-v376-settings-engine.js','Settings Engine'],
    ['prx-v377-interactive-controls-status-booking.js','Status/Buchung'],
    ['prx-v378-detail-open-recovery.js','Detail Recovery'],
    ['prx-v380-osm-live-poi.js','OSM Live POI'],
    ['prx-v385-module-intake-start-diagnosis.js','Startdiagnose']
  ];

  function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function hasClass(el, cls){ return !!(el && el.classList && el.classList.contains(cls)); }
  function safeCount(v){ return Array.isArray(v) ? v.length : (v && typeof v === 'object' ? Object.keys(v).length : 0); }
  function scriptLoaded(name){ return !!$all('script[src]').find(s => (s.getAttribute('src') || '').includes(name)); }
  function visible(el){
    if(!el) return false;
    const cs = getComputedStyle(el);
    if(cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2;
  }
  function toast(msg){
    const t = $('#toast');
    if(t){
      t.textContent = msg;
      t.classList.remove('hidden');
      clearTimeout(t.__prxTimer);
      t.__prxTimer = setTimeout(()=>t.classList.add('hidden'), 2600);
      return;
    }
    console.log('[PRX]', msg);
  }

  function injectCss(){
    if($('#prx385Styles')) return;
    const st = document.createElement('style');
    st.id = 'prx385Styles';
    st.textContent = `
      .prx385-diagnostic-card{margin:14px 12px 90px;padding:16px;border:1px solid rgba(186,230,210,.22);border-radius:22px;background:rgba(6,24,20,.86);box-shadow:0 18px 50px rgba(0,0,0,.28);color:#edf8f3;backdrop-filter:blur(18px)}
      .prx385-diagnostic-card h3{margin:0 0 8px;font-size:18px}.prx385-diagnostic-card p{margin:0 0 10px;color:#a9c7ba;line-height:1.4}.prx385-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.prx385-metric{padding:10px;border-radius:14px;background:rgba(255,255,255,.055);font-size:12px;color:#a9c7ba}.prx385-metric b{display:block;color:#edf8f3;font-size:16px;margin-top:3px}.prx385-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.prx385-actions button{border:1px solid rgba(53,215,166,.38);border-radius:13px;background:rgba(53,215,166,.13);color:#edf8f3;padding:10px 12px;font-weight:750}.prx385-actions button.secondary{border-color:rgba(186,230,210,.18);background:rgba(255,255,255,.06)}
      .prx385-panel{position:fixed;inset:0;z-index:9999;background:linear-gradient(180deg,#0b241e,#071713);color:#edf8f3;overflow:auto;-webkit-overflow-scrolling:touch;padding:max(18px,env(safe-area-inset-top)) 14px max(24px,env(safe-area-inset-bottom));font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',Arial,sans-serif}.prx385-panel.hidden{display:none!important}.prx385-panel-head{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;gap:10px;margin:-2px -2px 14px;padding:8px 2px;background:linear-gradient(180deg,rgba(7,23,19,.98),rgba(7,23,19,.84));backdrop-filter:blur(16px)}.prx385-panel h2{margin:0;font-size:24px}.prx385-close{width:40px;height:40px;border-radius:50%;border:1px solid rgba(186,230,210,.18);background:rgba(255,255,255,.08);color:#edf8f3;font-size:22px}.prx385-list{display:grid;gap:8px}.prx385-row{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:12px;border:1px solid rgba(186,230,210,.18);border-radius:16px;background:rgba(255,255,255,.05)}.prx385-dot{width:10px;height:10px;border-radius:50%;background:#b4df72}.prx385-dot.warn{background:#ffd166}.prx385-dot.err{background:#ff6b6b}.prx385-row small{color:#a9c7ba}.prx385-pill{font-size:12px;color:#a9c7ba;border:1px solid rgba(186,230,210,.18);border-radius:999px;padding:5px 8px}.prx385-osm-loading:after{content:'OSM lädt …';position:fixed;left:50%;bottom:max(92px,calc(72px + env(safe-area-inset-bottom)));transform:translateX(-50%);z-index:9998;background:rgba(7,23,19,.92);border:1px solid rgba(53,215,166,.35);border-radius:999px;color:#edf8f3;padding:10px 14px;font-size:13px;font-weight:800;box-shadow:0 10px 30px rgba(0,0,0,.35)}
    `;
    document.head.appendChild(st);
  }

  function counts(){
    const data = window.PRX_DATA || window.prxData || window.TRAILS || window.trails;
    const pois = window.PRX_POIS || window.PRX_CONTEXT_POIS || window.POI_DATA || window.pois;
    const tracks = window.PRX_GPX || window.GPX_TRACKS || null;
    const kml = window.PRX_KML || window.KML_ROUTES || null;
    return {
      pr: safeCount(Array.isArray(data) ? data : (data && (data.trails || data.routes || data.prs))),
      poi: safeCount(Array.isArray(pois) ? pois : (pois && (pois.items || pois.pois || pois.highlights))),
      gpx: safeCount(tracks || (data && data.gpx)),
      kml: safeCount(kml || (data && data.kml))
    };
  }

  function diagnostics(){
    const c = counts();
    const scripts = MODULES.map(([file,label]) => ({file,label,loaded:scriptLoaded(file)}));
    const mapReady = !!($('#map') && (window.L || window.leaflet));
    const journalItems = $('#journalList') ? $('#journalList').children.length : 0;
    return {version:VERSION, build:BUILD, ageMs:Date.now()-startedAt, counts:c, scripts, mapReady, journalItems, errors:window.PRX_RUNTIME_ERRORS || []};
  }

  function ensurePanel(){
    let p = $('#prx385Panel');
    if(p) return p;
    p = document.createElement('section');
    p.id = 'prx385Panel';
    p.className = 'prx385-panel hidden';
    p.innerHTML = `<div class="prx385-panel-head"><div><h2>Dashboard · Startdiagnose</h2><small>PRX ${VERSION} · ${BUILD}</small></div><button class="prx385-close" aria-label="Schließen">×</button></div><div id="prx385PanelBody"></div>`;
    document.body.appendChild(p);
    $('.prx385-close', p).addEventListener('click', () => p.classList.add('hidden'));
    return p;
  }

  function renderPanel(){
    const p = ensurePanel();
    const d = diagnostics();
    const body = $('#prx385PanelBody', p);
    const rows = d.scripts.map(s => `<div class="prx385-row"><span class="prx385-dot ${s.loaded?'':'warn'}"></span><div><b>${s.label}</b><small>${s.file}</small></div><span class="prx385-pill">${s.loaded?'geladen':'fehlt'}</span></div>`).join('');
    const errors = (d.errors || []).slice(-5).map(e => `<div class="prx385-row"><span class="prx385-dot err"></span><div><b>${escapeHtml(e.message || 'Fehler')}</b><small>${escapeHtml(e.source || '')}:${e.line || ''}</small></div><span class="prx385-pill">JS</span></div>`).join('') || `<div class="prx385-row"><span class="prx385-dot"></span><div><b>Keine Laufzeitfehler protokolliert</b><small>Seit Seitenstart</small></div><span class="prx385-pill">OK</span></div>`;
    body.innerHTML = `<div class="prx385-diagnostic-card"><h3>Startstatus</h3><p>Diese Diagnose ist absichtlich lokal und blockiert keine App-Funktion.</p><div class="prx385-grid"><div class="prx385-metric">PRs<b>${d.counts.pr || '—'}</b></div><div class="prx385-metric">POIs<b>${d.counts.poi || '—'}</b></div><div class="prx385-metric">GPX<b>${d.counts.gpx || '—'}</b></div><div class="prx385-metric">KML<b>${d.counts.kml || '—'}</b></div><div class="prx385-metric">Karte<b>${d.mapReady?'bereit':'prüfen'}</b></div><div class="prx385-metric">Journal-Karten<b>${d.journalItems}</b></div></div><div class="prx385-actions"><button id="prx385CopyDiag">Diagnose kopieren</button><button class="secondary" id="prx385CloseDiag">Schließen</button></div></div><h3>Module</h3><div class="prx385-list">${rows}</div><h3 style="margin-top:16px">Laufzeitfehler</h3><div class="prx385-list">${errors}</div>`;
    $('#prx385CloseDiag', body).addEventListener('click', () => p.classList.add('hidden'));
    $('#prx385CopyDiag', body).addEventListener('click', async () => {
      const text = JSON.stringify(d, null, 2);
      try{ await navigator.clipboard.writeText(text); toast('Diagnose kopiert'); } catch(e){ toast('Diagnose konnte nicht kopiert werden'); }
    });
  }
  function openPanel(){ renderPanel(); $('#prx385Panel').classList.remove('hidden'); }

  function escapeHtml(v){ return String(v).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  function installErrorLog(){
    window.PRX_RUNTIME_ERRORS = window.PRX_RUNTIME_ERRORS || [];
    window.addEventListener('error', e => {
      window.PRX_RUNTIME_ERRORS.push({message:e.message, source:e.filename, line:e.lineno, col:e.colno, time:new Date().toISOString()});
      if(window.PRX_RUNTIME_ERRORS.length > 20) window.PRX_RUNTIME_ERRORS.shift();
    });
    window.addEventListener('unhandledrejection', e => {
      const msg = e.reason && (e.reason.message || String(e.reason));
      window.PRX_RUNTIME_ERRORS.push({message:msg || 'Unhandled rejection', source:'promise', time:new Date().toISOString()});
      if(window.PRX_RUNTIME_ERRORS.length > 20) window.PRX_RUNTIME_ERRORS.shift();
    });
  }

  function installOsmFetchIndicator(){
    if(window.__prx385FetchWrapped || !window.fetch) return;
    const nativeFetch = window.fetch.bind(window);
    window.fetch = function(input, init){
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      const isOverpass = /overpass|overpass-api|overpass\.kumi|overpass\.openstreetmap/i.test(url);
      if(isOverpass){
        document.body.classList.add('prx385-osm-loading');
        toast('OSM-Live-POIs werden geladen …');
      }
      return nativeFetch(input, init).finally(() => {
        if(isOverpass){
          setTimeout(()=>document.body.classList.remove('prx385-osm-loading'), 350);
        }
      });
    };
    window.__prx385FetchWrapped = true;
  }

  function installDashboardHook(){
    document.addEventListener('click', e => {
      const btn = e.target.closest && e.target.closest('[data-nav="dash"]');
      if(btn){
        setTimeout(openPanel, 60);
      }
    }, true);
  }

  function makeFallbackCard(reason){
    const list = $('#journalList') || $('#journalStage');
    if(!list || $('#prx385FallbackCard')) return;
    const c = counts();
    const card = document.createElement('section');
    card.id = 'prx385FallbackCard';
    card.className = 'prx385-diagnostic-card';
    card.innerHTML = `<h3>Startdiagnose</h3><p>${escapeHtml(reason)} Die App-Shell ist vorhanden; die Kernliste wurde nicht erwartungsgemäß gerendert.</p><div class="prx385-grid"><div class="prx385-metric">PR-Daten<b>${c.pr || 'prüfen'}</b></div><div class="prx385-metric">POIs<b>${c.poi || 'prüfen'}</b></div><div class="prx385-metric">Version<b>${VERSION}</b></div><div class="prx385-metric">Map-DOM<b>${$('#map')?'vorhanden':'fehlt'}</b></div></div><div class="prx385-actions"><button id="prx385OpenDiagInline">Diagnose öffnen</button><button class="secondary" onclick="location.reload()">Neu laden</button></div>`;
    list.appendChild(card);
    $('#prx385OpenDiagInline', card).addEventListener('click', openPanel);
  }

  function displayGuard(){
    const body = document.body;
    const map = $('#map'), journal = $('#journalStage'), list = $('#journalList');
    if(!body || !map || !journal){
      makeFallbackCard('Kritische App-Container fehlen.');
      return;
    }
    // Do not fight valid modal states; only recover from blank/hidden main views.
    const anyMainVisible = visible(journal) || visible($('#detailCard')) || visible($('#poiSheet')) || visible(map);
    if(!anyMainVisible){
      body.classList.add('state-journal');
      journal.classList.remove('hidden','is-hidden','off','closed');
      map.classList.remove('hidden','is-hidden','off','closed');
      makeFallbackCard('Display-Guard hat eine leere Hauptansicht erkannt und Journal/Karte wieder aktiviert.');
      return;
    }
    if(list && list.children.length === 0){
      makeFallbackCard('Keine Journal-Karten nach dem Start gefunden.');
    }
  }

  function addVersionMarker(){
    document.documentElement.setAttribute('data-prx-version', VERSION);
    const title = document.querySelector('title');
    if(title && !title.textContent.includes(VERSION)) title.textContent = 'PR Explorer Madeira V' + VERSION;
    try{ localStorage.setItem('prx.lastVersion', VERSION); }catch(e){}
  }

  function init(){
    injectCss();
    installErrorLog();
    installOsmFetchIndicator();
    installDashboardHook();
    addVersionMarker();
    setTimeout(displayGuard, 2400);
    setTimeout(() => { window.PRX_MODULE_STATUS.v385 = diagnostics(); }, 3200);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
