# PR-Explorer Madeira V3.7.4 MODAL ISOLATION

## Geändert

- Reise-, Optionen-, Einstellungen- und Filterbereiche werden als echte isolierte App-Ebene behandelt.
- Während eine dieser Rubriken geöffnet ist, werden Journal, Karte, Detailkarte, POI-Dock, Top-Controls und Bottom-Navigation pauschal ausgeblendet und deaktiviert.
- Vertikale Gesten scrollen nun die aktive Rubrik selbst, nicht mehr das darunterliegende Journal-/Kartenmaterial.
- Aktive Rubriken erhalten einen eigenen vollflächigen, scrollbaren Container mit stärkerem Hintergrund und Sticky-Kopfzeile.
- Datumseingaben und Listenzeilen bleiben größer/bedienbarer.
- Escape-Taste schließt offene Rubriken im Desktop-Test.

## Nicht geändert

- Keine neuen PR-/GPX-/KML-/POI-Rohdaten.
- Keine OSM-Live-POI-Abfrage.
- Keine Live-Statusabfrage.
- Keine neue Assetstruktur.
- Keine Service-Worker-Änderung.

## Hinweis

Dieser Patch folgt der Entscheidung: Wenn Reise, Optionen oder Einstellungen aktiv sind, werden alle anderen App-Inhalte ausgeblendet, damit keine Layer-/Scroll-Konflikte entstehen.
