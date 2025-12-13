@echo off
echo ========================================
echo REVERTING TO LAST WORKING VERSION
echo ========================================
echo.

cd /d "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"

echo [1/3] Staging revert...
"C:\Program Files\Git\bin\git.exe" add server/routes.ts

echo [2/3] Committing revert...
"C:\Program Files\Git\bin\git.exe" commit -m "REVERT: Restore routes.ts to last working version before syntax error"

echo [3/3] Pushing...
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo ========================================
echo ✅ REVERTED & DEPLOYED
echo ========================================
echo.
echo Railway deploying last known-good version
echo Site should be back online in 2-3 minutes
echo.
pause
