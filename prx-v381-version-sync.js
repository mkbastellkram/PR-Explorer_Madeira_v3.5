/* PRX V3.8.1 · Version Display Sync
   Korrigiert ältere hardcodierte Diagnose-/Admin-Versionen aus Modulketten. */
(function(){
  'use strict';
  const VERSION='3.8.1';
  window.PRX_APP_VERSION=VERSION;
  window.PRX_APP_VERSION_LABEL='PR-Explorer Madeira V'+VERSION;
  function syncVersions(root=document){
    try{
      root.querySelectorAll('.diag-grid div').forEach(box=>{
        const b=box.querySelector('b'); const span=box.querySelector('span');
        if(b && span && /Version/i.test(b.textContent||'')) span.textContent=VERSION;
      });
      root.querySelectorAll('[data-prx-version], .prx-version').forEach(el=>el.textContent=VERSION);
    }catch(e){}
  }
  document.addEventListener('DOMContentLoaded',()=>syncVersions());
  document.addEventListener('click',()=>setTimeout(()=>syncVersions(),30), true);
  const mo=new MutationObserver(m=>{for(const x of m){for(const n of x.addedNodes||[]){if(n.nodeType===1)syncVersions(n)}}});
  try{mo.observe(document.documentElement,{childList:true,subtree:true})}catch(e){}
})();
