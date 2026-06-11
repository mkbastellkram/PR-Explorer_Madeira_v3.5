# PRX V3.8.7 · MAP TILE RECOVERY

Änderungen:
- Leaflet-Kartencontainer defensiv stabilisiert.
- Neues Modul `prx-v387-map-tile-recovery.js` ergänzt.
- Leaflet-Map wird beim Erzeugen global als `window.PRX_LEAFLET_MAP` referenziert, ohne die App-Architektur zu ändern.
- `invalidateSize()` wird nach Karten-/UI-Zustandswechseln mehrfach verzögert ausgeführt.
- Kartencontainer `#map` und `.world` werden auf volle Viewportgröße fixiert.
- Tile-Versatz nach Modal-/Map-/Detailwechseln wird abgefangen.
- Keine Änderung an Daten, POIs, GPX/KML oder OSM-Logik.

Upload: nur Einzeldateien, iPhone-Upload reicht.
