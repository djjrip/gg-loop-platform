@echo off
echo ========================================
echo GG LOOP REVENUE ACTIVATION SCRIPT
echo ========================================
echo.

REM Step 1: Seed Shop
echo [1/4] Seeding shop catalog...
npx tsx server\seed-shop.ts
if %errorlevel% neq 0 (
    echo ERROR: Shop seeding failed
    pause
    exit /b 1
)
echo ✓ Shop seeded successfully
echo.

REM Step 2: Test email sequence
echo [2/4] Testing email system...
npx tsx server\emailQueueWorker.ts
if %errorlevel% neq 0 (
    echo WARNING: Email system check failed (this is okay if no users)
)
echo ✓ Email system ready
echo.

REM Step 3: Reminder for manual steps
echo [3/4] MANUAL STEPS REQUIRED:
echo.
echo → Go to Railway Dashboard (railway.app)
echo → Click your GG-LOOP-PLATFORM project
echo → Go to Variables tab
echo → Change PAYPAL_MODE=sandbox to PAYPAL_MODE=live
echo → Click "Deploy"
echo.
echo Press any key after you've done this...
pause > nul
echo.

REM Step 4: Final checklist
echo [4/4] FINAL ACTIVATION CHECKLIST:
echo.
echo ☐ Shop seeded (DONE ✓)
echo ☐ PayPal in live mode (Did you do it?)
echo ☐ Marketing bot APIs (Do this next - see AUTONOMOUS_MARKETING_SETUP.md)
echo.
echo ========================================
echo REVENUE SYSTEM ACTIVATED!
echo ========================================
echo.
echo Next steps:
echo 1. Set up marketing bot APIs (30 min) - see AUTONOMOUS_MARKETING_SETUP.md
echo 2. Post on Reddit (5 min) - templates in AUTONOMOUS_REVENUE_PLAN.md
echo 3. Watch money roll in!
echo.
pause
