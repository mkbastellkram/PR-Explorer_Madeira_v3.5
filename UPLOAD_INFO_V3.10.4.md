# Upload-Info · PR Explorer Madeira V3.10.4

## Kurzzeile
V3.10.4: `index.html` ersetzen, `prx-v3104-detail-scroll-feedback.js` und Changelog neu hochladen; keine Ordneränderungen.

## Vollständiger Infoblock

Version: PR Explorer Madeira V3.10.4

Ziel:
- Karten-Detailseite erhält dieselbe überlaufende Scrolllogik wie Journal.
- Bottom-Navigation bleibt darüber fixiert.
- Buttonfeedback wird global sauberer unterscheidbar: Toggle, Action, Statusauswahl.

Hochzuladende Dateien:
1. `index.html` ersetzen
2. `prx-v3104-detail-scroll-feedback.js` neu in Repo-Root hochladen
3. `PRX_V3.10.4_CHANGELOG.md` neu in Repo-Root hochladen
4. `UPLOAD_INFO_V3.10.4.md` optional neu in Repo-Root hochladen

Keine neuen/geänderten Ordner:
- `assets/` unverändert
- `data/` unverändert
- `docs/` unverändert

Nach Upload prüfen:
1. GitHub Pages öffnen.
2. Safari/iPhone Cache ggf. hart aktualisieren.
3. App-Version im Titel/Repo: V3.10.4.
4. Journal öffnen: Head/Bottom weiterhin wie V3.10.3.
5. Karte öffnen und PR-Detail anzeigen.
6. Detailseite muss vertikal bis unten scrollen, ohne an der Bottom-Nav hängen zu bleiben.
7. Statusbuttons testen: Offen/Eingeschränkt/Geschlossen/Prüfen müssen sichtbar aktiv werden.
8. Audit kopieren testen: Button muss kurz Done anzeigen und Toast liefern.
