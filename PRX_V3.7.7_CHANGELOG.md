# PR-Explorer Madeira V3.7.7 INTERACTIVE CONTROLS STATUS BOOKING

## Geändert

- Linien-/Track-Einstellungen aktiviert:
  - GPX-Farbe
  - GPX-Stärke
  - GPX-Deckkraft
  - KML-Farbe
  - KML-Stärke
  - KML-Deckkraft
  - KML-Linienart: durchgezogen / gestrichelt / gepunktet
  - weiße Kontur-Zusatzbreite
  - Kontur-Deckkraft
- Linienwerte werden in `prx.lineStyle.v377` gespeichert.
- Aktive Route wird nach Linienänderung neu eingepasst/neu gezeichnet.
- Icon-/Symbolauswahl als erste funktionale Testebene ergänzt:
  - Cupertino klar
  - Outdoor zweifarbig
  - Minimal hart
- Detailtext-Testmodus bleibt aktiv nutzbar:
  - Aus
  - 150 Zeichen
  - 280 Zeichen
  - Beide
- Favoritenlogik ergänzt:
  - Favorit-Button setzt/entfernt Favoriten
  - Favoriten-Badge an Journal-Kachel
  - Favoriten-Badge am PR-Marker
- Status-&-Buchungsblock in PR-Detailseite ergänzt:
  - Status manuell setzen: offen / eingeschränkt / geschlossen / prüfen
  - experimenteller Live-Statuscheck mit CORS-Fallback
  - SIMplifica-Buchungslink
  - Visit-Madeira-/Quelle-Link
  - MadeiraJourney-Link
  - Buchung/Reservierung lokal vormerken
- Transparenter Journal-Schatten im POI-/Kartenmodus weiter ausgeblendet.
- Version und Cache-Parameter auf 3.7.7 gesetzt.

## Nicht geändert

- Keine neuen PR-/GPX-/KML-/POI-Rohdaten.
- Keine OSM-Live-POI-Abfrage.
- Keine Hotspot-/Heatmap-Integration.
- Keine automatische Tagesroutenoptimierung.
- Keine neuen Ordner/Assets.
- Keine Service-Worker-Änderung.

## Bekannte Grenzen

- Der Live-Statuscheck ist clientseitig. Wenn Visit Madeira/Quelle CORS blockiert, wird die Quelle geöffnet und der Status bleibt auf „Prüfen“.
- Das Buchungssystem ist in V3.7.7 als Link-/Vormerklogik umgesetzt, noch nicht als echte SIMplifica-API-Integration.
- Icon-/Symbolauswahl ist als Test- und Strukturstufe aktiv, nicht als finales vollständiges SVG-Set.
