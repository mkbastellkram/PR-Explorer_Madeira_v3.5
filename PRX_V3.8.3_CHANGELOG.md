# PRX V3.8.3 DISPLAY RECOVERY

## Änderungen
- Kritischen Fehler aus V3.8.2 behoben: `index.html` enthielt nur Head/Scripte, aber keine App-Body-Struktur.
- Vollständige App-Shell wiederhergestellt: Karte, Journal, Detailkarte, POI-Dock, Bottom Navigation, Toast.
- P1-Fixes aus V3.8.2 beibehalten:
  - `prx-v377-interactive-controls-status-booking.js` eingebunden.
  - `prx-v380-osm-live-poi.js` nach `app.js` und nach den Patchmodulen geladen.
  - Doppelter Leaflet-CSS-Import entfernt.
- Version/Cache auf 3.8.3 gesetzt.
- Manifest short_name bleibt versionsfrei: `PRX Madeira`.

## Nicht geändert
- Keine neuen Rohdaten.
- Keine neue Architektur.
- Keine Service-Worker-Änderung.
- Keine Hotspot-/Status-Automatik.

## Upload
Nur Einzeldateien erforderlich.
