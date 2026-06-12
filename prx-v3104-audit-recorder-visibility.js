/* PR Explorer Madeira · V3.10.4 Audit Recorder & Visibility Engine
   Non-destructive audit layer: replaces audit report API with current version, adds event recording, improves visibility detection. */
(function(){
  'use strict';
  if(window.__PRX3104_AUDIT_RECORDER__) return;
  window.__PRX3104_AUDIT_RECORDER__ = true;
  const VERSION = '3.10.4';
  const BUILD = 'AUDIT RECORDER & VISIBILITY ENGINE';
  const AUDIT_KEY = 'prx.auditMode.v3101';
  const REC_KEY = 'prx.auditRecorder.v3104.last';
  window.PRX_APP_VERSION = VERSION;
  window.PRX_BUILD_NAME = BUILD;
  window.PRX_MODULE_STATUS = Object.assign({}, window.PRX_MODULE_STATUS||{}, {v3104:{loaded:true,version:VERSION,features:['audit recorder','visibility engine','current report','A-00 console']}});

  const GROUPS = {
    N:'Navigation', T:'Top-Controls', J:'Journal', D:'PR-Detail', M:'Karte', F:'Filter', O:'Optionen', E:'Einstellungen', R:'Reise', P:'POI', S:'Status/Buchung', A:'Audit/Admin'
  };
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>{try{return Array.from(r.querySelectorAll(s))}catch(e){return[]}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const now=()=>new Date().toISOString();

  function toast(msg){const t=$('#toast'); if(t){t.textContent=msg;t.classList.remove('hidden');clearTimeout(t._prx3104);t._prx3104=setTimeout(()=>t.classList.add('hidden'),1600)}else console.log('[PRX]',msg)}
  function copyText(txt){if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(txt); const ta=document.createElement('textarea'); ta.value=txt; ta.style.position='fixed'; ta.style.left='-9999px'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); return Promise.resolve();}
  function auditOn(){try{return localStorage.getItem(AUDIT_KEY)==='1'||document.body.classList.contains('prx-audit-mode')}catch(e){return document.body.classList.contains('prx-audit-mode')}}
  function setAudit(on){try{localStorage.setItem(AUDIT_KEY,on?'1':'0')}catch(e){} document.body.classList.toggle('prx-audit-mode',!!on); updateFloating();}

  function componentOf(el){
    const c=el && el.closest && el.closest('[data-prx-component]');
    if(!c) return {label:'unbekannt', id:'', name:'', text:''};
    return {label:c.dataset.prxLabel||c.dataset.prxComponent||'', id:c.dataset.prxComponent||'', name:c.dataset.prxName||'', text:(c.innerText||c.textContent||'').trim().replace(/\s+/g,' ').slice(0,120)};
  }
  function hasHiddenAncestor(el){
    let n=el;
    while(n && n!==document.documentElement){
      if(n.classList && (n.classList.contains('hidden') || n.getAttribute('aria-hidden')==='true')) return true;
      const cs=getComputedStyle(n);
      if(cs.display==='none' || cs.visibility==='hidden' || Number(cs.opacity)===0) return true;
      n=n.parentElement;
    }
    return false;
  }
  function isViewportVisible(el){
    if(!el || !el.getBoundingClientRect) return false;
    if(hasHiddenAncestor(el)) return false;
    const r=el.getBoundingClientRect();
    if(r.width<2 || r.height<2) return false;
    const vw=window.innerWidth||document.documentElement.clientWidth;
    const vh=window.innerHeight||document.documentElement.clientHeight;
    if(r.right<=0 || r.bottom<=0 || r.left>=vw || r.top>=vh) return false;
    return true;
  }
  function applyLabels(){
    // Ensure late generated records have stable enough data. Do not mutate layout.
    $$('[data-nav="journal"]').forEach(e=>assign(e,'N-01.1','Tab Journal','bottomNav'));
    $$('[data-nav="map"]').forEach(e=>assign(e,'N-01.2','Tab Karte','bottomNav'));
    $$('[data-nav="trip"]').forEach(e=>assign(e,'N-01.3','Tab Reise','bottomNav'));
    $$('[data-nav="dash"]').forEach(e=>assign(e,'N-01.4','Tab Dashboard','bottomNav'));
    const dash=$('#prx3102Dashboard'); if(dash) assign(dash,'D-00','Dashboard','modal');
    const audit=$('#prx3104AuditConsole'); if(audit) assign(audit,'A-01','Audit-Konsole','console');
    const settings=$('.settings-sheet'); if(settings) assign(settings,'E-01','Einstellungen-Hauptbereich','settingsSheet');
    $$('.jcard').forEach((e,i)=>{const txt=(e.innerText||''); const m=txt.match(/\bPR\s?\d+(?:\.\d+)?\b/i); assign(e,'J-05','PR-Listenelement',m?m[0].replace(/\s+/g,''):(i+1));});
  }
  function assign(el,id,name,inst){ if(!el) return; el.dataset.prxComponent=el.dataset.prxComponent||id; el.dataset.prxName=el.dataset.prxName||name; el.dataset.prxInstance=el.dataset.prxInstance||inst; el.dataset.prxLabel=el.dataset.prxLabel||`${id}${inst?'@'+inst:''}`; }
  function collect(){
    applyLabels();
    const rows=$$('[data-prx-component]').map(el=>({
      id:el.dataset.prxComponent||'',
      instance:el.dataset.prxInstance||'',
      label:el.dataset.prxLabel||el.dataset.prxComponent||'',
      name:el.dataset.prxName||'',
      visible:isViewportVisible(el),
      tag:el.tagName.toLowerCase(),
      rect:(()=>{const r=el.getBoundingClientRect(); return {x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)}})(),
      text:(el.innerText||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,120)
    }));
    const seen=new Set();
    return rows.filter(r=>{const k=[r.label,r.name,r.visible,r.rect.x,r.rect.y,r.rect.w,r.rect.h].join('|'); if(seen.has(k))return false; seen.add(k); return true;});
  }

  let rec={active:false,start:null,stop:null,duration:0,events:[],timer:null};
  function recordEvent(type,ev){
    if(!rec.active) return;
    const c=componentOf(ev.target);
    rec.events.push({t:Date.now()-rec.startMs,type,component:c.label,name:c.name,body:[...document.body.classList].join(' '),target:(ev.target?.tagName||'').toLowerCase(),text:c.text});
    if(rec.events.length>600) rec.events.shift();
    updateRecorderState();
  }
  ['click','input','change','touchstart','touchend'].forEach(type=>document.addEventListener(type,e=>recordEvent(type,e),true));
  function startRecording(sec=120){
    stopRecording(false);
    rec={active:true,start:now(),startMs:Date.now(),stop:null,duration:sec,events:[],timer:null};
    rec.timer=setTimeout(()=>stopRecording(true),sec*1000);
    document.body.classList.add('prx3104-recording');
    updateFloating(); updateRecorderState(); toast(`Audit-Aufnahme ${sec}s gestartet`);
  }
  function stopRecording(auto=false){
    if(rec.timer) clearTimeout(rec.timer);
    if(rec.active){ rec.active=false; rec.stop=now(); try{localStorage.setItem(REC_KEY,JSON.stringify({start:rec.start,stop:rec.stop,duration:rec.duration,events:rec.events}))}catch(e){} if(auto) toast('Audit-Aufnahme beendet'); }
    document.body.classList.remove('prx3104-recording');
    updateFloating(); updateRecorderState();
  }
  function lastRecording(){try{return JSON.parse(localStorage.getItem(REC_KEY)||'null')}catch(e){return null}}

  function buildReport(){
    const rows=collect();
    const state=[...document.body.classList].join(' ');
    let out=`# PRX Komponenten-Audit\n\nVersion: ${VERSION}\nZeit: ${now()}\nAnsicht/Body-Klassen: ${state}\nURL: ${location.href}\n\n`;
    out+=`## Änderungshinweise\n\n- Änderung mit Komponenten-ID benennen, z. B. \`T-06@journal\`, \`J-05@PR1.2\` oder \`PD-00\`.\n- Basis-ID ohne Instanz = wiederverwendete Komponente allgemein.\n- Suffix nach \`@\` = konkretes Vorkommen.\n- Sichtbarkeit wird in V3.10.4 nach Viewport/Hidden-Ancestors bewertet.\n\n`;
    Object.keys(GROUPS).forEach(g=>{
      const part=rows.filter(r=>r.id && r.id.startsWith(g+'-'));
      if(!part.length) return;
      out+=`## ${g} · ${GROUPS[g]}\n\n`;
      part.forEach(r=>{out+=`- ${r.label} · ${r.name} · ${r.visible?'sichtbar':'nicht sichtbar'} · ${r.rect.w}×${r.rect.h}@${r.rect.x},${r.rect.y}${r.text?` · „${r.text}”`:''}\n`;});
      out+='\n';
    });
    const lr=rec.active?rec:lastRecording();
    if(lr){
      out+=`## R · Audit-Recorder\n\n`;
      out+=`- Aufnahme: ${rec.active?'läuft':'beendet'}\n- Start: ${lr.start||''}\n- Ende: ${lr.stop||''}\n- Ereignisse: ${(lr.events||[]).length}\n\n`;
      (lr.events||[]).slice(-120).forEach(e=>{out+=`- +${e.t}ms · ${e.type} · ${e.component||'unbekannt'} · ${e.name||''}${e.text?` · „${String(e.text).slice(0,80)}”`:''}\n`;});
      out+='\n';
    }
    out+=`## Freie Audit-Notizen\n\n- \n`;
    return out;
  }

  function injectCss(){
    if($('#prx3104-css')) return;
    const st=document.createElement('style'); st.id='prx3104-css'; st.textContent=`
      #prx3104AuditConsole{position:fixed;inset:calc(env(safe-area-inset-top) + 10px) 10px calc(env(safe-area-inset-bottom) + 10px);z-index:2147483300;background:rgba(3,24,18,.97);color:#f4fff9;border:1px solid rgba(220,255,240,.20);border-radius:28px;box-shadow:0 24px 70px rgba(0,0,0,.55);display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",Segoe UI,sans-serif;backdrop-filter:blur(18px)}
      #prx3104AuditConsole.hidden{display:none!important}.prx3104-head{display:grid;grid-template-columns:52px 1fr 52px;gap:10px;align-items:center;padding:14px;border-bottom:1px solid rgba(220,255,240,.13)}.prx3104-head h2{margin:0;text-align:center;font-size:22px}.prx3104-round{width:48px;height:48px;border-radius:50%;border:1px solid rgba(220,255,240,.18);background:rgba(255,255,255,.07);color:#f4fff9;font-weight:950;font-size:22px}.prx3104-body{overflow:auto;-webkit-overflow-scrolling:touch;padding:14px 14px 120px}.prx3104-card{border:1px solid rgba(220,255,240,.14);border-radius:20px;background:rgba(255,255,255,.055);padding:14px;margin:0 0 12px}.prx3104-card h3{margin:0 0 10px;font-size:17px}.prx3104-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.prx3104-actions.three{grid-template-columns:repeat(3,minmax(0,1fr));}.prx3104-btn{border:1px solid rgba(220,255,240,.18);background:rgba(255,255,255,.075);color:#f4fff9;border-radius:16px;padding:12px 8px;font-weight:950}.prx3104-btn.primary{background:linear-gradient(180deg,#35d7a6,#25b986);color:#031710;border:0}.prx3104-btn.warn{background:rgba(255,210,64,.92);color:#031710;border:0}.prx3104-muted{color:#a9c7ba;font-size:13px;line-height:1.45}.prx3104-text{width:100%;min-height:230px;border-radius:16px;border:1px solid rgba(220,255,240,.16);background:rgba(0,0,0,.25);color:#f4fff9;padding:12px;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}.prx3104-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.prx3104-stat{background:rgba(0,0,0,.16);border:1px solid rgba(220,255,240,.10);border-radius:14px;padding:10px}.prx3104-stat small{display:block;color:#a9c7ba;font-weight:850}.prx3104-stat b{font-size:22px}#prx3104Floating{position:fixed;right:14px;bottom:calc(env(safe-area-inset-bottom) + 150px);z-index:2147483200;display:none;gap:7px;align-items:center;border-radius:999px;background:rgba(2,18,15,.88);border:1px solid rgba(255,210,64,.55);padding:6px;box-shadow:0 12px 34px rgba(0,0,0,.42);backdrop-filter:blur(16px)}body.prx-audit-mode #prx3104Floating,#prx3104Floating.rec{display:flex}#prx3104Floating button{border:0;border-radius:999px;padding:10px 12px;font-weight:950;background:rgba(255,210,64,.95);color:#04130f}.prx3104-rec-dot{width:10px;height:10px;border-radius:50%;background:#f43;display:none;box-shadow:0 0 0 4px rgba(255,68,51,.15)}body.prx3104-recording .prx3104-rec-dot{display:block;animation:prx3104pulse 1s infinite}@keyframes prx3104pulse{50%{opacity:.35}}
    `; document.head.appendChild(st);
  }
  function ensureConsole(){
    injectCss();
    let p=$('#prx3104AuditConsole'); if(p) return p;
    p=document.createElement('section'); p.id='prx3104AuditConsole'; p.className='hidden'; p.dataset.prxComponent='A-01'; p.dataset.prxName='Audit-Konsole'; p.dataset.prxInstance='main'; p.dataset.prxLabel='A-01@main';
    p.innerHTML=`<header class="prx3104-head"><button class="prx3104-round" id="prx3104Close">×</button><h2>A-00 Audit</h2><button class="prx3104-round" id="prx3104Refresh">↻</button></header><main class="prx3104-body"><section class="prx3104-card"><h3>Audit-Steuerung</h3><div class="prx3104-actions"><button class="prx3104-btn primary" id="prx3104ToggleLabels">Labels an/aus</button><button class="prx3104-btn" id="prx3104Copy">Bericht kopieren</button></div><p class="prx3104-muted">Komponenten-IDs sind sichtbar als gelbe Labels. Report enthält aktuelle Version 3.10.4 und bessere Sichtbarkeitsprüfung.</p></section><section class="prx3104-card"><h3>Recorder</h3><div class="prx3104-actions three"><button class="prx3104-btn warn" id="prx3104Rec60">60 s</button><button class="prx3104-btn warn" id="prx3104Rec120">120 s</button><button class="prx3104-btn" id="prx3104Stop">Stop</button></div><p class="prx3104-muted" id="prx3104RecState">Keine Aufnahme aktiv.</p></section><section class="prx3104-card"><h3>Komponentenstatus</h3><div class="prx3104-grid" id="prx3104Stats"></div></section><section class="prx3104-card"><h3>Kopiervorlage</h3><textarea class="prx3104-text" id="prx3104Text"></textarea></section></main>`;
    document.body.appendChild(p);
    $('#prx3104Close').onclick=()=>p.classList.add('hidden');
    $('#prx3104Refresh').onclick=()=>renderConsole();
    $('#prx3104ToggleLabels').onclick=()=>{setAudit(!auditOn()); renderConsole();};
    $('#prx3104Copy').onclick=()=>copyText($('#prx3104Text').value).then(()=>toast('Audit kopiert'));
    $('#prx3104Rec60').onclick=()=>startRecording(60);
    $('#prx3104Rec120').onclick=()=>startRecording(120);
    $('#prx3104Stop').onclick=()=>stopRecording(false);
    return p;
  }
  function renderConsole(){
    const p=ensureConsole(); applyLabels();
    const rows=collect(); const vis=rows.filter(r=>r.visible).length;
    const stats={}; rows.forEach(r=>{const g=(r.id||'?').split('-')[0]; stats[g]=stats[g]||{t:0,v:0}; stats[g].t++; if(r.visible)stats[g].v++;});
    $('#prx3104Stats').innerHTML=Object.keys(GROUPS).map(g=>`<div class="prx3104-stat"><small>${g} ${esc(GROUPS[g])}</small><b>${stats[g]?.v||0}/${stats[g]?.t||0}</b></div>`).join('');
    $('#prx3104Text').value=buildReport();
    updateRecorderState();
    return p;
  }
  function updateRecorderState(){
    const s=$('#prx3104RecState');
    if(s){
      if(rec.active){const left=Math.max(0, Math.ceil((rec.duration*1000-(Date.now()-rec.startMs))/1000)); s.textContent=`Aufnahme läuft · ${left}s Rest · ${rec.events.length} Ereignisse`;}
      else {const lr=lastRecording(); s.textContent=lr?`Letzte Aufnahme · ${lr.events?.length||0} Ereignisse · ${lr.start||''}`:'Keine Aufnahme aktiv.';}
    }
    const t=$('#prx3104Text'); if(t && !$('#prx3104AuditConsole')?.classList.contains('hidden')) t.value=buildReport();
  }
  function openConsole(){renderConsole(); ensureConsole().classList.remove('hidden');}
  function ensureFloating(){
    injectCss(); let f=$('#prx3104Floating'); if(f) return f;
    f=document.createElement('div'); f.id='prx3104Floating'; f.innerHTML='<span class="prx3104-rec-dot"></span><button id="prx3104FloatOpen">A-00</button><button id="prx3104FloatOff">Aus</button>';
    document.body.appendChild(f);
    $('#prx3104FloatOpen').onclick=openConsole;
    $('#prx3104FloatOff').onclick=()=>{setAudit(false); stopRecording(false); toast('Audit aus');};
    return f;
  }
  function updateFloating(){const f=ensureFloating(); f.classList.toggle('rec',rec.active);}
  function syncVersion(){
    document.title='PR Explorer Madeira V3.10.4';
    document.documentElement.setAttribute('data-prx-version',VERSION);
    $$('small,span,b,strong,div,p,h1,h2,h3').forEach(el=>{
      if(el.closest('#prx3104AuditConsole')) return;
      if(el.children.length>3) return;
      const t=(el.textContent||'');
      if(/PRX\s+3\.(7\.7|8\.\d+|9\.\d+|10\.[0-3])/.test(t)) el.textContent=t.replace(/PRX\s+3\.(7\.7|8\.\d+|9\.\d+|10\.[0-3])/g,'PRX '+VERSION);
      else if(/^3\.(7\.7|8\.\d+|9\.\d+|10\.[0-3])$/.test(t.trim())) el.textContent=VERSION;
    });
  }
  function patchAuditApi(){
    const old=window.PRX_AUDIT||{};
    window.PRX_AUDIT=Object.assign({}, old, {open:openConsole, collect:collect, report:buildReport, toggle:()=>setAudit(!auditOn()), startRecording, stopRecording});
  }
  function boot(){
    injectCss(); applyLabels(); ensureFloating(); patchAuditApi(); syncVersion(); document.body.classList.add('prx-v3104-ready'); document.body.classList.toggle('prx-audit-mode', auditOn()); updateFloating();
    // Dashboard/Admin cards from older modules call PRX_AUDIT.open; after patch they open this console.
    setInterval(()=>{applyLabels(); syncVersion(); updateFloating(); updateRecorderState();},1200);
    let moT; new MutationObserver(()=>{clearTimeout(moT); moT=setTimeout(()=>{applyLabels(); patchAuditApi();},250)}).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
