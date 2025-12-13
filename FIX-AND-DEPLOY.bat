@echo off
echo ========================================
echo FIXING GIT HISTORY - REMOVING EXPOSED KEY
echo ========================================
echo.

cd /d "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"

echo Resetting to last safe commit...
"C:\Program Files\Git\bin\git.exe" reset --soft HEAD~1

echo Restaging files without exposed keys...
"C:\Program Files\Git\bin\git.exe" add -A

echo Creating new clean commit...
"C:\Program Files\Git\bin\git.exe" commit -m "PRODUCTION: PayPal fix + email system + alerts (keys secured)"

echo Force pushing to GitHub...
"C:\Program Files\Git\bin\git.exe" push -f origin main

echo.
echo ========================================
echo ✅ DEPLOYMENT IN PROGRESS
echo ========================================
echo.
echo Railway is deploying now (2-3 minutes)
echo.
echo Test at: https://ggloop.io/subscription
echo.
pause
