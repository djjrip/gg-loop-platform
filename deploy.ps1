# Run this to deploy to Railway!

Write-Host "🚀 Preparing to deploy GG Loop to Railway..." -ForegroundColor Cyan
Write-Host ""

# Check if git is clean
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Changes detected. Committing..." -ForegroundColor Yellow
    git add .
    git commit -m "Remove Replit banner and deploy to Railway"
}
else {
    Write-Host "✅ No changes to commit" -ForegroundColor Green
}

Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ Code pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Railway will now automatically redeploy your site." -ForegroundColor Cyan
Write-Host "   This usually takes 2-3 minutes." -ForegroundColor White
Write-Host ""
