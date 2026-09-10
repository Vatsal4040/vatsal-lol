@echo off
title Ambient Memory - Correct Folder Server
cd /d "E:\DOWNLOADS\VATSAL-GOOGLE\CHROME DOWNLOADS\ambient-memory-v1-four-scenes"

echo Starting Ambient Memory from:
echo %CD%
echo.
echo Open: http://localhost:8000
echo.

start "" "http://localhost:8000/index.html"
python -m http.server 8000
pause
