# PR Explorer Madeira V3.5.1 Navigation Core

Neuer Navigationskern gemäß Konzeptbeschluss.

## Enthalten

- Journal-first Start
- schriftfreies Introbild als Listen-/Kartenhintergrund
- PR-Kachel-Tap: ausgewählte Kachel gleitet links, Detail schiebt sich schwerelos ein
- übrige Listenkacheln folgen verzögert
- Detailseite fast fullscreen, umlaufender transparenter Rand zur Karte
- Detailseite intern scrollbar
- fixierte Top-Controls: Filter, Optionen, Teilen, Karte, Einstellungen
- Kartensymbol:
  - aus Journal: Liste + Hintergrund gleiten links, Karte mit allen Pins
  - aus Detail: Detail reduziert auf Karussellhöhe
- Karussell: horizontal wischbar
- Solo-Modus: aktive PR mit Pin + GPX/KML-Dummy + POI-Dummy
- Bottom Navigation volle Breite
- kein Service Worker

## Noch bewusst prototypisch

- echte GPX/KML-Geometrien werden in diesem Navigationskern noch nicht final ausgewertet
- POIs sind Dummy-Kontextpunkte
- Detailinhalte sind Platzhalter für spätere flexible Erweiterung
