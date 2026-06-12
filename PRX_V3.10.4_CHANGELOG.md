# PR Explorer Madeira · V3.10.4

## Schwerpunkt
Karten-Detailseite stabilisieren und globales Buttonfeedback vereinheitlichen.

## Änderungen

### D-01 · PR-Detailseite
- Detailseite nutzt in Karten-/Detailansicht jetzt das Journal-Überlaufprinzip.
- `#detailCard` läuft technisch bis `bottom: 0` und erhält unten ausreichend Innenabstand für Bottom-Navigation und iOS-Safe-Area.
- Vertikales Scrollen der Detailseite ist wieder eigenständig möglich.
- Detailkopf bleibt innerhalb der Detailseite sticky.

### N-01 · Bottom-Navigation
- Bottom-Navigation bleibt fest über dem Inhalt.
- Keine zusätzliche harte Detailbegrenzung oberhalb der Navigation.
- Detailinhalt darf hinter die Navigation scrollen, wird aber durch Padding freigehalten.

### T-00 · Top-Control-Leiste
- Top-Control-Höhe wird dynamisch gemessen.
- Detailseite startet unterhalb der Top-Controls.

### Globales Buttonfeedback
- Einführung der Laufzeitklassen:
  - `.prx-toggle` für einrastende Schalter.
  - `.prx-action` für momentane Taster.
  - `.prx-status-choice` für Statusauswahl.
- Klicks erhalten eine kurze visuelle Pulse-Rückmeldung.
- Aktionsbuttons erhalten Busy-/Done-Zustand.
- Relevante Aktionen lösen Toast-Meldungen aus.

### S-01/S-02 · Status & Buchung
- Statusbuttons werden als Radio-State-Gruppe behandelt.
- Nur der gewählte Status wird aktiv markiert.
- Statuswechsel erzeugt Toast-Rückmeldung.

### A-00/A-01/A-02/A-03 · Audit/Admin
- Audit-/ID-Schalter erhalten Toggle-Kennzeichnung.
- Audit-kopieren-Button erhält Done-Feedback und Toast.

## Dateien
- `index.html`
- `prx-v3104-detail-scroll-feedback.js`
- `PRX_V3.10.4_CHANGELOG.md`
- `UPLOAD_INFO_V3.10.4.md`

## Ordneränderungen
Keine neuen oder geänderten Ordner.
