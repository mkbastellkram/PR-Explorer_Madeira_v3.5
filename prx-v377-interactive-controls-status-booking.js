/* PRX V3.7.7 · Interactive Controls, Status & Booking
   Additive layer: status/booking controls, live-check fallback, line redraw hook, POI/journal shadow cleanup. */
(function(){
  'use strict';
  const STATUS_KEY='prx.status.v3511';
  const BOOKING_KEY='prx.booking.v377';
  const OFFICIAL_HIKING='https://visitmadeira.com/de/ausfluege/naturliebhaber/aktivitaeten/wandern/';
  const OFFICIAL_FAQ='https://www.visitmadeira.com/de/reiseinfos/faq/';
  const SIMPLIFICA='https://simplifica.madeira.gov.pt/';
  const JOURNEY='https://madeirajourney.com/madeira-trail-status-closures-entrance-fees/';
  const $=id=>document.getElementById(id);
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function toast(msg){let t=$('toast'); if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t)} t.textContent=msg; t.classList.remove('hidden'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.add('hidden'),1800)}
  function load(k,def){try{return Object.assign({},def,JSON.parse(localStorage.getItem(k)||'{}'))}catch(e){return Object.assign({},def)}}
  function save(k,obj){try{localStorage.setItem(k,JSON.stringify(obj))}catch(e){}}
  function trailId(){const txt=$('detailTitle')?.textContent||'';const m=txt.match(/PR\s*([0-9]+(?:\.[0-9]+)?)/i);return m?'PR'+m[1]:null}
  function statusLabel(k){return {open:'🟢 Offen',restricted:'🟡 Eingeschränkt',closed:'🔴 Geschlossen',check:'⚪ Prüfen'}[k]||'⚪ Prüfen'}
  function decorateDetail(){
    const card=$('detailCard'); if(!card||card.classList.contains('hidden'))return;
    const id=trailId(); if(!id)return;
    card.querySelectorAll('.prx377-status-booking').forEach(x=>x.remove());
    const store=load(STATUS_KEY,{}); const booking=load(BOOKING_KEY,{}); const cur=store[id]||'check';
    const block=document.createElement('section'); block.className='detail-block prx377-status-booking';
    block.innerHTML=`<h3>Status & Buchung</h3><div class="prx377-status-row"><strong>${esc(statusLabel(cur))}</strong><span>${esc(id)}</span></div><div class="prx377-status-actions"><button data-st="open">🟢 Offen</button><button data-st="restricted">🟡 Eingeschränkt</button><button data-st="closed">🔴 Geschlossen</button><button data-st="check">⚪ Prüfen</button></div><div class="prx377-booking-grid"><button data-live>Live prüfen</button><button data-book>SIMplifica buchen</button><button data-src>Quelle öffnen</button><button data-j>MadeiraJourney</button></div><label class="prx377-booking-note"><input type="checkbox" ${booking[id]?'checked':''}> Buchung/Reservierung für diese PR vorgemerkt</label><small class="prx377-hint">Live-Abruf ist clientseitig und kann durch CORS blockiert werden. In diesem Fall bleibt der Status auf „Prüfen“ und die offizielle Quelle wird geöffnet.</small>`;
    const facts=$('detailFacts'); facts?.insertAdjacentElement('afterend',block);
    block.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{const s=load(STATUS_KEY,{});s[id]=b.dataset.st;save(STATUS_KEY,s);decorateDetail();toast('Status gespeichert: '+statusLabel(b.dataset.st))});
    block.querySelector('[data-book]').onclick=()=>window.open(SIMPLIFICA,'_blank');
    block.querySelector('[data-src]').onclick=()=>window.open(OFFICIAL_HIKING,'_blank');
    block.querySelector('[data-j]').onclick=()=>window.open(JOURNEY,'_blank');
    block.querySelector('input[type=checkbox]').onchange=e=>{const b=load(BOOKING_KEY,{});b[id]=!!e.target.checked;save(BOOKING_KEY,b);toast(e.target.checked?'Buchung vorgemerkt':'Buchungsmerk entfernt')};
    block.querySelector('[data-live]').onclick=()=>liveCheck(id,block);
  }
  async function liveCheck(id,block){
    const btn=block.querySelector('[data-live]'); btn.disabled=true; btn.textContent='Prüfe…';
    try{
      const r=await fetch(OFFICIAL_HIKING,{mode:'cors',cache:'no-store'});
      const txt=(await r.text()).toLowerCase();
      let st='check';
      const key=id.toLowerCase().replace('.','\\.');
      const near=txt.match(new RegExp(key+'[\\s\\S]{0,600}'))?.[0]||'';
      if(/geschlossen|closed|encerrado|suspended|suspenso/.test(near))st='closed';
      else if(/eingeschr|restricted|condicionad|partial|parcial/.test(near))st='restricted';
      else if(/offen|open|aberto/.test(near))st='open';
      const s=load(STATUS_KEY,{});s[id]=st;save(STATUS_KEY,s);toast('Live-Check: '+statusLabel(st));decorateDetail();
    }catch(e){
      toast('Live-Abruf blockiert · Quelle öffnen');
      window.open(OFFICIAL_HIKING,'_blank');
      btn.disabled=false;btn.textContent='Live prüfen';
    }
  }
  function cleanupBackgroundShadow(){
    const poi=$('poiSheet'); const active=poi && !poi.classList.contains('hidden');
    document.body.classList.toggle('prx-poi-dock-active',!!active);
  }
  function installObservers(){
    const target=document.body;
    const mo=new MutationObserver(()=>{cleanupBackgroundShadow(); if($('detailCard')&&!$('detailCard').classList.contains('hidden'))decorateDetail();});
    mo.observe(target,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    setInterval(cleanupBackgroundShadow,900);
  }
  document.addEventListener('prx-line-style-changed',()=>{setTimeout(()=>{$('fitBtn')?.click()},80)});
  document.addEventListener('DOMContentLoaded',()=>{installObservers();setTimeout(decorateDetail,800)});
  if(document.readyState!=='loading'){installObservers();setTimeout(decorateDetail,800)}
})();
