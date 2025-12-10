@echo off
cd /d "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"

"C:\Program Files\Git\bin\git.exe" checkout 2670e04 server/routes.ts
"C:\Program Files\Git\bin\git.exe" add server/routes.ts  
"C:\Program Files\Git\bin\git.exe" commit -m "REVERT: routes.ts to before bracket addition"
"C:\Program Files\Git\bin\git.exe" push origin main

echo Done
pause
