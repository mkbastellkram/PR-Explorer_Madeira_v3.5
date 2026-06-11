/* PRX V3.8.8 · Runtime Clean Map
   Zweck: alte Recovery-Nebenwirkungen vermeiden, Karte neu vermessen, Version/Diagnose zentralisieren. */
(function(){
  'use strict';
  var VERSION='3.8.8';
  window.PRX_APP_VERSION=VERSION;
  window.PRX_MODULES=window.PRX_MODULES||{};
  window.PRX_MODULES.runtimeCleanMap={version:VERSION,loaded:true};

  function $(id){return document.getElementById(id)}
  function map(){return window.PRX_LEAFLET_MAP||null}
  function injectCss(){
    if($('prx388-clean-map-css')) return;
    var st=document.createElement('style');
    st.id='prx388-clean-map-css';
    st.textContent=[
      'html,body{width:100%;min-height:100%;}',
      'body{background:#061f18;}',
      '.world{position:fixed!important;left:0!important;right:0!important;top:0!important;bottom:0!important;width:100vw!important;height:100dvh!important;overflow:hidden!important;background:#0b3027!important;}',
      '#map.map{position:absolute!important;left:0!important;right:0!important;top:0!important;bottom:0!important;width:100vw!important;height:100dvh!important;min-height:100dvh!important;transform:none!important;}',
      '#map .leaflet-container,.leaflet-container{width:100%!important;height:100%!important;}',
      '.leaflet-tile{max-width:none!important;}',
      '.leaflet-pane,.leaflet-map-pane,.leaflet-tile-pane,.leaflet-overlay-pane{will-change:transform;}',
      'body.map-ready #map.map, body.state-map #map.map, body.state-detail #map.map, body.state-peek #map.map, body.state-fullmap #map.map{opacity:1!important;}',
      'body.state-map .scene-bg,body.state-detail .scene-bg,body.state-peek .scene-bg,body.state-fullmap .scene-bg{opacity:0!important;pointer-events:none!important;}',
      '.prx388-osm-loading:after{content:"OSM lädt …";position:fixed;left:50%;bottom:max(92px,calc(72px + env(safe-area-inset-bottom)));transform:translateX(-50%);z-index:9998;background:rgba(7,23,19,.94);border:1px solid rgba(53,215,166,.35);border-radius:999px;color:#edf8f3;padding:10px 14px;font-size:13px;font-weight:800;box-shadow:0 10px 30px rgba(0,0,0,.35)}',
      '.prx388-diag-card{margin:14px 12px 92px;padding:16px;border:1px solid rgba(186,230,210,.22);border-radius:22px;background:rgba(6,24,20,.88);color:#edf8f3;box-shadow:0 18px 50px rgba(0,0,0,.28);backdrop-filter:blur(16px)}',
      '.prx388-diag-card h3{margin:0 0 8px;font-size:18px}.prx388-diag-card p{margin:0 0 10px;color:#a9c7ba;line-height:1.4}.prx388-diag-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.prx388-diag-grid div{padding:10px;border-radius:14px;background:rgba(255,255,255,.055);font-size:12px;color:#a9c7ba}.prx388-diag-grid b{display:block;color:#edf8f3;font-size:16px;margin-top:3px}'
    ].join('\n');
    document.head.appendChild(st);
  }
  function invalidate(reason){
    injectCss();
    var el=$('map');
    if(el){
      el.style.width='100vw'; el.style.height='100dvh'; el.style.minHeight='100dvh';
    }
    var w=document.querySelector('.world');
    if(w){w.style.width='100vw'; w.style.height='100dvh';}
    var m=map();
    if(m && typeof m.invalidateSize==='function'){
      try{m.invalidateSize({pan:false,animate:false});}catch(e){try{m.invalidateSize(false);}catch(_e){}}
    }
    window.PRX_MODULES.runtimeCleanMap.lastInvalidate=reason||'manual';
    window.PRX_MODULES.runtimeCleanMap.lastRun=new Date().toISOString();
  }
  function schedule(reason){[0,60,180,420,900,1500].forEach(function(t){setTimeout(function(){invalidate(reason);},t);});}
  function visible(el){if(!el) return false; var cs=getComputedStyle(el); return cs.display!=='none' && cs.visibility!=='hidden' && Number(cs.opacity)!==0;}
  function displayGuard(){
    var journal=$('journalStage'), list=$('journalList'), detail=$('detailCard'), poi=$('poiSheet'), mapEl=$('map');
    if(!journal || !mapEl) return;
    var mainVisible=visible(journal)||visible(detail)||visible(poi)||visible(mapEl);
    if(!mainVisible){
      document.body.classList.remove('prx-modal-isolated','prx376-modal-open');
      document.body.classList.add('state-journal');
      journal.classList.remove('hidden');
      mapEl.classList.remove('hidden');
      if(list && !list.children.length){addDiag('Startdiagnose','Journal-Liste leer. Daten oder Renderfunktion prüfen.');}
    }
  }
  function addDiag(title,msg){
    var list=$('journalList')||$('journalStage'); if(!list || $('prx388InlineDiag')) return;
    var c=document.createElement('div'); c.id='prx388InlineDiag'; c.className='prx388-diag-card';
    var data=window.PRX_DATA||{}; var trails=(data.trails||data.routes||window.trails||[]);
    var pois=(window.PRX_POIS||window.PRX_POI_DATA||[]);
    c.innerHTML='<h3>'+esc(title)+'</h3><p>'+esc(msg)+'</p><div class="prx388-diag-grid"><div>Version<b>'+VERSION+'</b></div><div>PR-Daten<b>'+(trails.length||'prüfen')+'</b></div><div>POIs<b>'+(pois.length||'prüfen')+'</b></div><div>Map-DOM<b>'+($('map')?'OK':'fehlt')+'</b></div></div>';
    list.prepend(c);
  }
  function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

  window.PRX_RECOVER_MAP=function(){schedule('manual');};
  window.PRX_DIAG=function(){
    return {version:VERSION,mapCaptured:!!window.PRX_LEAFLET_MAP,bodyClass:document.body.className,modules:window.PRX_MODULES||{}};
  };
  function bind(){
    injectCss();
    schedule('runtime-load');
    window.addEventListener('load',function(){schedule('window-load');displayGuard();});
    window.addEventListener('resize',function(){schedule('resize');});
    window.addEventListener('orientationchange',function(){schedule('orientation');});
    document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule('visible');});
    document.addEventListener('click',function(e){
      var t=e.target&&e.target.closest&&e.target.closest('#mapBtn,[data-nav="map"],#fitBtn,#detailClose,#poiSheetClose,#osmLiveBtn,#bottomNav button,.ctl');
      if(t) schedule('click');
    },true);
    try{
      var mo=new MutationObserver(function(muts){
        for(var i=0;i<muts.length;i++) if(muts[i].attributeName==='class'){schedule('body-class');break;}
      });
      mo.observe(document.body,{attributes:true,attributeFilter:['class']});
    }catch(e){}
    setTimeout(displayGuard,2600);
    setTimeout(displayGuard,5200);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind); else bind();
})();
