# PRX POI-Datenpaket V2 COMPLETED · Auditbericht

## Kurzfazit

Das Paket ist deutlich weiter als V2-Auditstand und enthält echte Daten statt leerer Templates. **Bilder fehlen**, sind aber sauber über Placeholder-/Remote-Suchlink-Strategie abfangbar. Für eine App-Integration ist das Paket grundsätzlich geeignet, jedoch nicht als blinder 1:1-Ersatz der bestehenden `data.js`-Kernlogik.

Empfehlung: als **V3.7.1 DATA V2 FOUNDATION / TEXT+POI IMPORT** vorbereiten, mit Adapterlogik und ohne harte Ersetzung von GPX/KML/Trail-Kernlogik.

## Paketstruktur

- `CHANGELOG.md` (635 Bytes)
- `PRX_Datenbank_Masterstruktur_V2.xlsx` (86125 Bytes)
- `PRX_POI_Datenpaket_V2_COMPLETION_REPORT.md` (2639 Bytes)
- `README.md` (2171 Bytes)
- `assets/poi/gallery/README.txt` (60 Bytes)
- `assets/poi/heroes/README.txt` (81 Bytes)
- `assets/poi/placeholders/poi_placeholder.svg` (397 Bytes)
- `assets/poi/thumbs/README.txt` (111 Bytes)
- `data/highlight-pois-madeira.js` (69716 Bytes)
- `data/highlight-pois-madeira.template.js` (1394 Bytes)
- `data/legacy-pr-context-pois.js` (31450 Bytes)
- `data/legacy-pr-context-pois.template.js` (980 Bytes)
- `data/pr-routes-madeira.js` (43441 Bytes)
- `data/pr-routes-madeira.template.js` (579 Bytes)
- `data/standard-pois-madeira.js` (51054 Bytes)
- `data/standard-pois-madeira.template.js` (650 Bytes)
- `docs/Arbeitsauftrag_ChatGPT_V2.md` (1051 Bytes)
- `docs/Arbeitsauftrag_CodeKollege_V2.md` (1551 Bytes)
- `docs/PRX_Kurztexte_PR_POI_V1_Audit.md` (6496 Bytes)
- `docs/PRX_POI_Arbeitsauftrag_an_ChatGPT_V1.md` (4339 Bytes)
- `docs/PRX_POI_Import_Anforderungen_V1.xlsx` (47815 Bytes)

## Excel-Blätter und Importstatus

| Blatt | Zeilen | ImportReady true | ImportReady false | Auditstatus |
|---|---:|---:|---:|---|
| `README` | 7 |  |  |  |
| `PR_Wanderwege` | 40 | 40 | 0 | ok: 40 |
| `POI_PR_Kontext_Altbestand` | 32 | 25 | 7 | ok: 25, merged: 7 |
| `Standard_POI_Template` | 50 | 50 | 0 | ok: 50 |
| `Sehenswuerdigkeiten` | 40 | 40 | 0 | ok: 40 |
| `Media_Strategy` | 8 |  |  |  |
| `OSM_Standard_POI_Strategie` | 6 |  |  |  |
| `Kategorien` | 31 |  |  |  |
| `Export_Regeln` | 8 |  |  |  |
| `Original_PR_Steckbriefe` | 40 |  |  |  |
| `Original_POI_Steckbriefe` | 32 |  |  |  |
| `Original_README` | 6 |  |  |  |

## JS-Dateien

| Datei | Objektname | Datensätze | Syntax |
|---|---|---:|---|
| `data/highlight-pois-madeira.js` | `PRX_HIGHLIGHT_POIS_MADEIRA` | 40 | OK |
| `data/standard-pois-madeira.js` | `PRX_STANDARD_POIS_MADEIRA` | 50 | OK |
| `data/pr-routes-madeira.js` | `PRX_PR_ROUTES_MADEIRA` | 40 | OK |
| `data/legacy-pr-context-pois.js` | `PRX_LEGACY_PR_CONTEXT_POIS` | 25 | OK |

## Inhaltlicher Befund

### PR_Wanderwege

- 40 PR-/PSPR-Routen, alle `importReady=true`, alle `auditStatus=ok`.
- Geeignet als PR-Text-/Zusatzdatenschicht.
- Nicht als alleinige Quelle für GPX/KML ersetzen; bestehende GPX-/KML-Integration bleibt führend.

### Sehenswuerdigkeiten / Highlight-POIs

- 40 kuratierte Highlight-POIs, alle `importReady=true`, alle `auditStatus=ok`.
- Lokale Bilder fehlen bewusst; `offlinePlaceholder` ist gesetzt.
- `thumbnailRemoteUrl` / `infoImageSearchUrl` sind Such-/Prüflinks, keine lokal eingebundenen Bilddateien.
- Für das Highlight-Karussell geeignet, sofern UI nur `isHighlightPoi=true` und keine Funktions-POIs verwendet.

### Standard_POI_Template / Funktions-POIs

- 50 Standard-/Funktions-POIs, alle `importReady=true`, alle `auditStatus=ok`.
- Datensatz enthält Startpunkte/Trailheads und funktionsbezogene POIs.
- In der App nicht im Highlight-Bereich anzeigen; nur Kategoriezeilen/Karussell nach Kategorie.

### POI_PR_Kontext_Altbestand

- 32 Altbestandszeilen.
- 25 exportierbar, 7 nicht produktiv.
- 7 Legacy-Datensätze sind als `merged` gekennzeichnet und sollen nicht parallel produktiv erscheinen.

## Prüfhinweise / Risiken

- **Bilder fehlen:** keine lokalen Thumbnails/Hero-/Gallery-Bilder enthalten, nur `poi_placeholder.svg` und README-Dateien in Assetordnern.
- **PC-Upload empfohlen:** Paket enthält `data/`, `assets/`, `docs/`.
- **Objektnamen weichen von ursprünglichen Template-Namen ab:** produktive Dateien nutzen z. B. `window.PRX_HIGHLIGHT_POIS_MADEIRA` statt `window.PRX_HIGHLIGHT_POIS`. Integration braucht Adapter oder App-Code-Anpassung.
- **Legacy nicht blind importieren:** `legacy-pr-context-pois.js` enthält nur 25 Datensätze; 7 gemergte Datensätze sind bewusst ausgeschlossen.
- **Status 2026-06-07 ist Momentaufnahme:** nicht als Live-Status verwenden.
- **Hotspot-Felder sind vorbereitet:** `hotspotCandidate`, `crowdScore`, `parkingRisk`, `tourBusRisk`, `photoSpotRisk`; noch kein fertiger Hotspot-Layer.
- **OSM-/Funktions-POIs:** Qualität trotzdem stichprobenartig prüfen, besonders WC/Parkplatz/Versorgung.

## Importempfehlung

### Freigeben für nächsten Build

- `pr-routes-madeira.js` als zusätzliche PR-Text-/Metadatenquelle.
- `highlight-pois-madeira.js` als Highlight-POI-Datenquelle.
- `standard-pois-madeira.js` als Kategorie-/Funktions-POI-Datenquelle.
- `poi_placeholder.svg` als Bildfallback.
- Dokumentation aus `docs/` ins Admin-/Entscheidungsarchiv.

### Nicht tun

- keine bestehenden PR-/GPX-/KML-Daten hart ersetzen.
- keine Funktions-POIs in Highlight-Karussell mischen.
- keine fehlenden Bilder durch zufällige Webbilder ersetzen.
- keine Popular-Times-/Strava-Heatmap-Logik daraus ableiten.

## Nächster sinnvoller Build

`V3.7.1 DATA V2 IMPORT FOUNDATION`

Umfang:
- Datenadapter für neue Objektnamen.
- Highlight-/Standard-POI-Trennung aus Paket V2 übernehmen.
- PR-Textschicht aus `PR_Wanderwege` in PR-Details einblenden.
- Placeholder-Bildlogik aktivieren.
- Legacy-Merge respektieren.
- Keine neuen Bilder erforderlich.
