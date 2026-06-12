# PRX V3.10.0 · FLAT LAYOUT MAP STABILITY

Geändert:
- Journal erhält einen flacheren, platzsparenderen Layout-Test nach Strava/Komoot/Geory-Prinzip.
- Große PR-Bild-/Badge-Platzhalter werden im Flat-Modus ausgeblendet.
- Journal-Karten nutzen volle Breite, dünne Trennlinien und weniger Glass-Rahmen.
- Detailseite erhält flachere Abschnitte mit weniger verschachtelten Karten-in-Karten.
- Leaflet-Kartenkacheln werden gegen globale `img`-Styles der App abgeschirmt.
- Kartencontainer und Leaflet-Tiles werden auf stabile 100vw/100dvh und 256px-Tiles gesetzt.
- Sanfte Karten-Neuvermessung nach Kartenwechsel, Resize, Touch-Ende und Sichtbarkeitswechsel.
- Falsch schwebende Anfahrtszeit-Einstellungsbox aus der Rubrikenebene wird entfernt.
- Neue Datei: `prx-v3100-flat-layout-map-stability.js`.
- Version/Cachewerte auf 3.10.0 gesetzt.

Nicht geändert:
- Keine neuen PR-/GPX-/KML-/POI-Rohdaten.
- Keine neue Ordnerstruktur.
- Kein Service Worker.
- Keine Hotspot-/Heatmap-Integration.
- Keine automatische Tagesroutenoptimierung.

Bekannte Grenze:
- Kartenstabilität wird weiter defensiv verbessert, aber die tiefere Leaflet/App-Konsolidierung ist noch nicht abgeschlossen.
