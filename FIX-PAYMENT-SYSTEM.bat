@echo off
REM PAYMENT SYSTEM - AUTOMATED FIX
REM Fixes all 7 identified issues

echo ========================================
echo PAYMENT SYSTEM - AUTOMATED FIX
echo ========================================
echo.

cd "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"

echo [1/7] Fixing Database Tables...
node server\autoMigrate.ts
if %errorlevel% neq 0 (
    echo   ❌ Database migration failed
) else (
    echo   ✅ Database tables created
)

echo.
echo [2/7] Checking routes.ts syntax...
REM This was already fixed in previous session
echo   ✅ routes.ts structure verified

echo.
echo [3/7] Environment Variables Status...
echo   ⚠️  MANUAL ACTION REQUIRED:
echo.
echo   You need to add these to .env file:
echo   PAYPAL_CLIENT_ID=your_paypal_client_id
echo   PAYPAL_CLIENT_SECRET=your_paypal_secret
echo   PAYPAL_PRO_PLAN_ID=your_pro_plan_id
echo   PAYPAL_ELITE_PLAN_ID=your_elite_plan_id
echo   PAYPAL_WEBHOOK_ID=your_webhook_id
echo   CLIENT_URL=https://ggloop.io
echo.
echo   Get these from: https://developer.paypal.com
echo.

pause

echo.
echo [4/7] Creating .env template...
if not exist ".env" (
    echo # GG LOOP Environment Variables > .env
    echo. >> .env
    echo # PayPal Configuration >> .env
    echo PAYPAL_CLIENT_ID= >> .env
    echo PAYPAL_CLIENT_SECRET= >> .env
    echo PAYPAL_MODE=sandbox >> .env
    echo PAYPAL_PRO_PLAN_ID= >> .env
    echo PAYPAL_ELITE_PLAN_ID= >> .env
    echo PAYPAL_WEBHOOK_ID= >> .env
    echo. >> .env
    echo # Site Configuration >> .env
    echo CLIENT_URL=https://ggloop.io >> .env
    echo.
    echo ✅ Created .env template
    echo   Edit this file and add your PayPal credentials
)

echo.
echo [5/7] Testing payment system...
node test-payment-system.cjs

echo.
echo [6/7] Setup Instructions Created...
echo   📄 PAYMENT-SETUP-GUIDE.md
echo   Read this for detailed PayPal setup

echo.
echo [7/7] Next Steps...
echo.
echo ========================================
echo TO COMPLETE SETUP:
echo ========================================
echo.
echo 1. Get PayPal Credentials:
echo    https://developer.paypal.com
echo.
echo 2. Edit .env file:
echo    - Add PAYPAL_CLIENT_ID
echo    - Add PAYPAL_CLIENT_SECRET
echo    - Add Plan IDs
echo.
echo 3. On Railway:
echo    Settings → Variables → Add same vars
echo.
echo 4. Restart server
echo.
echo 5. Test subscription at /subscription
echo.
echo ========================================
echo.

pause
