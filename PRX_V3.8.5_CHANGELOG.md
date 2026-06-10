# PR-Explorer Madeira V3.8.5 MODULE INTAKE & START DIAGNOSIS

## Geändert

- V3.8.5 defensiv auf Basis des sichtbaren V3.8.0-GitHub-Bestands aufgebaut.
- Vollständige App-Shell in `index.html` beibehalten.
- Doppelten Leaflet-CSS-Import entfernt.
- `prx-v377-interactive-controls-status-booking.js` wieder eingebunden.
- Script-Reihenfolge stabilisiert:
  - `data.js`
  - `poi-data.js`
  - `app.js`
  - Patchmodule `prx-v372` bis `prx-v378`
  - danach `prx-v380-osm-live-poi.js`
  - zuletzt `prx-v385-module-intake-start-diagnosis.js`
- OSM-Live-POI-Modul lädt damit erst nach der Kern-App.
- Startdiagnose / Modulstatus ergänzt.
- Dashboard wird minimal mit Startdiagnose und Modulstatus belegt.
- Display-Guard ergänzt, um grüne Leerseite / komplett ausgeblendete Hauptansicht abzufangen.
- OSM-/Overpass-Ladeindikator ergänzt.
- Laufzeitfehler werden lokal protokolliert und im Diagnosepanel angezeigt.
- Versionswert zentral auf `3.8.5` gesetzt.
- `manifest.webmanifest` bleibt mit versionsfreiem `short_name`: `PRX Madeira`.

## Nicht geändert

- Keine neuen PR-/GPX-/KML-/POI-Rohdaten.
- Keine Service-Worker-Änderung.
- Keine Hotspot-/Heatmap-Integration.
- Keine Live-Statusautomatik.
- Keine automatische Tagesroutenoptimierung.
- Keine neue Ordnerstruktur.
- Keine neuen Assets.

## Bekannte Grenzen

- Der `data/`-Ordner bleibt als vorbereitete V2-Daten-/Quellstruktur erhalten, wird aber nicht pauschal gelöscht.
- Die Patch-Architektur bleibt bestehen; V3.8.5 konsolidiert nicht den gesamten Code, sondern stabilisiert Start, Modulstatus und Ladefolge.
- OSM-/Overpass-Daten bleiben externe Community-Daten und sind nicht redaktionell geprüft.
