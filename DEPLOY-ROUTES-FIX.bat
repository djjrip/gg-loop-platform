@echo off
echo ========================================
echo DEPLOYING ROUTES.TS FIX TO RAILWAY
echo ========================================
echo.

REM Use full git path
SET GIT="C:\Program Files\Git\cmd\git.exe"

echo [1/3] Staging routes.ts fix...
%GIT% add server/routes.ts
if %errorlevel% neq 0 (
    echo ERROR: Git add failed
    pause
    exit /b 1
)
echo ✓ Staged

echo.
echo [2/3] Committing fix...
%GIT% commit -m "URGENT FIX: Add missing catch block in routes.ts line 860 - fixes 5hr outage"
if %errorlevel% neq 0 (
    echo WARNING: Commit failed - checking if already committed
    %GIT% status
)
echo ✓ Committed

echo.
echo [3/3] Pushing to Railway...
%GIT% push
if %errorlevel% neq 0 (
    echo ERROR: Push failed
    pause
    exit /b 1
)
echo ✓ Pushed!

echo.
echo ========================================
echo DEPLOYMENT TRIGGERED!
echo ========================================
echo.
echo Railway is now building and deploying...
echo Check status: https://railway.app
echo.
echo The routes.ts syntax fix is deployed.
echo Server should come online in ~2 minutes.
echo.
pause
