# PRX V3.5.12 CHANGELOG

## Geändert

- Filterfunktion reaktiviert.
- Regionfilter ergänzt.
- Statusfilter aus V3.5.11 beibehalten und in die neue Filterlogik integriert.
- Numerische Zwei-Anfasser-Filter ergänzt:
  - Anfahrt km
  - Anfahrtszeit
  - Wanderlänge
  - Wanderdauer
  - Höhenmeter
- Hybrid-Slider umgesetzt:
  - interne Rastpunkte aus echten vorhandenen PR-Datenwerten
  - sichtbare Lineal-/Zollstock-Skala mit reduzierten Hauptmarken
  - aktuelle Auswahl zeigt echte Werte, nicht gerundete Fantasiewerte
- Filterbereiche reagieren auf Region/Status-Vorauswahl.
- Trefferzahl ergänzt.
- Filter wirkt auf Journal-Liste und Kartenpins.
- Aktiver PR-Kontext wird beendet, wenn der aktive PR durch neue Filter nicht mehr sichtbar ist.
- Version und Cache-Parameter auf 3.5.12 gesetzt.

## Nicht geändert

- Keine neue Navigationsarchitektur.
- Keine POI-Integration.
- Keine Live-Statusabfrage.
- Keine Änderung an PR-/GPX-/KML-Rohdaten.
- Keine vollständige Linien-Einstellzentrale.
- Keine Service-Worker-Änderung.

## Hinweis

V3.5.12 ist eine Praxisversion zum Testen der Filterbedienung auf dem iPhone. Die Slider nutzen echte PR-Datenwerte als Rastpunkte und zeigen nur eine reduzierte Orientierungsskala, damit die UI nicht überladen wird.
