# PR-Explorer Madeira V3.7.1 DATA V2 IMPORT FOUNDATION

## Geändert

- PRX POI-Datenpaket V2 COMPLETED als neue Datenbasis vorbereitet.
- Neue Datenordnerstruktur ergänzt:
  - `data/pr-routes-madeira.js`
  - `data/highlight-pois-madeira.js`
  - `data/standard-pois-madeira.js`
  - `data/legacy-pr-context-pois.js`
  - `data/prx-v2-adapter.js`
- `assets/poi/placeholders/poi_placeholder.svg` übernommen.
- POI-V2-Daten per Adapter in die bestehende App-Struktur übersetzt.
- 40 Highlight-POIs, 50 Standard-/Funktions-POIs und 25 Legacy-Kontext-POIs als App-POIs verfügbar gemacht.
- PR-Textschicht aus `PR_Wanderwege` übernommen:
  - Kurztext
  - Detailtext
  - Tags
  - Quellen-/Status-Momentaufnahme als Zusatzfelder
- PR-Detailbeschreibung nutzt jetzt bevorzugt V2-Detailtext.
- Journal-Karten nutzen bevorzugt V2-Kurztext.
- Fehlende Bilder werden über Placeholder-Strategie abgefangen.
- Keine lokalen Bilddateien erfunden oder referenziert.
- Version und Cache-Parameter auf 3.7.1 gesetzt.

## Nicht geändert

- Keine Änderung an GPX-/KML-/PR-Kerndaten.
- Keine Live-Statusabfrage.
- Keine automatische Routenoptimierung.
- Keine Service-Worker-Änderung.
- Keine Hotspot-/Heatmap-Integration.
- Keine lokalen echten POI-Bilder.

## Bekannte Grenzen

- Bilder fehlen weiterhin; es wird der Placeholder verwendet.
- V2-POI-Kategorien werden über einen Adapter in die bestehende App-Kategorie-Logik gemappt.
- Porto-Santo-/PSPR-Daten werden als Textdaten mitgeführt, aber die aktuelle App-Liste enthält weiterhin nur die vorhandenen 37 Madeira-PRs aus der bisherigen App-Struktur.
- Legacy-Daten bleiben als Kontextdaten erhalten; Dubletten werden nicht hart gelöscht.

## Upload-Hinweis

PC-Upload empfohlen. Neue/geänderte Ordner enthalten:

- `data/`
- `assets/poi/`
- `docs/poi/`

Am iPhone ist ein vollständiger Ordnerupload nach GitHub fehleranfällig.
