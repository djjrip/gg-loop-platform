@echo off
echo ========================================
echo DEPLOYING: MONITORING + PAYPAL FIX
echo ========================================
echo.

cd /d "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"

echo [1/4] Adding all files...
"C:\Program Files\Git\bin\git.exe" add -A
if errorlevel 1 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)

echo [2/4] Committing...
"C:\Program Files\Git\bin\git.exe" commit -m "PRODUCTION: Monitoring system + PayPal fix + Security middleware"
if errorlevel 1 (
    echo No changes to commit or commit failed
)

echo [3/4] Pushing to GitHub...
"C:\Program Files\Git\bin\git.exe" push origin main
if errorlevel 1 (
    echo ERROR: Push failed
    pause
    exit /b 1
)

echo [4/4] Railway deploying...
echo.
echo ========================================
echo ✅ DEPLOYMENT STARTED
echo ========================================
echo.
echo Railway will deploy in 2-3 minutes
echo.
echo FEATURES DEPLOYED:
echo ✅ PayPal subscription fix
echo ✅ Production monitoring system
echo ✅ Email alerts for all critical events
echo ✅ Revenue tracking
echo ✅ Error monitoring
echo.
echo TEST:
echo 1. https://ggloop.io/subscription (PayPal)
echo 2. https://ggloop.io/health (Monitoring)
echo 3. Check jaysonquindao1@gmail.com for alerts
echo.
pause
