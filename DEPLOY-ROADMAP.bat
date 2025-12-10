@echo off
REM Deploy roadmap routing changes to production

echo ========================================
echo DEPLOYING ROADMAP CHANGES
echo ========================================
echo.

cd "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"

echo [1/5] Building client...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo [2/5] Testing build output...
if not exist "dist\index.html" (
    echo ERROR: Build output not found
    pause
    exit /b 1
)

echo.
echo [3/5] Changes ready:
echo   - /roadmap route added (public customer roadmap)
echo   - /aws-roadmap route exists (admin-only AWS roadmap)
echo.

echo [4/5] Ready to commit and push?
echo This will deploy the roadmap changes to Railway.
echo.
echo Continue? (Y/N)
choice /c YN /n
if errorlevel 2 goto cancel

echo.
echo [5/5] Deploying...

REM Add changes
"C:\Program Files\Git\cmd\git.exe" add client\src\App.tsx

REM Commit
"C:\Program Files\Git\cmd\git.exe" commit -m "Add customer roadmap route - CEO approved"

REM Push to trigger Railway deployment
"C:\Program Files\Git\cmd\git.exe" push

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Railway will auto-deploy in ~2-3 minutes
echo Monitor: https://railway.app
echo.
echo New routes:
echo   https://ggloop.io/roadmap (public)
echo   https://ggloop.io/aws-roadmap (admin)
echo.
pause
exit /b 0

:cancel
echo.
echo Deployment cancelled.
pause
exit /b 0
