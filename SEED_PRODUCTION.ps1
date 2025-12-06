# GG Loop - Seed Rewards to Production
# This script will guide you through seeding rewards to Railway production

Write-Host "`n🎮 GG LOOP - SEED REWARDS TO PRODUCTION`n" -ForegroundColor Green

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "STEP 1: Get Your Railway DATABASE_URL" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan

Write-Host "`n1. Open your browser and go to: https://railway.app" -ForegroundColor White
Write-Host "2. Click on your 'GG Loop' project" -ForegroundColor White
Write-Host "3. Click on the 'PostgreSQL' service (database icon)" -ForegroundColor White
Write-Host "4. Click on the 'Variables' tab" -ForegroundColor White
Write-Host "5. Find 'DATABASE_URL' and click the copy icon" -ForegroundColor White

Write-Host "`n" -ForegroundColor White
Write-Host "Paste your DATABASE_URL here (it will be hidden): " -ForegroundColor Cyan -NoNewline
$DATABASE_URL = Read-Host -AsSecureString
$DATABASE_URL_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DATABASE_URL)
)

# Validate it's a PostgreSQL URL
if (-not $DATABASE_URL_Plain.StartsWith("postgresql://")) {
    Write-Host "`n❌ ERROR: That doesn't look like a PostgreSQL URL!" -ForegroundColor Red
    Write-Host "It should start with 'postgresql://'" -ForegroundColor Red
    Write-Host "`nPlease try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ DATABASE_URL validated!" -ForegroundColor Green

Write-Host "`n" -ForegroundColor White
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "STEP 2: Seeding Rewards to Production" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan

Write-Host "`nThis will add 12 rewards to your production database:" -ForegroundColor White
Write-Host "  • 4 Gift Cards ($10 - $100)" -ForegroundColor Gray
Write-Host "  • 3 Subscriptions (Discord, Spotify, Xbox)" -ForegroundColor Gray
Write-Host "  • 3 Gaming Gear (Headset, Mouse, Keyboard)" -ForegroundColor Gray
Write-Host "  • 2 High-Value Items (RTX 4060, PS5)" -ForegroundColor Gray

Write-Host "`n⚠️  WARNING: This will add NEW rewards to your database." -ForegroundColor Yellow
Write-Host "If you've already seeded, this will create duplicates!" -ForegroundColor Yellow

Write-Host "`nDo you want to continue? (Y/N): " -ForegroundColor Cyan -NoNewline
$confirm = Read-Host

if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "`n❌ Cancelled by user." -ForegroundColor Red
    exit 0
}

Write-Host "`n🚀 Starting seed process...`n" -ForegroundColor Green

# Set the environment variable
$env:DATABASE_URL = $DATABASE_URL_Plain

# Run the seed script
try {
    Write-Host "Running: npx tsx server/seed-rewards.ts`n" -ForegroundColor Gray
    
    $output = npx tsx server/seed-rewards.ts 2>&1
    
    Write-Host $output -ForegroundColor White
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n" -ForegroundColor White
        Write-Host "=" * 60 -ForegroundColor Cyan
        Write-Host "✅ SUCCESS! REWARDS SEEDED TO PRODUCTION!" -ForegroundColor Green
        Write-Host "=" * 60 -ForegroundColor Cyan
        
        Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
        Write-Host "1. Visit https://ggloop.io/shop" -ForegroundColor White
        Write-Host "2. Verify all 12 rewards are displaying" -ForegroundColor White
        Write-Host "3. Test the redemption flow" -ForegroundColor White
        Write-Host "4. Check the fulfillment system (see FULFILLMENT_SOP.md)" -ForegroundColor White
        
        Write-Host "`n🎮 Your shop is now LIVE and ready for revenue! 🚀`n" -ForegroundColor Green
    }
    else {
        throw "Seed script failed with exit code $LASTEXITCODE"
    }
}
catch {
    Write-Host "`n❌ ERROR: Failed to seed rewards" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nPlease check:" -ForegroundColor Yellow
    Write-Host "1. DATABASE_URL is correct" -ForegroundColor White
    Write-Host "2. Database is accessible" -ForegroundColor White
    Write-Host "3. Network connection is stable" -ForegroundColor White
    exit 1
}
