
(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const TRIP_KEY='prx.trip.v370';
  function getTrip(){try{return Object.assign({start:'2026-06-22',end:'2026-07-05'},JSON.parse(localStorage.getItem(TRIP_KEY)||'{}'))}catch(e){return{start:'2026-06-22',end:'2026-07-05'}}}
  function saveTrip(v){try{localStorage.setItem(TRIP_KEY,JSON.stringify(Object.assign(getTrip(),v)))}catch(e){}}
  function daysBetween(start,end){const a=new Date(start+'T00:00:00'),b=new Date(end+'T00:00:00');if(!Number.isFinite(+a)||!Number.isFinite(+b)||b<a)return[];const out=[];for(let d=new Date(a);d<=b;d.setDate(d.getDate()+1))out.push(new Date(d));return out}
  function toast(s){const t=$('toast');if(!t)return;t.textContent=s;t.classList.remove('hidden');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.add('hidden'),1500)}
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function ensureTrip(){let sh=$('tripSheet');if(!sh){sh=document.createElement('div');sh.id='tripSheet';document.body.appendChild(sh)}sh.className='settings-sheet trip-sheet prx-trip-v372';return sh}
  function showTrip(selectedIndex=null){const sh=ensureTrip();const tr=getTrip();const days=daysBetween(tr.start,tr.end);const idx=selectedIndex==null?null:Math.max(0,Math.min(days.length-1,selectedIndex));const detail=idx==null?'':renderDayDetail(days[idx],idx);sh.innerHTML=`<div class="settings-head"><strong>Reise</strong><button id="tripClose">×</button></div><div class="settings-row"><strong>Reisezeitraum</strong><div class="date-row"><label>Start<input type="date" id="tripStart" value="${esc(tr.start)}"></label><label>Ende<input type="date" id="tripEnd" value="${esc(tr.end)}"></label></div><small>${days.length} Reisetage · Datumswerte bleiben nebeneinander.</small></div><div class="trip-stage"><div class="trip-list">${days.map((d,i)=>renderDayRow(d,i)).join('')||'<div class="empty-state">Bitte gültigen Reisezeitraum wählen.</div>'}</div><div class="trip-detail">${detail}</div></div>`;if(idx!=null)sh.classList.add('detail-open');sh.classList.remove('hidden');document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.nav==='trip'));$('tripClose').onclick=()=>{sh.classList.add('hidden');document.body.classList.remove('state-trip');};$('tripStart').onchange=e=>{saveTrip({start:e.target.value});showTrip(null)};$('tripEnd').onchange=e=>{saveTrip({end:e.target.value});showTrip(null)};sh.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>showTrip(+b.dataset.day));const back=sh.querySelector('[data-trip-back]');if(back)back.onclick=()=>{sh.classList.remove('detail-open');setTimeout(()=>showTrip(null),260)}}
  function renderDayRow(d,i){return `<button class="day-row" data-day="${i}"><b>Tag ${i+1}</b><span>${d.toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'})}</span><strong>›</strong></button>`}
  function renderDayDetail(d,i){return `<button class="trip-back" data-trip-back="1">‹ Tage</button><div class="trip-detail-card"><h3>Tag ${i+1}</h3><p>${d.toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'})}</p><p>PR-/POI-Zuordnung vorbereitet. Tagesplanung bleibt bewusst manuell.</p></div><div class="trip-detail-card"><strong>Listen</strong><p>Heute-Auswahl, Später-Liste und gemerkte PRs/POIs werden hier weitergeführt.</p></div>`}
  function intercept(e){const trip=e.target.closest?.('[data-nav="trip"],#openTripFromOptions');if(trip){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();showTrip(null)}}
  document.addEventListener('click',intercept,true);
  // Detailkarte per Rechtswisch zurück zur Liste holen.
  let sx=0,sy=0,dx=0,dy=0,down=false;
  document.addEventListener('pointerdown',e=>{const card=e.target.closest?.('#detailCard');if(!card||card.classList.contains('hidden'))return;sx=e.clientX;sy=e.clientY;dx=dy=0;down=true;},true);
  document.addEventListener('pointermove',e=>{if(!down)return;dx=e.clientX-sx;dy=e.clientY-sy;},true);
  document.addEventListener('pointerup',e=>{if(!down)return;down=false;if(dx>110&&Math.abs(dx)>Math.abs(dy)*1.35){const btn=$('detailClose'); if(btn) btn.click(); else { $('detailCard')?.classList.add('hidden'); document.body.className=document.body.className.replace(/state-\w+/g,'state-journal'); } }},true);
  // POI-Detail-Rückweg stabilisieren, falls der Button aus dem Dock nicht greift.
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-poi-back]');if(!b)return;e.preventDefault();e.stopPropagation();document.body.classList.remove('poi-focus-open','poi-inline-open');const dock=$('poiDock');if(dock){dock.classList.add('hidden');dock.innerHTML=''}const detail=$('detailCard');if(detail){detail.classList.remove('hidden')}document.body.classList.remove('state-map','state-peek','state-fullmap');document.body.classList.add('state-detail');},true);
  window.PRX_V372_showTrip=showTrip;
})();
