PR Explorer Madeira V3.9.4

Route Style & Trip Polish. Track-Farben werden über eine PRX-eigene dunkle Inline-Farbwahl gesetzt; keine native iOS-Farbkarte mehr für GPX/KML.


## V3.9.4 SAFE CONTENT FALLBACK

- Startpfad wieder ohne dynamischen V2-Textdatei-Loader.
- PRX-V2-PR-Texte sind als passive eingebettete Zusatzschicht im Modul `prx-v394-safe-content-fallback.js` enthalten.
- Keine externen Zusatzdateien blockieren den Start.
- Wenn die Textanreicherung fehlschlägt, bleibt Journal/Karte bedienbar.
