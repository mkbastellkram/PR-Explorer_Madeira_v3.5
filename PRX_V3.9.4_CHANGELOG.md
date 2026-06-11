# PR-Explorer Madeira V3.9.4 SAFE CONTENT FALLBACK

## Geändert
- V3.9.4 defensiv auf Basis der letzten vor der Textintegration stabileren Linie V3.9.1 aufgebaut.
- Dynamische V2-Textdatei-Lader aus dem kritischen Startpfad entfernt.
- `prx-v392-content-settings-dashboard.js` und `prx-v393-content-load-recovery.js` sind nicht aktiv geladen.
- Neues Modul `prx-v394-safe-content-fallback.js` ergänzt.
- PRX-V2-PR-Texte werden als passive, eingebettete Zusatzschicht nach App-Start angereichert.
- Keine Textdatei blockiert den App-Start.
- Journal-Karten erhalten 150-Zeichen-Kurztexte, wenn PRs erfolgreich gematcht werden.
- Detailkarten erhalten 280-Zeichen-Detailtexte, wenn PRs erfolgreich gematcht werden.
- Steckbrief-Tags und Quellenhinweis werden defensiv ergänzt.
- White-Screen-Guard stellt Journal/Karte/Bottom-Nav defensiv sichtbar, falls eine Ansicht leer geschaltet wurde.
- Versions-/Cachewerte auf 3.9.4 gesetzt.

## Nicht geändert
- Keine neuen PR-/GPX-/KML-/POI-Rohdaten.
- Keine neue Ordnerstruktur.
- Kein Service Worker.
- Kein Kartenumbau.
- Keine Hotspot-/Heatmap-Integration.
- Keine automatische Tagesroutenoptimierung.

## Bekannte Grenzen
- Das Karten-Kachelproblem bleibt separates Thema.
- Die V2-Texte werden nur als Zusatzschicht verwendet, nicht als neue Stammdatenquelle.
