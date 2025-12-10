@echo off
echo ==========================================
echo RAILWAY DATABASE MIGRATION
echo ==========================================
echo.
echo This script will add the riot_verifications table to Railway
echo.

REM Check if Railway CLI is installed
where railway >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Railway CLI not found. Installing...
    npm install -g @railway/cli
)

echo.
echo Logging into Railway...
railway login

echo.
echo Running database migration on Railway...
railway run node add-verification-table.cjs

echo.
echo ==========================================
echo MIGRATION COMPLETE!
echo ==========================================
echo.
pause
