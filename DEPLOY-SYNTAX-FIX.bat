@echo off
echo DEPLOYING SYNTAX FIX TO PRODUCTION
cd /d "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"

"C:\Program Files\Git\bin\git.exe" add server/routes.ts
"C:\Program Files\Git\bin\git.exe" commit -m "FIX: Remove extra bracket causing esbuild error in routes.ts"
"C:\Program Files\Git\bin\git.exe" push origin main

echo DEPLOYED - Railway building now
pause
