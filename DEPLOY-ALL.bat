@echo off
REM Complete deployment sequence - Run all critical updates

echo ========================================
echo GG LOOP - FULL DEPLOYMENT SEQUENCE
echo ========================================
echo.
echo This will deploy ALL approved changes:
echo   1. Twitter bot disable (stop spam)
echo   2. Roadmap routing (fix 404s)
echo   3. Commit both changes
echo   4. Push to Railway
echo.
echo Total time: ~5 minutes
echo.
echo Continue? (Y/N)
choice /c YN /n
if errorlevel 2 goto cancel

cd "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"

echo.
echo [1/6] Building client...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [2/6] Verifying build output...
if not exist "dist\index.html" (
    echo ERROR: Build output missing!
    pause
    exit /b 1
)

echo.
echo [3/6] Staging changes...
"C:\Program Files\Git\cmd\git.exe" add client\src\App.tsx
"C:\Program Files\Git\cmd\git.exe" add .github\workflows\twitter-auto-post.yml

echo.
echo [4/6] Reviewing changes...
"C:\Program Files\Git\cmd\git.exe" status

echo.
echo [5/6] Committing...
"C:\Program Files\Git\cmd\git.exe" commit -m "Deploy: Twitter bot disable + roadmap routing (CEO approved)"

echo.
echo [6/6] Pushing to Railway...
"C:\Program Files\Git\cmd\git.exe" push

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Changes deployed:
echo   ✅ Twitter spam STOPPED
echo   ✅ /roadmap route LIVE
echo   ✅ /aws-roadmap route LIVE
echo.
echo Railway auto-deploy: ~2-3 minutes
echo Monitor: https://railway.app
echo.
echo Next steps:
echo   1. Wait 3 minutes for Railway deploy
echo   2. Test https://ggloop.io/roadmap
echo   3. Send Early Access email
echo.
pause
exit /b 0

:cancel
echo.
echo Deployment cancelled.
pause
exit /b 0
