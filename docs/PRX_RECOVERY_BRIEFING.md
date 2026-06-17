# PRX Recovery Briefing

Dieses Briefing ergaenzt den App-Stand um die spaet nachgereichten Projekt- und Recovery-Informationen. Es ist absichtlich kurz gehalten, damit der weitere Ausbau nicht wieder in eine Patchkette kippt.

## Phase-Historie

| Phase | Stand/Ziel | Entscheidung |
| --- | --- | --- |
| P0 | Madeira-Wanderplaner | PRs, GPX, KML und Leaflet bilden die Basis. |
| P15 | Recovery | Regression und Stabilisierung haben Vorrang vor Rebuild und Featureausbau. |

## Architektur-Kern

- Kartenengine bleibt Leaflet.
- Hauptnavigation bleibt Bottom Navigation.
- Journal-first bleibt der Startpunkt.
- GPX steht fuer Wandertrack.
- KML steht fuer Anfahrt.
- Fehlende Daten werden sichtbar markiert.

## Wiederkehrende Kritik

- Bereits geloeste Karten- und UI-Fehler duerfen nicht wieder auftauchen.
- Patchketten sind keine stabile Projektstruktur.
- Neue CSS-/JS-Patchdateien duerfen nicht zur Dauerloesung werden.

## Konsequenz fuer V4.0.4

Die vorhandenen Stabilisierungen aus `map-recovery.css` und `ui-recovery.css` wurden als Baseline-Regeln in `src/styles.css` uebernommen. Die Recovery-Dateien selbst sind damit nicht mehr Teil der aktiven App-Struktur.
