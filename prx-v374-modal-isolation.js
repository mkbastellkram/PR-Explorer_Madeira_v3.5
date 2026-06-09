/* PRX V3.7.4 · Modal Isolation
   Reise / Optionen / Einstellungen / Filter laufen als echte isolierte App-Ebenen.
   Unterliegende Journal-, Detail- und Kartenebenen werden ausgeblendet und gesperrt,
   damit vertikale Gesten nicht versehentlich das Material darunter scrollen. */
(function(){
  'use strict';
  const MODALS = ['optionSheet','settingsSheet','tripSheet','filterSheet'];
  let raf = 0;
  function isOpen(el){ return !!el && !el.classList.contains('hidden'); }
  function openModals(){ return MODALS.map(id=>document.getElementById(id)).filter(isOpen); }
  function sync(){
    raf = 0;
    const open = openModals();
    const active = open.length > 0;
    document.body.classList.toggle('prx-modal-isolated', active);
    MODALS.forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.classList.toggle('prx-active-modal', isOpen(el));
    });
    if(active){
      document.documentElement.classList.add('prx-modal-lock');
      document.body.classList.add('prx-modal-lock');
      // Sicherheitsposition: Untergrund darf nicht mitwandern.
      try{ window.scrollTo(0,0); }catch(e){}
    }else{
      document.documentElement.classList.remove('prx-modal-lock');
      document.body.classList.remove('prx-modal-lock');
    }
  }
  function schedule(){ if(!raf) raf = requestAnimationFrame(sync); }
  const mo = new MutationObserver(schedule);
  mo.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  document.addEventListener('click',()=>setTimeout(sync,0),true);
  document.addEventListener('touchstart',schedule,{passive:true,capture:true});
  document.addEventListener('touchmove',function(e){
    if(!document.body.classList.contains('prx-modal-isolated')) return;
    const t = e.target;
    if(t && t.closest && t.closest('#optionSheet,#settingsSheet,#tripSheet,#filterSheet')) return;
    e.preventDefault();
  },{passive:false,capture:true});
  document.addEventListener('wheel',function(e){
    if(!document.body.classList.contains('prx-modal-isolated')) return;
    const t = e.target;
    if(t && t.closest && t.closest('#optionSheet,#settingsSheet,#tripSheet,#filterSheet')) return;
    e.preventDefault();
  },{passive:false,capture:true});
  document.addEventListener('keydown',function(e){
    if(e.key !== 'Escape') return;
    openModals().forEach(el=>el.classList.add('hidden'));
    schedule();
  });
  document.addEventListener('DOMContentLoaded',sync);
  schedule();
})();
