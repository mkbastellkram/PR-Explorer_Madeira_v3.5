/* PRX V3.7.8 · Detail Open Recovery
   Recovery layer after V3.7.7 freeze: no automatic live fetch, no mutation feedback loop,
   defensive detail decoration, safe favorite/status/booking block. */
(function(){
  'use strict';
  if(window.__PRX378_RECOVERY__) return;
  window.__PRX378_RECOVERY__ = true;

  const STATUS_KEY='prx.status.v3511';
  const BOOKING_KEY='prx.booking.v377';
  const OFFICIAL_HIKING='https://visitmadeira.com/de/ausfluege/naturliebhaber/aktivitaeten/wandern/';
  const SIMPLIFICA='https://simplifica.madeira.gov.pt/';
  const JOURNEY='https://madeirajourney.com/madeira-trail-status-closures-entrance-fees/';
  const $=id=>document.getElementById(id);
  const raf = window.requestAnimationFrame || (fn=>setTimeout(fn,16));
  let decorateTimer = null;
  let lastDecoratedKey = '';
  let busy = false;

  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function toast(msg){let t=$('toast'); if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t)} t.textContent=msg; t.classList.remove('hidden'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.add('hidden'),1800)}
  function load(k,def){try{const raw=localStorage.getItem(k);return raw?Object.assign({},def,JSON.parse(raw)):Object.assign({},def)}catch(e){return Object.assign({},def)}}
  function save(k,obj){try{localStorage.setItem(k,JSON.stringify(obj))}catch(e){}}
  function trailId(){
    const txt=$('detailTitle')?.textContent||'';
    const m=txt.match(/PR\s*([0-9]+(?:\.[0-9]+)?)/i);
    return m?'PR'+m[1]:null;
  }
  function statusLabel(k){return {open:'🟢 Offen',restricted:'🟡 Eingeschränkt',closed:'🔴 Geschlossen',check:'⚪ Prüfen'}[k]||'⚪ Prüfen'}
  function detailVisible(){const c=$('detailCard'); return !!(c && !c.classList.contains('hidden') && c.offsetParent !== null)}

  function scheduleDecorate(force=false){
    if(decorateTimer) clearTimeout(decorateTimer);
    decorateTimer=setTimeout(()=>raf(()=>decorateDetail(force)),90);
  }

  function decorateDetail(force=false){
    if(busy) return;
    const card=$('detailCard');
    if(!card || card.classList.contains('hidden')) return;
    const id=trailId();
    if(!id) return;
    const title=$('detailTitle')?.textContent || '';
    const key=id+'|'+title;
    if(!force && key===lastDecoratedKey && card.querySelector('.prx378-status-booking')) return;
    busy=true;
    try{
      card.querySelectorAll('.prx377-status-booking,.prx378-status-booking,.prx-detail-error').forEach(x=>x.remove());
      const store=load(STATUS_KEY,{});
      const booking=load(BOOKING_KEY,{});
      const cur=store[id]||'check';
      const block=document.createElement('section');
      block.className='detail-block prx378-status-booking';
      block.innerHTML=`<h3>Status & Buchung</h3>
        <div class="prx377-status-row"><strong>${esc(statusLabel(cur))}</strong><span>${esc(id)}</span></div>
        <div class="prx377-status-actions">
          <button type="button" data-st="open">🟢 Offen</button>
          <button type="button" data-st="restricted">🟡 Eingeschränkt</button>
          <button type="button" data-st="closed">🔴 Geschlossen</button>
          <button type="button" data-st="check">⚪ Prüfen</button>
        </div>
        <div class="prx377-booking-grid">
          <button type="button" data-live>Quelle prüfen</button>
          <button type="button" data-book>SIMplifica</button>
          <button type="button" data-src>Visit Madeira</button>
          <button type="button" data-j>MadeiraJourney</button>
        </div>
        <label class="prx377-booking-note"><input type="checkbox" ${booking[id]?'checked':''}> Buchung/Reservierung für diese PR vorgemerkt</label>
        <small class="prx377-hint">Recovery: keine automatische Live-Abfrage beim Öffnen. Quellen werden nur per Button geöffnet; Status kann manuell gesetzt werden.</small>`;
      const anchor=$('detailFacts') || card.querySelector('.detail-head');
      if(anchor) anchor.insertAdjacentElement('afterend',block); else card.appendChild(block);
      block.querySelectorAll('[data-st]').forEach(b=>b.addEventListener('click',()=>{
        const s=load(STATUS_KEY,{}); s[id]=b.dataset.st; save(STATUS_KEY,s); lastDecoratedKey=''; scheduleDecorate(true); toast('Status gespeichert: '+statusLabel(b.dataset.st));
      },{passive:true}));
      block.querySelector('[data-book]')?.addEventListener('click',()=>window.open(SIMPLIFICA,'_blank'),{passive:true});
      block.querySelector('[data-src]')?.addEventListener('click',()=>window.open(OFFICIAL_HIKING,'_blank'),{passive:true});
      block.querySelector('[data-j]')?.addEventListener('click',()=>window.open(JOURNEY,'_blank'),{passive:true});
      block.querySelector('[data-live]')?.addEventListener('click',()=>{toast('Offizielle Quelle wird geöffnet'); window.open(OFFICIAL_HIKING,'_blank')},{passive:true});
      block.querySelector('input[type=checkbox]')?.addEventListener('change',e=>{const b=load(BOOKING_KEY,{}); b[id]=!!e.target.checked; save(BOOKING_KEY,b); toast(e.target.checked?'Buchung vorgemerkt':'Buchungsmerk entfernt')});
      lastDecoratedKey=key;
    }catch(e){
      console.error('[PRX 3.7.8] Detail decoration failed',e);
      try{
        const err=document.createElement('section'); err.className='detail-block prx-detail-error';
        err.innerHTML='<h3>Detail-Hinweis</h3><p>Zusatzblock konnte nicht geladen werden. Kernansicht bleibt bedienbar.</p>';
        card.appendChild(err);
      }catch(_e){}
    }finally{busy=false;}
  }

  function cleanupBackgroundShadow(){
    try{
      const poi=$('poiSheet');
      const active=poi && !poi.classList.contains('hidden');
      document.body.classList.toggle('prx-poi-dock-active',!!active);
    }catch(e){}
  }

  function installSafeWatchers(){
    document.addEventListener('click',ev=>{
      const target=ev.target && ev.target.closest ? ev.target.closest('.journal-card,[data-pr],#journalList *') : null;
      if(target) scheduleDecorate(true);
    },true);
    ['transitionend','pointerup','touchend'].forEach(type=>document.addEventListener(type,()=>scheduleDecorate(false),{passive:true}));
    const card=$('detailCard');
    if(card && window.MutationObserver){
      const mo=new MutationObserver(()=>scheduleDecorate(false));
      mo.observe(card,{attributes:true,attributeFilter:['class'],childList:false,subtree:false});
    }
    setInterval(cleanupBackgroundShadow,1500);
  }

  function hardenUi(){
    document.addEventListener('prx-line-style-changed',()=>{
      // Defensive: fit only when detail/map is stable; never block UI.
      setTimeout(()=>{try{$('fitBtn')?.click()}catch(e){}},180);
    },{passive:true});
    window.addEventListener('error',e=>{console.warn('[PRX 3.7.8] captured error',e?.message||e)});
    window.addEventListener('unhandledrejection',e=>{console.warn('[PRX 3.7.8] captured rejection',e?.reason||e)});
  }

  function init(){installSafeWatchers(); hardenUi(); setTimeout(()=>scheduleDecorate(true),500);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
