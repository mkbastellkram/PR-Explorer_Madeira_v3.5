(function(){
  'use strict';
  const VERSION='3.9.5';
  window.PRX_APP_VERSION=VERSION;
  const KEY='prx.driveTime.v395';
  const DEFAULTS={enabled:true,factor:1.20,trafficPct:10,groupBufferMin:10,parkingMin:20,walkMin:10,stopMin:0,preset:'standard'};
  const PRESETS={
    low:{label:'Ruhig',factor:1.15,trafficPct:5,groupBufferMin:5,parkingMin:15,walkMin:5,stopMin:0},
    standard:{label:'Madeira realistisch',factor:1.20,trafficPct:10,groupBufferMin:10,parkingMin:20,walkMin:10,stopMin:0},
    high:{label:'Hauptsaison',factor:1.30,trafficPct:15,groupBufferMin:15,parkingMin:30,walkMin:20,stopMin:0},
    stop:{label:'Mit Zwischenstopp',factor:1.25,trafficPct:12,groupBufferMin:10,parkingMin:25,walkMin:15,stopMin:60}
  };
  function load(){try{return Object.assign({},DEFAULTS,JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){return Object.assign({},DEFAULTS);}}
  function save(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){} window.dispatchEvent(new CustomEvent('prx:drive-time-settings',{detail:v}));}
  function round5(n){return Math.max(0,Math.round(n/5)*5);}
  function fmt(min){min=Math.max(0,Math.round(min)); const h=Math.floor(min/60), m=min%60; if(h>0) return h+' h '+String(m).padStart(2,'0')+' min'; return min+' min';}
  function getTrails(){return (window.PRX_DATA&&Array.isArray(window.PRX_DATA.trails))?window.PRX_DATA.trails:[];}
  function normId(s){s=String(s||'').toUpperCase(); const m=s.match(/P?R\s*[-_]?\s*(\d+(?:\.\d+)?)/); return m?('PR'+m[1]):'';}
  function currentTrail(){
    const title=(document.getElementById('detailTitle')||{}).textContent||'';
    const id=normId(title);
    const trails=getTrails();
    return trails.find(t=>String(t.id).toUpperCase()===id||('PR'+t.number)===id) || trails.find(t=>title.includes(t.name));
  }
  function calc(trail, cfg){
    const base=Number(trail&&trail.driveMin)||0;
    if(!base) return null;
    const madeira=base*Number(cfg.factor||1.2);
    const traffic=madeira*(Number(cfg.trafficPct||0)/100);
    const group=Number(cfg.groupBufferMin||0), parking=Number(cfg.parkingMin||0), walk=Number(cfg.walkMin||0), stop=Number(cfg.stopMin||0);
    const total=round5(madeira+traffic+group+parking+walk+stop);
    return {base:round5(base),madeira:round5(madeira),traffic:round5(traffic),group,parking,walk,stop,total};
  }
  function toast(msg){const t=document.getElementById('toast'); if(!t) return; t.textContent=msg; t.classList.remove('hidden'); clearTimeout(t._prxTimer); t._prxTimer=setTimeout(()=>t.classList.add('hidden'),1800);}
  function presetButton(id, active){return `<button type="button" class="prx395-preset ${active?'active':''}" data-prx395-preset="${id}">${PRESETS[id].label}</button>`;}
  function blockHtml(trail,cfg){
    const c=calc(trail,cfg); if(!c) return '';
    return `<section class="detail-block prx395-drive-block"><h3>Anfahrt realistisch</h3>
      <div class="prx395-drive-summary"><div><span>Google</span><b>${fmt(c.base)}</b></div><div><span>Planwert</span><b>${fmt(c.total)}</b></div></div>
      <div class="prx395-drive-grid">
        <span>Madeira-Faktor</span><b>${Number(cfg.factor).toFixed(2)}× → ${fmt(c.madeira)}</b>
        <span>Verkehr/Saison</span><b>+${cfg.trafficPct}% ≈ ${fmt(c.traffic)}</b>
        <span>Zu viert loskommen</span><b>+${fmt(c.group)}</b>
        <span>Parkplatzsuche</span><b>+${fmt(c.parking)}</b>
        <span>Parkplatz → Start</span><b>+${fmt(c.walk)}</b>
        <span>Zwischenstopps</span><b>+${fmt(c.stop)}</b>
      </div>
      <div class="prx395-presets">${Object.keys(PRESETS).map(k=>presetButton(k,cfg.preset===k)).join('')}</div>
      <p class="prx395-note">Original-Google-Zeit bleibt erhalten. Dieser Wert ist nur ein Planungs-/Reisepuffer für Madeira.</p>
    </section>`;
  }
  function injectDetail(){
    const card=document.getElementById('detailCard'); if(!card||card.classList.contains('hidden')) return;
    const old=card.querySelector('.prx395-drive-block'); if(old) old.remove();
    const trail=currentTrail(); if(!trail) return;
    const cfg=load(); if(!cfg.enabled) return;
    const html=blockHtml(trail,cfg); if(!html) return;
    const anchor=card.querySelector('.detail-block:nth-of-type(2)')||card.querySelector('.detail-block')||card.querySelector('.facts');
    if(anchor) anchor.insertAdjacentHTML('afterend',html); else card.insertAdjacentHTML('beforeend',html);
  }
  function settingsHtml(cfg){
    return `<section class="prx395-panel"><h2>Anfahrtszeit Madeira</h2><p>Planungszeit = Google-Zeit × Madeira-Faktor + Verkehr + Gruppenpuffer + Parkplatz + Weg zum Start + optionale Stopps.</p>
      <div class="prx395-presets">${Object.keys(PRESETS).map(k=>presetButton(k,cfg.preset===k)).join('')}</div>
      ${range('factor','Madeira-Faktor',cfg.factor,1.00,1.50,0.05,'×')}
      ${range('trafficPct','Hauptsaison / Verkehr',cfg.trafficPct,0,25,1,'%')}
      ${range('groupBufferMin','Zu viert loskommen',cfg.groupBufferMin,0,30,5,'min')}
      ${range('parkingMin','Parkplatzsuche',cfg.parkingMin,0,45,5,'min')}
      ${range('walkMin','Parkplatz → Start',cfg.walkMin,0,30,5,'min')}
      ${range('stopMin','Zwischenstopps',cfg.stopMin,0,180,15,'min')}
      <button type="button" class="prx395-save" data-prx395-reset>Standardwerte</button>
    </section>`;
  }
  function range(name,label,value,min,max,step,unit){return `<label class="prx395-range"><span>${label}</span><b data-prx395-value="${name}">${value}${unit}</b><input data-prx395-range="${name}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;}
  function ensureStyle(){if(document.getElementById('prx395-style'))return; const css=`
    .prx395-drive-block{border-color:rgba(80,220,170,.34)!important;background:rgba(10,42,34,.86)!important}
    .prx395-drive-summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0 12px}.prx395-drive-summary div{border:1px solid rgba(220,255,240,.16);background:rgba(255,255,255,.055);border-radius:18px;padding:12px}.prx395-drive-summary span{display:block;color:rgba(235,250,244,.64);font-weight:800;font-size:12px}.prx395-drive-summary b{display:block;font-size:26px;margin-top:4px}.prx395-drive-grid{display:grid;grid-template-columns:1fr auto;gap:8px 12px;border-top:1px solid rgba(220,255,240,.12);padding-top:12px;color:rgba(235,250,244,.72)}.prx395-drive-grid b{color:#f2fff8}.prx395-presets{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.prx395-preset,.prx395-save{border:1px solid rgba(220,255,240,.18);border-radius:999px;background:rgba(255,255,255,.07);color:#eefaf4;padding:10px 12px;font-weight:900}.prx395-preset.active{background:rgba(57,207,155,.30);border-color:rgba(57,207,155,.65)}.prx395-note{color:rgba(235,250,244,.62);font-size:13px;line-height:1.35}.prx395-panel{margin:16px;border:1px solid rgba(220,255,240,.16);border-radius:24px;background:rgba(8,32,26,.88);padding:16px;color:#eefaf4}.prx395-panel h2{margin:0 0 8px;font-size:28px}.prx395-panel p{color:rgba(235,250,244,.66);line-height:1.4}.prx395-range{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;margin:14px 0;color:#eefaf4}.prx395-range span{font-weight:850}.prx395-range input{grid-column:1/-1;width:100%;accent-color:#39cf9b}.prx395-range b{color:#bdebd8}`; const s=document.createElement('style'); s.id='prx395-style'; s.textContent=css; document.head.appendChild(s);}
  function injectSettings(){
    // Find detail pages opened by settings/options/trip patches and append to Reise/Optionen/Einstellungen when possible.
    const cfg=load();
    const candidates=[...document.querySelectorAll('section,div,main')].filter(el=>el.offsetParent!==null && /Anfahrt|Reise|Optionen|Einstellungen|Darstellung|Reiseansicht/.test(el.textContent||''));
    const host=candidates.find(el=>/Reise|Reiseansicht/.test(el.textContent||'')) || candidates[0];
    if(!host || host.querySelector('.prx395-panel')) return;
    // only inject into modal/full panels, not tiny detail card
    if(host.id==='detailCard') return;
    host.insertAdjacentHTML('beforeend',settingsHtml(cfg));
  }
  function applyPreset(id){const p=PRESETS[id]; if(!p)return; const cfg=Object.assign(load(),p,{preset:id,enabled:true}); save(cfg); renderAll(); toast('Anfahrtsprofil: '+p.label);}
  function handleInput(e){const input=e.target.closest('[data-prx395-range]'); if(!input)return; const cfg=load(); const k=input.dataset.prx395Range; cfg[k]=Number(input.value); cfg.preset='custom'; save(cfg); const val=document.querySelector(`[data-prx395-value="${k}"]`); if(val){const unit=k==='factor'?'×':(k==='trafficPct'?'%':'min'); val.textContent=input.value+unit;} injectDetail();}
  function handleClick(e){const b=e.target.closest('[data-prx395-preset]'); if(b){applyPreset(b.dataset.prx395Preset); return;} if(e.target.closest('[data-prx395-reset]')){save(Object.assign({},DEFAULTS)); renderAll(); toast('Anfahrtszeiten zurückgesetzt');}}
  function renderAll(){ensureStyle(); injectDetail(); injectSettings();}
  function init(){ensureStyle(); document.addEventListener('input',handleInput,true); document.addEventListener('click',handleClick,true); ['click','touchend','pointerup'].forEach(ev=>document.addEventListener(ev,()=>setTimeout(renderAll,160),true)); window.addEventListener('prx:drive-time-settings',()=>setTimeout(renderAll,80)); setInterval(renderAll,1400); renderAll();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();
})();
