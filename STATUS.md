# PR-Explorer Madeira - Status

Paketstand: V4.0.4 Recovery Baseline

## Zweck dieses Stands

Dieser Stand konsolidiert die zuletzt gebaute V4.0.3-App mit den nachgereichten Recovery-, Funktions-, UI- und UX-Briefings. Er ist als stabiler Ausgangspunkt fuer die finale Fertigstellung gedacht, nicht als neue Feature-Expansion.

## Aktuell enthalten

- Statische iPhone-/Safari-taugliche App fuer GitHub Pages.
- Vanilla JavaScript, Leaflet, kein Build-Zwang.
- Journal-first Start mit PR-/PS-PR-Liste.
- Leaflet-Karte mit Madeira-Fokus.
- PR-Pins, GPX-Tracks und KML-Anfahrten aus bereitgestellten Daten.
- Detailansicht mit Kennwerten, Datenstatus und Links.
- Reise- und Dashboard-Bereiche als stabile Huelle.
- Audit Center mit Komponenten-IDs, Notizmodus, Tickets, CSV- und JSON-Export.
- Lokaler Start ueber `START_LOCAL_SERVER.bat` oder Python HTTP Server.

## Recovery-Entscheidungen

- V4.0.2- und V4.0.3-Stabilisierungen wurden in die Baseline uebernommen.
- Separate Recovery-CSS-Dateien gelten nicht als Dauerstruktur.
- `src/styles.css` ist wieder die zentrale CSS-Datei.
- `src/app.js` bleibt die zentrale JS-Datei.
- Kein Service Worker in dieser Baseline.
- Fehlende Daten werden sichtbar gemeldet und nicht erfunden.

## Bekannte Grenzen

- Reiseplanung ist vorbereitet, aber noch keine vollwertige Tagesplanung.
- Dynamische Filterengine ist noch nicht V4.1-Stand.
- Hoehenprofil, POI-Steckbriefe und Status-/Quellenlinks sind Roadmap-Themen.
- Offlinefaehigkeit bleibt spaeteren stabilen Stufen vorbehalten.
- Leaflet 1.9.4 ist lokal unter `vendor/leaflet/` im Paket enthalten.

## Verbindliche Quellen im Paket

- `docs/PRX_TARGET_FUNCTION_UI_UX.md`
- `docs/PRX_RECOVERY_BRIEFING.md`
- `docs/PRX_ARCHITECTURE_LOCK.md`
- `docs/PRX_COMPONENT_REGISTRY.json`
- die zugehoerigen CSV-Quelldateien in `docs/`

## Naechste sinnvolle Schritte

1. App visuell auf iPhone- und Desktop-Breite pruefen.
2. Karte, Basiskarten, PR-Pins, GPX- und KML-Layer pruefen.
3. Audit-Ticketfluss einmal komplett testen.
4. Danach erst V4.1-Themen angehen: Layersteuerung, dynamische Filter, weitere Detaildaten.
