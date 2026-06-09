# PR-Explorer Madeira V3.8.2 CRITICAL LOAD FIX

Korrekturbuild nach GitHub-Upload-Audit: prx-v377 eingebunden, prx-v380 nach App-Initialisierung geladen, doppelter Leaflet-CSS-Import entfernt, short_name versionsfrei gesetzt, Versionssync beibehalten.

# PR-Explorer Madeira V3.8.0 OSM LIVE POI LAYER

Basis: V3.7.8 Detail Open Recovery.

Diese Version ergänzt einen separaten OSM-Live-POI-Layer.

OSM-Live-POIs sind nicht kuratierte Community-Daten und bleiben getrennt von PRX Highlight-/Standard-POIs.

# PR-Explorer Madeira V3.7.8 SETTINGS ENGINE

Stabilisiert die zweiten Ebenen von Optionen, Einstellungen und Reise auf Basis der V3.7.4/V3.7.5-Modal-Isolation.

Schwerpunkt:
- kein Durchscheinen darunterliegender Inhalte
- keine vertikale Containerdrift
- Cover-weich + horizontaler Lock
- erste wirklich gespeicherte Optionen/Einstellungen
- Reisezeitraum und Tagesdetails als stabile zweite Ebene

Keine neuen Daten oder Asset-Ordner.


## V3.7.8

Interaktive Liniensteuerung, Favoriten-Badges, Status-/Buchungsblock, Icon-/Symbol-Testebene und aktive Detailtext-Testauswahl ergänzt.

## V3.7.8 DETAIL OPEN RECOVERY
Recovery-Build nach Freeze beim Öffnen einer PR-Detailkarte. Entfernt die automatische Zusatzlogik/Observer-Schleife aus V3.7.7 und kapselt Status-/Buchungsblock defensiv.
