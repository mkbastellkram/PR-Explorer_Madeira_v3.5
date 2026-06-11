# PRX V3.9.0 · GPS STATUS DASHBOARD FOUNDATION

## Geändert
- Aktive Scriptkette bereinigt und auf V3.9.0 synchronisiert.
- Alte inaktive Status-/Recoverymodule aus dem Deploy-ZIP entfernt.
- Dashboard als echte Nutzfläche belegt:
  - PR-/POI-Zähler
  - Favoritenzähler
  - Buchungszähler
  - Status-Center
  - OSM-Live-POI-Zähler
  - Diagnose kopierbar
- GPS-Live-Position als sicherer, manueller Abruf ergänzt.
- GPS-Marker und Genauigkeitskreis auf der Leaflet-Karte ergänzt.
- OSM-/Overpass-Ladeindikator ergänzt.
- SIMplifica-/Visit-Madeira-Schnellzugriff im Dashboard ergänzt.
- Leerer Filterzustand wird klarer kommuniziert.
- Karten-Recovery bleibt defensiv, ohne harte Tile-Reset-Manöver.

## Nicht geändert
- Keine neuen PR-/GPX-/KML-/POI-Rohdaten.
- Keine neue Ordnerstruktur.
- Kein Service Worker.
- Keine automatische Live-Statusabfrage.
- Keine Hotspot-/Heatmap-Integration.
- Keine automatische Tagesroutenoptimierung.

## Bekannte Grenzen
- GPS funktioniert nur nach Nutzerfreigabe und HTTPS/GitHub-Pages-Kontext.
- OSM-Live-POIs sind externe Community-Daten und nicht redaktionell geprüft.
- Dashboard ist jetzt funktional belegt, aber noch nicht das finale Full Trip Dashboard.
