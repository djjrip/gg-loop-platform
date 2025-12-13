@echo off
echo ========================================
echo EMERGENCY FIX: PRODUCTION SERVER CRASH
echo ========================================
echo.

cd /d "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"

echo [1/3] Adding fix...
"C:\Program Files\Git\bin\git.exe" add server/routes.ts
if errorlevel 1 (
    echo ERROR: Failed to add
    pause
    exit /b 1
)

echo [2/3] Committing...
"C:\Program Files\Git\bin\git.exe" commit -m "CRITICAL FIX: Add missing closing bracket in routes.ts"
if errorlevel 1 (
    echo No changes
)

echo [3/3] Pushing...
"C:\Program Files\Git\bin\git.exe" push origin main
if errorlevel 1 (
    echo ERROR: Push failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ FIX DEPLOYED
echo ========================================
echo.
echo Railway deploying in 2-3 minutes
echo Site should be back online
echo.
pause
