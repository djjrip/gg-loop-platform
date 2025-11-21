# Run this to deploy to Railway!

Write-Host "🚀 Preparing to deploy GG Loop to Railway..." -ForegroundColor Cyan
Write-Host ""

# Check if git is clean
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Changes detected. Committing..." -ForegroundColor Yellow
    git add .
    git commit -m "Deploy to Railway - PostgreSQL schema restored"
} else {
    Write-Host "✅ No changes to commit" -ForegroundColor Green
}

Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ Code pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://railway.app" -ForegroundColor White
Write-Host "2. Click 'Start a New Project'" -ForegroundColor White
Write-Host "3. Select 'Deploy from GitHub repo'" -ForegroundColor White
Write-Host "4. Choose 'djjrip/gg-loop-platform'" -ForegroundColor White
Write-Host "5. Add PostgreSQL database" -ForegroundColor White
Write-Host "6. Set environment variables (see DEPLOY_NOW.md)" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full guide: DEPLOY_NOW.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "💰 Once live, cancel Replit and save $15-35/month!" -ForegroundColor Green
