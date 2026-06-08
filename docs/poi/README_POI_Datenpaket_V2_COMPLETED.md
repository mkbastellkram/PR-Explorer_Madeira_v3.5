# PRX POI Datenpaket V2

Stand: 2026-06-08 07:09

## Zweck
Dieses Paket trennt die PR-Explorer-Daten sauber in:

1. PR-Wanderwege
2. PR-Kontext-Altbestand ohne Datenverlust
3. Standard-/Funktions-POIs
4. Sehenswürdigkeiten/Highlight-POIs

## Zentrale Entscheidung
Excel bleibt Master-/Pflegedatei. Die PWA soll später keine XLSX-Datei lesen, sondern fertig vorbereitete JS-Dateien unter `data/`.

## Bildstrategie
- Für die Datenbank wird ein vollständiger Satz von ca. 100 Sehenswürdigkeiten vorbereitet.
- In der App werden zunächst nur die wichtigsten 25 bis 40 Sehenswürdigkeiten mit lokalen Thumbnails versorgt.
- Alle weiteren Sehenswürdigkeiten erhalten Bild-/Info-Links statt lokaler Bilddateien.
- Hero-Bilder werden optional per Lazy-Load eingebunden.
- Galerie/Karussell nur für kuratierte Top-POIs mit sicheren Bildrechten.

## Standard-POIs
Standard-POIs sollen bevorzugt aus OSM/Overpass gewonnen werden, aber nicht komplett ungefiltert lokal gespeichert werden. Sinnvoll ist eine kuratierte Auswahl entlang Hotel, PR-Startpunkten, GPX/KML-Anfahrten und Tagesrouten.

## Produktiv-Regel
Produktiv anzeigen nur:

```js
item.importReady === true && item.auditStatus === "ok"
```

## GitHub-Hinweis
Dieses Paket enthält neue/geänderte Ordner:

- `data/`
- `assets/`
- `docs/`

Am iPhone sind komplette Ordner-Uploads nach GitHub umständlich. Für den ersten Import besser per PC hochladen.


## PRX_POI_Datenpaket_V2_COMPLETED · Stand 2026-06-08

Dieses Paket wurde bereinigt und ohne produktive Template-Leerzeilen erzeugt.

Produktiv gepflegt:
- Sehenswuerdigkeiten: 40 kuratierte Highlight-POIs, davon 40 importReady=true.
- Standard_POI_Template: 50 Standard-/Funktions-POIs, davon 50 importReady=true.
- POI_PR_Kontext_Altbestand: 32 geprüfte Legacy-Datensätze, Dubletten gegen Highlights markiert.

Wichtige Regeln:
- Lokale Bildpfade wurden nicht gesetzt, wenn kein Bild mit dokumentierter Lizenz im Paket vorhanden ist.
- Produktive JS-Dateien enthalten nur importReady=true-Datensätze.
- Webcams und Funktions-POIs sind nicht als Sehenswürdigkeiten klassifiziert.
- Leere Template-Zeilen wurden aus den produktiven Tabellen entfernt.
