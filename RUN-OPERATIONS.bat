@echo off
REM GG LOOP - DAILY OPERATIONS CHECK
REM Run this every morning

echo ========================================
echo   GG LOOP COMMAND CENTER
echo ========================================
echo.

cd /d "%~dp0"

echo Running operations check...
echo.
node scripts/run-operations.js

echo.
echo ========================================
echo   NEXT ACTIONS
echo ========================================
echo.
echo 1. Check Twitter for new replies/DMs
echo 2. Respond to all engagement
echo 3. Follow up on warm leads
echo 4. Check user activity
echo.
echo Run again in 4 hours or after posting new tweet.
echo.
pause
