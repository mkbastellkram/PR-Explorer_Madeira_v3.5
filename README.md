# PR Explorer Madeira V3.5.2 Interaction Refinement

Feinschliff auf Basis der Rückmeldung zu V3.5.1.

## Neu / geändert

- Listenkachel kann per Drag nach links geöffnet werden.
- Tippen auf Kachel funktioniert weiterhin.
- Nach dem Weggleiten zentriert sich die Liste unsichtbar wieder magnetisch.
- Detailseite bleibt Floating Card, kein klassisches Bottom-Sheet.
- Kartensymbol schaltet:
  - Journal → Kartenübersicht
  - Detail → Karussellhöhe
  - Karussell/Solo → Vollbildkarte
  - Vollbildkarte → zurück zu Karussell/Solo
- Bottom Navigation parkt beim Scrollen links.
- Bottom Navigation parkt auch im Vollbildkartenmodus links.
- Antippen/Benutzen der geparkten Navigation holt sie zurück.
- Journal kann über Bottom Navigation wieder angewählt werden.

## Weiterhin prototypisch

- GPX/KML sind Dummy-Geometrien.
- POI ist Dummy-Kontextpunkt.
- Detailinhalte bleiben Platzhalter.
- Keine Service-Worker-Logik.
