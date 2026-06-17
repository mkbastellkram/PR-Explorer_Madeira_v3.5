# PRX Zielbild fuer Funktion, UI und UX

Dieses Dokument fasst die nachgereichten Zielbild-CSV-Dateien fuer die weitere Arbeit zusammen. Die CSV-Dateien bleiben als Quelle im Ordner `docs/` enthalten.

## Verbindlicher Funktionskern

- Private iPhone-PWA, statisch und GitHub-Pages-geeignet.
- PR-zentrierte Madeira-App, kein allgemeiner Reisefuehrer.
- Primaerdaten aus Excel, GPX und KML.
- Keine erfundenen Daten.
- Leaflet-Karte mit Madeira-Fokus.
- Basiskarten: OSM, OpenTopoMap, Satellit und Hybrid.
- PR-Pins aus echten Start-, Ziel- oder Parkplatzkoordinaten.
- GPX-Tracks und KML-Anfahrten getrennt behandeln.
- Solo-Modus: aktive PR fokussiert relevante Marker, GPX und KML.
- Journal-first mit flacher PR-Liste.
- Suche, Region und Status als Baseline-Filter.
- Detailseite mit echten Daten, Links und GPX/KML-Aktionen.
- Reisebereich bleibt in V4.0 nur stabile Huelle.
- Homezone: Pestana Promenade Premium Funchal.
- Dashboard zeigt Datenstatus und spaetere Uebersichten.
- Audit/Diagnose erst nach stabiler Basis ausbauen.
- Kein Service Worker in instabiler Baseline.

## UI-/UX-Zielbild

- Apple-/Cupertino-nahe Designsprache mit grossen Touch-Zielen.
- Flach, nutzflaechenorientiert, keine Karten-in-Karten-Struktur.
- Einstellbare Transparenz darf nicht zur Fehlerquelle werden.
- Fullscreen-Karte mit sinnvoller Safe-Area-Nutzung.
- Schwebende Bottom Navigation.
- Isolierte Scrollcontainer fuer Journal, Detail, Reise und Panels.
- Wiederkehrende Bedienelemente zentral und gleichartig fuehren.
- Keine globalen CSS-Regeln, die Leaflet-Tiles beschaedigen.
- PR-Auswahl fokussiert Karte, GPX, KML und Detail.
- Detail schliessen fuehrt zurueck zu Liste bzw. Pins.
- Fehler sichtbar melden statt weisse Seite.
- Stabilitaet vor Funktionsfuelle.

## Verworfene Ansaetze

- Keine weitere V3.x-Patchkette.
- Keine aggressiven Service-Worker-Experimente in der Baseline.
- Keine Strava-Heatmap als Kernquelle.
- Webcams sind keine Sehenswuerdigkeiten.
- Keine automatische POI-Tagesplanung.
- Kein Google-Popular-Times-Scraping.
- Keine echte Server-Synchronisation als Baseline.
- Kein automatisches Loeschen beim Import.
- Kein Framework- oder Build-Zwang.
- Neue CSS-/JS-Patchdateien sind keine Dauerloesung.

## Roadmap nach Baseline

- V4.1: Layersteuerung und dynamische Filterengine.
- V4.2: kompakte Statusanzeige und Quellenlinks.
- V4.3: Reisezeitraum, Tagesliste und Tagesplanung.
- V4.4: Heute/Spaeter-Listen und kuratierte POI-Vorschlaege.
