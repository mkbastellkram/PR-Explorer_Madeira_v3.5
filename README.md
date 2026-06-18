# PR-Explorer Madeira V5 Recovery

V5 ist ein kontrollierter Neuaufbau aus den gesicherten Rohdaten. Ziel ist nicht, V4 weiter zu flicken, sondern eine stabile Basis ohne Audit-, Recovery- und Patchketten zu schaffen.

## Stand

Version: `V5.0.0 Recovery Core`

Enthalten:

- Datenimport aus `PR – V1.xlsx` inklusive eingebetteter Hyperlinks
- Text-/Status-/POI-Ergaenzung aus `PRX_Kurztexte_PR_POI_V1.json`
- GPX-Import aus `Gpx (1).zip`
- KML-Import aus `KML (1).zip`
- Leaflet-Karte
- PR-Pins
- Journal-Liste mit Suche und sichtbaren Regionschips
- Detail-Sheet mit Kurz-Dashboard
- GPX rot, KML blau
- Segmenttrennung gegen KML-/GPX-Luftlinien
- zentrale Versionierung in `src/version.js`

## Bewusste Grenzen

- kein Audit/Recording
- keine V3-/V4-Patchdateien
- POIs sind importiert, aber noch nicht in die UI integriert
- Dashboard ist nur Datenstatus
- PR9-KML-Datei ist leer und wird deshalb als fehlend behandelt
- Porto-Santo-Routen haben in den gelieferten ZIPs keine GPX/KML-Dateien

## Lokaler Start

Im Ordner `PR-Explorer-Madeira-V5-Recovery` einen lokalen HTTP-Server starten, z.B.:

```powershell
python -m http.server 5175
```

Dann öffnen:

```text
http://127.0.0.1:5175
```

`file://` ist nicht geeignet, weil die App JSON-, GPX- und KML-Daten per `fetch()` lädt.
