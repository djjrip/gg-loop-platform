@echo off
echo ========================================
echo GG LOOP DNS FIX - ONE CLICK SOLUTION
echo ========================================
echo.
echo STEP 1: Opening Railway Dashboard...
start https://railway.app/project/9a91fdd6-a31a-47cb-b74c-be084f9b758b
timeout /t 2 /nobreak >nul
echo.
echo STEP 2: Opening Namecheap DNS Settings...
start https://ap.www.namecheap.com/domains/domaincontrolpanel/ggloop.io/advancedns
timeout /t 2 /nobreak >nul
echo.
echo ========================================
echo BOTH SITES OPENED IN YOUR BROWSER
echo ========================================
echo.
echo IN RAILWAY TAB:
echo 1. Click Settings (left side)
echo 2. Click Domains
echo 3. Copy the Railway URL (looks like: xxxx.up.railway.app)
echo.
echo IN NAMECHEAP TAB:
echo 1. Login if needed
echo 2. Find the A Record or CNAME record
echo 3. Change it to the Railway URL you just copied
echo 4. Click Save
echo.
echo That's it! Done in 2 minutes.
echo.
pause
