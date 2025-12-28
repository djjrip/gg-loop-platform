@echo off
REM GG Loop - One-Click Automation Starter
REM Run this to start all automation tools at once

echo ========================================
echo   GG LOOP Automation Starter
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo [1/3] Starting Health Monitor...
start "GG Loop Health Monitor" cmd /k "cd /d "%~dp0" && node scripts/auto-health-monitor.js"
timeout /t 2 /nobreak >nul

echo [2/3] Opening Job Tracker...
start "" "%~dp0scripts\job-tracker.html"
timeout /t 2 /nobreak >nul

echo [3/3] Generating LinkedIn Post...
call node scripts/linkedin-auto-content.js
echo.

echo ========================================
echo   Automation Started Successfully!
echo ========================================
echo.
echo Health Monitor: Running in background window
echo Job Tracker: Opened in browser
echo LinkedIn Post: Check linkedin-posts/ folder
echo.
echo Press any key to exit (automation keeps running)...
pause >nul
