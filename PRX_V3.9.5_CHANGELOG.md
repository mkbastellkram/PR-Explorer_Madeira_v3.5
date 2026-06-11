# PRX V3.9.5 DRIVE TIME REALISM

## Geändert
- Realistische Anfahrtszeit-Korrektur ergänzt.
- Google-Maps-Zeit bleibt Originalwert; zusätzlicher Planwert wird separat berechnet.
- Faktoren/Puffer: Madeira-Faktor 1,15–1,30, Verkehr, Gruppenpuffer, Parkplatzsuche, Weg Parkplatz→Start, optionale Zwischenstopps.
- Presets: Ruhig, Madeira realistisch, Hauptsaison, Mit Zwischenstopp.
- Detailkarten erhalten Block „Anfahrt realistisch“.
- Einstellungen/Reise bekommen eine steuerbare Anfahrtszeit-Karte, soweit die Rubrik geöffnet ist.
- Werte werden lokal gespeichert unter `prx.driveTime.v395`.

## Nicht geändert
- Keine PR-/GPX-/KML-/POI-Rohdaten geändert.
- Keine Kartenarchitektur geändert.
- Kein Service Worker.
- Keine neuen Ordner.
