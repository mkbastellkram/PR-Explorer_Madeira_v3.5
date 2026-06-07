# PR Explorer Madeira V3.5.12 STABILIZED

Vollversion nach Interview-Architektur, mit realen Projektdateien eingebunden.

## Datenstand
- Excel/App: 37 PR-Einträge aus `PR – V1.xlsx` eingebettet; 3 PS-Zeilen aus Excel sind als offener Datenumfang dokumentiert
- GPX: 37 Tracks aus `Gpx.zip`, inklusive Höhenprofilen
- KML: 36 verwertbare Anfahrten aus `KML.zip`; PR9-KML enthält keine Koordinaten

## Navigation
- Journal-first Start
- Detailkarte ist das kompakte Karussell: keine separaten Karussellkarten
- Detail nach unten ziehen: 1:1, ohne Gummiband, Snap auf kompakte Detailkarte
- Kompakte Detailkarte horizontal wischen: PR-Wechsel
- Kompakte Detailkarte nach oben ziehen: volle Detailseite
- Kompakte Detailkarte nach unten ziehen: Vollbildkarte mit allen Pins
- Karte-Button: Journal → Übersichtskarte, Detail → kompakte Detailkarte, Peek → Vollbildkarte

## Enthalten
- echte PR-Daten aus Excel
- echte GPX-Polylines
- echte KML-Anfahrtslinien
- echte SVG-Höhenprofile aus GPX-Höhendaten
- GPX rot, KML blau
- Cupertino-ähnliche Inline-Line-Icons
- kein Service Worker

## V3.5.11 Stabilisierung

- Leaflet/CDN-Ausfall erzeugt keinen harten JavaScript-Abbruch mehr.
- Keine Architekturänderung.
- Auditbericht: `PRX_V3.5.7_AUDIT_REPORT.md`.


## V3.5.11

Siehe `PRX_V3.5.11_CHANGELOG.md`.


## V3.5.12

Filterfunktion reaktiviert: Region, Status und numerische Zwei-Anfasser-Hybrid-Slider mit echten PR-Datenwerten als interne Rastpunkte, Lineal-/Zollstock-Skala, Trefferzahl und gemeinsamer Wirkung auf Journal und Kartenpins. Siehe `PRX_V3.5.12_CHANGELOG.md`.
