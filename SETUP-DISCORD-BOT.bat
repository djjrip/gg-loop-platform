@echo off
REM GG LOOP - Discord Bot Quick Setup
REM Auto-installs and validates Discord bot

echo ========================================
echo GG LOOP DISCORD BOT - QUICK SETUP
echo ========================================
echo.

cd discord-bot

echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/4] Checking for .env file...
if not exist .env (
    echo WARNING: .env file not found!
    echo Copying .env.example to .env...
    copy .env.example .env
    echo.
    echo IMPORTANT: You must edit .env and add:
    echo   - DISCORD_BOT_TOKEN (from Discord Developer Portal)
    echo   - DISCORD_GUILD_ID (your server ID)
    echo   - DISCORD_CEO_ID (your Discord user ID)
    echo   - Channel IDs (optional but recommended)
    echo.
    echo Open .env file now? (Y/N)
    choice /c YN /n
    if errorlevel 2 goto skip_edit
    if errorlevel 1 notepad .env
    :skip_edit
)

echo.
echo [3/4] Building TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo [4/4] Setup complete!
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Ensure .env file is configured
echo 2. Create Discord bot at discord.com/developers
echo 3. Invite bot to your server
echo 4. Create required roles and channels
echo 5. Run: npm run dev
echo.
echo Full instructions: See README.md
echo ========================================
echo.
pause
