/* PRX V3.10.0 · Flat Layout + Map Stability
   Zweck: schrittweise flachere Journal-/Detaildarstellung, Leaflet-Tile-CSS entkoppeln,
   Anfahrtszeit-Panel aus falscher Overlay-Ebene entfernen. Keine neuen Daten/Ordner. */
(function(){
  'use strict';
  var VERSION='3.10.0';
  window.PRX_APP_VERSION=VERSION;
  window.PRX_MODULES=window.PRX_MODULES||{};
  window.PRX_MODULES.flatLayoutMapStability={version:VERSION,loaded:true};

  function $(id){return document.getElementById(id);}
  function css(){
    if($('prx3100-css')) return;
    var st=document.createElement('style');
    st.id='prx3100-css';
    st.textContent=[
      'body.prx-flat-3100{--prx-flat-line:rgba(220,255,240,.13);--prx-flat-bg:rgba(2,18,15,.94);}',
      'body.prx-flat-3100 .journal-stage{left:0!important;right:0!important;padding-left:0!important;padding-right:0!important;}',
      'body.prx-flat-3100 .journal-intro{margin:0 0 10px!important;border-left:0!important;border-right:0!important;border-radius:0 0 26px 26px!important;background:rgba(2,18,15,.88)!important;box-shadow:none!important;backdrop-filter:none!important;padding-left:20px!important;padding-right:20px!important;}',
      'body.prx-flat-3100 .journal-list{gap:0!important;margin:0!important;border-top:1px solid var(--prx-flat-line)!important;}',
      'body.prx-flat-3100 .filter-summary{margin:0!important;border-radius:0!important;border-left:0!important;border-right:0!important;background:rgba(2,18,15,.92)!important;box-shadow:none!important;}',
      'body.prx-flat-3100 .jcard{grid-template-columns:minmax(0,1fr)!important;gap:0!important;border-radius:0!important;border-left:0!important;border-right:0!important;border-top:0!important;border-bottom:1px solid var(--prx-flat-line)!important;background:var(--prx-flat-bg)!important;box-shadow:none!important;backdrop-filter:none!important;min-height:auto!important;padding:15px 18px 16px!important;margin:0!important;}',
      'body.prx-flat-3100 .jcard .thumb{display:none!important;}',
      'body.prx-flat-3100 .jcard h2{font-size:23px!important;line-height:1.08!important;margin:0 0 8px!important;letter-spacing:-.035em!important;}',
      'body.prx-flat-3100 .jcard .meta{gap:6px!important;margin:0 0 9px!important;}',
      'body.prx-flat-3100 .jcard .badge{font-size:12px!important;padding:5px 8px!important;border-radius:999px!important;}',
      'body.prx-flat-3100 .jcard .note{font-size:15px!important;line-height:1.28!important;margin:0!important;color:rgba(236,250,244,.86)!important;}',
      'body.prx-flat-3100 .journal-end{margin:0!important;border-radius:0!important;border-left:0!important;border-right:0!important;background:rgba(2,18,15,.92)!important;box-shadow:none!important;}',
      'body.prx-flat-3100 .detail-card{left:0!important;right:0!important;border-left:0!important;border-right:0!important;border-bottom:0!important;border-radius:28px 28px 0 0!important;background:rgba(2,18,15,.96)!important;box-shadow:0 -14px 60px rgba(0,0,0,.45)!important;backdrop-filter:none!important;}',
      'body.prx-flat-3100 .detail-block{border-left:0!important;border-right:0!important;border-bottom:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;border-top:1px solid var(--prx-flat-line)!important;margin:0!important;padding:16px 8px!important;}',
      'body.prx-flat-3100 .facts{gap:7px!important;}',
      'body.prx-flat-3100 .fact{border-radius:14px!important;background:rgba(255,255,255,.06)!important;}',
      'body.prx-flat-3100 .link-grid,body.prx-flat-3100 .route-actions{gap:8px!important;}',
      'body.prx-flat-3100 .prx395-panel{display:none!important;}',
      'body.prx-flat-3100 .prx3100-drive-settings-card{display:block!important;}',
      /* Leaflet must be isolated from app-wide img/card styles. This is the main map stability patch. */
      '#map.leaflet-container,#map.map.leaflet-container{position:absolute!important;inset:0!important;width:100vw!important;height:100dvh!important;min-width:100vw!important;min-height:100dvh!important;overflow:hidden!important;background:#b6d4df!important;}',
      '#map.leaflet-container img,.leaflet-container img{border:0!important;border-radius:0!important;box-shadow:none!important;object-fit:initial!important;max-width:none!important;max-height:none!important;}',
      '#map.leaflet-container .leaflet-tile,.leaflet-container .leaflet-tile{width:256px!important;height:256px!important;border:0!important;border-radius:0!important;box-shadow:none!important;object-fit:initial!important;max-width:none!important;max-height:none!important;background:transparent!important;}',
      '.leaflet-tile-container,.leaflet-pane,.leaflet-map-pane,.leaflet-tile-pane,.leaflet-overlay-pane,.leaflet-marker-pane{transform-origin:0 0!important;}',
      '.leaflet-container .leaflet-layer,.leaflet-container .leaflet-tile-pane{filter:none!important;mix-blend-mode:normal!important;}',
      'body.state-map #map,body.state-detail #map,body.state-peek #map,body.state-fullmap #map{opacity:1!important;visibility:visible!important;}',
      '.prx3100-map-note{position:fixed;left:50%;bottom:max(94px,calc(78px + env(safe-area-inset-bottom)));transform:translateX(-50%);z-index:9999;background:rgba(2,18,15,.94);border:1px solid rgba(82,220,170,.35);border-radius:999px;padding:9px 13px;color:#eefaf4;font-size:12px;font-weight:850;box-shadow:0 10px 30px rgba(0,0,0,.35)}',
      '.prx3100-drive-settings-card{margin:14px 0 0;padding:14px;border:1px solid rgba(220,255,240,.14);border-radius:18px;background:rgba(255,255,255,.045);color:#eefaf4}.prx3100-drive-settings-card b{display:block;font-size:18px}.prx3100-drive-settings-card small{color:rgba(235,250,244,.64);line-height:1.35}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function enableFlat(){
    document.body.classList.add('prx-flat-3100');
    try{localStorage.setItem('prx.layoutMode.v3100','flat');}catch(e){}
  }

  function map(){return window.PRX_LEAFLET_MAP||null;}
  function invalidate(reason){
    css();
    var el=$('map');
    if(el){
      el.style.width='100vw'; el.style.height='100dvh'; el.style.minHeight='100dvh';
      // Remove app-level inline distortions if they were introduced by earlier recovery modules.
      el.style.transform='none';
    }
    var m=map();
    if(m && typeof m.invalidateSize==='function'){
      try{m.invalidateSize({pan:false,animate:false});}catch(e){try{m.invalidateSize(false);}catch(_e){}}
    }
    window.PRX_MODULES.flatLayoutMapStability.lastInvalidate=reason||'manual';
    window.PRX_MODULES.flatLayoutMapStability.lastRun=new Date().toISOString();
  }
  function schedule(reason){[0,80,220,520,1100,1800].forEach(function(t){setTimeout(function(){invalidate(reason);},t);});}
  function flash(msg){
    var old=$('prx3100MapNote'); if(old) old.remove();
    var d=document.createElement('div'); d.id='prx3100MapNote'; d.className='prx3100-map-note'; d.textContent=msg;
    document.body.appendChild(d); setTimeout(function(){try{d.remove();}catch(e){}},1600);
  }

  function removeBadDrivePanels(){
    // V3.9.5 inserted a global drive-time settings panel into the wrong layer by text matching.
    // Keep detail drive blocks, remove only floating settings panels outside the PR detail card.
    document.querySelectorAll('.prx395-panel').forEach(function(p){
      if(!p.closest('#detailCard')) p.remove();
    });
  }
  function addDriveSummaryToSettings(){
    var settings=document.querySelector('.settings-sheet,.prx-settings,.settings-modal,[data-prx-settings],section');
    // Avoid broad injection: only add a compact diagnostic card when an actual settings page heading exists.
    var visibleSettings=[].slice.call(document.querySelectorAll('section,div,main')).find(function(el){
      if(!el.offsetParent) return false;
      var txt=(el.textContent||'').slice(0,300);
      return /Einstellungen/.test(txt) && /Darstellung|Kartenstil|Bedienung/.test(txt);
    });
    var host=visibleSettings||settings;
    if(!host || host.querySelector('.prx3100-drive-settings-card')) return;
    // Do not inject into journal/detail/poi layers.
    if(host.id==='journalStage'||host.id==='detailCard'||host.id==='poiSheet') return;
    var cfg={}; try{cfg=JSON.parse(localStorage.getItem('prx.driveTime.v395')||'{}');}catch(e){}
    var card=document.createElement('div'); card.className='prx3100-drive-settings-card';
    card.innerHTML='<b>Anfahrtszeit Madeira</b><small>Planungswert aktiv: Faktor '+(cfg.factor||1.20)+'×, Verkehr '+(cfg.trafficPct||10)+' %, Gruppe '+(cfg.groupBufferMin||10)+' min, Parkplatz '+(cfg.parkingMin||20)+' min. Vollständige Regler folgen in der sauber eingebundenen Reise-/Planungsseite.</small>';
    // Do not append to enormous root; insert after heading area if safe.
    try{host.appendChild(card);}catch(e){}
  }

  function bind(){
    css(); enableFlat(); removeBadDrivePanels(); schedule('v3100-load');
    window.PRX_RECOVER_MAP_3100=function(){schedule('manual-3100');flash('Karte neu vermessen');};
    window.PRX_RECOVER_MAP=window.PRX_RECOVER_MAP_3100;
    ['load','resize','orientationchange'].forEach(function(ev){window.addEventListener(ev,function(){schedule(ev);});});
    document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule('visible');});
    document.addEventListener('click',function(e){
      var t=e.target&&e.target.closest&&e.target.closest('#mapBtn,[data-nav="map"],#fitBtn,#detailClose,#poiSheetClose,#osmLiveBtn,#bottomNav button,.ctl');
      if(t) schedule('ui-click');
      setTimeout(removeBadDrivePanels,120);
      setTimeout(addDriveSummaryToSettings,180);
    },true);
    document.addEventListener('touchend',function(){schedule('touchend');},true);
    setInterval(function(){removeBadDrivePanels();},1200);
    if(window.ResizeObserver && $('map')){
      try{new ResizeObserver(function(){schedule('map-resize-observer');}).observe($('map'));}catch(e){}
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind); else bind();
})();
