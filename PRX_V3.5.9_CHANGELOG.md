# PR-Explorer Madeira V3.5.9 · Änderungsprotokoll

Basis: V3.5.8_STABILIZED  
Ziel: Bedienungsstabilisierung nach Interview V3.5.9

## Geändert

### Gesten / kompakte Detailkarte
- Vertikale Bewegung in kompakter Karussellposition ist gesperrt.
- Kleine diagonale Bewegungen führen nicht mehr zu vertikalem Flattern.
- Vertikale Aktion erst ab `max(90 px, 50 % der kompakten Detailkartenhöhe)`.
- Vertikale Aktion zusätzlich nur bei klar vertikaler Bewegung: `abs(deltaY) > abs(deltaX) * 1.25`.
- Horizontales Wischen der kompakten Detailkarte folgt der Fingerbewegung.
- PR-Wechsel erfolgt erst ab horizontaler Schwelle `max(88 px, 24 % Kartenbreite)`.
- Nach Überschreiten der Schwelle gleitet die Karte aus, der nächste/vorherige PR wird geladen und die Karte gleitet wieder ein.
- Kein diagonales Mitschwimmen der kompakten Detailkarte.

### UI-Icons / Einstellungen
- CSS-Variable `--ui-icon-scale` ergänzt.
- UI-Icons in Top-Controls und Bottom-Navigation skalieren darüber.
- Admin-Testoption in Einstellungen ergänzt:
  - 0.90×
  - 1.00×
  - 1.15×
  - 1.30×
  - 1.45×
- Startwert: 1.15×, entspricht ca. 26–28 px je nach Symbol.
- Einstellung wird lokal in `localStorage` unter `prx.ui.v359` gespeichert.

### App-Icon-Struktur
- Ordner `assets/app-icons/` ergänzt.
- Zehn gelieferte App-Icon-Motive als vorbereitete PNG-Dateien aufgenommen.
- Standard-Homescreen-Icon vorbereitet: `prx-map-route`.
- `apple-touch-icon` ergänzt.
- Manifest-Icons 192/512 px ergänzt.

### Linienbild GPX/KML
- GPX bleibt rot, 5 px.
- KML ist jetzt blau, durchgezogen, 5 px.
- KML ist nicht mehr gestrichelt.
- Weiße Kontur technisch vorbereitet und aktiv:
  - Hauptlinie 5 px
  - Outline-Layer 6 px gesamt, entspricht ca. 0,5 px Kontur je Seite
- Vollständige Liniensteuerung bleibt späterem Patch vorbehalten.

## Nicht geändert

- Keine neue Navigationsarchitektur.
- Keine separaten Karussellkarten.
- Keine POI-Integration.
- Keine Webcams/Tunnel/Wasserfälle-Integration.
- Keine vollständige Linien-Einstellzentrale.
- Keine Service-Worker-Änderung.
- Keine Änderung der PR-/GPX-/KML-Rohdaten.

## Noch offen

- Icongröße nach iPhone-Test final festlegen.
- Vollständige GPX/KML-Liniensteuerung später wieder einbauen.
- POI-Daten erst nach Bedienungsstabilisierung integrieren.
- App-Icon-Auswahl in der UI später optional ausbauen.

## Bekannte Risiken

- Homescreen-Icon einer bereits installierten PWA ändert sich auf iOS meist nicht automatisch; ggf. muss die PWA neu zum Home-Bildschirm hinzugefügt werden.
- Horizontale Karussellanimation muss auf echtem iPhone getestet werden; Desktop-Mausverhalten ist nur eingeschränkt vergleichbar.
