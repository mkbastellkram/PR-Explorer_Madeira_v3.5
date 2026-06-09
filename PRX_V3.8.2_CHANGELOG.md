# PRX V3.8.2 CRITICAL LOAD FIX

Änderungen:
- `prx-v377-interactive-controls-status-booking.js` wieder in `index.html` eingebunden.
- Script-Reihenfolge korrigiert: `app.js` lädt vor Patchmodulen; `prx-v380-osm-live-poi.js` lädt nach App-/Patch-Initialisierung.
- Doppelten Leaflet-CSS-Import entfernt; SRI-Import bleibt erhalten.
- `manifest.webmanifest` short_name auf `PRX Madeira` gesetzt.
- `window.PRX_APP_VERSION = "3.8.2"` gesetzt.
- `prx-v381-version-sync.js` beibehalten und zuletzt geladen.

Nicht geändert:
- Kein Service Worker.
- Keine neuen Rohdaten.
- Keine OSM-POI-Funktionsänderung.
- Keine Architektur-Konsolidierung.

Hinweis:
Dieser Build behebt die P1/P2-Befunde aus dem GitHub-Upload-Audit ohne neue Funktionen.
