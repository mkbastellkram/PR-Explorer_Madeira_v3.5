/* PR Explorer Madeira · V3.10.1 Component Audit Mode
   Safe runtime-only overlay: no app data mutation, no routing replacement, no service worker. */
(function(){
  'use strict';
  const VERSION='3.10.1';
  const STORE='prx.auditMode.v3101';
  window.PRX_APP_VERSION = VERSION;
  const GROUPS={
    N:'Navigation', T:'Top-Controls', J:'Journal', D:'PR-Detail', M:'Karte', F:'Filter', O:'Optionen', E:'Einstellungen', R:'Reise', P:'POI', S:'Status/Buchung', A:'Audit/Admin'
  };
  const RULES=[
    ['M-01','#map','Leaflet-Karte'],['M-02','.world','Karten-/Szenenebene'],['M-03','.scene-bg','Intro-/Hintergrundebene'],
    ['T-00','.top-controls','Top-Control-Leiste'],['T-01','#filterBtn','Filterbutton'],['T-02','#optionBtn','Optionenbutton'],['T-03','#shareBtn','Teilenbutton'],['T-04','#osmLiveBtn, #osmBtn, [data-prx-osm], button[aria-label*="OSM"]','OSM-Live-Button'],['T-05','#gpsBtn, [data-prx-gps], button[aria-label*="GPS"]','GPS-Button'],['T-06','#mapBtn','Kartenbutton'],['T-07','#settingsBtn','Einstellungenbutton'],
    ['J-01','#journalStage','Journal-Ansicht'],['J-02','#journalList','PR-Liste'],['J-03','.journal-intro','Journal-Kopf'],['J-04','.journal-end','Listenende / Empty-State'],['J-05','.jcard','PR-Listenelement'],
    ['D-01','#detailCard','PR-Detailseite'],['D-02','.detail-head','Detail-Header'],['D-03','#detailGrip,.detail-grip','Detail-Griff'],['D-04','#detailClose','Detail schließen'],['D-05','#detailFacts,.facts','Faktenraster'],['D-06','#profile,.profile','Höhenprofil'],['D-07','#detailText','Beschreibungstext'],['D-08','#fitBtn','Route einpassen'],['D-09','#mapsBtn','Google Maps'],['D-10','#favBtn','Favorit'],['D-11','#contextGrid','Kontextbereich'],['D-12','#linkGrid','Linkbereich'],
    ['P-01','#poiSheet,.poi-sheet','POI-Dock / POI-Sheet'],['P-02','#poiSheetRail,.poi-sheet-rail','POI-Karussell'],['P-03','.poi-card','POI-Karte'],['P-04','.poi-info-row,.poi-info-list','Info-POI-Zeile'],
    ['N-01','#bottomNav,.bottom-nav','Bottom-Navigation'],['N-01.1','[data-nav="journal"]','Tab Journal'],['N-01.2','[data-nav="map"]','Tab Karte'],['N-01.3','[data-nav="trip"]','Tab Reise'],['N-01.4','[data-nav="dash"]','Tab Dashboard'],
    ['F-01','.filter-sheet','Filter-Sheet'],['F-02','.filter-summary','Filter-Zusammenfassung'],['F-03','.region-grid','Regionsfilter'],['F-04','.status-filter-grid','Statusfilter'],['F-05','.range-control','Wertebereich-Slider'],['F-06','.dual-range','Doppelgriff-Slider'],['F-07','.filter-actions','Filter-Aktionen'],
    ['O-01','.options-sheet,[data-prx-panel="options"]','Optionen-Hauptbereich'],['O-02','.menu-list','Menülistenblock'],['O-03','.menu-row','Menüzeile'],
    ['E-01','.settings-sheet,[data-prx-panel="settings"]','Einstellungen-Hauptbereich'],['E-02','.settings-head','Einstellungen-Kopf'],['E-03','.settings-stack','Einstellungen-Detailstack'],['E-04','.settings-row','Einstellungszeile'],['E-05','.switch-row','Schalterzeile'],['E-06','.seg','Segment-/Auswahlbutton'],['E-07','.diag-grid','Diagnose-Kachelgrid'],
    ['R-01','.trip-sheet,[data-prx-panel="trip"]','Reise-Hauptbereich'],['R-02','.trip-day,.day-card','Tageskarte'],['R-03','.trip-detail,.day-detail','Tagesdetail'],
    ['S-01','.prx386-status-booking,.prx-status-booking,[data-prx-status-block]','Status-&-Buchung-Block'],['S-02','.prx386-status-booking button,.prx-status-booking button','Status-/Buchungsbutton'],
    ['A-01','#prxAuditPanel','Audit-Panel'],['A-02','#prxAuditToggle','Audit-Modus-Schalter'],['A-03','#prxAuditCopy','Audit kopieren']
  ];
  function $(s,r=document){return r.querySelector(s)}
  function $all(s,r=document){try{return Array.from(r.querySelectorAll(s))}catch(e){return[]}}
  function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function instanceFor(el,id,idx){
    if(!el) return String(idx+1);
    const nav=el.getAttribute('data-nav'); if(nav) return nav;
    const aria=el.getAttribute('aria-label'); if(aria) return aria.toLowerCase().replace(/\s+/g,'-');
    const txt=(el.innerText||el.textContent||'').trim();
    const pr=txt.match(/\bPR\s?\d+(?:\.\d+)?\b/i); if(pr) return pr[0].replace(/\s+/g,'');
    if(el.id) return el.id;
    return String(idx+1);
  }
  function applyRegistry(){
    RULES.forEach(([id,selector,name])=>{
      $all(selector).forEach((el,idx)=>{
        if(!el || el.dataset.prxAuditLocked==='1') return;
        if(!el.dataset.prxComponent){
          const inst=instanceFor(el,id,idx);
          const label = (selector.includes(',')||$all(selector).length>1) ? `${id}@${inst}` : id;
          el.dataset.prxComponent=id;
          el.dataset.prxInstance=inst;
          el.dataset.prxName=name;
          el.dataset.prxLabel=label;
        }
      });
    });
  }
  function auditOn(){try{return localStorage.getItem(STORE)==='1'}catch(e){return false}}
  function setAudit(on){try{localStorage.setItem(STORE,on?'1':'0')}catch(e){} document.body.classList.toggle('prx-audit-mode',!!on); updateAuditPanel();}
  function visible(el){if(!el) return false; const r=el.getBoundingClientRect(); const cs=getComputedStyle(el); return r.width>1 && r.height>1 && cs.display!=='none' && cs.visibility!=='hidden' && cs.opacity!=='0'}
  function collectComponents(){
    applyRegistry();
    const rows=$all('[data-prx-component]').map(el=>({
      id:el.dataset.prxComponent, instance:el.dataset.prxInstance||'', label:el.dataset.prxLabel||el.dataset.prxComponent, name:el.dataset.prxName||'', visible:visible(el), tag:el.tagName.toLowerCase(), text:(el.innerText||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,90)
    }));
    const seen=new Set();
    return rows.filter(r=>{const k=r.label+'|'+r.name+'|'+r.visible; if(seen.has(k)) return false; seen.add(k); return true;});
  }
  function buildReport(){
    const rows=collectComponents();
    const now=new Date().toISOString();
    const state=[...document.body.classList].join(' ');
    let out=`# PRX Komponenten-Audit\n\nVersion: ${VERSION}\nZeit: ${now}\nAnsicht/Body-Klassen: ${state}\nURL: ${location.href}\n\n`;
    out+=`## Änderungshinweise\n\n- Bitte Änderung mit Komponenten-ID benennen, z. B. \`T-06@journal\` oder \`J-05@PR1.2\`.\n- Komponenten-ID ohne Instanz meint die wiederverwendete Komponente allgemein.\n- Instanzsuffix nach \`@\` meint ein konkretes Vorkommen.\n\n`;
    Object.keys(GROUPS).forEach(g=>{
      const part=rows.filter(r=>r.id && r.id.startsWith(g+'-'));
      if(!part.length) return;
      out+=`## ${g} · ${GROUPS[g]}\n\n`;
      part.forEach(r=>{out+=`- ${r.label} · ${r.name} · ${r.visible?'sichtbar':'nicht sichtbar'}${r.text?` · „${r.text}”`:''}\n`;});
      out+='\n';
    });
    out+=`## Freie Audit-Notizen\n\n- \n`;
    return out;
  }
  function copyText(txt){
    if(navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(txt);
    const ta=document.createElement('textarea'); ta.value=txt; ta.style.position='fixed'; ta.style.left='-9999px'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); return Promise.resolve();
  }
  function ensureStyles(){
    if($('#prxAuditStyles'))return;
    const st=document.createElement('style'); st.id='prxAuditStyles'; st.textContent=`
      body.prx-audit-mode [data-prx-component]{outline:1.5px dashed rgba(255,210,64,.85)!important; outline-offset:-2px; position:relative!important;}
      body.prx-audit-mode [data-prx-component]::before{content:attr(data-prx-label); position:absolute; left:3px; top:3px; z-index:2147483000; padding:2px 5px; border-radius:7px; background:rgba(255,210,64,.94); color:#04130f; font:800 10px/1.2 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif; letter-spacing:.02em; pointer-events:none; box-shadow:0 2px 10px rgba(0,0,0,.35);}
      #prxAuditPanel{position:fixed; inset:calc(env(safe-area-inset-top) + 12px) 10px calc(env(safe-area-inset-bottom) + 12px); z-index:2147482500; background:rgba(3,24,18,.96); color:#f4fff9; border:1px solid rgba(220,255,240,.22); border-radius:28px; box-shadow:0 20px 70px rgba(0,0,0,.55); backdrop-filter:blur(18px); display:flex; flex-direction:column; overflow:hidden; font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;}
      #prxAuditPanel.hidden{display:none!important} .prx-audit-head{display:flex; align-items:center; gap:10px; padding:16px; border-bottom:1px solid rgba(220,255,240,.14)}
      .prx-audit-head h2{margin:0; flex:1; text-align:center; font-size:22px}.prx-audit-icon{width:46px;height:46px;border-radius:50%;border:1px solid rgba(220,255,240,.22);background:rgba(255,255,255,.06);color:#f4fff9;font-size:24px;font-weight:900}.prx-audit-body{padding:16px; overflow:auto; -webkit-overflow-scrolling:touch}.prx-audit-card{border:1px solid rgba(220,255,240,.15);border-radius:20px;background:rgba(255,255,255,.055);padding:14px;margin:0 0 12px}.prx-audit-card h3{margin:0 0 8px;font-size:16px}.prx-audit-row{display:flex;gap:10px;align-items:center;justify-content:space-between;border-top:1px solid rgba(220,255,240,.10);padding:9px 0}.prx-audit-row:first-child{border-top:0}.prx-audit-id{font-weight:900;color:#ffd240}.prx-audit-muted{color:rgba(244,255,249,.66);font-size:13px}.prx-audit-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}.prx-audit-btn{border:1px solid rgba(220,255,240,.20);border-radius:16px;background:rgba(255,255,255,.08);color:#f4fff9;font-weight:900;padding:13px 10px}.prx-audit-btn.primary{background:rgba(55,215,166,.28);border-color:rgba(55,215,166,.55)} textarea.prx-audit-text{width:100%;min-height:210px;border-radius:16px;border:1px solid rgba(220,255,240,.16);background:rgba(0,0,0,.24);color:#f4fff9;padding:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.4}
    `; document.head.appendChild(st);
  }
  function ensurePanel(){
    ensureStyles();
    let p=$('#prxAuditPanel'); if(p)return p;
    p=document.createElement('section'); p.id='prxAuditPanel'; p.className='hidden'; p.dataset.prxComponent='A-01'; p.dataset.prxName='Audit-Panel'; p.dataset.prxInstance='main'; p.dataset.prxLabel='A-01';
    p.innerHTML=`<div class="prx-audit-head"><button class="prx-audit-icon" id="prxAuditClose" aria-label="Audit schließen">×</button><h2>Komponenten-Audit</h2><button class="prx-audit-icon" id="prxAuditRefresh" aria-label="Aktualisieren">↻</button></div><div class="prx-audit-body" id="prxAuditBody"></div>`;
    document.body.appendChild(p);
    $('#prxAuditClose').onclick=()=>p.classList.add('hidden');
    $('#prxAuditRefresh').onclick=()=>updateAuditPanel();
    return p;
  }
  function updateAuditPanel(){
    const p=ensurePanel(); const body=$('#prxAuditBody',p); if(!body)return;
    const rows=collectComponents(); const counts={}; rows.forEach(r=>{const g=(r.id||'?').split('-')[0]; counts[g]=(counts[g]||0)+1});
    const groups=Object.keys(GROUPS).map(g=>`<div class="prx-audit-row"><span><b>${g}</b> · ${esc(GROUPS[g])}</span><span class="prx-audit-id">${counts[g]||0}</span></div>`).join('');
    const report=buildReport();
    body.innerHTML=`<div class="prx-audit-card"><h3>Audit-Modus</h3><div class="prx-audit-actions"><button class="prx-audit-btn primary" id="prxAuditToggle" data-prx-component="A-02" data-prx-name="Audit-Modus-Schalter">${auditOn()?'IDs ausblenden':'IDs anzeigen'}</button><button class="prx-audit-btn" id="prxAuditCopy" data-prx-component="A-03" data-prx-name="Audit kopieren">Audit kopieren</button></div><p class="prx-audit-muted">IDs sichtbar: Bauteilklasse + Instanz. Beispiel: <b>T-06@journal</b> = Kartenbutton in Journal-Kontext.</p></div><div class="prx-audit-card"><h3>Komponentengruppen</h3>${groups}</div><div class="prx-audit-card"><h3>Kopiervorlage</h3><textarea class="prx-audit-text" id="prxAuditText">${esc(report)}</textarea></div>`;
    $('#prxAuditToggle',body).onclick=()=>setAudit(!auditOn());
    $('#prxAuditCopy',body).onclick=()=>copyText($('#prxAuditText',body).value).then(()=>toast('Audit kopiert'));
  }
  function toast(msg){try{const t=$('#toast'); if(t){t.textContent=msg;t.classList.remove('hidden');setTimeout(()=>t.classList.add('hidden'),1400);return}}catch(e){} console.log('[PRX]',msg)}
  function openAudit(){applyRegistry(); const p=ensurePanel(); updateAuditPanel(); p.classList.remove('hidden');}
  function injectDashboardButton(){
    const existing=$('#prxAuditOpenMini'); if(existing)return;
    const nav=$('[data-nav="dash"]');
    if(nav){nav.addEventListener('contextmenu',e=>{e.preventDefault();openAudit();});}
  }
  function interceptDashboard(){
    document.addEventListener('click',function(e){
      const dash=e.target.closest && e.target.closest('[data-nav="dash"]');
      if(!dash) return;
      if(e.shiftKey || auditOn()) { e.preventDefault(); e.stopImmediatePropagation(); openAudit(); }
    },true);
  }
  function installAdminShortcut(){
    document.addEventListener('click',function(e){
      const el=e.target.closest && e.target.closest('button, .menu-row, .settings-row');
      if(!el) return;
      const txt=(el.innerText||el.textContent||'').toLowerCase();
      if(txt.includes('entscheidungsarchiv') || txt.includes('diagnose kopieren')){
        setTimeout(()=>{if(!$('#prxAuditAdminCard')){
          const host=$('.settings-sheet .settings-stack, .settings-sheet, body');
          const card=document.createElement('div'); card.id='prxAuditAdminCard'; card.className='settings-row'; card.dataset.prxComponent='A-04'; card.dataset.prxName='Audit-Admin-Karte'; card.dataset.prxInstance='settings'; card.dataset.prxLabel='A-04@settings';
          card.innerHTML='<b>Komponenten-Audit</b><small>IDs anzeigen und Audit kopieren</small><span>›</span>'; card.onclick=openAudit; host.appendChild(card);
        }},200);
      }
    },true);
  }
  function boot(){
    ensureStyles(); applyRegistry(); document.body.classList.toggle('prx-audit-mode',auditOn()); interceptDashboard(); injectDashboardButton(); installAdminShortcut();
    window.PRX_AUDIT={open:openAudit, collect:collectComponents, report:buildReport, toggle:()=>setAudit(!auditOn()), assign:applyRegistry};
    let timer; const mo=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>{applyRegistry(); if(!$('#prxAuditPanel')?.classList.contains('hidden'))updateAuditPanel();},220)});
    mo.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot); else boot();
})();
