# PRX V3.9.2 · CONTENT SETTINGS DASHBOARD DEEPENING

## Geändert
- V2-PR-Texte aus `data/pr-routes-madeira.js` werden vor App-Start geladen und in `window.PRX_DATA.trails` übernommen.
- Journal-/PR-Karten zeigen dadurch echte Kurztexte, sofern vorhanden.
- PR-Detailseite nutzt echte 280-Zeichen-Texte und ergänzt einen Steckbrief-/Tag-/Quellenblock.
- Dashboard um Inhalte & Reise erweitert: PR-Kurztexte, PR-Detailtexte, Highlight-POIs, Standard-POIs, Textmodus, Reisezeitraum.
- Zweite Ebenen von Optionen/Einstellungen/Reise werden mit ergänzenden Daten-/Statuskarten vertieft.
- Linienseite zeigt aktive Linienwerte und bietet Reset auf Standard.
- POI-Anzeige zeigt Datenstand für Highlight-/Standard-/OSM-Live-POIs.
- Version und Cachewerte auf 3.9.2 gesetzt.

## Nicht geändert
- Keine neuen PR-/GPX-/KML-/POI-Rohdaten.
- Keine neue Ordnerstruktur.
- Kein Service Worker.
- Keine Hotspot-/Heatmap-Integration.
- Keine automatische Tagesroutenoptimierung.
- Keine harte Kartenarchitektur-Änderung.

## Bekannte Grenzen
- Das Karten-Kachelproblem bleibt als separates Thema bestehen; V3.9.2 priorisiert Inhalte, Dashboard und Einstellungs-/Options-Tiefe.
- Die V2-Textdaten werden nur übernommen, wenn `data/pr-routes-madeira.js` auf GitHub vorhanden ist.
