/* PR Explorer Madeira · V3.10.4
   Detail-Scroll-Recovery + globales Buttonfeedback
   Ziel: Karten-Detailseite nutzt Journal-Überlaufprinzip; Buttons zeigen klaren Toggle-/Action-State.
*/
(function PRX_V3104(){
  'use strict';
  const VERSION = '3.10.4';
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function injectStyle(){
    if(document.getElementById('prx-v3104-style')) return;
    const css = `
      :root{
        --prx-top-controls-clearance: 104px;
        --prx-bottom-nav-clearance: 132px;
        --prx-v3104-action-done: rgba(73, 222, 164, .96);
        --prx-v3104-action-busy: rgba(255, 214, 74, .96);
      }

      html, body{
        min-height:100%;
        overscroll-behavior-y:none;
      }

      body.state-detail .world,
      body.state-map .world,
      body.state-fullmap .world{
        position:fixed !important;
        inset:0 !important;
        height:100dvh !important;
        overflow:hidden !important;
      }

      body.state-detail .top-controls,
      body.state-map .top-controls,
      body.state-fullmap .top-controls{
        position:fixed !important;
        top:calc(env(safe-area-inset-top, 0px) + 10px) !important;
        left:0 !important;
        right:0 !important;
        z-index:8500 !important;
        pointer-events:none;
      }
      body.state-detail .top-controls button,
      body.state-map .top-controls button,
      body.state-fullmap .top-controls button,
      body.state-detail .top-controls .ctl,
      body.state-map .top-controls .ctl,
      body.state-fullmap .top-controls .ctl{
        pointer-events:auto;
      }

      #bottomNav,
      .bottom-nav{
        position:fixed !important;
        left:0 !important;
        right:0 !important;
        bottom:0 !important;
        z-index:9200 !important;
        transform:translateZ(0);
      }

      body.state-detail #detailCard:not(.hidden),
      body.state-map #detailCard:not(.hidden),
      body.state-fullmap #detailCard:not(.hidden){
        position:fixed !important;
        left:0 !important;
        right:0 !important;
        top:calc(env(safe-area-inset-top, 0px) + var(--prx-top-controls-clearance)) !important;
        bottom:0 !important;
        height:auto !important;
        max-height:none !important;
        overflow-y:auto !important;
        overflow-x:hidden !important;
        -webkit-overflow-scrolling:touch !important;
        overscroll-behavior-y:contain;
        padding-bottom:calc(var(--prx-bottom-nav-clearance) + env(safe-area-inset-bottom, 0px)) !important;
        z-index:7400 !important;
        touch-action:pan-y;
        will-change:scroll-position;
      }

      body.state-detail #detailCard:not(.hidden) .detail-head,
      body.state-map #detailCard:not(.hidden) .detail-head,
      body.state-fullmap #detailCard:not(.hidden) .detail-head{
        position:sticky;
        top:0;
        z-index:2;
        backdrop-filter:blur(18px) saturate(1.25);
        -webkit-backdrop-filter:blur(18px) saturate(1.25);
      }

      body.state-detail #detailCard:not(.hidden) .detail-block:last-child,
      body.state-map #detailCard:not(.hidden) .detail-block:last-child,
      body.state-fullmap #detailCard:not(.hidden) .detail-block:last-child{
        margin-bottom:calc(var(--prx-bottom-nav-clearance) * .35);
      }

      .prx-toggle,
      .prx-action,
      .prx-status-choice{
        position:relative;
        transition:background .16s ease, color .16s ease, box-shadow .16s ease, transform .12s ease, border-color .16s ease, opacity .16s ease;
      }
      .prx-action:active,
      .prx-toggle:active,
      .prx-status-choice:active{
        transform:scale(.975);
      }
      .prx-toggle.is-active,
      .prx-toggle[aria-pressed="true"],
      .prx-status-choice.is-active,
      .prx-status-choice[aria-pressed="true"]{
        background:rgba(73, 222, 164, .22) !important;
        border-color:rgba(73, 222, 164, .72) !important;
        box-shadow:0 0 0 2px rgba(73, 222, 164, .20) inset, 0 10px 28px rgba(0,0,0,.24) !important;
      }
      .prx-action.is-busy{
        background:var(--prx-v3104-action-busy) !important;
        color:#06150f !important;
        border-color:rgba(255,255,255,.55) !important;
      }
      .prx-action.is-done{
        background:var(--prx-v3104-action-done) !important;
        color:#06150f !important;
        border-color:rgba(255,255,255,.55) !important;
      }
      .prx-action.is-error{
        background:rgba(255, 85, 85, .95) !important;
        color:#fff !important;
      }
      .prx-click-pulse::after{
        content:'';
        position:absolute;
        inset:-3px;
        border-radius:inherit;
        pointer-events:none;
        border:2px solid rgba(73,222,164,.70);
        animation:prxPulse3104 .48s ease-out forwards;
      }
      @keyframes prxPulse3104{
        from{opacity:.95; transform:scale(.96)}
        to{opacity:0; transform:scale(1.08)}
      }

      #toast.prx-toast-v3104{
        position:fixed !important;
        left:18px !important;
        right:18px !important;
        bottom:calc(96px + env(safe-area-inset-bottom, 0px)) !important;
        z-index:9800 !important;
        text-align:center;
      }

      body.prx-v3104-ready::before{
        content:'V3.10.4';
        position:fixed;
        right:10px;
        bottom:calc(82px + env(safe-area-inset-bottom, 0px));
        z-index:1200;
        font:700 10px/1 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        letter-spacing:.08em;
        color:rgba(255,255,255,.34);
        pointer-events:none;
      }
    `;
    const style = document.createElement('style');
    style.id = 'prx-v3104-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function showToast(message, ms=1500){
    const t = document.getElementById('toast');
    if(!t) return;
    t.textContent = message;
    t.classList.add('prx-toast-v3104');
    t.classList.remove('hidden');
    clearTimeout(t._prx3104Timer);
    t._prx3104Timer = setTimeout(()=>t.classList.add('hidden'), ms);
  }

  function classifyButton(btn){
    if(!btn || btn.dataset.prx3104Type) return;
    const text = (btn.textContent || btn.getAttribute('aria-label') || '').trim().replace(/\s+/g,' ');
    const id = btn.id || '';
    const isNav = btn.classList.contains('nav') || !!btn.dataset.nav;
    const isCtl = btn.classList.contains('ctl');
    const isStatus = /^(🟢\s*)?Offen$|^(🟡\s*)?Eingeschränkt$|^(🔴\s*)?Geschlossen$|^(⚪\s*)?Prüfen$/i.test(text);
    const isToggleText = /IDs anzeigen|IDs ausblenden|Audit an|Audit aus|OSM|GPS|Karte$|Journal$|Reise$|Dashboard$/i.test(text);
    const isActionText = /kopieren|öffnen|teilen|Route einpassen|Google Maps|SIMplifica|MadeiraJourney|Quelle öffnen|Favorit|×|Schließen/i.test(text);

    if(isStatus){
      btn.classList.add('prx-status-choice');
      btn.dataset.prx3104Type = 'status';
      btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
      return;
    }
    if(isNav || isToggleText || (isCtl && /filterBtn|optionBtn|mapBtn|settingsBtn/.test(id))){
      btn.classList.add('prx-toggle');
      btn.dataset.prx3104Type = 'toggle';
      if(!btn.hasAttribute('aria-pressed')) btn.setAttribute('aria-pressed', btn.classList.contains('active') || btn.classList.contains('primary') ? 'true':'false');
      return;
    }
    if(isActionText || isCtl || btn.tagName === 'BUTTON'){
      btn.classList.add('prx-action');
      btn.dataset.prx3104Type = 'action';
    }
  }

  function decorateButtons(root=document){
    $$('button', root).forEach(classifyButton);
    syncNavState();
    syncStatusButtons();
    syncAuditButtons();
  }

  function pulse(el){
    if(!el) return;
    el.classList.remove('prx-click-pulse');
    void el.offsetWidth;
    el.classList.add('prx-click-pulse');
    setTimeout(()=>el.classList.remove('prx-click-pulse'), 520);
  }

  function actionFeedback(btn, message){
    if(!btn) return;
    btn.classList.remove('is-done','is-error');
    btn.classList.add('is-busy');
    setTimeout(()=>{
      btn.classList.remove('is-busy');
      btn.classList.add('is-done');
      if(message) showToast(message);
      setTimeout(()=>btn.classList.remove('is-done'), 900);
    }, 110);
  }

  function syncNavState(){
    $$('#bottomNav .nav, .bottom-nav .nav').forEach(btn=>{
      const active = btn.classList.contains('active');
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true':'false');
    });
  }

  function statusButtons(){
    return $$('button').filter(b=>/^(🟢\s*)?Offen$|^(🟡\s*)?Eingeschränkt$|^(🔴\s*)?Geschlossen$|^(⚪\s*)?Prüfen$/i.test((b.textContent||'').trim().replace(/\s+/g,' ')));
  }

  function syncStatusButtons(activeBtn){
    const group = statusButtons();
    if(!group.length) return;
    group.forEach(b=>{
      b.classList.add('prx-status-choice');
      b.dataset.prx3104Type='status';
      const active = activeBtn ? b === activeBtn : b.classList.contains('is-active') || b.getAttribute('aria-pressed') === 'true';
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true':'false');
    });
  }

  function syncAuditButtons(){
    $$('button').forEach(btn=>{
      const text=(btn.textContent||'').trim().replace(/\s+/g,' ');
      if(/Audit aus|IDs ausblenden/.test(text)){
        btn.classList.add('prx-toggle','is-active');
        btn.setAttribute('aria-pressed','true');
        btn.dataset.prx3104Type='toggle';
      }
      if(/Audit an|IDs anzeigen/.test(text)){
        btn.classList.add('prx-toggle');
        btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true':'false');
        btn.dataset.prx3104Type='toggle';
      }
      if(/Audit kopieren|JSON kopieren|Bericht kopieren/.test(text)){
        btn.classList.add('prx-action');
        btn.dataset.prx3104Type='action';
      }
    });
  }

  function feedbackMessage(btn){
    const text=(btn.textContent||btn.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ');
    const id=btn.id || '';
    if(/Audit kopieren/.test(text)) return 'Komponenten-Audit kopiert.';
    if(/JSON kopieren/.test(text)) return 'JSON kopiert.';
    if(/Bericht kopieren/.test(text)) return 'Bericht kopiert.';
    if(/Route einpassen/.test(text) || id==='fitBtn') return 'Route eingepasst.';
    if(/Google Maps/.test(text) || id==='mapsBtn') return 'Google Maps geöffnet.';
    if(/Quelle öffnen/.test(text)) return 'Quelle geöffnet.';
    if(/SIMplifica/.test(text)) return 'SIMplifica geöffnet.';
    if(/MadeiraJourney/.test(text)) return 'MadeiraJourney geöffnet.';
    if(/Favorit/.test(text) || id==='favBtn') return 'Favorit geändert.';
    if(id==='shareBtn' || /Teilen/.test(text)) return 'Teilen ausgelöst.';
    return '';
  }

  function onClick(e){
    const btn = e.target.closest && e.target.closest('button');
    if(!btn) return;
    classifyButton(btn);
    pulse(btn);

    const type = btn.dataset.prx3104Type;
    const text=(btn.textContent||btn.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ');

    if(type === 'status'){
      setTimeout(()=>{
        syncStatusButtons(btn);
        const clean=text.replace(/[🟢🟡🔴⚪]/g,'').trim();
        showToast('Status gesetzt: ' + clean);
      }, 70);
      return;
    }

    if(type === 'toggle'){
      setTimeout(()=>{
        syncNavState();
        syncAuditButtons();
        const active = btn.classList.contains('active') || btn.classList.contains('is-active') || btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', active ? 'true':'false');
        if(/IDs anzeigen|IDs ausblenden/.test(text)) showToast(active ? 'IDs sichtbar.' : 'IDs umgeschaltet.');
        else if(/Audit an|Audit aus/.test(text)) showToast(active ? 'Audit-Modus aktiv.' : 'Audit-Modus umgeschaltet.');
      }, 90);
      return;
    }

    if(type === 'action'){
      const msg = feedbackMessage(btn);
      if(msg) actionFeedback(btn, msg);
    }
  }

  function setDetailScrollVariables(){
    const top = $('.top-controls');
    const bottom = $('#bottomNav') || $('.bottom-nav');
    const topH = top ? Math.ceil(top.getBoundingClientRect().height + 22) : 104;
    const bottomH = bottom ? Math.ceil(bottom.getBoundingClientRect().height + 34) : 132;
    document.documentElement.style.setProperty('--prx-top-controls-clearance', Math.max(92, topH) + 'px');
    document.documentElement.style.setProperty('--prx-bottom-nav-clearance', Math.max(118, bottomH) + 'px');
  }

  function repairDetailScroll(){
    const card = $('#detailCard');
    if(!card) return;
    const visible = !card.classList.contains('hidden');
    if(visible && (document.body.classList.contains('state-detail') || document.body.classList.contains('state-map') || document.body.classList.contains('state-fullmap'))){
      card.setAttribute('data-prx3104-scroll','edge-overflow');
      card.style.overflowY = 'auto';
      card.style.webkitOverflowScrolling = 'touch';
    }
  }

  function observe(){
    const mo = new MutationObserver(muts=>{
      let need=false;
      for(const m of muts){
        if(m.type === 'childList') need=true;
        if(m.type === 'attributes' && ['class','aria-pressed','style'].includes(m.attributeName)) need=true;
      }
      if(!need) return;
      clearTimeout(observe._t);
      observe._t=setTimeout(()=>{
        decorateButtons();
        setDetailScrollVariables();
        repairDetailScroll();
      }, 80);
    });
    mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-pressed','style']});
  }

  function boot(){
    injectStyle();
    document.body.classList.add('prx-v3104-ready');
    document.title = document.title.replace(/V3\.10\.3/i,'V3.10.4');
    decorateButtons();
    setDetailScrollVariables();
    repairDetailScroll();
    document.addEventListener('click', onClick, false);
    window.addEventListener('resize', ()=>{setDetailScrollVariables(); repairDetailScroll();}, {passive:true});
    window.addEventListener('orientationchange', ()=>setTimeout(()=>{setDetailScrollVariables(); repairDetailScroll();}, 250), {passive:true});
    observe();
    setTimeout(()=>{decorateButtons(); setDetailScrollVariables(); repairDetailScroll();}, 350);
    setTimeout(()=>{decorateButtons(); setDetailScrollVariables(); repairDetailScroll();}, 1200);
  }

  window.PRX_V3104 = {
    version: VERSION,
    showToast,
    decorateButtons,
    repairDetailScroll,
    setDetailScrollVariables
  };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
