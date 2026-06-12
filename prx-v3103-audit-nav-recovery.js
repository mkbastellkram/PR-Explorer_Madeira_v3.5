/* PR Explorer Madeira · V3.10.3 Audit Nav Recovery
   Fixes V3.10.1 audit CSS side effect: position:relative!important broke fixed navigation. */
(function(){
  'use strict';
  const VERSION='3.10.3';
  const STORE='prx.auditMode.v3101';
  window.PRX_APP_VERSION=VERSION;
  window.PRX_MODULE_STATUS=Object.assign({}, window.PRX_MODULE_STATUS||{}, {auditNavRecovery:'3.10.3'});
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  function auditOn(){try{return localStorage.getItem(STORE)==='1'||document.body.classList.contains('prx-audit-mode')}catch(e){return document.body.classList.contains('prx-audit-mode')}}
  function setAudit(on){try{localStorage.setItem(STORE,on?'1':'0')}catch(e){} document.body.classList.toggle('prx-audit-mode',!!on); updateBar(); recoverChrome();}
  function toast(msg){const t=$('#toast'); if(t){t.textContent=msg;t.classList.remove('hidden');setTimeout(()=>t.classList.add('hidden'),1600)}else console.log('[PRX]',msg)}
  function injectCss(){
    if($('#prx3103-audit-nav-css'))return;
    const st=document.createElement('style'); st.id='prx3103-audit-nav-css';
    st.textContent=`
      /* Restore critical fixed/absolute layout while audit labels are visible */
      body.prx-audit-mode .world{position:fixed!important;inset:0!important;z-index:0!important;overflow:hidden!important;}
      body.prx-audit-mode #map, body.prx-audit-mode .map{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;z-index:1!important;}
      body.prx-audit-mode .scene-bg{position:absolute!important;inset:0!important;z-index:0!important;}
      body.prx-audit-mode .top-controls{position:fixed!important;z-index:2147480500!important;left:0!important;right:0!important;top:0!important;display:flex!important;pointer-events:none!important;}
      body.prx-audit-mode .top-left, body.prx-audit-mode .top-right{display:flex!important;pointer-events:auto!important;}
      body.prx-audit-mode #bottomNav, body.prx-audit-mode .bottom-nav{position:fixed!important;z-index:2147480400!important;left:0!important;right:0!important;bottom:0!important;display:grid!important;grid-template-columns:repeat(4,1fr)!important;opacity:1!important;visibility:visible!important;pointer-events:auto!important;transform:none!important;}
      body.prx-audit-mode #bottomNav .nav, body.prx-audit-mode .bottom-nav .nav{display:flex!important;visibility:visible!important;opacity:1!important;}
      body.prx-audit-mode .detail-card{position:absolute!important;z-index:60!important;}
      body.prx-audit-mode .detail-card.dragging{position:fixed!important;}
      body.prx-audit-mode .journal-stage{position:relative!important;z-index:5!important;}
      body.prx-audit-mode .ctl, body.prx-audit-mode .nav{position:relative!important;}
      #prx3103AuditEscape{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom) + 82px);z-index:2147483600;display:none;gap:8px;padding:7px;border-radius:999px;background:rgba(2,18,15,.88);border:1px solid rgba(255,210,64,.55);box-shadow:0 14px 38px rgba(0,0,0,.45);backdrop-filter:blur(18px);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",Segoe UI,sans-serif;}
      body.prx-audit-mode #prx3103AuditEscape{display:flex;}
      #prx3103AuditEscape button{border:0;border-radius:999px;padding:10px 13px;font-weight:950;background:rgba(255,210,64,.95);color:#04130f;}
      #prx3103AuditEscape button.secondary{background:rgba(255,255,255,.10);color:#f4fff9;border:1px solid rgba(255,255,255,.18);}
      .prx3103-audit-safe-note{position:fixed;left:10px;right:10px;top:calc(env(safe-area-inset-top) + 8px);z-index:2147483550;background:rgba(255,210,64,.95);color:#04130f;border-radius:14px;padding:10px 12px;font-weight:900;font-size:13px;text-align:center;box-shadow:0 10px 28px rgba(0,0,0,.35);display:none;}
      body.prx-audit-mode.prx3103-show-note .prx3103-audit-safe-note{display:block;}
    `;
    document.head.appendChild(st);
  }
  function ensureBar(){
    let b=$('#prx3103AuditEscape'); if(b)return b;
    b=document.createElement('div'); b.id='prx3103AuditEscape';
    b.innerHTML='<button id="prx3103AuditOff">Audit aus</button><button class="secondary" id="prx3103AuditOpen">A-00</button><button class="secondary" id="prx3103NavHome">Journal</button>';
    document.body.appendChild(b);
    $('#prx3103AuditOff').onclick=()=>{setAudit(false); toast('Audit-Modus aus');};
    $('#prx3103AuditOpen').onclick=()=>{ if(window.PRX_AUDIT?.open) window.PRX_AUDIT.open(); else toast('Audit-Panel nicht bereit'); };
    $('#prx3103NavHome').onclick=()=>{document.body.className=[...document.body.classList].filter(c=>!/^state-/.test(c)).join(' '); document.body.classList.add('state-journal'); recoverChrome();};
    return b;
  }
  function ensureNote(){if($('.prx3103-audit-safe-note'))return; const n=document.createElement('div'); n.className='prx3103-audit-safe-note'; n.textContent='Audit-Modus aktiv · unten: Audit aus / A-00 / Journal'; document.body.appendChild(n);}
  function updateBar(){ensureBar(); ensureNote(); document.body.classList.toggle('prx3103-show-note', auditOn()); if(auditOn()) setTimeout(()=>document.body.classList.remove('prx3103-show-note'),2400);}
  function recoverChrome(){
    const top=$('.top-controls'), nav=$('#bottomNav,.bottom-nav');
    if(top){top.style.position='fixed'; top.style.display='flex'; top.style.visibility='visible'; top.style.opacity='1';}
    if(nav){nav.style.position='fixed'; nav.style.display='grid'; nav.style.visibility='visible'; nav.style.opacity='1'; nav.style.pointerEvents='auto';}
  }
  function syncVersion(){
    document.title='PR Explorer Madeira V3.10.3';
    document.documentElement.setAttribute('data-prx-version',VERSION);
    $$('small,span,b,strong,div,p,h1,h2,h3').forEach(el=>{
      if(el.children.length>3)return;
      const t=(el.textContent||'');
      if(/PRX\s+3\.(7\.7|8\.\d+|9\.\d+|10\.[0-2])/.test(t)) el.textContent=t.replace(/PRX\s+3\.(7\.7|8\.\d+|9\.\d+|10\.[0-2])/g,'PRX '+VERSION);
      else if(/^3\.(7\.7|8\.\d+|9\.\d+|10\.[0-2])$/.test(t.trim())) el.textContent=VERSION;
    });
  }
  function boot(){
    injectCss(); ensureBar(); ensureNote(); syncVersion(); recoverChrome(); updateBar();
    // If the user was stranded with audit mode active, keep controls visible immediately.
    if(auditOn()){document.body.classList.add('prx-audit-mode'); recoverChrome(); updateBar();}
    document.addEventListener('click',()=>setTimeout(()=>{syncVersion(); recoverChrome(); updateBar();},120),true);
    document.addEventListener('scroll',()=>{if(auditOn())recoverChrome();},{passive:true});
    window.PRX_AUDIT_SAFE={off:()=>setAudit(false), on:()=>setAudit(true), recover:recoverChrome, version:VERSION};
    setInterval(()=>{syncVersion(); if(auditOn())recoverChrome(); updateBar();},1200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
