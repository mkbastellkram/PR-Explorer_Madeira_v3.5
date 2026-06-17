@echo off
setlocal
cd /d "%~dp0"
echo PR-Explorer Madeira V4.0.4 Recovery Baseline
echo.
echo Lokaler Server startet auf http://localhost:4173
echo Browser oeffnen und diese Adresse verwenden.
echo Zum Beenden dieses Fensters: Strg+C
echo.
"%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" -m http.server 4173 --bind 127.0.0.1
