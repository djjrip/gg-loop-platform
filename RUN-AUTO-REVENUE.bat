@echo off
REM AUTO-REVENUE MASTER AGENT
REM Runs all revenue automation in sequence

echo ========================================
echo   AUTO-REVENUE SYSTEM
echo   Running all automation agents...
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found
    pause
    exit /b 1
)

cd /d "%~dp0"

echo [1/3] Running Cold Email Agent...
call node scripts/auto-cold-email-agent.js --mode=agency
echo.

echo [2/3] Running LinkedIn Scheduler...
call node scripts/linkedin-scheduler.js
echo.

echo [3/3] Health Monitor Status...
echo Check logs/health-monitor.log for platform status
echo.

echo ========================================
echo   RUN COMPLETE
echo ========================================
echo.
echo Today's Activity:
echo - Cold emails sent (check logs/cold-email-log.json)
echo - LinkedIn post generated (check linkedin-posts/)
echo - GG Loop health monitored
echo.
echo Next: Check email for replies, post to LinkedIn
echo.
pause
