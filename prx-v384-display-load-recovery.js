(()=>{
  'use strict';
  const VERSION='3.8.4';
  window.PRX_APP_VERSION=VERSION;
  function toast(msg){
    const el=document.getElementById('toast');
    if(!el) return;
    el.textContent=msg; el.classList.remove('hidden');
    clearTimeout(window.__prx384ToastTimer);
    window.__prx384ToastTimer=setTimeout(()=>el.classList.add('hidden'),2600);
  }
  function ensureVisibleShell(){
    try{
      const body=document.body;
      if(!body) return;
      // Green-screen guard: if no modal is active and journal/detail/map shell is accidentally hidden, restore journal shell.
      const activeModal=body.classList.contains('prx376-modal-open') || document.querySelector('.prx-active-modal');
      if(activeModal) return;
      const journal=document.getElementById('journalStage');
      const detail=document.getElementById('detailCard');
      const nav=document.getElementById('bottomNav');
      const map=document.getElementById('map');
      if(journal && detail && map){
        const jr=getComputedStyle(journal);
        const hiddenJournal=(jr.visibility==='hidden'||jr.display==='none'||parseFloat(jr.opacity||'1')===0);
        const detailHidden=detail.classList.contains('hidden') || getComputedStyle(detail).visibility==='hidden';
        if(hiddenJournal && detailHidden && !body.classList.contains('state-map') && !body.classList.contains('state-fullmap')){
          body.classList.remove('state-detail','state-peek','state-fullmap','prx-poi-dock-active','poi-sheet-open');
          body.classList.add('state-journal');
          journal.style.visibility='visible'; journal.style.opacity='1'; journal.style.pointerEvents='auto'; journal.style.transform='translateX(0)';
          if(nav){nav.style.visibility='visible'; nav.style.opacity='1'; nav.style.pointerEvents='auto';}
          toast('Ansicht wiederhergestellt');
        }
      }
      document.querySelectorAll('[data-prx-version], .prx-version-value').forEach(el=>{el.textContent=VERSION;});
      document.title='PR Explorer Madeira V'+VERSION;
    }catch(e){console.warn('PRX 3.8.4 display guard',e);}
  }
  window.addEventListener('DOMContentLoaded',()=>setTimeout(ensureVisibleShell,250));
  window.addEventListener('load',()=>setTimeout(ensureVisibleShell,900));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(ensureVisibleShell,150);});
  window.PRX_DISPLAY_RECOVERY=ensureVisibleShell;
})();
