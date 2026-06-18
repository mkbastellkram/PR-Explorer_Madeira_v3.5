# V5 Import Report

Generiert aus:

- `PR – V1.xlsx`
- `PRX_Kurztexte_PR_POI_V1.json`
- `Gpx (1).zip`
- `KML (1).zip`

## Ergebnis

- PRs: 40
- GPX-Tracks: 37
- KML-Routen: 36
- POIs: 32

## Hyperlink-Import

Die Excel wird nicht als reine Wertetabelle gelesen. Eingebettete Zell-Hyperlinks werden als Daten übernommen:

- Spalte A `Nummer`: Visit-Madeira-Detailseite
- Spalte H `Link: Wie komme ich hin`: Google-Maps-Startpunkt
- Spalte I `Link: Anfahrt/Route`: Google-Maps-Anfahrt
- Spalte U `Beschreibung Link`: Schmale-Pfade-Link

## Fehlende Zuordnungen

- `PR 9`: KML-Datei vorhanden, aber ohne Koordinateninhalt
- `PS PR 1`, `PS PR 2`, `PS PR 3`: keine GPX/KML-Dateien in den gelieferten Madeira-ZIPs

Diese Lücken bleiben in den App-Daten sichtbar und werden nicht durch künstliche Luftlinien ersetzt.
