/* PRX V3.9.2 · Content / Settings / Dashboard Deepening
   Leitplanken-konform: keine neue Architektur, keine neuen Ordner, keine blockierenden Abfragen.
   Aufgaben:
   - V2-PR-Texte aus data/pr-routes-madeira.js in PRX_DATA.trails übernehmen.
   - Dashboard um Text-/Daten-/Reise-/OSM-Status erweitern.
   - Zweite Ebenen in Optionen/Einstellungen/Reise mit echten, risikoarmen Zusatzinfos füllen.
*/
(function(){
  'use strict';
  if(window.__PRX392_CONTENT_SETTINGS_DASHBOARD__) return;
  window.__PRX392_CONTENT_SETTINGS_DASHBOARD__ = true;
  const VERSION='3.9.2';
  const TEXT_MODE_KEY='prx.detailTextMode.v373';
  const LINE_STYLE_KEY='prx.lineStyle.v377';
  const TRIP_KEY='prx.trip.v370';
  const OPTIONS_KEY='prx.options.v370';
  window.PRX_APP_VERSION=VERSION;
  window.PRX_BUILD_NAME='CONTENT SETTINGS DASHBOARD DEEPENING';
  window.PRX_MODULE_STATUS=window.PRX_MODULE_STATUS||{};
  const $=(id)=>document.getElementById(id);
  const qsa=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
  const esc=(s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function read(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(_){return fallback}}
  function write(key,val){try{localStorage.setItem(key,JSON.stringify(val))}catch(_){}}
  function toast(msg){const t=$('toast'); if(t){t.textContent=msg;t.classList.remove('hidden');clearTimeout(t._prx392);t._prx392=setTimeout(()=>t.classList.add('hidden'),1800)}else console.log('[PRX]',msg)}
  function normId(v){return String(v||'').toUpperCase().replace(/\s+/g,'').replace(/^ROUTE_/,'').replace(/^PR0+/,'PR').replace(/^PR/,'PR')}
  function routeLookup(){
    const arr=Array.isArray(window.PRX_PR_ROUTES_MADEIRA)?window.PRX_PR_ROUTES_MADEIRA:[];
    const map=new Map();
    arr.forEach(r=>{
      const keys=[r.originalId,r.routeNo,r.routeId,r.name].filter(Boolean).map(normId);
      keys.forEach(k=>map.set(k,r));
      const n=String(r.routeNo||r.originalId||'').match(/PR\s*([0-9.]+)/i);
      if(n) map.set('PR'+n[1],r);
    });
    return map;
  }
  function enrichTrailTexts(){
    const data=window.PRX_DATA; if(!data||!Array.isArray(data.trails)) return {ok:false,count:0,reason:'PRX_DATA fehlt'};
    const map=routeLookup(); let count=0;
    data.trails.forEach(t=>{
      const keys=[t.id,'PR'+(t.number||''),t.rawNumber,t.name].filter(Boolean).map(normId);
      const r=keys.map(k=>map.get(k)).find(Boolean);
      if(!r) return;
      if(r.shortText150 && !t.shortText150) t.shortText150=r.shortText150;
      if(r.detailText280 && !t.detailText280) t.detailText280=r.detailText280;
      if(r.featureTags && !t.featureTags) t.featureTags=r.featureTags;
      if(r.sourceUrl && !t.sourceUrl) t.sourceUrl=r.sourceUrl;
      if(r.googleMapsUrl && !t.googleMapsUrl) t.googleMapsUrl=r.googleMapsUrl;
      if(r.status_2026_06_07 && !t.statusSnapshot) t.statusSnapshot=r.status_2026_06_07;
      count++;
    });
    window.PRX_TEXT_ENRICHMENT={version:VERSION,matched:count,total:data.trails.length,source:'data/pr-routes-madeira.js'};
    return {ok:true,count,total:data.trails.length};
  }
  function textStats(){
    const trails=(window.PRX_DATA&&Array.isArray(window.PRX_DATA.trails))?window.PRX_DATA.trails:[];
    const withShort=trails.filter(t=>t.shortText150).length;
    const withDetail=trails.filter(t=>t.detailText280).length;
    const src=Array.isArray(window.PRX_PR_ROUTES_MADEIRA)?window.PRX_PR_ROUTES_MADEIRA.length:0;
    return {trails:trails.length,withShort,withDetail,sourceRows:src,mode:localStorage.getItem(TEXT_MODE_KEY)||'off'};
  }
  function counts(){
    const trails=(window.PRX_DATA&&Array.isArray(window.PRX_DATA.trails))?window.PRX_DATA.trails:[];
    const pois=Array.isArray(window.PRX_POIS)?window.PRX_POIS:[];
    const hl=Array.isArray(window.PRX_HIGHLIGHT_POIS_MADEIRA)?window.PRX_HIGHLIGHT_POIS_MADEIRA:[];
    const std=Array.isArray(window.PRX_STANDARD_POIS_MADEIRA)?window.PRX_STANDARD_POIS_MADEIRA:[];
    const osm=window.PRX_OSM_LIVE&&typeof window.PRX_OSM_LIVE.getItems==='function'?(window.PRX_OSM_LIVE.getItems()||[]).length:0;
    const trip=read(TRIP_KEY,{start:'2026-06-22',end:'2026-07-05'});
    return {trails:trails.length,pois:pois.length,highlight:hl.length,standard:std.length,osm,trip};
  }
  function injectCss(){
    if($('prx392-style'))return;
    const s=document.createElement('style'); s.id='prx392-style'; s.textContent=`
      .prx392-card{border:1px solid rgba(220,255,240,.14);background:rgba(16,44,37,.86);border-radius:20px;padding:14px;margin:10px 0;color:#edf8f3}.prx392-card h3{margin:0 0 8px;font-size:18px}.prx392-card p{margin:0;color:#a9c7ba;line-height:1.42}.prx392-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.prx392-stat{border:1px solid rgba(220,255,240,.12);background:rgba(255,255,255,.045);border-radius:16px;padding:12px}.prx392-stat small{display:block;color:#a9c7ba;font-weight:800}.prx392-stat b{font-size:25px}.prx392-action{border:1px solid rgba(220,255,240,.18);background:rgba(255,255,255,.065);color:#edf8f3;border-radius:14px;padding:12px 13px;font-weight:900}.prx392-action.primary{background:linear-gradient(180deg,#35d7a6,#25b986);color:#041b15;border:0}.jcard .note.prx392-realtext{color:#d6f4e8;font-weight:650}.prx392-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.prx392-tags span{border:1px solid rgba(220,255,240,.16);background:rgba(255,255,255,.055);border-radius:999px;padding:5px 8px;color:#bfe5d7;font-size:12px;font-weight:800}.detail-block.prx392-source small{display:block;color:#a9c7ba;line-height:1.4}.prx392-muted{color:#a9c7ba}.prx392-ok{color:#b6ffd0}.prx392-warn{color:#ffe7a8}.prx392-line-swatch{display:inline-block;width:44px;height:8px;border-radius:999px;margin-right:8px;vertical-align:middle;box-shadow:0 0 0 2px rgba(255,255,255,.35)}
    `; document.head.appendChild(s);
  }
  function refreshJournalTextClass(){
    qsa('.jcard .note').forEach(n=>{ if(n.textContent && !/GPX\/KML aus Projektdateien/i.test(n.textContent)) n.classList.add('prx392-realtext'); });
  }
  function addDetailSourceBlock(){
    const card=$('detailCard'); if(!card||card.classList.contains('hidden')) return;
    const title=$('detailTitle')?.textContent||'';
    const activeId=(title.match(/PR\s*([0-9.]+)/i)||[])[1];
    if(!activeId) return;
    const trail=(window.PRX_DATA?.trails||[]).find(t=>String(t.number)===String(activeId)||String(t.id).toUpperCase()==='PR'+String(activeId).toUpperCase());
    const old=card.querySelector('.prx392-source'); if(old) old.remove();
    if(!trail) return;
    const block=document.createElement('section'); block.className='detail-block prx392-source';
    const tags=String(trail.featureTags||'').split(/[,;]+/).map(x=>x.trim()).filter(Boolean).slice(0,6);
    block.innerHTML=`<h3>Steckbrief</h3><small>Textquelle: ${trail.shortText150||trail.detailText280?'PRX V2-Textschicht':'Basisdaten'}${trail.statusSnapshot?' · Status-Momentaufnahme: '+esc(trail.statusSnapshot):''}</small>${tags.length?'<div class="prx392-tags">'+tags.map(t=>'<span>'+esc(t)+'</span>').join('')+'</div>':''}`;
    const links=card.querySelector('#linkGrid')?.closest('.detail-block');
    if(links) links.before(block); else card.appendChild(block);
  }
  function enhanceDashboard(){
    const modal=$('prx390Dashboard'); const body=$('prx390Body'); if(!modal||!body||modal.classList.contains('hidden')) return;
    if(body.querySelector('.prx392-dashboard-extra')) return;
    const t=textStats(), c=counts();
    const extra=document.createElement('section'); extra.className='prx390-section prx392-dashboard-extra';
    const modeLabel={off:'echte Texte',short150:'Test 150',detail280:'Test 280',both:'beide Tests'}[t.mode]||t.mode;
    extra.innerHTML=`
      <div class="prx390-title">Inhalte & Reise</div>
      <div class="prx390-card">
        <div class="prx392-grid">
          <div class="prx392-stat"><small>PR-Kurztexte</small><b>${t.withShort}/${t.trails}</b></div>
          <div class="prx392-stat"><small>PR-Detailtexte</small><b>${t.withDetail}/${t.trails}</b></div>
          <div class="prx392-stat"><small>Highlight-POIs</small><b>${c.highlight}</b></div>
          <div class="prx392-stat"><small>Standard-POIs</small><b>${c.standard}</b></div>
        </div>
        <div style="height:12px"></div>
        <div class="prx390-row"><span class="prx390-ico">TXT</span><div><strong>Textmodus</strong><small>${esc(modeLabel)} · V2-Textschicht bleibt Rohdaten-unabhängig.</small></div><span class="prx390-pill">${t.sourceRows? 'V2 aktiv':'Basis'}</span></div>
        <div class="prx390-row"><span class="prx390-ico">📅</span><div><strong>Reisezeitraum</strong><small>${esc(c.trip.start||'–')} bis ${esc(c.trip.end||'–')}</small></div><span class="prx390-pill">lokal</span></div>
        <div class="prx390-actions"><button id="prx392OpenSettingsText">Textmodus öffnen</button><button id="prx392CopyTextDiag">Textdiagnose kopieren</button></div>
      </div>`;
    const diag=Array.from(body.children).find(el=>/Diagnose/i.test(el.textContent||''));
    if(diag) body.insertBefore(extra,diag); else body.appendChild(extra);
    $('prx392OpenSettingsText')?.addEventListener('click',()=>{modal.classList.add('hidden');$('settingsBtn')?.click(); setTimeout(()=>{const rows=qsa('#settingsSheet [data-go="display"]'); rows[0]?.click();},220)});
    $('prx392CopyTextDiag')?.addEventListener('click',()=>{navigator.clipboard?.writeText(JSON.stringify({version:VERSION,textStats:t,counts:c,enrichment:window.PRX_TEXT_ENRICHMENT||null},null,2));toast('Textdiagnose kopiert')});
  }
  function deepenActiveSettingsPage(){
    const active=document.querySelector('#optionSheet:not(.hidden),#settingsSheet:not(.hidden),#tripSheet:not(.hidden)'); if(!active) return;
    const detail=active.querySelector('.prx376-detail'); if(!detail||!active.querySelector('.prx376-pages.detail-open')) return;
    const h=(detail.querySelector('h2')?.textContent||'').trim(); if(!h || detail.querySelector('.prx392-deepen')) return;
    let html='';
    const c=counts(), t=textStats(), line=read(LINE_STYLE_KEY,{gpx:{color:'#ff3b30',weight:5},kml:{color:'#007aff',weight:5},outline:{extraWeight:1},kmlStyle:'solid'});
    if(h==='Darstellung') html=`<div class="prx392-card prx392-deepen"><h3>Aktive Textschicht</h3><p>Aktuell: ${esc(({off:'echte V2-Texte',short150:'150-Zeichen-Test',detail280:'280-Zeichen-Test',both:'beide Testtexte'}[t.mode]||t.mode))}. PR-Karten nutzen jetzt echte Kurztexte, sofern im V2-Paket vorhanden.</p><div class="prx392-grid"><button class="prx392-action" data-prx392-text="off">Echte Texte</button><button class="prx392-action" data-prx392-text="short150">Test 150</button><button class="prx392-action" data-prx392-text="detail280">Test 280</button><button class="prx392-action" data-prx392-text="both">Beide</button></div></div>`;
    if(h==='Karteninhalt') html=`<div class="prx392-card prx392-deepen"><h3>Kartenstatus</h3><p>OSM-Live-POIs geladen: ${c.osm}. PRX-POIs bleiben getrennt von OSM-Communitydaten. Karten-Kachelproblem wird nicht hart umgebaut, damit der restliche Betrieb stabil bleibt.</p></div>`;
    if(h==='POI-Anzeige') html=`<div class="prx392-card prx392-deepen"><h3>POI-Datenstand</h3><div class="prx392-grid"><div class="prx392-stat"><small>Highlight</small><b>${c.highlight}</b></div><div class="prx392-stat"><small>Standard</small><b>${c.standard}</b></div><div class="prx392-stat"><small>Alt/kompiliert</small><b>${c.pois}</b></div><div class="prx392-stat"><small>OSM Live</small><b>${c.osm}</b></div></div><p style="margin-top:10px">Highlights sind Besuchsziele; Standard-POIs bleiben Kategorie-/Funktionskontext.</p></div>`;
    if(h==='Linien & Tracks') html=`<div class="prx392-card prx392-deepen"><h3>Aktive Linienwerte</h3><p><span class="prx392-line-swatch" style="background:${esc(line.gpx?.color||'#ff3b30')};height:${Math.max(4,Math.min(12,line.gpx?.weight||5))}px"></span>GPX ${esc(line.gpx?.weight||5)} px · <span class="prx392-line-swatch" style="background:${esc(line.kml?.color||'#007aff')};height:${Math.max(4,Math.min(12,line.kml?.weight||5))}px"></span>KML ${esc(line.kml?.weight||5)} px · Kontur +${esc(line.outline?.extraWeight??1)} px · ${esc(line.kmlStyle||'solid')}</p><button class="prx392-action" id="prx392ResetLines">Linienstandard wiederherstellen</button></div>`;
    if(h==='Reiseansicht'||h==='Tag 1'||h.startsWith('Tag ')) html=`<div class="prx392-card prx392-deepen"><h3>Reiseplanung</h3><p>Reisezeitraum: ${esc(c.trip.start||'–')} bis ${esc(c.trip.end||'–')}. Nächster Ausbau: PR pro Tag, Tagesnotiz, Heute-/Später-POIs und Warnhinweise.</p></div>`;
    if(h==='Admin'||h==='Diagnose/Test') html=`<div class="prx392-card prx392-deepen"><h3>V3.9.2 Diagnose</h3><div class="prx392-grid"><div class="prx392-stat"><small>Text-Match</small><b>${t.withShort}</b></div><div class="prx392-stat"><small>V2-Routen</small><b>${t.sourceRows}</b></div></div><p style="margin-top:10px">Modul: Content/Settings/Dashboard Deepening aktiv.</p></div>`;
    if(!html) return;
    const stack=detail.querySelector('.settings-stack')||detail;
    stack.insertAdjacentHTML('beforeend',html);
    detail.querySelectorAll('[data-prx392-text]').forEach(b=>b.addEventListener('click',()=>{localStorage.setItem(TEXT_MODE_KEY,b.dataset.prx392Text);toast('Textmodus gesetzt: '+b.textContent); setTimeout(()=>location.reload(),350)}));
    $('prx392ResetLines')?.addEventListener('click',()=>{localStorage.setItem(LINE_STYLE_KEY,JSON.stringify({gpx:{color:'#ff3b30',weight:5,opacity:.95},kml:{color:'#007aff',weight:5,opacity:.86},outline:{color:'#ffffff',extraWeight:1,opacity:.55},kmlStyle:'solid'}));document.dispatchEvent(new CustomEvent('prx-line-style-changed'));toast('Linienstandard gesetzt')});
  }
  function observeUi(){
    const mo=new MutationObserver(()=>{refreshJournalTextClass();addDetailSourceBlock();enhanceDashboard();deepenActiveSettingsPage();});
    mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    setInterval(()=>{refreshJournalTextClass();addDetailSourceBlock();enhanceDashboard();deepenActiveSettingsPage();},1400);
  }
  function syncVersion(){
    window.PRX_APP_VERSION=VERSION;
    document.documentElement.setAttribute('data-prx-version',VERSION);
    const body=$('prx390Body');
    if(body){
      body.querySelectorAll('small').forEach(el=>{
        if(/PRX\s+3\.9\.0/i.test(el.textContent||'')) el.textContent=(el.textContent||'').replace(/PRX\s+3\.9\.0/i,'PRX '+VERSION);
      });
    }
  }
  function init(){
    injectCss();
    const res=enrichTrailTexts();
    window.PRX_MODULE_STATUS.v392={loaded:true,version:VERSION,features:['v2-text-enrichment','dashboard-content','settings-deepening'],textMatched:res.count||0};
    syncVersion();
    observeUi();
    [250,900,1800,3200].forEach(t=>setTimeout(syncVersion,t));
    setTimeout(()=>{refreshJournalTextClass();addDetailSourceBlock();},800);
  }
  init();
})();
