# PR-Explorer Madeira V3.7.8 DETAIL OPEN RECOVERY

## Änderungen
- Freeze nach Antippen einer PR-Kachel entschärft.
- V3.7.7-Status-/Buchungszusatzlogik durch defensive Recovery-Logik ersetzt.
- MutationObserver-Feedbackschleife entfernt.
- Keine automatische Live-Statusabfrage beim Öffnen einer Detailkarte.
- Statusprüfung öffnet nur noch per Button die offizielle Quelle.
- Detail-Zusatzblock wird entkoppelt/debounced nachgeladen.
- Fehler im Zusatzblock blockieren nicht mehr die Kern-Detailansicht.
- Linien-Fit-Refresh defensiver verzögert.
- Version und Cache-Parameter auf 3.7.8 gesetzt.

## Nicht geändert
- Keine neuen PR-/GPX-/KML-/POI-Rohdaten.
- Keine neue Navigation.
- Keine OSM-Live-POI-Abfrage.
- Keine Hotspot-/Heatmap-Integration.
- Keine automatische Tagesroutenoptimierung.
- Keine neuen Ordner/Assets.
- Keine Service-Worker-Änderung.

## Hinweis
V3.7.8 ist ein Recovery-Build. Ziel ist Stabilität beim Öffnen der PR-Detailkarte. Die in V3.7.7 aktivierten Funktionen bleiben nur defensiv/ohne Blockade erhalten.
