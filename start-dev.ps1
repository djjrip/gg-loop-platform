# Set execution policy for this session
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

Write-Host "🚀 GG Loop Platform - Local Development Server" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Dependencies ready" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    Write-Host "📋 Copying from .env.template..." -ForegroundColor Yellow
    Copy-Item ".env.template" ".env"
    Write-Host "✅ .env file created - please edit with your API keys" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🗄️  Initializing database..." -ForegroundColor Cyan
Write-Host "   Using SQLite (local.db) for development" -ForegroundColor Gray
Write-Host ""

Write-Host "🌐 Starting development server..." -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5000" -ForegroundColor Green
Write-Host "   Backend API: http://localhost:5000/api" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the dev server
npm run dev
