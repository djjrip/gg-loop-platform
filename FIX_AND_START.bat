@echo off
setlocal
title GG LOOP SERVER

echo ===================================================
echo      GG LOOP PLATFORM - STARTUP REPAIR
echo ===================================================
echo.

echo 1. Cleaning up old processes...
taskkill /F /IM node.exe >nul 2>&1
echo.

echo 2. Checking dependencies...
if not exist node_modules (
    echo    Installing dependencies (this may take a minute)...
    call npm install
)
echo.

echo 3. Starting Development Server...
echo.
echo    Please wait for "serving on port 5000"
echo    Then open: http://localhost:5000
echo.
echo ===================================================

:: Set environment variables explicitly
set NODE_ENV=development
set PORT=5000

:: Run directly with tsx to avoid npm script indirection issues
call npx tsx server/index.ts

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo    SERVER CRASHED WITH ERROR CODE %ERRORLEVEL%
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo.
    pause
)
