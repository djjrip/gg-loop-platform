@echo off
echo 👻 Opening chrome://extensions/...
echo.

REM Try to open in Chrome
start chrome chrome://extensions/ 2>nul
if %errorlevel% neq 0 (
    start "" "chrome://extensions/"
)

echo.
echo ✅ Chrome should have opened!
echo.
echo 📋 NEXT STEPS:
echo 1. Find "Ghost Bot - Virtual Assistant"
echo 2. Click the refresh icon (🔄)
echo 3. Check version shows v1.0.2
echo.
pause

