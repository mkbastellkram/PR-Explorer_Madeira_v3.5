# PR-Explorer lokal starten

Die App sollte nicht direkt per Doppelklick als `file://.../index.html` geöffnet werden, weil Browser dann `fetch()` auf `data/prs.json` und die Track-/Routen-Dateien blockieren können.

## Windows

1. `START_LOCAL_SERVER.bat` starten.
2. Im Browser `http://localhost:4173` öffnen.
3. Zum Beenden im Server-Fenster `Strg+C` drücken.

## Alternative

Im Projektordner:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Dann `http://localhost:4173` öffnen.
