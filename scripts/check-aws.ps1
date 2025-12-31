# AWS Migration Pre-Flight Check
Write-Host "Checking AWS Migration Readiness..." -ForegroundColor Cyan
Write-Host ""

$errors = 0

# Check AWS CLI
Write-Host "Checking AWS CLI..." -ForegroundColor Yellow
try {
    $null = aws --version 2>&1
    Write-Host "  OK: AWS CLI installed" -ForegroundColor Green
}
catch {
    Write-Host "  FAIL: AWS CLI not found" -ForegroundColor Red
    Write-Host "  Install from: https://aws.amazon.com/cli/" -ForegroundColor Red
    $errors++
}

# Check AWS Credentials
Write-Host "Checking AWS credentials..." -ForegroundColor Yellow
if ($env:AWS_ACCESS_KEY_ID) {
    Write-Host "  OK: AWS_ACCESS_KEY_ID set" -ForegroundColor Green
}
else {
    Write-Host "  FAIL: AWS_ACCESS_KEY_ID not set" -ForegroundColor Red
    $errors++
}

if ($env:AWS_SECRET_ACCESS_KEY) {
    Write-Host "  OK: AWS_SECRET_ACCESS_KEY set" -ForegroundColor Green
}
else {
    Write-Host "  FAIL: AWS_SECRET_ACCESS_KEY not set" -ForegroundColor Red
    $errors++
}

# Check .env file
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  OK: .env file found" -ForegroundColor Green
}
else {
    Write-Host "  FAIL: .env file not found" -ForegroundColor Red
    $errors++
}

# Check GitHub
Write-Host "Checking GitHub repository..." -ForegroundColor Yellow
$gitRemote = git remote -v 2>&1
if ($gitRemote -match "github.com/djjrip/gg-loop-platform") {
    Write-Host "  OK: GitHub repo configured" -ForegroundColor Green
}
else {
    Write-Host "  FAIL: GitHub remote incorrect" -ForegroundColor Red
    $errors++
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($errors -eq 0) {
    Write-Host "PRE-FLIGHT CHECK PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ready to deploy to AWS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next command: npm run deploy:aws"
    exit 0
}
else {
    Write-Host "PRE-FLIGHT CHECK FAILED - $errors errors" -ForegroundColor Red
    Write-Host ""
    Write-Host "Fix errors above before deploying"
    exit 1
}
