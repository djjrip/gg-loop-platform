@echo off
echo ========================================
echo SAFE DEPLOYMENT - PRE-FLIGHT CHECKS
echo ========================================
echo.

cd /d "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"

echo [1/5] Checking TypeScript compilation...
call npm run build
if errorlevel 1 (
    echo.
    echo ❌❌❌ BUILD FAILED ❌❌❌
    echo.
    echo SYNTAX ERRORS DETECTED!
    echo FIX ERRORS BEFORE DEPLOYING!
    echo.
    pause
    exit /b 1
)
echo ✅ TypeScript compilation passed

echo.
echo [2/5] Running local server test...
timeout /t 2 /nobreak >nul
echo ✅ (Skipped - manual test required)

echo.
echo [3/5] Staging changes...
"C:\Program Files\Git\bin\git.exe" add -A

echo.
echo [4/5] Committing...
"C:\Program Files\Git\bin\git.exe" commit -m "%~1"
if errorlevel 1 (
    echo No changes to commit
)

echo.
echo [5/5] Pushing to production...
echo.
echo ⚠️⚠️⚠️ FINAL CHECK ⚠️⚠️⚠️
echo.
echo Before deploying, confirm:
echo 1. Did you TEST locally? (y/n)
echo 2. Did PayPal buttons work? (y/n)
echo 3. Does site load without errors? (y/n)
echo.
set /p CONFIRM="Type 'YES' to deploy: "

if /i not "%CONFIRM%"=="YES" (
    echo.
    echo ❌ Deployment CANCELLED
    echo Good call - test first!
    pause
    exit /b 1
)

"C:\Program Files\Git\bin\git.exe" push origin main
if errorlevel 1 (
    echo.
    echo ❌ Push failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ SAFELY DEPLOYED
echo ========================================
echo.
echo Railway deploying in 2-3 minutes
echo Monitor at: https://railway.app
echo.
pause
