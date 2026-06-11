/* PRX V3.8.8 · Map Bootstrap Capture
   Zweck: Leaflet-Map beim Erzeugen erfassen, ohne CSS/Layout zu verändern. */
(function(){
  'use strict';
  var VERSION='3.8.8';
  window.PRX_APP_VERSION=VERSION;
  window.PRX_MODULES=window.PRX_MODULES||{};
  window.PRX_MODULES.mapBootstrap={version:VERSION,loaded:true,captured:false};
  function patch(){
    if(!window.L || !window.L.map || window.L.__prx388MapPatched) return false;
    var original=window.L.map;
    window.L.map=function(){
      var map=original.apply(this,arguments);
      window.PRX_LEAFLET_MAP=map;
      window.PRX_MODULES.mapBootstrap.captured=true;
      setTimeout(function(){try{map.invalidateSize({pan:false,animate:false});}catch(e){}},0);
      setTimeout(function(){try{map.invalidateSize({pan:false,animate:false});}catch(e){}},180);
      setTimeout(function(){try{map.invalidateSize({pan:false,animate:false});}catch(e){}},650);
      return map;
    };
    window.L.__prx388MapPatched=true;
    return true;
  }
  patch();
})();
