@echo off
echo ===================================================
echo      GG LOOP DIAGNOSTIC START (PORT 3000)
echo ===================================================
echo.
cd /d "%~dp0"

echo 1. Setting PORT to 3000...
set PORT=3000

echo 2. Checking node version...
node -v

echo 3. Starting server with verbose logging...
echo.
call npm run dev > server_error.log 2>&1

echo.
echo ===================================================
echo SERVER CRASHED OR STOPPED.
echo.
echo LAST 20 LINES OF LOG:
echo ---------------------------------------------------
powershell -Command "Get-Content server_error.log -Tail 20"
echo ---------------------------------------------------
echo.
pause
