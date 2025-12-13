@echo off
REM Deploy Twitter bot disable to stop Options Hunter spam

echo ========================================
echo DEPLOYING TWITTER BOT DISABLE
echo ========================================
echo.

cd "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"

echo This will permanently disable the Twitter auto-posting
echo that was spamming Options Hunter content to @ggloopllc
echo.
echo Continue? (Y/N)
choice /c YN /n
if errorlevel 2 goto cancel

echo.
echo Deploying...

REM Add changes
"C:\Program Files\Git\cmd\git.exe" add .github\workflows\twitter-auto-post.yml

REM Commit
"C:\Program Files\Git\cmd\git.exe" commit -m "Disable Twitter bot - Options Hunter spam fix (CEO directive)"

REM Push
"C:\Program Files\Git\cmd\git.exe" push

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Twitter auto-posting is now DISABLED.
echo No more Options Hunter spam to @ggloopllc
echo.
pause
exit /b 0

:cancel
echo.
echo Deployment cancelled.
pause
exit /b 0
