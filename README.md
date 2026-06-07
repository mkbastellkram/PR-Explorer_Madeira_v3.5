# PR Explorer Madeira V3.5.6 No-Rubber Detail Drag

Radikale Korrektur nach Rückmeldung zu V3.5.5.

## Geändert

- Beim Ziehen nach unten hängt die Detailkarte nicht mehr am Dokument-Scroll.
- Die Detailkarte folgt abwärts 1:1 dem Finger.
- Keine künstliche Gegenkraft.
- Kein Gummiband.
- Kein Clamp während des Ziehens.
- Die Detailkarte darf beim Ziehen nach unten komplett aus dem Display laufen.
- Beim Loslassen wird nur magnetisch entschieden:
  - kurzer Zug → zurück zur Detailachse
  - deutlicher Zug → Karussellhöhe
- Normaler Detail-Scroll nach oben wird weiterhin begrenzt, sobald die Unterkante der Detailkarte sichtbar am unteren Displayrand steht.
- Linke Listenreste bleiben vollständig außerhalb des sichtbaren Bereichs.

## Wichtig

Dieser Patch entfernt die vorherige Gummibandlogik aus dem Dragpfad.
