# PR-Explorer Madeira V3.6.3 POI SAME DETAIL FLOW

Reparaturpatch: POIs laufen nicht mehr über separate Sheets, sondern im gleichen Detailkarten-Aufbau wie die PR-Details.

# PR Explorer Madeira V3.6.3 POI DETAIL FLOW

Arbeitsstand nach V3.6.1 POI CAROUSEL.

## Datenstand
- PR-Grunddaten: 37 PR-Einträge eingebettet
- GPX: 37 Tracks inklusive Höhenprofilen
- KML: 36 verwertbare Anfahrten; PR9-KML ohne Koordinaten
- POI-Daten: vorhandene `poi-data.js` aus V3.6.0/3.6.1 weiterverwendet

## V3.6.3 Schwerpunkt
- Highlight-POIs und Funktions-/Info-POIs getrennt
- Sehenswürdigkeiten/Highlights als kompakte vertikale POI-Liste in der PR-Detailseite
- Antippen oder Links-Wischen öffnet das POI-Karussell
- Funktions-/Info-POIs erscheinen als Kategorie-Platzhalter mit Anzahl
- Kategorie-Platzhalter öffnen ein eigenes Kategorie-Karussell
- Aktiver POI wird auf der Karte angezeigt; GPX/KML der aktiven PR bleiben sichtbar

## Nicht enthalten
- Keine neuen POI-Daten
- Keine automatische Tagesroutenoptimierung
- Keine Live-Statusabfrage
- Keine Änderung an PR-/GPX-/KML-Rohdaten
- Keine neue Navigationsarchitektur


## V3.6.4 POI MAP DOCK

- POI-Auswahl fährt die PR-Detailkarte nach links aus dem Blickfeld.
- POI-Karussell liegt danach als kompakter Dock im unteren Kartenbereich.
- GPX-/KML-Kontext der aktiven PR bleibt sichtbar.
- Aktiver POI wird auf der Karte markiert; weitere POIs der Kategorie bleiben als Ghost-Marker sichtbar.
- Kein separates POI-Sheet als Zielzustand; Bedienung orientiert sich am PR-/Journal-Kartenfluss.
- Grauer Griff-/Balkenbereich der Detailkarte reduziert und Peek-Position unten leicht angehoben.
