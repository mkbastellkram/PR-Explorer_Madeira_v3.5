# PRX V3.8.6 · Interaction Recovery

## Geändert
- Problematisches `prx-v377-interactive-controls-status-booking.js` aus der aktiven Script-Kette entfernt.
- Neues defensives Modul `prx-v386-interaction-recovery-safe-status.js` ergänzt.
- Status-/Buchungsblock bleibt verfügbar, aber ohne globalen `MutationObserver` und ohne automatische Live-Abfrage.
- Detailöffnung wird nicht mehr durch Status-/Buchungslogik blockiert.
- Version/Cache auf 3.8.6 gesetzt.

## Nicht geändert
- Keine neuen Daten.
- Keine neuen Ordner.
- Kein Service Worker.
- Keine neue Architektur.

## Zweck
V3.8.6 ist ein Interaktions-Recovery-Build nach dem Freeze bei Antippen einer PR-Kachel in V3.8.5.
