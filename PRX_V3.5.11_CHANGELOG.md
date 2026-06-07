# PR-Explorer Madeira V3.5.11 STABILIZED

## Geändert
- Status-Testmodell ergänzt: offen / eingeschränkt / geschlossen / prüfen.
- Bewusst gemischte Teststatus für PRs gesetzt, damit Filter und Kompaktanzeige praktisch geprüft werden können.
- Statuswerte liegen in einer später überschreibbaren lokalen Struktur (`prx.status.v3511`).
- Kompakte Detailkarte zeigt nur ein einzelnes Ampelsymbol für die aktive Solo-PR. Keine Dreier-Ampel, keine bunte Statusgruppe.
- Statusfilter ergänzt: Alle, Offen, Eingeschränkt, Geschlossen, Prüfen.
- Journal-Karten zeigen den jeweiligen Teststatus.
- Volle Detailkarte zeigt Status als Fact-Kachel.
- Version und Cache-Parameter auf 3.5.11 gesetzt.

## Nicht geändert
- Keine Live-Statusabfrage.
- Keine POI-Integration.
- Keine neue Navigationsarchitektur.
- Keine Änderung an PR-/GPX-/KML-Rohdaten.
- Keine Service-Worker-Änderung.

## Hinweis
Die Statuswerte sind bewusst Testdaten. Später können sie durch MadeiraJourney-/offizielle Statusabfrage oder JSON-Import überschrieben werden.
