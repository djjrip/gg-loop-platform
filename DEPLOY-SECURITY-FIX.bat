@echo off
echo ==========================================
echo DEPLOYING SECURITY FIX: Riot Verification
echo ==========================================
echo.

SET GIT="C:\Program Files\Git\cmd\git.exe"

echo [1/4] Staging files...
%GIT% add server/routes.ts
%GIT% add server/routes/riotVerification.ts
%GIT% add add-verification-table.cjs
echo Done

echo.
echo [2/4] Committing security fix...
%GIT% commit -m "SECURITY FIX: Add ownership verification for Riot accounts - prevents account takeover attacks"
echo Done

echo.
echo [3/4] Pushing to Railway...
%GIT% push
echo Done

echo.
echo [4/4] Run database migration on Railway...
echo After deployment completes, run in Railway console:
echo   node add-verification-table.cjs
echo.
echo ==========================================
echo SECURITY FIX DEPLOYED!
echo ==========================================
echo.
echo Changes:
echo - Added riot_verifications table
echo - New secure endpoints:
echo   POST /api/riot/verification/request-verification
echo   POST /api/riot/verification/verify-ownership
echo - Disabled insecure /api/riot/link-account
echo.
echo Frontend needs update to use new 2-step flow.
echo.
pause
