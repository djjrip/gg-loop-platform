@echo off
REM DAILY STARTUP ROUTINE
REM Run this every morning to get situation report

echo ========================================
echo   GG LOOP - MORNING BRIEFING
echo ========================================
echo.

cd /d "%~dp0"

REM Platform Health Check
echo [1/5] Platform Status...
curl -s https://ggloop.io/api/health
echo.
echo.

REM Metrics Report
echo [2/5] Growth Metrics...
node scripts/track-metrics.js report
echo.

REM Check for milestones
echo [3/5] Checking Milestones...
if exist data\milestones.json (
    type data\milestones.json
) else (
    echo No milestones yet
)
echo.

REM Operations check
echo [4/5] Operations Status...
node scripts/run-operations.js
echo.

REM Today's focus
echo [5/5] TODAY'S MISSION:
echo.
echo - Check Twitter/Discord for engagement
echo - Respond to ALL messages within 1 hour
echo - Follow up on warm leads
echo - Post daily content
echo.
echo ========================================
echo   Ready to execute. LFG.
echo ========================================
echo.

pause
