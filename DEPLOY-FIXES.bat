@echo off
echo ========================================
echo DEPLOYING GG LOOP TO PRODUCTION
echo ========================================
echo.

cd /d "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"

echo [1/4] Staging all changes...
"C:\Program Files\Git\bin\git.exe" add -A
if errorlevel 1 (
    echo ERROR: Failed to stage files
    pause
    exit /b 1
)
echo ✓ Changes staged

echo.
echo [2/4] Committing changes...
"C:\Program Files\Git\bin\git.exe" commit -m "PRODUCTION: PayPal fix, email system, alerts, bootstrap fulfillment"
if errorlevel 1 (
    echo WARNING: Commit failed or no changes to commit
)
echo ✓ Changes committed

echo.
echo [3/4] Pushing to GitHub...
"C:\Program Files\Git\bin\git.exe" push origin main
if errorlevel 1 (
    echo ERROR: Failed to push to GitHub
    pause
    exit /b 1
)
echo ✓ Pushed to GitHub

echo.
echo [4/4] Railway auto-deploying...
echo ⏳ Wait 2-3 minutes for Railway deployment
echo.
echo ========================================
echo ✅ DEPLOYMENT COMPLETE
echo ========================================
echo.
echo Your fixes are now deploying to ggloop.io
echo.
echo TEST IN 3 MINUTES:
echo 1. Go to https://ggloop.io/subscription
echo 2. Refresh page multiple times
echo 3. PayPal buttons should NOT shift
echo.
pause
