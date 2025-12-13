@echo off
echo ==========================================
echo DEPLOYING RIOT API KEY FIX
echo ==========================================
echo.

SET GIT="C:\Program Files\Git\cmd\git.exe"

echo [1/3] Staging .env update...
%GIT% add .env
echo Done

echo.
echo [2/3] Committing...
%GIT% commit -m "Fix: Update Riot API key (expired key caused 401 errors)"
echo Done

echo.
echo [3/3] Pushing to Railway...
%GIT% push
echo Done

echo.
echo ==========================================
echo IMPORTANT: UPDATE RAILWAY ENVIRONMENT
echo ==========================================
echo.
echo Railway Dashboard ^> Variables ^> Edit:
echo   RIOT_API_KEY=RGAPI-c24e9c1e-21fd-4d05-9f15-84a97901699d
echo.
echo NOTE: This key expires in 15 hours!
echo For production, apply for permanent key at:
echo https://developer.riotgames.com/
echo.
pause
