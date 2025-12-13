@echo off
echo ========================================
echo AUTOMATED DEPLOYMENT - EMPIRE ENGINE
echo ========================================
echo.

REM Use full git path since PATH not refreshed yet
SET GIT="C:\Program Files\Git\cmd\git.exe"

echo [1/5] Adding all files to git...
%GIT% add .
if %errorlevel% neq 0 (
    echo ERROR: Git add failed
    pause
    exit /b 1
)
echo ✓ Files staged

echo.
echo [2/5] Committing changes...
%GIT% commit -m "Empire Engine Complete: 13 cycles - shop seeder, trials, emails, analytics, contests, marketing bots, conversion optimization"
if %errorlevel% neq 0 (
    echo ERROR: Git commit failed (this is okay if no changes)
)
echo ✓ Committed

echo.
echo [3/5] Pushing to GitHub (triggers Railway deploy)...
%GIT% push
if %errorlevel% neq 0 (
    echo ERROR: Git push failed
    echo Check if you have push permissions
    pause
    exit /b 1
)
echo ✓ Pushed to GitHub!

echo.
echo [4/5] Railway is deploying...
echo Check: https://railway.app
timeout /t 5

echo.
echo [5/5] DEPLOYMENT COMPLETE!
echo.
echo ========================================
echo NEXT: ACTIVATE REVENUE (3 minutes)
echo ========================================
echo.
echo 1. Wait for Railway deploy to finish (~3 min)
echo    Check: https://railway.app
echo.
echo 2. Run shop seeder on Railway:
echo    Railway Dashboard -^> "..." menu -^> Run Command:
echo    npx tsx server/seed-shop.ts
echo.
echo 3. Flip PayPal to live:
echo    Railway -^> Variables -^> PAYPAL_MODE=live
echo.
echo 4. Post on Reddit (templates in QUICK_START.md)
echo.
echo Then money flows automatically!
echo.
pause
