# PRX V3.5.7 Audit Report

Stand: 2026-06-07  
Arbeitsbasis: `PR-Explorer_Madeira_v3.5-main.zip`  
Funktioneller Stand laut Vorgabe: V3.5.7  
Zielausgabe: `PR-Explorer-Madeira_v3.5.8_STABILIZED.zip`

## 1. Geprüfte Primärquellen

| Quelle | Ergebnis |
|---|---:|
| `PR – V1.xlsx` | vorhanden, 1 Blatt `Tabelle1`, 40 nummerierte Datenzeilen |
| `Gpx.zip` | vorhanden, 37 GPX-Dateien |
| `KML.zip` | vorhanden, 37 KML-Dateien, davon `Route von Pestana Promenade nach PR 9.kml` ohne Koordinaten |
| `PRX_Interview_Uebergabe_HTML.zip` | vorhanden, 17 Dateien, überwiegend Antwort-/Entscheidungsdokumente |
| `PR-Explorer_Madeira_v3.5-main.zip` | vorhanden, App-Rohbasis V3.5.7 |
| `prx_poi_madeira_v1.zip` | vorhanden, 120 POIs, noch nicht in App integriert |

## 2. App-Struktur V3.5.7

| Datei | Funktion |
|---|---|
| `index.html` | HTML-Shell, Top-Controls, Journal, Detailkarte, Bottom Navigation |
| `style.css` | komplette Journal-/Karten-/Peek-/Detail-/Fullmap-Darstellung |
| `app.js` | Navigation, Kartenlogik, Detailkarte, Gesten, Höhenprofilausgabe |
| `data.js` | eingebettete PRX-Daten aus Excel/GPX/KML |
| `intro.jpg`, `intro-bg.svg` | Journal-/Intro-Hintergrund |
| `manifest.webmanifest` | PWA-Metadaten |

## 3. Syntaxprüfung

`node --check app.js` bestanden.  
`node --check data.js` bestanden.

Es wurden keine JavaScript-Syntaxfehler gefunden.

## 4. Datenprüfung

### 4.1 Excel → App-Daten

`PR – V1.xlsx` enthält 40 nummerierte Datenzeilen:

- 37 PR-Routen: `PR1` bis `PR28` inkl. Unterrouten.
- 3 PS-Routen: `PSPR1`, `PSPR2`, `PSPR3`.

`data.js` enthält 37 Trail-Einträge.

Abgleich der 37 enthaltenen PR-Routen:

- Name: keine Hauptabweichung festgestellt.
- Koordinaten Startpunkt: keine Hauptabweichung festgestellt.
- Anfahrtskilometer: keine Hauptabweichung festgestellt.
- Anfahrtsdauer: keine Hauptabweichung festgestellt.
- Distanz: keine Hauptabweichung festgestellt.

Nicht enthalten:

- `PSPR1`
- `PSPR2`
- `PSPR3`

Bewertung: Die App bildet aktuell die 37 PR-Routen ab, nicht die 3 PS-Routen aus der Excel-Datei. Das ist kein Syntaxfehler, aber ein Datenumfangs-Thema. Eine Integration der PS-Routen würde die Kartenübersicht auf Porto Santo erweitern und sollte gesondert entschieden werden.

### 4.2 GPX → App-Daten

`data.js` enthält 37 Track-Datensätze.  
Alle 37 in der App enthaltenen PR-Routen haben einen zugeordneten GPX-Track.

Einschränkung:

- `PR2` enthält im eingebetteten Track keine auswertbaren Höhenwerte.
- `PR12` enthält im eingebetteten Track keine auswertbaren Höhenwerte.

Bewertung: GPX-Tracks sind real eingebettet. Höhenprofile funktionieren nur dort belastbar, wo der GPX-Track echte Höhenwerte enthält.

### 4.3 KML → App-Daten

`data.js` enthält 36 KML-/Drive-Datensätze.

Nicht als Drive-Datensatz enthalten:

- `PR9`

Ursache: In `KML.zip` existiert zwar `Route von Pestana Promenade nach PR 9.kml`, diese Datei enthält aber keine `<coordinates>`-Daten. Daher kann daraus keine reale Anfahrtslinie erzeugt werden.

Bewertung: Keine Halluzination. Keine KML-Linie für PR9 ergänzt, weil keine verwertbaren Koordinaten vorhanden sind.

### 4.4 POI-Daten

`prx_poi_madeira_v1.zip` enthält 120 POIs:

- trailhead: 72
- fuel: 7
- supermarket: 7
- waterfall: 6
- viewpoint: 6
- parking: 6
- beach: 5
- tunnel: 4
- toilet: 4
- sight: 3

Diese POIs wurden in V3.5.8 nicht integriert, weil der aktuelle Arbeitsauftrag zuerst die V3.5.7-Rohbasis prüfen und stabilisieren soll.

## 5. Navigationsprüfung gegen Leitplanken

| Leitplanke | Status in V3.5.7 |
|---|---|
| Journal-first Start | vorhanden |
| Intro-/Listenhintergrund | vorhanden |
| Leaflet-Karte liegt darunter | vorhanden |
| kompakte PR-Kacheln | vorhanden |
| Öffnen per Tippen | vorhanden |
| Öffnen per horizontalem Wischen der Listenkachel | vorhanden |
| Detailkarte schwebt über Karte | vorhanden |
| keine separate Karussellkarte | erfüllt |
| kompakte Detailkarte als Karussell | vorhanden |
| horizontales Wischen in Peek wechselt PR | vorhanden |
| Swipe nach oben öffnet Detail | vorhanden |
| Swipe nach unten öffnet Fullmap | vorhanden |
| Kartensymbol aus Journal öffnet Karte mit Pins | vorhanden |
| Pin-Tap aktiviert kompakte PR | vorhanden |
| Bottom Navigation vorhanden / parkend | vorhanden |
| Top-Controls fixiert | vorhanden |

Bewertung: Die geltende V3.5.7-Navigationsarchitektur ist im Code erkennbar umgesetzt. Es wurde keine Rückkehr zur alten Bottom-Sheet-/Karussellarchitektur festgestellt.

## 6. Konkrete Korrektur in V3.5.8

### geändert

1. `index.html`
   - Versionsbezug von `3.5.7` auf `3.5.8` erhöht.
   - Cache-Parameter für `style.css`, `data.js`, `app.js` auf `v=3.5.8` gesetzt.

2. `app.js`
   - `ensureMap()` gibt jetzt einen booleschen Status zurück.
   - Wenn Leaflet/CDN nicht geladen ist, bricht die Karteninitialisierung kontrolliert ab und zeigt einen Toast: `Kartenbibliothek nicht geladen`.
   - `mapOverview()`, `peek()` und `fullmap()` prüfen den Rückgabewert von `ensureMap()` und erzeugen dadurch keinen Folgefehler mehr, wenn `window.L` fehlt.

### nicht geändert

- Keine neue Navigationsarchitektur.
- Keine separaten Karussellkarten.
- Keine Dummy-PR-Daten.
- Keine erfundenen GPX-/KML-/POI-Daten.
- Keine Service-Worker-Experimente.
- Keine Safe-Area-Grundsatzänderung.
- Keine POI-Integration.
- Keine Integration der drei PS-Routen.
- Keine Umstellung von CDN-Leaflet auf lokale Leaflet-Dateien.

### noch offen

1. Entscheidung: Sollen `PSPR1`, `PSPR2`, `PSPR3` aus Excel in die App-Liste aufgenommen werden?
2. Entscheidung: Soll PR9 eine Anfahrtslinie erhalten? Aktuell nicht möglich aus bereitgestellter KML-Datei, weil Koordinaten fehlen.
3. GPX-Höhenproblem bei `PR2` und `PR12`: Höhenprofil nur eingeschränkt möglich, weil die eingebetteten Trackpunkte keine echten Höhendaten enthalten.
4. POI-Integration aus `prx_poi_madeira_v1.zip` ist vorbereitet als nächster separater Schritt, aber nicht Bestandteil dieser Stabilisierung.
5. Browser-Echtlauf konnte in der lokalen Containerumgebung nicht per Playwright abgeschlossen werden, weil Chromium-Aufrufe durch die Umgebung blockiert wurden. Syntax- und Datenprüfung wurden statisch durchgeführt.

### bekannte Risiken

1. Leaflet wird weiterhin per CDN geladen. Bei fehlender Internetverbindung oder blockiertem CDN erscheint jetzt kein harter JavaScript-Abbruch mehr, aber die Karte kann dann nicht initialisiert werden.
2. Die App nutzt eingebettete Daten in `data.js`, nicht zur Laufzeit die Excel-/GPX-/KML-Dateien. Das ist für GitHub Pages sinnvoll, setzt aber voraus, dass `data.js` bei Stammdatenänderungen neu erzeugt wird.
3. `PR9` besitzt in Excel Anfahrtsdaten, aber keine verwertbare KML-Linie in der gelieferten KML-Datei.
4. PS-Routen sind in Excel vorhanden, aber nicht in der V3.5.7-App-Rohbasis.
