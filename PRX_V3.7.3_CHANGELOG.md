# PR-Explorer Madeira V3.7.3 SETTINGS SYMBOL SYSTEM

## Änderungen

- Einstellungen/Optionen weiter in Richtung zweistufiges Bedienmodell ausgebaut.
- Systemweite Gestenregel vorbereitet: Cover weich + horizontaler Lock.
- Sobald ein horizontaler Swipe erkannt wird, wird die vertikale Achse stabilisiert.
- Detailübergang Journal → Detail optisch ruhiger: Detail legt sich stärker über die Liste, sichtbare Lücken werden reduziert.
- Snap-/Magnetwirkung weiter entschärft.
- Einstellungen → Darstellung erweitert:
  - Detailtext-Testmodus Aus / 150 Zeichen / 280 Zeichen / Beide.
  - Fake-/Testtexte überschreiben keine echten V2-Texte, sondern dienen nur der Layoutprüfung.
- Einstellungen → Bedienung & Gesten erweitert:
  - Cover weich + horizontaler Lock dokumentiert.
  - Snap weich / mittel / fest bleibt testbar.
- Einstellungen → Icons & Symbole erweitert:
  - UI-Icon-Skalierung bleibt erhalten.
  - App-Icon-Vorschau ergänzt.
  - Symbol-Taxonomie für POI-/Kategorie-Symbole vorbereitet.
- Optionen → Linien & Tracks erweitert:
  - GPX-/KML-Linienbild als strukturierte Einstellseite vorbereitet.
  - OSM-Hiking-Nachzeichnung weiterhin vorgemerkt, noch nicht produktiv umgesetzt.
- Linklogo-Darstellung weiter normalisiert.
- Version und Cache-Parameter auf 3.7.3 gesetzt.

## Nicht geändert

- Keine neuen PR-/GPX-/KML-/POI-Rohdaten.
- Keine OSM-Live-POI-Abfrage.
- Keine Live-Statusabfrage.
- Keine automatische Tagesroutenoptimierung.
- Keine Hotspot-/Heatmap-Integration.
- Keine neuen Asset-Ordner.
- Keine Service-Worker-Änderung.

## Hinweis

V3.7.3 ist ein Struktur- und Bedienpatch. Ziel ist, die zweite Ebene der Einstellungen/Optionen und das Gestenverhalten für weitere Module belastbarer zu machen.
