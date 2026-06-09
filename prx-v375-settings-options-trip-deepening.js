/* PRX V3.7.5 · Settings / Options / Trip Deepening
   Baut auf V3.7.4 Modal Isolation auf: keine neue Architektur, sondern zweite Ebenen
   innerhalb der isolierten Rubriken Optionen, Einstellungen und Reise. */
(function(){
  'use strict';
  const $ = (id)=>document.getElementById(id);
  const STORE_OPT='prx.options.v375';
  const STORE_SET='prx.settings.v375';
  const STORE_TRIP='prx.trip.v375';
  const DEFAULT_OPTIONS={pins:true,gpx:true,kml:true,poiContext:true,ghostPois:true,home:true,focus:true,autoFit:true,poiHighlights:true,poiWebcams:true,poiSupply:true,poiParking:true,poiMobility:true,hikingOverlay:true,filterStatus:true,filterRegion:true,shareSummary:true,diagnostics:true};
  const DEFAULT_SETTINGS={mapStyle:'hybrid',snap:'soft',motion:'glide',iconScale:1.15,detailText:'off',theme:'darkGlass',fontSet:'system'};
  const DEFAULT_TRIP={start:'2026-06-22',end:'2026-07-05'};
  function load(key,def){try{return Object.assign({},def,JSON.parse(localStorage.getItem(key)||'{}'))}catch(e){return Object.assign({},def)}}
  function save(key,obj){try{localStorage.setItem(key,JSON.stringify(obj))}catch(e){}}
  function escape(s){return String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[m]))}
  function toast(s){let t=$('toast'); if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t)} t.textContent=s; t.classList.remove('hidden'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.add('hidden'),1500)}
  function sheet(id, cls){let el=$(id); if(!el){el=document.createElement('section'); el.id=id; el.className='settings-sheet '+(cls||''); document.body.appendChild(el)} return el}
  function closeSheet(id){const el=$(id); if(el) el.classList.add('hidden')}
  function head(title,closeId){return `<div class="settings-head prx375-head"><button id="${closeId}" class="prx375-x" aria-label="Schließen">×</button><strong>${escape(title)}</strong><span class="prx375-head-spacer"></span></div>`}
  function row(id, icon, title, sub, value){return `<button class="menu-row prx375-row" data-go="${id}"><span class="prx375-row-icon">${icon}</span><span class="prx375-row-text"><strong>${escape(title)}</strong><small>${escape(sub||'')}</small></span>${value?`<em>${escape(value)}</em>`:''}<b>›</b></button>`}
  function toggle(label, key, obj, store){const checked=obj[key]!==false;return `<label class="switch-row prx375-switch"><span><strong>${escape(label)}</strong></span><input type="checkbox" data-store="${store}" data-key="${key}" ${checked?'checked':''}></label>`}
  function seg(items,current,attr){return `<div class="seg prx375-seg">${items.map(([id,lab])=>`<button data-${attr}="${id}" class="${id===current?'active':''}">${escape(lab)}</button>`).join('')}</div>`}
  function layout(el,title,homeHtml,detailTitle,detailHtml){
    el.innerHTML=head(title,el.id+'Close')+`<div class="prx375-pages"><div class="prx375-page prx375-home"><div class="menu-list">${homeHtml}</div></div><div class="prx375-page prx375-detail">${detailTitle?`<button class="back-row prx375-back">‹ ${escape(title)}</button><h2>${escape(detailTitle)}</h2>`:''}<div class="settings-stack">${detailHtml||''}</div></div></div>`;
    $(el.id+'Close').onclick=()=>el.classList.add('hidden');
    const pages=el.querySelector('.prx375-pages');
    el.querySelectorAll('[data-go]').forEach(btn=>btn.onclick=()=>renderDetail(el,btn.dataset.go));
    const back=el.querySelector('.prx375-back'); if(back) back.onclick=()=>pages.classList.remove('detail-open');
  }
  function openSheet(el){el.classList.remove('hidden'); el.classList.add('prx375-sheet'); setTimeout(()=>{try{el.scrollTop=0}catch(e){}},0)}
  function renderDetail(el, key){
    if(el.id==='optionSheet') renderOptionDetail(key);
    else if(el.id==='settingsSheet') renderSettingsDetail(key);
    else if(el.id==='tripSheet') renderTripDetail(key);
  }
  function bindCommon(el){
    el.querySelectorAll('input[data-key]').forEach(inp=>{
      inp.onchange=()=>{const store=inp.dataset.store==='settings'?STORE_SET:STORE_OPT; const def=store===STORE_SET?DEFAULT_SETTINGS:DEFAULT_OPTIONS; const obj=load(store,def); obj[inp.dataset.key]=inp.checked; save(store,obj); toast('Gespeichert')};
    });
  }
  function openOptions375(){
    const opt=load(STORE_OPT,DEFAULT_OPTIONS); const el=sheet('optionSheet','prx375-options');
    const home=[
      row('map','◎','Karteninhalt','Pins, GPX, KML, POI-Kontext',''),
      row('pois','⌖','POI-Anzeige','Highlights, Webcams, Versorgung, Parken',''),
      row('lines','〽','Linien & Tracks','GPX/KML Darstellung vorbereitet',''),
      row('filters','≡','Filter & Sortierung','Region, Status, Hybrid-Slider',''),
      row('tripview','▦','Reiseansicht','Heute, Später, Tageslisten',''),
      row('export','⇧','Export & Teilen','Kurzlisten, JSON, Google Maps',''),
      row('diagnostics','ⓘ','Diagnose/Test','Version, Datenstand, Status','')
    ].join('');
    layout(el,'Optionen',home,'',''); openSheet(el); renderOptionDetail('map'); el.querySelector('.prx375-pages').classList.remove('detail-open');
  }
  function renderOptionDetail(key){
    const el=sheet('optionSheet'); const opt=load(STORE_OPT,DEFAULT_OPTIONS); let title='', body='';
    if(key==='map'){title='Karteninhalt'; body=[toggle('PR-Pins anzeigen','pins',opt,'options'),toggle('GPX-Wanderroute anzeigen','gpx',opt,'options'),toggle('KML-Anfahrt anzeigen','kml',opt,'options'),toggle('POI-Kontext anzeigen','poiContext',opt,'options'),toggle('Ghost-POIs anzeigen','ghostPois',opt,'options'),toggle('Hotel/Home-Pin anzeigen','home',opt,'options'),toggle('Fokusmodus aktivieren','focus',opt,'options'),toggle('Automatisch einpassen','autoFit',opt,'options'),toggle('OSM-Hiking Overlay anzeigen','hikingOverlay',opt,'options')].join('')+`<div class="settings-note">OSM-Hiking-Nachzeichnung bleibt vorbereitet, aber noch nicht als editierbare Liniengeometrie umgesetzt.</div>`}
    if(key==='pois'){title='POI-Anzeige'; body=[toggle('Highlight-POIs / Sehenswürdigkeiten','poiHighlights',opt,'options'),toggle('Webcams als Info-Kategorie','poiWebcams',opt,'options'),toggle('Versorgung: Tankstellen, WC, Supermarkt','poiSupply',opt,'options'),toggle('Parken & Startpunkte','poiParking',opt,'options'),toggle('Mobilität: Bus, Shuttle, Taxi','poiMobility',opt,'options')].join('')+`<div class="settings-note">Funktions-POIs erscheinen nur als Kategoriezeilen mit Anzahl, nicht als Highlights.</div>`}
    if(key==='lines'){title='Linien & Tracks'; body=`<div class="settings-row"><strong>GPX Wanderroute</strong><div class="prx375-line-preview gpx"></div><small>Farbe rot, Stärke 5 px, weiße Kontur vorbereitet.</small></div><div class="settings-row"><strong>KML Anfahrt</strong><div class="prx375-line-preview kml"></div><small>Farbe blau, durchgezogen, Stärke 5 px, Kontur vorbereitet.</small></div><div class="settings-row"><strong>OSM Hiking</strong><small>Als Overlay schaltbar. Editierbare Nachzeichnung folgt später separat.</small></div>`}
    if(key==='filters'){title='Filter & Sortierung'; body=[toggle('Statusfilter aktiv','filterStatus',opt,'options'),toggle('Regionfilter aktiv','filterRegion',opt,'options')].join('')+`<div class="settings-row"><strong>Hybrid-Slider</strong><small>Echte PR-Datenwerte als Rastpunkte. Bei min=max wird ein Einzelwert angezeigt.</small></div>`}
    if(key==='tripview'){title='Reiseansicht'; body=`<div class="settings-row"><strong>Tageslisten</strong><small>Einspaltige Tagesliste, Tagesdetail gleitet von rechts herein.</small></div><div class="settings-row"><strong>Heute / Später</strong><small>POI-Auswahl: maximal 5 Heute, maximal 10 Später.</small></div>`}
    if(key==='export'){title='Export & Teilen'; body=[toggle('Kurzliste kopieren','shareSummary',opt,'options')].join('')+`<div class="settings-row"><button id="prx375CopySummary">App-Zusammenfassung kopieren</button><button id="prx375CopyOptions">Optionen als JSON kopieren</button></div>`}
    if(key==='diagnostics'){title='Diagnose/Test'; body=[toggle('Diagnosewerte anzeigen','diagnostics',opt,'options')].join('')+`<div class="diag-grid"><div><b>Version</b><span>3.7.5</span></div><div><b>Speicher</b><span>${Object.keys(localStorage).filter(k=>k.startsWith('prx.')).length} PRX Keys</span></div></div>`}
    paintDetail(el,'Optionen',title,body); bindCommon(el); const cs=$('prx375CopySummary'); if(cs) cs.onclick=()=>copyText('PR-Explorer Madeira V3.7.5 · Optionen/Einstellungen/Reise vertieft'); const co=$('prx375CopyOptions'); if(co) co.onclick=()=>copyText(JSON.stringify(load(STORE_OPT,DEFAULT_OPTIONS),null,2));
  }
  function openSettings375(){
    const s=load(STORE_SET,DEFAULT_SETTINGS); const el=sheet('settingsSheet','prx375-settings');
    const home=[row('display','◐','Darstellung','Theme, Schrift, Textmodus',''),row('mapstyle','▧','Kartenstil','OSM, Topo, Satellit, Hybrid',s.mapStyle),row('gestures','↔','Bedienung & Gesten','Cover weich, horizontaler Lock',s.snap),row('icons','◈','Icons & Symbole','Größe, App-Icon, Taxonomie',String(s.iconScale)+'×'),row('data','◫','Daten & Speicher','LocalStorage, Export, Reset',''),row('admin','⚙','Admin','Archiv, Diagnose, Changelog','')].join('');
    layout(el,'Einstellungen',home,'',''); openSheet(el); renderSettingsDetail('display'); el.querySelector('.prx375-pages').classList.remove('detail-open');
  }
  function renderSettingsDetail(key){
    const el=sheet('settingsSheet'); const s=load(STORE_SET,DEFAULT_SETTINGS); let title='',body='';
    if(key==='display'){title='Darstellung'; body=`<div class="settings-row"><strong>Theme</strong>${seg([['darkGlass','Dark Glass'],['lowContrast','Low Contrast'],['satellite','Satellit Fokus']],s.theme,'theme')}</div><div class="settings-row"><strong>Detailtext-Testmodus</strong>${seg([['off','Aus'],['short150','150'],['detail280','280'],['both','Beide']],s.detailText,'detailtext')}</div><div class="settings-row"><strong>Designgrößen</strong><small>Titel 22–30 px · Abschnitt 18–20 px · Kartenkopf 17 px · Meta 12–13 px · Button 15–17 px.</small></div>`}
    if(key==='mapstyle'){title='Kartenstil'; body=`<div class="settings-row"><strong>Basiskarte</strong>${seg([['osm','OSM'],['topo','Topo'],['sat','Satellit'],['hybrid','Sat-Hybrid']],s.mapStyle,'mapstyle')}</div><div class="settings-note">Satellit-Hybrid bleibt kräftiger; keine globale Blass-/Opacity-Reduktion.</div>`}
    if(key==='gestures'){title='Bedienung & Gesten'; body=`<div class="settings-row"><strong>Bewegung</strong>${seg([['glide','Gleiten'],['normal','Normal'],['fast','Schnell']],s.motion,'motion')}</div><div class="settings-row"><strong>Snap-Stärke</strong>${seg([['soft','Weich'],['medium','Mittel'],['firm','Fest']],s.snap,'snap')}</div><div class="settings-row"><strong>Cover weich + horizontaler Lock</strong><small>Gilt für Journal, POI, Reise, Optionen, Einstellungen. Sobald horizontal erkannt, wird vertikal stabilisiert.</small></div>`}
    if(key==='icons'){title='Icons & Symbole'; body=`<div class="settings-row"><strong>UI-Icongröße</strong>${seg([['0.9','0.90×'],['1','1.00×'],['1.15','1.15×'],['1.3','1.30×'],['1.45','1.45×']],String(s.iconScale),'iconscale')}</div><div class="prx375-icon-grid"><div>⌖<small>Highlight</small></div><div>📷<small>Webcam</small></div><div>⛽<small>Tanken</small></div><div>WC<small>Toilette</small></div><div>Ⓟ<small>Parken</small></div><div>⛰<small>Route</small></div></div><div class="settings-row"><strong>App-Icon</strong><small>Vorschau vorbereitet. iOS Homescreen ggf. neu hinzufügen.</small></div>`}
    if(key==='data'){title='Daten & Speicher'; body=`<div class="settings-row"><button id="prx375CopyLocal">Lokale PRX-Daten kopieren</button><button id="prx375ClearPoi">POI-Zustände löschen</button><button id="prx375ClearStatus">Statusdaten löschen</button><small>Keine Rohdaten werden gelöscht.</small></div>`}
    if(key==='admin'){title='Admin'; body=`<div class="diag-grid"><div><b>Version</b><span>3.7.5</span></div><div><b>Modus</b><span>Deepening</span></div><div><b>Upload</b><span>Einzeldateien</span></div><div><b>PRX Keys</b><span>${Object.keys(localStorage).filter(k=>k.startsWith('prx.')).length}</span></div></div><div class="settings-row"><strong>Entscheidungsarchiv</strong><small>Markdown/JSON bleibt als Adminarchiv vorgesehen.</small></div>`}
    paintDetail(el,'Einstellungen',title,body); bindSettingsDetail(el,key);
  }
  function paintDetail(el,root,title,body){
    const pages=el.querySelector('.prx375-pages')||document.createElement('div');
    if(!el.querySelector('.prx375-pages')) el.innerHTML=head(root,el.id+'Close')+`<div class="prx375-pages"><div></div><div class="prx375-page prx375-detail"></div></div>`;
    const d=el.querySelector('.prx375-detail');
    d.innerHTML=`<button class="back-row prx375-back">‹ ${escape(root)}</button><h2>${escape(title)}</h2><div class="settings-stack">${body}</div>`;
    d.querySelector('.prx375-back').onclick=()=>el.querySelector('.prx375-pages').classList.remove('detail-open');
    el.querySelector('.prx375-pages').classList.add('detail-open');
  }
  function bindSettingsDetail(el,key){
    el.querySelectorAll('[data-mapstyle]').forEach(b=>b.onclick=()=>{const s=load(STORE_SET,DEFAULT_SETTINGS); s.mapStyle=b.dataset.mapstyle; save(STORE_SET,s); try{document.querySelector(`[data-mapstyle="${b.dataset.mapstyle}"]`).classList.add('active')}catch(e){} toast('Kartenstil gespeichert')});
    el.querySelectorAll('[data-snap]').forEach(b=>b.onclick=()=>{const s=load(STORE_SET,DEFAULT_SETTINGS); s.snap=b.dataset.snap; save(STORE_SET,s); document.documentElement.dataset.snap=b.dataset.snap; renderSettingsDetail('gestures')});
    el.querySelectorAll('[data-motion]').forEach(b=>b.onclick=()=>{const s=load(STORE_SET,DEFAULT_SETTINGS); s.motion=b.dataset.motion; save(STORE_SET,s); document.documentElement.dataset.motion=b.dataset.motion; renderSettingsDetail('gestures')});
    el.querySelectorAll('[data-detailtext]').forEach(b=>b.onclick=()=>{const s=load(STORE_SET,DEFAULT_SETTINGS); s.detailText=b.dataset.detailtext; save(STORE_SET,s); localStorage.setItem('prx.detailTextMode.v373',b.dataset.detailtext); renderSettingsDetail('display')});
    el.querySelectorAll('[data-iconscale]').forEach(b=>b.onclick=()=>{const s=load(STORE_SET,DEFAULT_SETTINGS); s.iconScale=Number(b.dataset.iconscale); save(STORE_SET,s); document.documentElement.style.setProperty('--ui-icon-scale',String(s.iconScale)); renderSettingsDetail('icons')});
    const cl=$('prx375CopyLocal'); if(cl) cl.onclick=()=>copyText(JSON.stringify({options:load(STORE_OPT,DEFAULT_OPTIONS),settings:load(STORE_SET,DEFAULT_SETTINGS),trip:load(STORE_TRIP,DEFAULT_TRIP)},null,2));
    const cp=$('prx375ClearPoi'); if(cp) cp.onclick=()=>{localStorage.removeItem('prx.poiState.v360'); toast('POI-Zustände gelöscht')};
    const cs=$('prx375ClearStatus'); if(cs) cs.onclick=()=>{localStorage.removeItem('prx.status.v3511'); toast('Statusdaten gelöscht')};
  }
  function openTrip375(){
    const el=sheet('tripSheet','prx375-trip'); const tr=load(STORE_TRIP,DEFAULT_TRIP); const days=makeDays(tr.start,tr.end); const home=`<div class="settings-row prx375-date-block"><strong>Reisezeitraum</strong><div class="date-row"><label>Start <input type="date" id="prx375TripStart" value="${escape(tr.start)}"></label><label>Ende <input type="date" id="prx375TripEnd" value="${escape(tr.end)}"></label></div><small>${days.length} Reisetage</small></div><div class="trip-days prx375-day-list">${days.map((d,i)=>`<button class="day-card prx375-day-card" data-go="day-${i}"><strong>Tag ${i+1}</strong><span>${d.toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'})}</span><small>Tagesdetail öffnen</small></button>`).join('')}</div><div class="menu-list"><button class="menu-row" data-go="today"><strong>Heute-Auswahl</strong><small>max. 5 POIs</small><b>›</b></button><button class="menu-row" data-go="later"><strong>Später-Liste</strong><small>max. 10 POIs</small><b>›</b></button><button class="menu-row" data-go="marked"><strong>Gemerkte PRs / POIs</strong><small>Sammlung vorbereiten</small><b>›</b></button></div>`;
    layout(el,'Reise',home,'',''); openSheet(el); bindTrip(el); el.querySelector('.prx375-pages').classList.remove('detail-open');
  }
  function renderTripDetail(key){
    const el=sheet('tripSheet'); const tr=load(STORE_TRIP,DEFAULT_TRIP); const days=makeDays(tr.start,tr.end); let title='Tagesdetail',body='';
    if(key.startsWith('day-')){const i=Number(key.split('-')[1]); const d=days[i]; title='Tag '+(i+1); body=`<div class="settings-row"><strong>${d?d.toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'}):'Tag'}</strong><small>PR, POIs und Notizen werden später hier zugeordnet.</small></div><div class="settings-row"><strong>Geplant</strong><small>Keine feste Tagesplanung. Auswahl erfolgt weiterhin manuell.</small></div><div class="settings-row"><button>Heute-Liste anzeigen</button><button>Google Maps vorbereiten</button></div>`}
    if(key==='today'){title='Heute-Auswahl'; body=`<div class="settings-row"><strong>Heute-POIs</strong><small>Maximal 5. Google Maps übernimmt Sortierung und Navigation.</small><button id="prx375TodayMaps">Google Maps vorbereiten</button></div>`}
    if(key==='later'){title='Später-Liste'; body=`<div class="settings-row"><strong>Für später gemerkt</strong><small>Maximal 10 POIs. Wird bei passenden KML-Anfahrten erneut vorgeschlagen.</small></div>`}
    if(key==='marked'){title='Gemerkte PRs / POIs'; body=`<div class="settings-row"><strong>Sammlung</strong><small>Favoriten, Später, Erledigt und Ausblenden werden hier später zusammengeführt.</small></div>`}
    paintDetail(el,'Reise',title,body); const gm=$('prx375TodayMaps'); if(gm) gm.onclick=()=>toast('Google Maps Übergabe vorbereitet');
  }
  function bindTrip(el){
    const st=$('prx375TripStart'), en=$('prx375TripEnd');
    if(st) st.onchange=()=>{const tr=load(STORE_TRIP,DEFAULT_TRIP); tr.start=st.value; save(STORE_TRIP,tr); openTrip375()};
    if(en) en.onchange=()=>{const tr=load(STORE_TRIP,DEFAULT_TRIP); tr.end=en.value; save(STORE_TRIP,tr); openTrip375()};
  }
  function makeDays(start,end){const a=new Date(start+'T00:00:00'),b=new Date(end+'T00:00:00'); if(!Number.isFinite(+a)||!Number.isFinite(+b)||b<a)return[]; const out=[]; for(let d=new Date(a);d<=b;d.setDate(d.getDate()+1)) out.push(new Date(d)); return out}
  function copyText(txt){try{navigator.clipboard.writeText(txt);toast('Kopiert')}catch(e){toast('Kopieren nicht möglich')}}
  function attach(){
    document.documentElement.dataset.motion=load(STORE_SET,DEFAULT_SETTINGS).motion;
    document.documentElement.dataset.snap=load(STORE_SET,DEFAULT_SETTINGS).snap;
    const optionBtn=$('optionBtn'), settingsBtn=$('settingsBtn');
    if(optionBtn) optionBtn.onclick=openOptions375;
    if(settingsBtn) settingsBtn.onclick=openSettings375;
    document.querySelectorAll('.nav').forEach(n=>{ if(n.dataset.nav==='trip') n.onclick=(e)=>{e.preventDefault();openTrip375()} });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',attach); else attach();
  setTimeout(attach,500);
})();
