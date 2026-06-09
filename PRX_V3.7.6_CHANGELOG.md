# PR-Explorer Madeira V3.7.6 SETTINGS ENGINE

## Geändert
- Zweite Ebenen von Optionen, Einstellungen und Reise technisch stabilisiert.
- Detailseiten in Optionen/Einstellungen/Reise vollständig isoliert: kein Durchscheinen darunterliegender App-Inhalte.
- Vertikales Wegschubsen der Rubrik-Detailseiten blockiert; nur der Seiteninhalt scrollt intern.
- Cover-weich + horizontaler Lock für Hauptliste -> Detailseite und Rechtswisch zurück ergänzt.
- Optionen schreiben in den bestehenden App-Optionsspeicher `prx.options.v370`.
- Einstellungen schreiben in den bestehenden App-Settingsspeicher `prx.appSettings.v370`.
- Reisezeitraum schreibt in `prx.trip.v370`.
- Erste Einstellungen funktional belegt: Kartenstil, Snap, Bewegung, Detailtextmodus, Glass, Schrift, Icongröße, Daten-/Status-/POI-Reset.
- Reisebereich mit stabiler Tagesliste und Tagesdetail in zweiter Ebene.
- Bewegungen der Rubrikseiten weiter gleitend statt rasend.
- Version und Cache-Parameter auf 3.7.6 gesetzt.

## Nicht geändert
- Keine neuen PR-/GPX-/KML-/POI-Rohdaten.
- Keine OSM-Live-POI-Abfrage.
- Keine Hotspot-/Heatmap-Integration.
- Keine Live-Statusabfrage.
- Keine automatische Tagesroutenoptimierung.
- Keine neuen Ordner/Assets.
- Keine Service-Worker-Änderung.

## Hinweis
V3.7.6 ist ein Settings-Engine-Build. Ziel ist die stabile, isolierte und funktionale zweite Ebene von Optionen, Einstellungen und Reise.
