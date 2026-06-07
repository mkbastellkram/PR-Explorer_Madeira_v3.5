# PRX V3.6.0 CHANGELOG

## Geändert
- POI-Datenquelle `prx_poi_madeira_v1` als `poi-data.js` integriert.
- Nur POIs mit Mindestqualität verwendet: Name, Koordinate, Kategorie und Quelle/Vertrauensgrad.
- POI-Kontext erscheint nur bei aktiver PR/Soloansicht.
- Kontextvorschläge werden aus PR-Bezug, GPX-Nähe, KML-Nähe und Startpunktnähe gebildet.
- Maximal 10 POI-Vorschläge pro aktiver PR.
- POI-Zustände ergänzt: Merken, Heute, Später, Erledigt, Ausblenden.
- Auswahlbegrenzung: maximal 5 POIs für Heute, maximal 10 POIs für Später.
- Google-Maps-Übergabe für die Heute-Auswahl vorbereitet.
- Einzelner POI-Kontextmarker erscheint nach Antippen einer POI-Karte.
- Admin-Entscheidungsarchiv unter `docs/interviews/` vorbereitet.
- Version und Cache-Parameter auf 3.6.0 gesetzt.

## Nicht geändert
- Keine automatische Tagesroutenoptimierung.
- Keine Live-Statusabfrage.
- Keine globale POI-Markerflut.
- Keine Änderung an PR-/GPX-/KML-Rohdaten.
- Keine neue Navigationsarchitektur.
- Keine Service-Worker-Änderung.

## Bekannte Grenzen
- Distanz zur KML/GPX ist eine geometrische Näherung, keine echte Fahrzeitprüfung.
- POI-Dubletten werden nicht hart gelöscht; die Datenquelle bleibt erhalten.
- Google Maps übernimmt die Sortierung/Navigation.
