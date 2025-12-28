@echo off
REM ONE-CLICK AUTOMATION SETUP WIZARD
REM This guides you through the 2 manual steps, then launches everything

echo ========================================
echo   GG LOOP - AUTO-REVENUE SETUP
echo ========================================
echo.
echo This will setup your autonomous revenue system.
echo You only need to do 2 things:
echo.
echo   1. Gmail app password (2 minutes)
echo   2. Confirm your email address
echo.
echo Everything else is automated.
echo.
pause

REM Step 1: Get email
echo.
echo ========================================
echo   STEP 1: Your Email Address
echo ========================================
echo.
set /p EMAIL_USER="Enter your email (jaysonquindao@ggloop.io): "
if "%EMAIL_USER%"=="" set EMAIL_USER=jaysonquindao@ggloop.io

echo.
echo Using email: %EMAIL_USER%
echo.

REM Step 2: Get Gmail app password
echo ========================================
echo   STEP 2: Gmail App Password
echo ========================================
echo.
echo Opening Google Account Security page...
start https://myaccount.google.com/apppasswords
echo.
echo INSTRUCTIONS:
echo 1. Sign in to Google Account
echo 2. Search "App Passwords"
echo 3. Create new password for "Mail"
echo 4. Copy the 16-character password
echo.
pause
echo.
set /p EMAIL_PASSWORD="Paste your app password here: "

REM Step 3: Save to .env
echo.
echo ========================================
echo   STEP 3: Saving Configuration
echo ========================================
echo.

REM Check if .env exists
if exist .env (
    echo Updating existing .env file...
    echo. >> .env
    echo # Auto-Revenue System Config >> .env
    echo EMAIL_USER=%EMAIL_USER% >> .env
    echo EMAIL_APP_PASSWORD=%EMAIL_PASSWORD% >> .env
) else (
    echo Creating new .env file...
    echo # Auto-Revenue System Config > .env
    echo EMAIL_USER=%EMAIL_USER% >> .env
    echo EMAIL_APP_PASSWORD=%EMAIL_PASSWORD% >> .env
)

echo ✅ Configuration saved!
echo.

REM Step 4: Test email
echo ========================================
echo   STEP 4: Testing Email Setup
echo ========================================
echo.
echo Testing email configuration...
node scripts/test-email-setup.js
echo.

REM Step 5: Create scheduled task
echo ========================================
echo   STEP 5: Scheduling Automation
echo ========================================
echo.
echo Do you want to run automation daily at 9am? (Y/N)
set /p SCHEDULE_CHOICE="Choice: "

if /i "%SCHEDULE_CHOICE%"=="Y" (
    echo Creating scheduled task...
    schtasks /create /tn "GG_Loop_Auto_Revenue" /tr "%CD%\RUN-AUTO-REVENUE.bat" /sc daily /st 09:00 /f
    echo ✅ Scheduled! Automation runs every day at 9am.
) else (
    echo ⏭️  Skipped scheduling. Run RUN-AUTO-REVENUE.bat manually.
)

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Your autonomous revenue system is ready.
echo.
echo WHAT HAPPENS NOW:
echo - Cold emails sent automatically (10/day)
echo - LinkedIn posts generated (3x/week)
echo - All activity logged
echo.
echo NEXT STEPS:
echo 1. Add prospects to data/prospects.json
echo 2. Run: RUN-AUTO-REVENUE.bat (or wait for 9am)
echo 3. Check inbox for replies
echo.
echo Check FULL_AUTOMATION_GUIDE.md for details.
echo.
pause
