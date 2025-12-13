@echo off
echo ==========================================
echo   GG LOOP - Development Server Startup
echo ==========================================
echo.
echo This window will STAY OPEN so you can see any errors.
echo.

cd /d "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"

echo [Step 1/3] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Download the LTS version, run the installer, and restart your computer.
    echo.
    pause
    exit /b 1
)
echo ✓ Node.js is installed
echo.

echo [Step 2/3] Checking npm packages...
if not exist "node_modules" (
    echo.
    echo WARNING: npm packages not installed!
    echo Installing now... this will take 3-5 minutes.
    echo.
    npm install
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed!
        echo Please check your internet connection.
        echo.
        pause
        exit /b 1
    )
)
echo ✓ npm packages are installed
echo.

echo [Step 3/3] Starting development server...
echo.
echo ==========================================
echo   WAIT FOR: "serving on port 5000"
echo ==========================================
echo.

npm run dev

echo.
echo ==========================================
echo   Server stopped or crashed
echo ==========================================
echo.
pause
