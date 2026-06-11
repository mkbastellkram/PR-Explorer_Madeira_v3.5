/* PRX V3.8.9 · Status Deduplicate Cleanup
   Purpose: ensure exactly one Status & Buchung block is visible in PR detail.
   Keeps the safe V3.8.6 block and removes older V3.7.7/V3.7.8 blocks if they are present. */
(function(){
  'use strict';
  const VERSION='3.8.9';
  window.PRX_APP_VERSION=VERSION;
  window.PRX_MODULE_STATUS=window.PRX_MODULE_STATUS||{};
  window.PRX_MODULE_STATUS.v389={loaded:true,purpose:'status booking dedupe cleanup'};
  function dedupe(){
    try{
      const detail=document.getElementById('detailCard');
      if(!detail || detail.classList.contains('hidden')) return;
      // Remove retired status blocks from older modules.
      detail.querySelectorAll('.prx377-status-booking,.prx378-status-booking').forEach(n=>n.remove());
      const safe=[...detail.querySelectorAll('.prx386-status-booking')];
      // If safe block somehow appears more than once, keep the first visible one.
      safe.slice(1).forEach(n=>n.remove());
    }catch(e){ console.warn('[PRX 3.8.9] Status dedupe skipped',e); }
  }
  function install(){
    ['click','pointerup','touchend','transitionend'].forEach(t=>document.addEventListener(t,()=>setTimeout(dedupe,180),{passive:true}));
    setTimeout(dedupe,500); setTimeout(dedupe,1200); setInterval(dedupe,2500);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true}); else install();
})();
