# PR-Explorer Madeira V3.5.10 STABILIZED

## Geändert

- Vertikale Drag-Bewegung der Detailkarte stärker begrenzt.
- Kompakte Detailkarte darf beim vertikalen Ziehen nur bis zur definierten Schwelle mitlaufen.
- Kein unkontrolliertes Durchziehen der Detailkarte bis an/unter den Displayboden.
- Scroll-Clamp wird während aktiver Detail-Geste deaktiviert, damit Scroll- und Drag-Logik nicht gegeneinander arbeiten.
- Doppelte Touch-/Pointer-Auslösung auf iOS entschärft.
- Versionsnummer und Cache-Parameter auf 3.5.10 gesetzt.

## Nicht geändert

- Keine neue Navigationsarchitektur.
- Keine POI-Integration.
- Keine neuen Daten.
- Keine Linien-Einstellzentrale.
- Keine Service-Worker-Änderung.

## Bekannte Risiken

- Die Gestenlogik bleibt feinfühlig und sollte auf dem iPhone direkt getestet werden.
- Falls das Flattern weiterhin nur bei sehr bestimmten Bewegungen auftritt, muss der konkrete Zustand geprüft werden: Peek → Full, Full → Peek oder Scrollen am unteren Detailkartenende.
