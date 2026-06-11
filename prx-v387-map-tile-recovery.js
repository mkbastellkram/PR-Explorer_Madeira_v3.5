/* PRX V3.8.7 · Map Tile Recovery
   Zweck: Leaflet-Kartencontainer defensiv stabilisieren, Tile-Versatz nach versteckter/isolierter UI verhindern. */
(function(){
  'use strict';
  var VERSION = '3.8.7';
  window.PRX_APP_VERSION = VERSION;
  window.PRX_MODULES = window.PRX_MODULES || {};
  window.PRX_MODULES.mapTileRecovery = { version: VERSION, loaded: true, mapCaptured: false };

  function injectCss(){
    if(document.getElementById('prx-map-tile-recovery-css')) return;
    var st=document.createElement('style');
    st.id='prx-map-tile-recovery-css';
    st.textContent = [
      'html,body{width:100%;min-height:100%;}',
      '.world{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;overflow:hidden!important;}',
      '#map.map{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:100dvh!important;transform:none!important;contain:layout paint;}',
      '#map .leaflet-container{width:100%!important;height:100%!important;min-height:100dvh!important;}',
      '#map .leaflet-tile{max-width:none!important;}',
      '#map .leaflet-map-pane,#map .leaflet-tile-pane,#map .leaflet-overlay-pane{will-change:transform;}',
      'body.prx-map-recovering #map{opacity:1!important;}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function captureLeafletMap(){
    if(!window.L || window.L.__prxMapPatched) return;
    var original = window.L.map;
    window.L.map = function(){
      var m = original.apply(this, arguments);
      window.PRX_LEAFLET_MAP = m;
      window.PRX_MODULES.mapTileRecovery.mapCaptured = true;
      scheduleRecovery('map-created');
      return m;
    };
    window.L.__prxMapPatched = true;
  }

  function getMap(){ return window.PRX_LEAFLET_MAP || null; }

  function forceContainerBox(){
    var mapEl=document.getElementById('map');
    if(!mapEl) return;
    mapEl.style.width='100%';
    mapEl.style.height='100%';
    mapEl.style.minHeight='100dvh';
    var world=document.querySelector('.world');
    if(world){ world.style.width='100vw'; world.style.height='100dvh'; }
  }

  var recoveryTimer=0;
  function scheduleRecovery(reason){
    clearTimeout(recoveryTimer);
    var times=[0,40,120,260,520,900];
    times.forEach(function(t){ setTimeout(function(){ recover(reason); }, t); });
    recoveryTimer=setTimeout(function(){ document.body.classList.remove('prx-map-recovering'); }, 1100);
  }

  function recover(reason){
    injectCss();
    forceContainerBox();
    document.body.classList.add('prx-map-recovering');
    var m=getMap();
    if(m && typeof m.invalidateSize==='function'){
      try { m.invalidateSize({pan:false, animate:false}); } catch(e) { try{ m.invalidateSize(false); }catch(_e){} }
      try {
        var c=m.getCenter && m.getCenter();
        if(c && m.setView) m.setView(c, m.getZoom(), {animate:false, reset:true});
      } catch(e) {}
    }
    window.PRX_MODULES.mapTileRecovery.lastReason = reason || 'manual';
    window.PRX_MODULES.mapTileRecovery.lastRun = new Date().toISOString();
  }

  function bindTriggers(){
    document.addEventListener('DOMContentLoaded', function(){ scheduleRecovery('dom-ready'); });
    window.addEventListener('load', function(){ scheduleRecovery('window-load'); });
    window.addEventListener('resize', function(){ scheduleRecovery('resize'); });
    window.addEventListener('orientationchange', function(){ scheduleRecovery('orientation'); });
    document.addEventListener('visibilitychange', function(){ if(!document.hidden) scheduleRecovery('visible'); });
    document.addEventListener('click', function(e){
      var t=e.target && e.target.closest && e.target.closest('#mapBtn,[data-nav="map"],#fitBtn,#detailClose,#poiSheetClose,.nav,.ctl,#bottomNav button');
      if(t) scheduleRecovery('ui-click');
    }, true);
    document.addEventListener('touchend', function(){ scheduleRecovery('touchend'); }, {passive:true});
    // Beobachtet nur Klassenwechsel am Body; keine Inhalts-Mutation, keine Feedbackschleife.
    try{
      var mo=new MutationObserver(function(muts){
        for(var i=0;i<muts.length;i++){
          if(muts[i].attributeName==='class'){ scheduleRecovery('body-class'); break; }
        }
      });
      mo.observe(document.body,{attributes:true,attributeFilter:['class']});
    }catch(e){}
  }

  window.PRX_RECOVER_MAP = function(){ scheduleRecovery('manual'); };
  injectCss();
  captureLeafletMap();
  bindTriggers();
})();
