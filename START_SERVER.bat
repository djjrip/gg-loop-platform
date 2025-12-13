@echo off
echo ===================================================
echo      GG LOOP PLATFORM - PRODUCTION SERVER
echo ===================================================
echo.
echo 1. Starting optimized production server...
echo.
echo    Server will open at: http://localhost:5000
echo.
echo ===================================================
cd /d "%~dp0"
call npm start
pause
