/* PRX V3.7.7 · Settings Engine
   Repariert die zweite Ebene von Optionen/Einstellungen/Reise:
   - echte Modal-Isolation auch für Detailseiten
   - kein Durchscheinen darunterliegender Inhalte
   - keine vertikale Container-Drift / kein Wegschubsen
   - Cover-weich + horizontaler Lock für Hauptliste -> Detail und zurück
   - erste Einstellungen schreiben in die bereits verwendeten App-Stores. */
(function(){
  'use strict';
  const APP_OPTIONS_KEY='prx.options.v370';
  const APP_SETTINGS_KEY='prx.appSettings.v370';
  const TRIP_KEY='prx.trip.v370';
  const LINE_STYLE_KEY='prx.lineStyle.v377';
  const DEFAULT_OPTIONS={showPins:true,showGPX:true,showKML:true,showPoiContext:true,showGhostPois:true,showHome:true,focusMode:true,autoFit:true,poiHighlights:true,poiWebcams:true,poiSupply:true,poiParking:true,poiMobility:true,hikingOverlay:false};
  const DEFAULT_SETTINGS={mapStyle:'hybrid',snap:'soft',fontScale:'standard',motion:'glide'};
  const DEFAULT_TRIP={start:'2026-06-22',end:'2026-07-05'};
  const $=(id)=>document.getElementById(id);
  const esc=(s)=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  function load(key,def){try{return Object.assign({},def,JSON.parse(localStorage.getItem(key)||'{}'))}catch(e){return Object.assign({},def)}}
  function save(key,obj){try{localStorage.setItem(key,JSON.stringify(obj))}catch(e){}}
  function loadLine(){return load(LINE_STYLE_KEY,{gpx:{color:'#ff3b30',weight:5,opacity:.95},kml:{color:'#007aff',weight:5,opacity:.86},outline:{color:'#ffffff',extraWeight:1,opacity:.55},kmlStyle:'solid'})}
  function saveLine(line){save(LINE_STYLE_KEY,line); document.dispatchEvent(new CustomEvent('prx-line-style-changed',{detail:line})); toast('Linien gespeichert')}
  function lineCtl(group,label,line){const v=line[group]||{};return `<div class="settings-row line-editor"><strong>${esc(label)}</strong><label>Farbe <input type="color" data-line="${group}.color" value="${esc(v.color||'#ffffff')}"></label><label>Stärke <input type="range" min="1" max="12" step="1" data-line="${group}.weight" value="${esc(v.weight||5)}"><span>${esc(v.weight||5)} px</span></label><label>Deckkraft <input type="range" min="0.2" max="1" step="0.05" data-line="${group}.opacity" value="${esc(v.opacity||.9)}"></label></div>`}
  function toast(msg){let t=$('toast'); if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t)} t.textContent=msg; t.classList.remove('hidden'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.add('hidden'),1600)}
  function sheet(id){let el=$(id); if(!el){el=document.createElement('section'); el.id=id; document.body.appendChild(el)} el.className='settings-sheet prx376-sheet hidden'; return el}
  function openModal(el){
    document.querySelectorAll('#optionSheet,#settingsSheet,#tripSheet,#filterSheet').forEach(x=>{ if(x!==el) x.classList.add('hidden') });
    el.classList.remove('hidden');
    el.classList.add('prx-active-modal','prx376-active');
    document.body.classList.add('prx-modal-isolated','prx-modal-lock','prx376-modal-open');
    document.documentElement.classList.add('prx-modal-lock');
    setTimeout(()=>{try{el.scrollTop=0}catch(e){}},0);
  }
  function closeModal(el){
    el.classList.add('hidden'); el.classList.remove('prx-active-modal','prx376-active');
    const any=[...document.querySelectorAll('#optionSheet,#settingsSheet,#tripSheet,#filterSheet')].some(x=>!x.classList.contains('hidden'));
    if(!any){document.body.classList.remove('prx-modal-isolated','prx-modal-lock','prx376-modal-open');document.documentElement.classList.remove('prx-modal-lock')}
  }
  function head(title,id){return `<div class="settings-head prx376-head"><button class="prx376-close" id="${id}">×</button><strong>${esc(title)}</strong><span></span></div>`}
  function row(key,icon,title,sub,value){return `<button class="menu-row prx376-row" data-go="${key}"><span class="prx376-ico">${icon}</span><span class="prx376-txt"><strong>${esc(title)}</strong><small>${esc(sub||'')}</small></span>${value?`<em>${esc(value)}</em>`:''}<b>›</b></button>`}
  function toggle(label,sub,key,obj){const on=obj[key]!==false; return `<label class="switch-row prx376-switch"><span><strong>${esc(label)}</strong><small>${esc(sub||'')}</small></span><input type="checkbox" data-opt="${key}" ${on?'checked':''}></label>`}
  function seg(name,items,current){return `<div class="seg prx376-seg">${items.map(([id,lab])=>`<button data-seg="${name}" data-value="${id}" class="${String(id)===String(current)?'active':''}">${esc(lab)}</button>`).join('')}</div>`}
  function layout(el,title,home){
    el.innerHTML=head(title,el.id+'Close')+`<div class="prx376-pages"><div class="prx376-page prx376-home"><div class="menu-list">${home}</div></div><div class="prx376-page prx376-detail"></div></div>`;
    $(el.id+'Close').onclick=()=>closeModal(el);
    el.querySelectorAll('[data-go]').forEach(b=>{
      b.onclick=()=>showDetail(el,b.dataset.go);
      bindRowSwipe(b,()=>showDetail(el,b.dataset.go));
    });
    bindPageSwipe(el);
  }
  function paint(el,root,title,body){
    const detail=el.querySelector('.prx376-detail');
    detail.innerHTML=`<button class="back-row prx376-back">‹ ${esc(root)}</button><h2>${esc(title)}</h2><div class="settings-stack">${body}</div>`;
    detail.querySelector('.prx376-back').onclick=()=>el.querySelector('.prx376-pages').classList.remove('detail-open');
    el.querySelector('.prx376-pages').classList.add('detail-open');
    bindInputs(el); bindSeg(el); bindLineInputs(el);
  }
  function showDetail(el,key){ if(el.id==='optionSheet') optionDetail(key); else if(el.id==='settingsSheet') settingsDetail(key); else if(el.id==='tripSheet') tripDetail(key); }
  function openOptions(){
    const o=load(APP_OPTIONS_KEY,DEFAULT_OPTIONS);
    const home=[
      row('map','◎','Karteninhalt','Pins, GPX, KML, POI-Kontext', ''),
      row('pois','⌖','POI-Anzeige','Highlights und Funktions-POIs', ''),
      row('lines','〽','Linien & Tracks','GPX/KML Basiswerte', ''),
      row('filters','≡','Filter & Sortierung','Status, Region, Bereiche', ''),
      row('tripview','▦','Reiseansicht','Heute, Später, Tageslisten', ''),
      row('export','⇧','Export & Teilen','Kopieren, Backup, Google Maps', ''),
      row('diagnostics','ⓘ','Diagnose/Test','Version und Datenstand', '')
    ].join('');
    const el=sheet('optionSheet'); layout(el,'Optionen',home); openModal(el);
  }
  function optionDetail(key){
    const el=$('optionSheet'), o=load(APP_OPTIONS_KEY,DEFAULT_OPTIONS); let title='',body='';
    if(key==='map'){title='Karteninhalt';body=[toggle('PR-Pins anzeigen','Alle gefilterten PRs auf der Karte','showPins',o),toggle('GPX-Wanderroute anzeigen','aktive Wanderroute','showGPX',o),toggle('KML-Anfahrt anzeigen','aktive Anfahrt','showKML',o),toggle('POI-Kontext anzeigen','Vorschläge zur aktiven PR','showPoiContext',o),toggle('Ghost-POIs anzeigen','weitere Kontextmarker dezent','showGhostPois',o),toggle('Hotel/Home-Pin anzeigen','Pestana/Homepunkt später','showHome',o),toggle('Fokusmodus','andere PRs abdunkeln','focusMode',o),toggle('Automatisch einpassen','Route/POI in sichtbares Kartenfeld','autoFit',o),toggle('OSM-Hiking Overlay','Waymarked Trails als externe Ebene','hikingOverlay',o)].join('')}
    if(key==='pois'){title='POI-Anzeige';body=[toggle('Highlight-POIs','Sehenswürdigkeiten und echte Besuchsziele','poiHighlights',o),toggle('Webcams','nur Info-Kategorie, kein Highlight','poiWebcams',o),toggle('Versorgung','Tankstellen, WC, Supermärkte','poiSupply',o),toggle('Parken & Startpunkte','Parkplätze und Trailheads','poiParking',o),toggle('Mobilität','Bus, Shuttle, Taxi','poiMobility',o)].join('')+`<div class="settings-note">Funktions-POIs bleiben Kategoriezeilen mit Anzahl; keine Vermischung mit Highlights.</div>`}
    if(key==='lines'){title='Linien & Tracks';const line=loadLine();body=lineCtl('gpx','GPX Wanderroute',line)+lineCtl('kml','KML Anfahrt',line)+`<div class="settings-row line-editor"><strong>KML Linienart</strong>${seg('kmlstyle',[['solid','durchgezogen'],['dash','gestrichelt'],['dot','gepunktet']],line.kmlStyle||'solid')}</div><div class="settings-row line-editor"><strong>Weiße Kontur</strong><label>Zusatzbreite <input type="range" min="0" max="6" step="0.5" data-line="outline.extraWeight" value="${esc(line.outline?.extraWeight??1)}"><span>${esc(line.outline?.extraWeight??1)} px</span></label><label>Deckkraft <input type="range" min="0" max="1" step="0.05" data-line="outline.opacity" value="${esc(line.outline?.opacity??.55)}"></label></div><div class="settings-row"><strong>OSM Hiking Overlay</strong>${toggle('Overlay anzeigen','Waymarked Trails. Editierbare Nachzeichnung später.','hikingOverlay',o)}</div>`}
    if(key==='filters'){title='Filter & Sortierung';body=`<div class="settings-row"><strong>Filter öffnen</strong><small>Status, Region und Hybrid-Slider bleiben im Filterbereich.</small><button id="prx376OpenFilter">Filter öffnen</button></div><div class="settings-row"><strong>Min = Max</strong><small>Einzelwert wird ruhiger angezeigt; kein Doppelgriff bei identischem Wert.</small></div>`}
    if(key==='tripview'){title='Reiseansicht';body=`<div class="settings-row"><strong>Tageslisten</strong><small>Einspaltige Liste. Tagesdetail gleitet von rechts herein.</small></div><div class="settings-row"><strong>Heute / Später</strong><small>Max. 5 Heute, max. 10 Später.</small></div>`}
    if(key==='export'){title='Export & Teilen';body=`<div class="settings-row"><button id="prx376CopyOpt">Optionen als JSON kopieren</button><button id="prx376CopySummary">Kurzinfo kopieren</button></div>`}
    if(key==='diagnostics'){title='Diagnose/Test';body=`<div class="diag-grid"><div><b>Version</b><span>3.7.7</span></div><div><b>PRX Speicher</b><span>${Object.keys(localStorage).filter(k=>k.startsWith('prx.')).length} Keys</span></div><div><b>Modal</b><span>isoliert</span></div><div><b>Navigation</b><span>Cover weich</span></div></div>`}
    paint(el,'Optionen',title,body);
    const f=$('prx376OpenFilter'); if(f) f.onclick=()=>{closeModal(el); setTimeout(()=>$('filterBtn')?.click(),60)};
    const co=$('prx376CopyOpt'); if(co) co.onclick=()=>copy(JSON.stringify(load(APP_OPTIONS_KEY,DEFAULT_OPTIONS),null,2));
    const cs=$('prx376CopySummary'); if(cs) cs.onclick=()=>copy('PR-Explorer V3.7.7 · Optionen/Einstellungen/Reise stabilisiert');
  }
  function openSettings(){
    const s=load(APP_SETTINGS_KEY,DEFAULT_SETTINGS); const mode=localStorage.getItem('prx.detailTextMode.v373')||'off';
    const home=[row('display','◐','Darstellung','Textmodus, Glass, Schrift',mode),row('mapstyle','▧','Kartenstil','OSM, Topo, Satellit, Hybrid',s.mapStyle||'hybrid'),row('gestures','↔','Bedienung & Gesten','Cover weich, Snap, Lock',s.snap||'soft'),row('icons','◈','Icons & Symbole','Größe und Taxonomie',''),row('data','◫','Daten & Speicher','Export und Reset',''),row('admin','⚙','Admin','Archiv, Diagnose, Changelog','')].join('');
    const el=sheet('settingsSheet'); layout(el,'Einstellungen',home); openModal(el);
  }
  function settingsDetail(key){
    const el=$('settingsSheet'), s=load(APP_SETTINGS_KEY,DEFAULT_SETTINGS); let title='',body=''; const detailMode=localStorage.getItem('prx.detailTextMode.v373')||'off';
    if(key==='display'){title='Darstellung';body=`<div class="settings-row"><strong>Detailtext-Testmodus</strong>${seg('detailtext',[['off','Aus'],['short150','150'],['detail280','280'],['both','Beide']],detailMode)}</div><div class="settings-row"><strong>Glass-Stärke</strong>${seg('glass',[['light','Leicht'],['medium','Mittel'],['strong','Stark']],localStorage.getItem('prx.glass.v376')||'medium')}</div><div class="settings-row"><strong>Schriftgröße</strong>${seg('fontscale',[['compact','Kompakt'],['standard','Standard'],['large','Groß']],s.fontScale||'standard')}</div><div class="settings-row"><strong>Reduzierte Bewegung</strong>${seg('reducedmotion',[['off','Aus'],['on','An']],localStorage.getItem('prx.reducedMotion.v376')||'off')}</div>`}
    if(key==='mapstyle'){title='Kartenstil';body=`<div class="settings-row"><strong>Basiskarte</strong>${seg('mapstyle',[['osm','OSM'],['topo','Topo'],['sat','Satellit kräftig'],['hybrid','Satellit-Hybrid']],s.mapStyle||'hybrid')}</div><div class="settings-note">Satellit/Hybrid bleiben ohne globale Blass-/Opacity-Reduktion.</div>`}
    if(key==='gestures'){title='Bedienung & Gesten';body=`<div class="settings-row"><strong>Bewegung</strong>${seg('motion',[['glide','Gleiten'],['normal','Normal'],['fast','Schnell']],localStorage.getItem('prx.motion.v376')||s.motion||'glide')}</div><div class="settings-row"><strong>Snap-Stärke</strong>${seg('snap',[['soft','Weich'],['medium','Mittel'],['firm','Fest']],s.snap||'soft')}</div><div class="settings-row"><strong>Horizontaler Lock</strong><small>Aktiv: bei horizontalem Swipe wird die vertikale Achse stabilisiert. Gilt für Journal, POI, Reise, Optionen, Einstellungen.</small></div><div class="settings-row"><strong>Vertikales Wegschubsen</strong><small>Für Einstellungs-/Options-/Reisedetailseiten blockiert. Nur interner Seiteninhalt scrollt.</small></div>`}
    if(key==='icons'){title='Icons & Symbole';const cur=localStorage.getItem('prx.symbolSet.v377')||'cupertino';body=`<div class="settings-row"><strong>UI-Icongröße</strong>${seg('iconscale',[['0.9','0.90×'],['1','1.00×'],['1.15','1.15×'],['1.3','1.30×'],['1.45','1.45×']],String(localStorage.getItem('prx.iconScale.v376')||'1.15'))}</div><div class="settings-row"><strong>Symbolset</strong>${seg('symbolset',[['cupertino','Cupertino klar'],['outdoor','Outdoor zweifarbig'],['minimal','Minimal hart']],cur)}</div><div class="prx376-icon-grid prx377-symbol-grid"><button data-symbol="highlight">⌖<small>Highlight</small></button><button data-symbol="webcam">▣<small>Webcam</small></button><button data-symbol="fuel">⛽<small>Tanken</small></button><button data-symbol="toilet">WC<small>Toilette</small></button><button data-symbol="parking">Ⓟ<small>Parken</small></button><button data-symbol="trail">⛰<small>Route</small></button></div><small>Auswahl speichert die Symbol-Taxonomie als Testwert; finale SVG-Sets später.</small>`}
    if(key==='data'){title='Daten & Speicher';body=`<div class="settings-row"><button id="prx376CopyLocal">Lokale PRX-Daten kopieren</button><button id="prx376ClearPoi">POI-Zustände löschen</button><button id="prx376ClearStatus">Statusdaten löschen</button><small>Rohdaten bleiben unverändert.</small></div>`}
    if(key==='admin'){title='Admin';body=`<div class="diag-grid"><div><b>Version</b><span>3.7.7</span></div><div><b>PRX Keys</b><span>${Object.keys(localStorage).filter(k=>k.startsWith('prx.')).length}</span></div><div><b>Upload</b><span>Einzeldateien</span></div><div><b>Engine</b><span>Settings</span></div></div><div class="settings-row"><strong>Entscheidungsarchiv</strong><small>Markdown/JSON bleibt in docs/interviews verfügbar.</small></div>`}
    paint(el,'Einstellungen',title,body);
    const cl=$('prx376CopyLocal'); if(cl) cl.onclick=()=>copy(JSON.stringify(snapshot(),null,2));
    const cp=$('prx376ClearPoi'); if(cp) cp.onclick=()=>{localStorage.removeItem('prx.poiState.v360');toast('POI-Zustände gelöscht')};
    const cs=$('prx376ClearStatus'); if(cs) cs.onclick=()=>{localStorage.removeItem('prx.status.v3511');toast('Statusdaten gelöscht')};
  }
  function openTrip(){
    const tr=load(TRIP_KEY,DEFAULT_TRIP), days=makeDays(tr.start,tr.end);
    const home=`<div class="settings-row prx376-date-block"><strong>Reisezeitraum</strong><div class="date-row"><label>Start <input type="date" id="prx376TripStart" value="${esc(tr.start)}"></label><label>Ende <input type="date" id="prx376TripEnd" value="${esc(tr.end)}"></label></div><small>${days.length} Reisetage</small></div><div class="trip-days prx376-day-list">${days.map((d,i)=>`<button class="day-card prx376-day-card" data-go="day-${i}"><strong>Tag ${i+1}</strong><span>${d.toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'})}</span><small>Tagesdetail öffnen</small></button>`).join('')}</div><div class="menu-list">${row('today','●','Heute-Auswahl','max. 5 POIs','')}${row('later','○','Später-Liste','max. 10 POIs','')}${row('marked','☆','Gemerkte PRs / POIs','Sammlung','')}</div>`;
    const el=sheet('tripSheet'); layout(el,'Reise',home); openModal(el); bindTripDates();
  }
  function tripDetail(key){
    const el=$('tripSheet'), tr=load(TRIP_KEY,DEFAULT_TRIP), days=makeDays(tr.start,tr.end); let title='Reise',body='';
    if(key.startsWith('day-')){const i=Number(key.split('-')[1]);const d=days[i];title='Tag '+(i+1);body=`<div class="settings-row"><strong>${d?d.toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'}):'Tag'}</strong><small>PR, POIs und Notizen werden später hier zugeordnet.</small></div><div class="settings-row"><strong>Geplant</strong><small>Keine automatische Tagesplanung.</small><button>Heute-Liste anzeigen</button><button>Google Maps vorbereiten</button></div>`}
    if(key==='today'){title='Heute-Auswahl';body=`<div class="settings-row"><strong>Heute-POIs</strong><small>Maximal 5. Google Maps übernimmt Sortierung.</small><button>Google Maps vorbereiten</button></div>`}
    if(key==='later'){title='Später-Liste';body=`<div class="settings-row"><strong>Für später gemerkt</strong><small>Maximal 10 POIs. Wird später wieder vorgeschlagen.</small></div>`}
    if(key==='marked'){title='Gemerkte PRs / POIs';body=`<div class="settings-row"><strong>Sammlung</strong><small>Favoriten, Später, Erledigt und Ausblenden werden hier zusammengeführt.</small></div>`}
    paint(el,'Reise',title,body);
  }
  function bindTripDates(){const st=$('prx376TripStart'),en=$('prx376TripEnd'); if(st) st.onchange=()=>{const tr=load(TRIP_KEY,DEFAULT_TRIP);tr.start=st.value;save(TRIP_KEY,tr);openTrip()}; if(en) en.onchange=()=>{const tr=load(TRIP_KEY,DEFAULT_TRIP);tr.end=en.value;save(TRIP_KEY,tr);openTrip()}}
  function bindInputs(el){
    el.querySelectorAll('input[data-opt]').forEach(inp=>inp.onchange=()=>{const o=load(APP_OPTIONS_KEY,DEFAULT_OPTIONS);o[inp.dataset.opt]=inp.checked;save(APP_OPTIONS_KEY,o);toast('Option gespeichert')});
  }

  function bindLineInputs(el){
    el.querySelectorAll('[data-line]').forEach(inp=>{inp.oninput=inp.onchange=()=>{const line=loadLine();const [g,k]=inp.dataset.line.split('.');line[g]=line[g]||{};let val=inp.value;if(inp.type==='range')val=Number(val);line[g][k]=val;const span=inp.parentElement?.querySelector('span'); if(span&&inp.type==='range')span.textContent=val+' px';saveLine(line)}});
  }
  function bindSeg(el){
    el.querySelectorAll('[data-seg]').forEach(btn=>btn.onclick=()=>{
      const name=btn.dataset.seg, val=btn.dataset.value; const s=load(APP_SETTINGS_KEY,DEFAULT_SETTINGS);
      if(name==='mapstyle'){s.mapStyle=val; save(APP_SETTINGS_KEY,s); toast('Kartenstil gespeichert')}
      if(name==='kmlstyle'){const line=loadLine();line.kmlStyle=val;saveLine(line)}
      if(name==='symbolset'){localStorage.setItem('prx.symbolSet.v377',val); document.documentElement.dataset.symbolset=val; toast('Symbolset '+val)}
      if(name==='snap'){s.snap=val; save(APP_SETTINGS_KEY,s); document.documentElement.dataset.snap=val; toast('Snap '+val)}
      if(name==='motion'){s.motion=val; save(APP_SETTINGS_KEY,s); localStorage.setItem('prx.motion.v376',val); document.documentElement.dataset.motion=val; toast('Bewegung '+val)}
      if(name==='detailtext'){localStorage.setItem('prx.detailTextMode.v373',val); toast('Textmodus '+val)}
      if(name==='glass'){localStorage.setItem('prx.glass.v376',val); document.documentElement.dataset.glass=val; toast('Glass '+val)}
      if(name==='fontscale'){s.fontScale=val; save(APP_SETTINGS_KEY,s); document.documentElement.dataset.fontscale=val; toast('Schrift '+val)}
      if(name==='reducedmotion'){localStorage.setItem('prx.reducedMotion.v376',val); document.documentElement.dataset.reducedMotion=val; toast('Bewegung reduziert '+val)}
      if(name==='iconscale'){localStorage.setItem('prx.iconScale.v376',val); document.documentElement.style.setProperty('--ui-icon-scale',val); toast('Icon '+val+'×')}
      const activeDetail=el.querySelector('.prx376-detail h2')?.textContent||'';
      if(el.id==='settingsSheet'){
        const map={Darstellung:'display',Kartenstil:'mapstyle','Bedienung & Gesten':'gestures','Icons & Symbole':'icons','Daten & Speicher':'data',Admin:'admin'};
        setTimeout(()=>settingsDetail(map[activeDetail]||'display'),0);
      }
    });
  }
  function bindRowSwipe(el,open){let sx=0,sy=0,dx=0,mode=null,drag=false; el.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;dx=0;mode=null;drag=true;el.classList.add('prx376-drag-row');try{el.setPointerCapture(e.pointerId)}catch(_){}}); el.addEventListener('pointermove',e=>{if(!drag)return;dx=e.clientX-sx;const dy=e.clientY-sy;if(!mode&&Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)*1.15)mode='h'; if(mode==='h'&&dx<0){e.preventDefault();el.style.setProperty('--row-dx',Math.max(dx,-96)+'px')}}); function end(){if(!drag)return;drag=false;el.classList.remove('prx376-drag-row');el.style.removeProperty('--row-dx');if(mode==='h'&&dx<-64)open()} el.addEventListener('pointerup',end); el.addEventListener('pointercancel',end);}
  function bindPageSwipe(el){let sx=0,sy=0,dx=0,mode=null,drag=false; const pages=()=>el.querySelector('.prx376-pages'); el.addEventListener('pointerdown',e=>{if(!pages()?.classList.contains('detail-open'))return; sx=e.clientX; sy=e.clientY; dx=0; mode=null; drag=true; el.classList.add('prx376-page-drag');}); el.addEventListener('pointermove',e=>{if(!drag)return; dx=e.clientX-sx; const dy=e.clientY-sy; if(!mode&&Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)*1.15)mode='h'; if(mode==='h'&&dx>0){e.preventDefault(); el.style.setProperty('--prx376-back-x',Math.min(dx,160)+'px')}}); function end(){if(!drag)return; drag=false; el.classList.remove('prx376-page-drag'); el.style.removeProperty('--prx376-back-x'); if(mode==='h'&&dx>82) pages()?.classList.remove('detail-open')} el.addEventListener('pointerup',end); el.addEventListener('pointercancel',end);}
  function makeDays(start,end){const a=new Date(start+'T00:00:00'),b=new Date(end+'T00:00:00'); if(!Number.isFinite(+a)||!Number.isFinite(+b)||b<a)return[]; const out=[]; for(let d=new Date(a);d<=b;d.setDate(d.getDate()+1))out.push(new Date(d)); return out}
  function copy(txt){try{navigator.clipboard.writeText(txt);toast('Kopiert')}catch(e){toast('Kopieren nicht möglich')}}
  function snapshot(){return{options:load(APP_OPTIONS_KEY,DEFAULT_OPTIONS),settings:load(APP_SETTINGS_KEY,DEFAULT_SETTINGS),trip:load(TRIP_KEY,DEFAULT_TRIP),detailText:localStorage.getItem('prx.detailTextMode.v373')||'off'}}
  function applyInitial(){const s=load(APP_SETTINGS_KEY,DEFAULT_SETTINGS);document.documentElement.dataset.snap=s.snap||'soft';document.documentElement.dataset.motion=s.motion||localStorage.getItem('prx.motion.v376')||'glide';document.documentElement.dataset.fontscale=s.fontScale||'standard';document.documentElement.dataset.glass=localStorage.getItem('prx.glass.v376')||'medium';document.documentElement.style.setProperty('--ui-icon-scale',localStorage.getItem('prx.iconScale.v376')||'1.15')}
  function attach(){applyInitial(); const o=$('optionBtn'), set=$('settingsBtn'); if(o)o.onclick=(e)=>{e.preventDefault();openOptions()}; if(set)set.onclick=(e)=>{e.preventDefault();openSettings()}; document.querySelectorAll('.nav').forEach(n=>{if(n.dataset.nav==='trip')n.onclick=(e)=>{e.preventDefault();openTrip()}});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach); else attach();
  setTimeout(attach,650); setTimeout(attach,1300);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('#optionSheet,#settingsSheet,#tripSheet,#filterSheet').forEach(closeModal)});
  document.addEventListener('touchmove',function(e){
    const active=document.querySelector('.prx376-active:not(.hidden)'); if(!active)return;
    if(e.target.closest('.prx376-page,.prx376-detail,.prx376-home,.settings-stack,.menu-list,.trip-days,.filter-block'))return;
    e.preventDefault();
  },{passive:false,capture:true});
})();
