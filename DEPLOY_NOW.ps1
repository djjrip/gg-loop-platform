#!/usr/bin/env pwsh
# Quick Deploy Script - Get GG Loop Live in 4 Minutes

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " GG LOOP - 4 MINUTE DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 1: Create Neon Database (2 min)" -ForegroundColor Yellow
Write-Host "--------------------------------------"
Write-Host "1. Open: https://neon.tech"
Write-Host "2. Sign up (GitHub login works)"
Write-Host "3. Create project: 'ggloop-production'"
Write-Host "4. Copy connection string"
Write-Host ""
Write-Host "Press Enter when you have the connection string..." -ForegroundColor Green
Read-Host

Write-Host ""
Write-Host "STEP 2: Enter Connection String" -ForegroundColor Yellow
Write-Host "--------------------------------------"
$neonUrl = Read-Host "Paste Neon DATABASE_URL here"

if ([string]::IsNullOrWhiteSpace($neonUrl)) {
    Write-Host "ERROR: No connection string provided" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "STEP 3: Seeding Database (30 sec)" -ForegroundColor Yellow
Write-Host "--------------------------------------"
$env:RAILWAY_DATABASE_URL = $neonUrl
node scripts/seed-railway-rewards.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Seed failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "STEP 4: Choose Hosting" -ForegroundColor Yellow
Write-Host "--------------------------------------"
Write-Host "1. Vercel (recommended - free, instant)"
Write-Host "2. Netlify (free, instant)"
Write-Host "3. Railway (update DATABASE_URL manually)"
Write-Host "4. Skip (I'll deploy manually)"
Write-Host ""
$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "Deploying to Vercel..." -ForegroundColor Green
        vercel env add DATABASE_URL production
        Write-Host $neonUrl
        vercel --prod --yes
    }
    "2" {
        Write-Host "Building for Netlify..." -ForegroundColor Green
        npm run build
        netlify deploy --prod --dir=dist/public
    }
    "3" {
        Write-Host ""
        Write-Host "Update Railway:" -ForegroundColor Green
        Write-Host "1. Go to railway.app dashboard"
        Write-Host "2. Variables → Add DATABASE_URL"
        Write-Host "3. Paste: $neonUrl"
        Write-Host "4. Redeploy"
    }
    "4" {
        Write-Host "Skipping deployment" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " DEPLOYMENT COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database: Neon (seeded with 3 rewards)" -ForegroundColor Green
Write-Host "Connection: $neonUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "Next: Verify shop at https://ggloop.io/shop" -ForegroundColor Yellow
Write-Host ""
