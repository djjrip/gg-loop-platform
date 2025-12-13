@echo off
title GG LOOP SERVER (BUNDLED)
echo ===================================================
echo      GG LOOP PLATFORM - STABLE START
echo ===================================================
echo.
echo 1. Starting Bundled Server...
echo.
echo    Server will open at: http://localhost:5000
echo.
echo ===================================================

set NODE_ENV=development
set PORT=5000

:: Run the bundled server file
node server.js

pause
