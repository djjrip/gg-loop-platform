#########################################
# GG LOOP - STREAMER OUTREACH AUTOMATION
# One-click system to find and email streamers

# STATUS: DISABLED UNDER CEO PROTOCOL
# This script must NOT be run automatically.
# All outreach and campaigns require explicit CEO approval.
#########################################

Write-Host "🎯 GG LOOP STREAMER OUTREACH AUTOMATION" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Step 1: Find Streamers
Write-Host "📊 FIND STREAMERS ON TWITCHTRACKER" -ForegroundColor Yellow
Write-Host "Tools available:" -ForegroundColor White
Write-Host "  1. TwitchTracker (manual but free)" -ForegroundColor DarkGray
Write-Host "     https://twitchtracker.com/games/21779/streamers (League)" -ForegroundColor DarkGray
Write-Host "     https://twitchtracker.com/games/516575/streamers (Valorant)" -ForegroundColor DarkGray
Write-Host "  2. Email scraper (server/twitchEmailScraper.ts)" -ForegroundColor DarkGray
Write-Host "  3. Partnership emailer (server/streamerOutreach.ts)`n" -ForegroundColor DarkGray

# Create streamers list if it doesn't exist
$streamersFile = ".\streamers-to-contact.json"

if (-not (Test-Path $streamersFile)) {
    Write-Host "📝 Creating streamers list template..." -ForegroundColor Yellow
    
    $template = @{
        streamers = @(
            @{
                username   = "example_streamer1"
                email      = "business@example1.com"
                game       = "League of Legends"
                avgViewers = 500
                notes      = "Found via TwitchTracker"
            }
            @{
                username   = "example_streamer2"
                email      = "contact@example2.com"
                game       = "VALORANT"
                avgViewers = 300
                notes      = "Has business email in Twitch panels"
            }
        )
        contacted = @()
        responded = @()
    }
    
    $template | ConvertTo-Json -Depth 10 | Out-File $streamersFile -Encoding UTF8
    Write-Host "✅ Created: $streamersFile" -ForegroundColor Green
    Write-Host "   Edit this file and add real streamers`n" -ForegroundColor DarkGray
}

# Step 2: Automated Email Finding
Write-Host "`n🔍 OPTION: Run Email Scraper" -ForegroundColor Yellow
Write-Host "Run this to find emails automatically:" -ForegroundColor White
Write-Host "  npx tsx server/twitchEmailScraper.ts`n" -ForegroundColor Cyan

# Step 3: Send Emails
Write-Host "📧 OPTION: Send Partnership Emails" -ForegroundColor Yellow
Write-Host "Once you have streamers + emails, run:" -ForegroundColor White
Write-Host "  npx tsx server/streamerOutreach.ts`n" -ForegroundColor Cyan

# Interactive menu
Write-Host "`n=========================================="  -ForegroundColor Cyan
Write-Host "WHAT WOULD YOU LIKE TO DO?" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open streamer list file (add streamers manually)" -ForegroundColor White
Write-Host "2. Run email scraper (auto-find emails from Twitch)" -ForegroundColor White
Write-Host "3. Send partnership emails (to streamers in list)" -ForegroundColor White
Write-Host "4. View partnership email template" -ForegroundColor White
Write-Host "5. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "`n📝 Opening streamers list..." -ForegroundColor Yellow
        notepad $streamersFile
    }
    "2" {
        Write-Host "`n🔍 Running email scraper..." -ForegroundColor Yellow
        Write-Host "This will check Twitch profiles for public emails`n" -ForegroundColor DarkGray
        npx tsx server/twitchEmailScraper.ts
    }
    "3" {
        Write-Host "`n📧 Running outreach system..." -ForegroundColor Yellow
        Write-Host "⚠️ WARNING: This will send REAL emails!" -ForegroundColor Red
        Write-Host "Make sure SendGrid API key is set`n" -ForegroundColor Yellow
        
        $confirm = Read-Host "Continue? (yes/no)"
        if ($confirm -eq "yes") {
            if (-not $env:SENDGRID_API_KEY) {
                Write-Host "⚠️  ERROR: SENDGRID_API_KEY not set. Cannot send." -ForegroundColor Red
            }
            else {
                npx tsx server/streamerOutreach.ts
            }
        }
    }
    "4" {
        Write-Host "`n📄 PARTNERSHIP EMAIL TEMPLATE:" -ForegroundColor Cyan
        Write-Host "==========================================`n" -ForegroundColor Cyan
        Write-Host "Subject: Partnership Opportunity - Reward Your [GAME] Viewers`n" -ForegroundColor Yellow
        Write-Host "Hi [STREAMER_NAME],"
        Write-Host ""
        Write-Host "I'm Jayson, founder of GG LOOP - a rewards platform for Riot game players."
        Write-Host ""
        Write-Host "I noticed you stream [GAME] and thought you'd be interested in a partnership."
        Write-Host ""
        Write-Host "WHAT GG LOOP DOES:"
        Write-Host "- Your viewers link their Riot accounts"
        Write-Host "- They earn points for playing ranked"
        Write-Host "- Redeem points for gift cards, gaming gear, subscriptions"
        Write-Host "- 100% free for them to start"
        Write-Host ""
        Write-Host "PARTNERSHIP BENEFITS FOR YOU:"
        Write-Host "- Custom affiliate code for your community"
        Write-Host "- 20% commission on paid subscriptions from your viewers"
        Write-Host "- Custom dashboard page: ggloop.io/streamers/[username]"
        Write-Host "- Exclusive rewards for your community"
        Write-Host ""
        Write-Host "WHY THIS WORKS:"
        Write-Host "- Increases viewer engagement (they're rewarded for playing)"
        Write-Host "- Passive income for you (20% recurring commission)"
        Write-Host "- No cost to you or your viewers"
        Write-Host "- Built by gamers, for gamers"
        Write-Host ""
        Write-Host "Interested? Reply and I'll set you up with a custom code this week."
        Write-Host ""
        Write-Host "Or check it out: https://ggloop.io"
        Write-Host ""
        Write-Host "Best,"
        Write-Host "Jayson"
        Write-Host "Founder, GG LOOP`n"
        Write-Host "==========================================`n" -ForegroundColor Cyan
    }
    "5" {
        Write-Host "`nExiting..." -ForegroundColor Yellow
        exit
    }
    default {
        Write-Host "`n❌ Invalid choice" -ForegroundColor Red
    }
}

Write-Host "`n✅ NEXT STEPS:" -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Cyan
Write-Host "1. Find 10-20 streamers on TwitchTracker" -ForegroundColor White
Write-Host "   - 100-1,000 avg viewers" -ForegroundColor DarkGray
Write-Host "   - League, Valorant, or TFT" -ForegroundColor DarkGray
Write-Host "   - Active (stream 3+ times/week)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "2. Add them to streamers-to-contact.json" -ForegroundColor White
Write-Host "   - Just username, game, viewer count" -ForegroundColor DarkGray
Write-Host ""
Write-Host "3. Run email scraper to find their business emails" -ForegroundColor White
Write-Host "   - Checks Twitch panels and about section" -ForegroundColor DarkGray
Write-Host ""
Write-Host "4. Send partnership emails" -ForegroundColor White
Write-Host "   - Professional B2B outreach" -ForegroundColor DarkGray
Write-Host "   - CAN-SPAM compliant" -ForegroundColor DarkGray
Write-Host "   - 5-10% response rate expected" -ForegroundColor DarkGray
Write-Host ""

Write-Host "Press any key to close..." -ForegroundColor DarkGray
$null = $Host.UI.Raw UI.ReadKey("NoEcho,IncludeKeyDown")
