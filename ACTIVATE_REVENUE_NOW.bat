@echo off
echo ====================================
echo GG LOOP REVENUE ACTIVATION
echo ====================================
echo.
echo THIS SCRIPT WILL:
echo 1. Run business automation (auto-approve redemptions)
echo 2. Start affiliate signup automation
echo 3. Prepare revenue tracking
echo.
echo FIRST: Make sure you fixed Railway PayPal variable!
echo See: MAKE_MONEY_NOW.md for instructions
echo.
pause

echo.
echo [1/3] Running business automation...
call npm run automate:business

echo.
echo [2/3] Starting affiliate signups...
echo (Browser will open - complete CAPTCHAs when prompted)
call npm run automate:affiliates

echo.
echo [3/3] Checking platform status...
echo Go to: https://ggloop.io/subscription
echo PayPal buttons should be visible!
echo.
echo ====================================
echo REVENUE ACTIVATION COMPLETE!
echo ====================================
echo.
echo NEXT STEPS:
echo 1. Check Railway deployment logs
echo 2. Test payment at ggloop.io/subscription
echo 3. Monitor /admin dashboard daily
echo.
pause
