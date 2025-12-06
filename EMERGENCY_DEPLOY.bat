@echo off
REM EMERGENCY DEPLOYMENT TO VERCEL (Windows)

echo.
echo ================================================
echo   EMERGENCY DEPLOYMENT TO VERCEL
echo ================================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>&1
if errorlevel 1 (
    echo [!] Vercel CLI not found. Installing...
    npm install -g vercel
)

echo [1/3] Building project...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Deploying to Vercel...
vercel --prod --yes
if errorlevel 1 (
    echo [ERROR] Deployment failed!
    pause
    exit /b 1
)

echo.
echo ================================================
echo   DEPLOYMENT COMPLETE
echo ================================================
echo.
echo Check your site at:
echo https://gg-loop-platform.vercel.app
echo.
echo Or check Vercel dashboard:
echo https://vercel.com/dashboard
echo.
pause
