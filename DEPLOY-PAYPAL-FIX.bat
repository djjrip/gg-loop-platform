@echo off
echo ========================================
echo EMERGENCY PAYPAL FIX - DEPLOYING NOW
echo ========================================
echo.

cd /d "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"

echo [1/3] Staging PayPal fix...
"C:\Program Files\Git\bin\git.exe" add client/src/components/PayPalSubscriptionButton.tsx
if errorlevel 1 (
    echo ERROR: Failed to stage
    pause
    exit /b 1
)

echo [2/3] Committing...
"C:\Program Files\Git\bin\git.exe" commit -m "URGENT: Fix PayPal buttons - prevent jumping + enable payment flow"
if errorlevel 1 (
    echo No changes or commit failed
)

echo [3/3] Pushing to production...
"C:\Program Files\Git\bin\git.exe" push origin main
if errorlevel 1 (
    echo ERROR: Push failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ PAYPAL FIX DEPLOYED
echo ========================================
echo.
echo Railway is deploying now (2-3 minutes)
echo.
echo THEN TEST:
echo 1. Go to https://ggloop.io/subscription
echo 2. Refresh 3 times - buttons should NOT jump
echo 3. Click a PayPal button - should open payment modal
echo.
echo 💰 Revenue system will be LIVE
echo.
pause
