# PR-Explorer V5 Umsetzung Inventur

Stand: V5.0.28 Arbeitsstand

## Stabil umgesetzt

- V5-Rebuild als neue Codebasis auf `codex/v5-recovery-rebuild`
- Leaflet-Karte mit OSM, Topo und Sat-Basiskarten
- PR-Pins mit Status- und Aktivitaets-Badges
- aktive GPX/KML-Darstellung mit Linien-/Farbsteuerung
- Journal mit Filterchips und PR-Auswahl
- Detail-Sheet mit Peek/Expanded-Zustand und horizontalem PR-Wechsel
- Reise-Statuslogik: Favorit, geplant, IFCN, ignorieren
- Termin-Picker fuer geplant/IFCN
- Reise-Liste mit grober Fahr-/Kostenrechnung
- Info Center als datengetriebenes Modul
- Info-Auszug in Detailkarten mit Deep-Link ins Info Center
- Hoehenprofil im Detail-Sheet aus Trackdaten, Fallback aus Tabellenwerten
- POI-Kategorien inklusive Wasserfall, Tunnel, Webcam
- kuratierte Webcam-Kontexte als erste Datenebene
- optionaler OSM-POI-Importpfad ohne Runtime-Overpass
- Live-Routing-Modul vorbereitet: ORS optional, kein API-Key im Repo

## Teilweise umgesetzt

- Sehenswuerdigkeiten:
  - aktuelle PRX-POIs werden im Info Center kategorisiert angezeigt
  - echte Top-100-Liste fehlt noch als befuellter und auditierter Datensatz
- Webcams:
  - Struktur und Kontextpunkte vorhanden
  - direkte Live-Webcam-URLs noch nicht verifiziert
- Info Center:
  - Rankings, Foto, Insta360, Landschaft, Statistik vorhanden
  - Inhalte sind Startwerte und redaktionell noch nicht final
- POIs:
  - PR-Kontext-POIs vorhanden
  - Standard-POIs aus OSM nur als Sample/Importpfad, nicht als Vollbestand
- Hoehenprofile:
  - sichtbares Profil vorhanden
  - Detailwerte wie Start/Ende/Min/Max/Distanz sind rudimentaer, Interaktion fehlt noch

## Noch offen

- Top-100 Sehenswuerdigkeiten:
  - `PRX_HIGHLIGHT_POIS` Template ist vorhanden, aber nicht befuellt
  - Kategorien, Ranking, Quellen, Koordinaten, Medienrechte und Auditstatus fehlen
  - erst importieren, wenn `importReady=true` und `auditStatus=ok`
- POI-/Sehenswuerdigkeiten-Trennung:
  - Funktions-POIs, PR-Kontext-POIs und Highlight-Sehenswuerdigkeiten endgueltig trennen
- Filter:
  - Range-Regler sollen live vollstaendig voneinander abhaengig sein
  - Filterzustaende brauchen UX-Feinschliff
- Detail-Sheet:
  - finaler Feinschliff Gesten, Ruhe, Scroll-Stabilitaet
  - Kontextkarten-Aktionen: Karte fokussieren, Reise hinzufuegen, ausblenden
- Karte:
  - POI-Solo-/Globalmodus sauberer differenzieren
  - Pin-/POI-Ebenenprioritaet weiter verfeinern
- Statusdaten:
  - echte Visit-/Madeira-Statusabfrage noch nicht angebunden
- Routing:
  - ORS-Schluessel-UX, Cache-Anzeige, echte Route-to-POI Workflows
  - Fallback-KML-Auswahl pro Ziel verfeinern
- Reiseplanung:
  - Urlaubsdaten, Unterkunft, Fahrzeugprofil, Verbrauch und Reichweitenlogik finalisieren
- Bilder:
  - lizenzsichere Thumbnail-/Hero-Strategie fehlt noch
- Audit/Recording:
  - vorerst deaktiviert, spaeter als robustes Feedbackmodul neu aufsetzen

## Wichtige Architekturregeln

- Keine Runtime-Overpass-Abfragen in der App
- Keine Secrets/API-Keys ins Repository
- Wandertracks bleiben gepruefte GPX/KML-Daten
- Live-Routing bleibt separater Anfahrtslayer
- Info Center bleibt datengetrieben
- Top-100-Sehenswuerdigkeiten nur aus auditierter Highlight-POI-Datenbasis
