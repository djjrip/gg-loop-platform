@echo off
REM Pre-deployment verification - Test all changes before pushing

echo ========================================
echo GG LOOP - PRE-DEPLOYMENT VALIDATION
echo ========================================
echo.

cd "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"

set errors=0

echo [1/7] Testing local build...
call npm run build
if %errorlevel% neq 0 (
    echo   ❌ Build failed
    set /a errors+=1
) else (
    echo   ✓ Build successful
)

echo.
echo [2/7] Checking build output...
if not exist "dist\index.html" (
    echo   ❌ No index.html in dist
    set /a errors+=1
) else (
    echo   ✓ index.html exists
)

if not exist "dist\assets\" (
    echo   ❌ No assets directory
    set /a errors+=1
) else (
    echo   ✓ Assets directory exists
)

echo.
echo [3/7] Testing roadmap route changes...
findstr /C:"Roadmap from" client\src\App.tsx > nul
if %errorlevel% neq 0 (
    echo   ❌ Roadmap import missing
    set /a errors+=1
) else (
    echo   ✓ Roadmap imported
)

findstr /C:"/roadmap" client\src\App.tsx > nul
if %errorlevel% neq 0 (
    echo   ❌ /roadmap route missing
    set /a errors+=1
) else (
    echo   ✓ /roadmap route exists
)

echo.
echo [4/7] Testing Twitter bot disable...
findstr /C:"PERMANENTLY DISABLED" .github\workflows\twitter-auto-post.yml > nul
if %errorlevel% neq 0 (
    echo   ❌ Twitter bot not disabled
    set /a errors+=1
) else (
    echo   ✓ Twitter bot disabled
)

echo.
echo [5/7] Checking for TypeScript errors...
call npm run build > build-output.txt 2>&1
findstr /C:"error TS" build-output.txt > nul
if %errorlevel% equ 0 (
    echo   ❌ TypeScript errors found
    type build-output.txt
    set /a errors+=1
) else (
    echo   ✓ No TypeScript errors
)
del build-output.txt

echo.
echo [6/7] Testing Git status...
"C:\Program Files\Git\cmd\git.exe" status --porcelain > git-status.txt
findstr /C:"client/src/App.tsx" git-status.txt > nul
if %errorlevel% neq 0 (
    echo   ⚠️  App.tsx not staged (might be already committed)
) else (
    echo   ✓ App.tsx changes detected
)
del git-status.txt

echo.
echo [7/7] Simulating production build...
set NODE_ENV=production
call npm run build > nul 2>&1
set NODE_ENV=
if %errorlevel% neq 0 (
    echo   ❌ Production build failed
    set /a errors+=1
) else (
    echo   ✓ Production build successful
)

echo.
echo ========================================
echo VALIDATION RESULTS
echo ========================================
echo.

if %errors% gtr 0 (
    echo ❌ VALIDATION FAILED - %errors% error(s) found
    echo.
    echo DO NOT DEPLOY until errors are fixed!
    echo.
) else (
    echo ✅ ALL TESTS PASSED
    echo.
    echo Safe to deploy!
    echo Run: DEPLOY-ALL.bat
    echo.
)

pause
