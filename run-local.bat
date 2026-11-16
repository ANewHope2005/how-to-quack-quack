@echo off
title How to Quack Quack - Local Server Launcher
echo Server is starting at: http://localhost:8000
echo Open your browser and go to http://localhost:8000
echo.
python -m http.server 8000 2>nul || python -m SimpleHTTPServer 8000
pause