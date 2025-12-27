# Ghost Bot Extension Reload Helper
# This script helps you reload the extension after making changes

Write-Host "👻 Ghost Bot Extension Reload Helper" -ForegroundColor Cyan
Write-Host ""

# Instructions
Write-Host "📋 INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Make your changes to files in ghost-bot-extension/" -ForegroundColor White
Write-Host "2. Go to chrome://extensions/" -ForegroundColor White
Write-Host "3. Find 'Ghost Bot - Virtual Assistant'" -ForegroundColor White
Write-Host "4. Click the refresh icon (🔄)" -ForegroundColor White
Write-Host "5. Test by clicking the Ghost Bot icon in Chrome" -ForegroundColor White
Write-Host ""

# Check if Chrome is running
$chromeProcess = Get-Process -Name "chrome" -ErrorAction SilentlyContinue
if ($chromeProcess) {
    Write-Host "✅ Chrome is running" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 TIP: Keep chrome://extensions/ open in a tab for quick reloads!" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Chrome is not running" -ForegroundColor Yellow
    Write-Host "   Start Chrome first, then reload the extension" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to open chrome://extensions/ in your default browser..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Try to open chrome://extensions/ (may not work if Chrome isn't default)
Start-Process "chrome://extensions/" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Done! Now reload the extension manually." -ForegroundColor Green

