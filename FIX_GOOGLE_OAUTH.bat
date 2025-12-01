@echo off
echo ========================================
echo   GOOGLE OAUTH CREDENTIAL FIX
echo ========================================
echo.
echo Current Issue: Your .env has the WRONG Google OAuth credentials
echo.
echo Solution: We need to use the NOVEMBER 11 credentials from Google Cloud Console
echo.
echo ========================================
echo.

cd /d "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"

echo Opening .env file in Notepad...
notepad .env

echo.
echo ========================================
echo   INSTRUCTIONS:
echo ========================================
echo.
echo 1. In Notepad, find these lines:
echo    GOOGLE_CLIENT_ID=
echo    GOOGLE_CLIENT_SECRET=
echo.
echo 2. Go to Google Cloud Console
echo    https://console.cloud.google.com/apis/credentials
echo.
echo 3. Click on the NOVEMBER 11 OAuth client
echo.
echo 4. Copy the Client ID and paste it after GOOGLE_CLIENT_ID=
echo.
echo 5. Copy the Client Secret and paste it after GOOGLE_CLIENT_SECRET=
echo.
echo 6. SAVE the file (Ctrl+S)
echo.
echo 7. Close Notepad
echo.
echo ========================================
pause
