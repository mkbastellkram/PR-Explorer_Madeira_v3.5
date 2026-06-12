# PRX V3.10.1 COMPONENT AUDIT MODE

## Geändert
- Komponenten-Audit-Modus ergänzt.
- Zentrale UI-Bauteile erhalten stabile Komponenten-IDs.
- Wiederverwendete Komponenten erhalten Basis-ID, konkrete Vorkommen Instanzsuffixe.
- Audit-Overlay zeigt IDs direkt im UI an.
- Audit-Panel erzeugt gegliederte kopierbare Audit-Rückmeldung.
- Globale API: `window.PRX_AUDIT.open()`, `report()`, `collect()`, `toggle()`.

## Nicht geändert
- Keine PR-/GPX-/KML-/POI-Rohdaten geändert.
- Keine Kartenarchitektur geändert.
- Kein Service Worker.
- Keine neuen Ordner.

## Hinweis
Der Audit-Modus soll Änderungswünsche künftig eindeutig adressierbar machen, z. B. `T-06@journal`, `J-05@PR1.2` oder `D-04`.
