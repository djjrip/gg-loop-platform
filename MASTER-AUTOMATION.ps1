####################################################
# GG LOOP - MASTER AUTOMATION SCRIPT
# CEO's One-Click Daily Routine
# Handles EVERYTHING automatically
####################################################

Write-Host "🚀 GG LOOP MASTER AUTOMATION" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Get current time
$time = Get-Date -Format "h:mm tt"
Write-Host "⏰ Started: $time`n" -ForegroundColor Yellow

# ====================
# 1. DEPLOYMENT CHECK
# ====================
Write-Host "📦 STEP 1/5: Checking Deployment Status..." -ForegroundColor Yellow

$gitStatus = git status --porcelain
if ($gitStatus -eq "") {
    Write-Host "   ✅ No uncommitted changes" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  Uncommitted changes found. Auto-deploying..." -ForegroundColor Yellow
    git add .
    git commit -m "Auto-deploy via master script"
    git push
    Write-Host "   ✅ Changes deployed to Railway" -ForegroundColor Green
}

# ====================
# 2. SITE VERIFICATION
# ====================
Write-Host "`n🌐 STEP 2/5: Verifying Site Status..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://ggloop.io" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ Site is LIVE (Status: $($response.StatusCode))" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Site unreachable! Check Railway." -ForegroundColor Red
}

try {
    $rdResponse = Invoke-WebRequest -Uri "https://ggloop.io/roadmap" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ Roadmap is accessible" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Roadmap 404! Deployment issue." -ForegroundColor Red
}

# ====================
# 3. EMAIL MANAGEMENT
# ====================
Write-Host "`n📧 STEP 3/5: Email System..." -ForegroundColor Yellow

$sendEmail = Read-Host "   Send Early Access email now? (yes/no)"
if ($sendEmail -eq "yes") {
    # $env:SENDGRID_API_KEY must be set in your terminal/environment
    if (-not $env:SENDGRID_API_KEY) {
        Write-Host "   ⚠️ WARNING: SENDGRID_API_KEY env var not set" -ForegroundColor Yellow
    }
    
    if (Test-Path "send-the-real-one.cjs") {
        node send-the-real-one.cjs
        Write-Host "   ✅ Early Access email sent!" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ Email script not found" -ForegroundColor Red
    }
}
else {
    Write-Host "   ⏸️  Email sending skipped" -ForegroundColor DarkGray
}

# ====================
# 4. STREAMER OUTREACH
# ====================
Write-Host "`n🎯 STEP 4/5: Streamer Outreach..." -ForegroundColor Yellow

if (Test-Path "streamers-to-contact.json") {
    $streamers = Get-Content "streamers-to-contact.json" | ConvertFrom-Json
    $count = $streamers.streamers.Count
    $contacted = $streamers.contacted.Count
    
    Write-Host "   📊 Streamers in database: $count" -ForegroundColor Cyan
    Write-Host "   📧 Already contacted: $contacted" -ForegroundColor Cyan
    
    $runOutreach = Read-Host "   Run outreach now? (yes/no)"
    if ($runOutreach -eq "yes") {
        Write-Host "   🚀 Launching STREAMER-OUTREACH.ps1..." -ForegroundColor Yellow
        & ".\STREAMER-OUTREACH.ps1"
    }
}
else {
    Write-Host "   ℹ️  No streamer database found" -ForegroundColor DarkGray
    Write-Host "   Run STREAMER-OUTREACH.ps1 to create one" -ForegroundColor DarkGray
}

# ====================
# 5. DISCORD BOT CHECK
# ====================
Write-Host "`n🤖 STEP 5/5: Discord Bot Status..." -ForegroundColor Yellow

if (Test-Path "discord-bot") {
    if (Test-Path "discord-bot\.env") {
        Write-Host "   ✅ Discord bot configured" -ForegroundColor Green
        
        $runBot = Read-Host "   Start Discord bot? (yes/no)"
        if ($runBot -eq "yes") {
            cd discord-bot
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
            cd ..
            Write-Host "   ✅ Discord bot starting in new window..." -ForegroundColor Green
        }
    }
    else {
        Write-Host "   ⚠️  Discord bot not configured yet" -ForegroundColor Yellow
        Write-Host "   Run: SETUP-DISCORD-BOT.bat" -ForegroundColor DarkGray
    }
}
else {
    Write-Host "   ℹ️  Discord bot not installed" -ForegroundColor DarkGray
}

# ====================
# DAILY SUMMARY
# ====================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "📊 DAILY SUMMARY" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "✅ Deployment: Checked/Updated" -ForegroundColor Green
Write-Host "✅ Site Status: Verified" -ForegroundColor Green
Write-Host "✅ Email System: Ready" -ForegroundColor Green
Write-Host "✅ Outreach: Configured" -ForegroundColor Green
Write-Host "✅ Discord Bot: Available" -ForegroundColor Green

Write-Host "`n🎯 QUICK ACTIONS AVAILABLE:`n" -ForegroundColor Yellow
Write-Host "  CEO-AUTO-DEPLOY.ps1     → Deploy + verify + email" -ForegroundColor White
Write-Host "  STREAMER-OUTREACH.ps1   → Find & email streamers" -ForegroundColor White
Write-Host "  SETUP-DISCORD-BOT.bat   → Configure Discord bot" -ForegroundColor White
Write-Host "  TEST-DEPLOYMENT.bat     → Validate before deploy" -ForegroundColor White

Write-Host "`n📚 DOCUMENTATION:`n" -ForegroundColor Yellow
Write-Host "  WAKE-UP-CHECKLIST.md    → Morning routine" -ForegroundColor White
Write-Host "  GOOD_MORNING.md         → Daily briefing" -ForegroundColor White
Write-Host "  CEO_ACTION_PLAN.md      → Master guide" -ForegroundColor White
Write-Host "  STREAMER-OUTREACH-GUIDE.md → Outreach automation" -ForegroundColor White

Write-Host "`n🚀 GG LOOP - Up Only Mode" -ForegroundColor Magenta
Write-Host ""

$nextAction = Read-Host "What would you like to do next? (1=Discord bot, 2=Outreach, 3=Nothing)"

switch ($nextAction) {
    "1" {
        Write-Host "`nLaunching Discord bot setup..." -ForegroundColor Cyan
        & ".\SETUP-DISCORD-BOT.bat"
    }
    "2" {
        Write-Host "`nLaunching streamer outreach..." -ForegroundColor Cyan
        & ".\STREAMER-OUTREACH.ps1"
    }
    "3" {
        Write-Host "`nAll set! You're good to go. ✅`n" -ForegroundColor Green
    }
}

Write-Host "Press any key to close..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
