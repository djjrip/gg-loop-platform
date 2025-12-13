@echo off
REM Test Discord Bot Configuration Before Deployment

echo ========================================
echo GG LOOP DISCORD BOT - VALIDATION TEST
echo ========================================
echo.

cd discord-bot

REM Check if dependencies are installed
if not exist "node_modules\" (
    echo ERROR: Dependencies not installed
    echo Run: npm install
    pause
    exit /b 1
)

REM Check for .env file
if not exist ".env" (
    echo ERROR: .env file not found
    echo Copy .env.example to .env and configure it
    pause
    exit /b 1
)

echo [1/5] Checking .env configuration...

REM Check for required environment variables
findstr /C:"DISCORD_BOT_TOKEN=your_bot_token_here" .env > nul
if %errorlevel% equ 0 (
    echo   ERROR: DISCORD_BOT_TOKEN not configured
    echo   Edit .env and add your bot token
    set /a errors+=1
) else (
    echo   ✓ Bot token configured
)

findstr /C:"DISCORD_GUILD_ID=your_server_id_here" .env > nul
if %errorlevel% equ 0 (
    echo   ERROR: DISCORD_GUILD_ID not configured
    echo   Edit .env and add your server ID
    set /a errors+=1
) else (
    echo   ✓ Guild ID configured
)

findstr /C:"DISCORD_CEO_ID=your_discord_user_id_here" .env > nul
if %errorlevel% equ 0 (
    echo   ERROR: DISCORD_CEO_ID not configured
    echo   Edit .env and add your Discord user ID
    set /a errors+=1
) else (
    echo   ✓ CEO ID configured
)

echo.
echo [2/5] Checking TypeScript compilation...
call npm run build > nul 2>&1
if %errorlevel% neq 0 (
    echo   ERROR: TypeScript compilation failed
    echo   Run: npm run build
    set /a errors+=1
) else (
    echo   ✓ TypeScript compiles successfully
)

echo.
echo [3/5] Checking required files...
if not exist "src\index.ts" (
    echo   ERROR: src\index.ts missing
    set /a errors+=1
) else (
    echo   ✓ Main entry point exists
)

if not exist "data\banned-words.json" (
    echo   ERROR: data\banned-words.json missing
    set /a errors+=1
) else (
    echo   ✓ Banned words list exists
)

echo.
echo [4/5] Checking package.json scripts...
findstr /C:"\"dev\"" package.json > nul
if %errorlevel% neq 0 (
    echo   ERROR: dev script missing in package.json
    set /a errors+=1
) else (
    echo   ✓ Development script configured
)

echo.
echo [5/5] Running syntax check...
node -c dist\index.js > nul 2>&1
if %errorlevel% neq 0 (
    echo   ERROR: JavaScript syntax errors detected
    set /a errors+=1
) else (
    echo   ✓ No syntax errors
)

echo.
echo ========================================
echo VALIDATION RESULTS
echo ========================================

if defined errors (
    echo.
    echo ❌ VALIDATION FAILED
    echo Found %errors% error(s)
    echo.
    echo Fix the errors above before running the bot.
    echo.
) else (
    echo.
    echo ✅ VALIDATION PASSED
    echo.
    echo Bot is ready to run!
    echo.
    echo Next steps:
    echo   1. Create Discord bot at discord.com/developers
    echo   2. Invite bot to your server
    echo   3. Create required roles and channels
    echo   4. Run: npm run dev
    echo.
)

pause
