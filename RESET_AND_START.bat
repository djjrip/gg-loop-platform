@echo off
echo ===================================================
echo      GG LOOP PLATFORM - EMERGENCY RESET
echo ===================================================
echo.
echo 1. Killing any stuck Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
echo.

echo 2. Cleaning project files (this might take a moment)...
if exist node_modules rmdir /s /q node_modules
if exist dist rmdir /s /q dist
if exist .next rmdir /s /q .next
echo.

echo 3. Reinstalling dependencies...
call npm install
echo.

echo 4. Starting Development Server...
echo.
echo    When you see "serving on port 5000", 
echo    please open: http://localhost:5000
echo.
echo ===================================================
call npm run dev
pause
