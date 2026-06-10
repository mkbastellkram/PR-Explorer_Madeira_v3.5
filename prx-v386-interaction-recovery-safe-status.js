/* PRX V3.8.6 · Interaction Recovery + Safe Status/Booking
   Purpose: remove V3.7.7 MutationObserver freeze risk; keep status/booking controls passive. */
(function(){
  'use strict';
  const VERSION='3.8.6';
  window.PRX_APP_VERSION=VERSION;
  const STATUS_KEY='prx.status.v3511';
  const BOOKING_KEY='prx.booking.v377';
  const OFFICIAL_HIKING='https://visitmadeira.com/de/ausfluege/naturliebhaber/aktivitaeten/wandern/';
  const SIMPLIFICA='https://simplifica.madeira.gov.pt/';
  const JOURNEY='https://madeirajourney.com/madeira-trail-status-closures-entrance-fees/';
  const $=(id)=>document.getElementById(id);
  const esc=(s)=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  let lastTrailId=null;
  let renderTimer=null;
  let busy=false;
  function toast(msg){
    const t=$('toast');
    if(!t){ console.log('[PRX]',msg); return; }
    t.textContent=msg;
    t.classList.remove('hidden');
    clearTimeout(t.__prx386);
    t.__prx386=setTimeout(()=>t.classList.add('hidden'),1900);
  }
  function load(k){ try{return JSON.parse(localStorage.getItem(k)||'{}')||{};}catch(e){return{};} }
  function save(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch(e){} }
  function trailId(){
    const txt=$('detailTitle')?.textContent||'';
    const m=txt.match(/\bPR\s*([0-9]+(?:\.[0-9]+)?)/i);
    return m?'PR'+m[1]:null;
  }
  function label(s){ return {open:'🟢 Offen',restricted:'🟡 Eingeschränkt',closed:'🔴 Geschlossen',check:'⚪ Prüfen'}[s]||'⚪ Prüfen'; }
  function removeOld(){ document.querySelectorAll('.prx377-status-booking,.prx386-status-booking').forEach(n=>n.remove()); }
  function renderStatus(){
    if(busy) return;
    const card=$('detailCard');
    if(!card || card.classList.contains('hidden')) return;
    const id=trailId();
    if(!id) return;
    if(lastTrailId===id && card.querySelector('.prx386-status-booking')) return;
    busy=true;
    try{
      removeOld();
      lastTrailId=id;
      const st=load(STATUS_KEY);
      const booking=load(BOOKING_KEY);
      const cur=st[id]||'check';
      const block=document.createElement('section');
      block.className='detail-block prx386-status-booking';
      block.innerHTML=`<h3>Status & Buchung</h3>
        <div class="prx386-status-head"><strong>${esc(label(cur))}</strong><small>${esc(id)} · manuell/Quelle prüfen</small></div>
        <div class="prx386-status-actions">
          <button type="button" data-prx-st="open">🟢 Offen</button>
          <button type="button" data-prx-st="restricted">🟡 Eingeschränkt</button>
          <button type="button" data-prx-st="closed">🔴 Geschlossen</button>
          <button type="button" data-prx-st="check">⚪ Prüfen</button>
        </div>
        <div class="prx386-book-actions">
          <button type="button" data-prx-link="official">Quelle öffnen</button>
          <button type="button" data-prx-link="book">SIMplifica</button>
          <button type="button" data-prx-link="journey">MadeiraJourney</button>
        </div>
        <label class="prx386-check"><input type="checkbox" ${booking[id]?'checked':''}> Buchung/Reservierung vorgemerkt</label>
        <small class="prx386-hint">Keine automatische Live-Abfrage beim Öffnen. Status manuell setzen oder Quelle öffnen.</small>`;
      const anchor=$('detailFacts') || $('detailText')?.closest('.detail-block') || card.querySelector('.detail-head');
      if(anchor) anchor.insertAdjacentElement('afterend',block); else card.appendChild(block);
      block.addEventListener('click',function(e){
        const b=e.target.closest('button'); if(!b) return;
        if(b.dataset.prxSt){ const next=load(STATUS_KEY); next[id]=b.dataset.prxSt; save(STATUS_KEY,next); lastTrailId=null; renderStatus(); toast('Status gespeichert'); }
        if(b.dataset.prxLink==='official') window.open(OFFICIAL_HIKING,'_blank');
        if(b.dataset.prxLink==='book') window.open(SIMPLIFICA,'_blank');
        if(b.dataset.prxLink==='journey') window.open(JOURNEY,'_blank');
      });
      const chk=block.querySelector('input[type="checkbox"]');
      chk && chk.addEventListener('change',function(){ const data=load(BOOKING_KEY); data[id]=!!this.checked; save(BOOKING_KEY,data); toast(this.checked?'Buchung vorgemerkt':'Buchung entfernt'); });
    }catch(err){ console.warn('[PRX 3.8.6] Status block skipped',err); }
    finally{ busy=false; }
  }
  function scheduleRender(){
    clearTimeout(renderTimer);
    renderTimer=setTimeout(renderStatus,140);
  }
  function installSafeTriggers(){
    // No MutationObserver on body. Only bounded user/action triggers.
    ['click','pointerup','touchend'].forEach(type=>{
      document.addEventListener(type,function(e){
        if(e.target && e.target.closest && e.target.closest('#journalList,.journal-list,#detailCard')) scheduleRender();
      },{passive:true,capture:false});
    });
    window.addEventListener('hashchange',scheduleRender,{passive:true});
    setTimeout(scheduleRender,900);
    setTimeout(scheduleRender,1800);
  }
  function injectStyle(){
    if(document.getElementById('prx386Style')) return;
    const st=document.createElement('style'); st.id='prx386Style';
    st.textContent=`.prx386-status-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px}.prx386-status-head small,.prx386-hint{color:rgba(237,248,243,.68)}.prx386-status-actions,.prx386-book-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:8px 0}.prx386-status-actions button,.prx386-book-actions button{border:1px solid rgba(186,230,210,.18);border-radius:14px;background:rgba(255,255,255,.07);color:#edf8f3;padding:10px;font-weight:750}.prx386-check{display:flex;gap:8px;align-items:center;margin:10px 0;color:#edf8f3}.prx386-check input{width:18px;height:18px;accent-color:#35d7a6}`;
    document.head.appendChild(st);
  }
  function init(){ injectStyle(); installSafeTriggers(); window.PRX_MODULE_STATUS=window.PRX_MODULE_STATUS||{}; window.PRX_MODULE_STATUS.v386={loaded:true, purpose:'interaction recovery + safe status block'}; }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
