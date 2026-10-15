@echo off
cd /d "%~dp0"
echo Starting Complete the Search...
echo Open http://localhost:5500 in your browser.
py -m http.server 5500
pause
