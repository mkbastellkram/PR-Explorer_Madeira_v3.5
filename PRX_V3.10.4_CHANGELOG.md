# PR Explorer Madeira V3.10.4 AUDIT RECORDER & VISIBILITY ENGINE

## Geändert
- A-00 Audit-Konsole ersetzt den alten schwer erreichbaren Audit-Einstieg als aktive Auditoberfläche.
- Auditbericht zeigt jetzt Version 3.10.4 statt alter 3.10.1-Reportversion.
- Sichtbarkeitsprüfung verbessert: Viewport, Hidden-Klassen, Display/Visibility/Opacity und Elementgröße werden berücksichtigt.
- Audit-Recorder ergänzt:
  - Aufnahme 60 Sekunden
  - Aufnahme 120 Sekunden
  - Stop
  - Ereignisse mit Zeitversatz, Ereignistyp, Komponenten-ID, Komponentenname und Body-Klassen.
- Auditbericht enthält Recorder-Protokoll, falls eine Aufnahme läuft oder eine letzte Aufnahme gespeichert ist.
- PRX_AUDIT API überschreibt jetzt `open`, `collect`, `report`, `toggle`, `startRecording`, `stopRecording`.
- Floating A-00 Button im Auditmodus beibehalten.
- Versionsanzeigen auf 3.10.4 synchronisiert.

## Nicht geändert
- Keine PR-/GPX-/KML-/POI-Rohdaten geändert.
- Keine Kartenarchitektur geändert.
- Kein Service Worker.
- Keine neue Ordnerstruktur.
- Keine Hotspot-/Heatmap-Integration.
- Keine automatische Tagesroutenoptimierung.

## Bekannte Grenze
- Das Audit-System ist weiter eine Laufzeit-Ergänzung. Es verbessert Adressierung und Protokollierung, ersetzt aber noch keine vollständige Entwicklerkonsole.
