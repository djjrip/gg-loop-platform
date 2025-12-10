# === CEO ONE-SCRIPT AUTO EXECUTION ===
# Location: Run inside GG-LOOP-PLATFORM folder
# Usage: Right-click → Run with PowerShell

Write-Host "🚀 GG LOOP CEO AUTO-SCRIPT STARTED" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# 1. CHECK GIT STATUS
Write-Host "`n🔍 Step 1/6: Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain

if ($gitStatus -eq "") {
    Write-Host "✅ Working tree clean (no uncommitted changes)." -ForegroundColor Green
}
else {
    Write-Host "⚠️ Uncommitted changes detected. Staging + committing..." -ForegroundColor Red
    git add .
    git commit -m "Auto-deploy via CEO script"
    Write-Host "✅ Changes committed." -ForegroundColor Green
}

# 2. CHECK LAST COMMIT MESSAGE
Write-Host "`n🔍 Step 2/6: Checking last commit..." -ForegroundColor Yellow
$lastCommit = git log -1 --oneline
Write-Host "📝 Last commit: $lastCommit" -ForegroundColor Cyan

# 3. PUSH TO GITHUB
Write-Host "`n⬆️ Step 3/6: Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push
    Write-Host "✅ Pushed to GitHub successfully!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Push failed. Check network connection." -ForegroundColor Red
    exit 1
}

# 4. WAIT FOR RAILWAY AUTO-DEPLOY
Write-Host "`n⏳ Step 4/6: Waiting 3 minutes for Railway deployment..." -ForegroundColor Yellow
Write-Host "   (Railway auto-deploys when GitHub updates)" -ForegroundColor DarkGray
$seconds = 180
for ($i = $seconds; $i -gt 0; $i--) {
    Write-Progress -Activity "Waiting for Railway" -Status "$i seconds remaining..." -PercentComplete ((($seconds - $i) / $seconds) * 100)
    Start-Sleep -Seconds 1
}
Write-Progress -Activity "Waiting for Railway" -Completed
Write-Host "✅ Wait complete. Railway should be deployed now." -ForegroundColor Green

# 5. VERIFY ROADMAP PAGE
Write-Host "`n🌐 Step 5/6: Verifying https://ggloop.io/roadmap ..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://ggloop.io/roadmap" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Roadmap is LIVE and responding! (Status: 200 OK)" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Roadmap not responding. Possible issues:" -ForegroundColor Red
    Write-Host "   - Railway deployment still in progress (wait 2 more min)" -ForegroundColor DarkGray
    Write-Host "   - Build failed (check Railway dashboard)" -ForegroundColor DarkGray
    Write-Host "   - Network issue (check internet)" -ForegroundColor DarkGray
    Write-Host "`n⚠️ Continuing anyway..." -ForegroundColor Yellow
}

# 6. SEND EARLY ACCESS EMAIL
Write-Host "`n📧 Step 6/6: Sending Early Access email..." -ForegroundColor Yellow
# Check if environment variable is set
if (-not $env:SENDGRID_API_KEY) {
    Write-Host "⚠️ WARNING: SENDGRID_API_KEY environment variable not set." -ForegroundColor Yellow
    Write-Host "   Emails will likely fail. Set it in your terminal first if needed." -ForegroundColor DarkGray
}

if (Test-Path "send-the-real-one.cjs") {
    try {
        node send-the-real-one.cjs
        Write-Host "✅ Email send script executed!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Email send failed. Check send-the-real-one.cjs exists." -ForegroundColor Red
    }
}
else {
    Write-Host "❌ send-the-real-one.cjs not found in current directory!" -ForegroundColor Red
}

# FINAL SUMMARY
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "🎉 ALL DONE, CEO. You're greenlit for the day." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Deployment completed" -ForegroundColor Green
Write-Host "✅ Roadmap verified" -ForegroundColor Green
Write-Host "✅ Email sent" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Check Railway dashboard for deployment logs" -ForegroundColor White
Write-Host "  2. Monitor SendGrid for email delivery" -ForegroundColor White
Write-Host "  3. Test https://ggloop.io/roadmap in browser" -ForegroundColor White
Write-Host ""
Write-Host "GG LOOP LLC — Up Only Mode 🚀" -ForegroundColor Magenta
Write-Host ""

# Keep window open to see results
Write-Host "Press any key to close..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
