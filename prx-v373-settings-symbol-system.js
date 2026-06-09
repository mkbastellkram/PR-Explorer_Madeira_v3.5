(()=>{
  'use strict';
  const HLOCK_CLASS='prx-horizontal-lock';
  let startX=0,startY=0,locked=false,target=null;
  function isInteractive(el){return el?.closest?.('input,textarea,select,button,a,.seg,.route-actions,.link-grid');}
  function isSwipeSurface(el){return el?.closest?.('.jcard,.menu-row,.day-row,.context-row,.poi-card,.poi-dock-card,.detail-card,.settings-sheet');}
  document.addEventListener('pointerdown',e=>{
    if(isInteractive(e.target)) return;
    target=isSwipeSurface(e.target);
    if(!target) return;
    startX=e.clientX; startY=e.clientY; locked=false;
  },{capture:true,passive:true});
  document.addEventListener('pointermove',e=>{
    if(!target||locked) return;
    const dx=e.clientX-startX, dy=e.clientY-startY;
    if(Math.abs(dx)>13 && Math.abs(dx)>Math.abs(dy)*1.15){
      locked=true;
      document.documentElement.classList.add(HLOCK_CLASS);
      document.body.classList.add('prx-cover-horizontal-active');
      target.classList.add('prx-active-horizontal-surface');
    }
  },{capture:true,passive:true});
  function end(){
    if(target) target.classList.remove('prx-active-horizontal-surface');
    target=null; locked=false;
    document.documentElement.classList.remove(HLOCK_CLASS);
    document.body.classList.remove('prx-cover-horizontal-active');
  }
  document.addEventListener('pointerup',end,{capture:true,passive:true});
  document.addEventListener('pointercancel',end,{capture:true,passive:true});

  // DOM polish for settings/options pages rendered by app.js closure.
  const obs=new MutationObserver(()=>{
    // Stamp version labels if older cached snippets appear.
    document.querySelectorAll('.diag-grid span').forEach(el=>{ if(el.textContent.trim()==='3.7.2') el.textContent='3.7.3'; });
    // Ensure text-mode active state in case buttons were inserted after render.
    const mode=localStorage.getItem('prx.detailTextMode.v373')||'off';
    document.querySelectorAll('[data-detailtext]').forEach(b=>b.classList.toggle('active',b.dataset.detailtext===mode));
  });
  obs.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
})();
