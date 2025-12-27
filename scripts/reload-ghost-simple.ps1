# Simple Ghost Bot Reload Script
# Opens chrome://extensions/ directly

Write-Host "👻 Opening chrome://extensions/..." -ForegroundColor Cyan

# Try multiple methods to open Chrome
$chromePaths = @(
    "${env:LOCALAPPDATA}\Google\Chrome\Application\chrome.exe",
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)

$opened = $false

foreach ($chromePath in $chromePaths) {
    if (Test-Path $chromePath) {
        try {
            Start-Process $chromePath -ArgumentList "chrome://extensions/"
            Write-Host "✅ Opened chrome://extensions/ in Chrome" -ForegroundColor Green
            $opened = $true
            break
        } catch {
            # Try next path
        }
    }
}

if (-not $opened) {
    # Fallback: try default browser
    try {
        Start-Process "chrome://extensions/"
        Write-Host "✅ Opened chrome://extensions/ in default browser" -ForegroundColor Green
    } catch {
        Write-Host "❌ Could not open Chrome automatically" -ForegroundColor Red
        Write-Host ""
        Write-Host "📋 MANUAL STEPS:" -ForegroundColor Yellow
        Write-Host "1. Open Chrome manually" -ForegroundColor White
        Write-Host "2. Type: chrome://extensions/" -ForegroundColor White
        Write-Host "3. Find 'Ghost Bot - Virtual Assistant'" -ForegroundColor White
        Write-Host "4. Click the refresh icon (🔄)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "📋 After Chrome opens:" -ForegroundColor Yellow
Write-Host "1. Find 'Ghost Bot - Virtual Assistant'" -ForegroundColor White
Write-Host "2. Click the refresh icon (🔄)" -ForegroundColor White
Write-Host "3. Check version shows v1.0.2" -ForegroundColor White
