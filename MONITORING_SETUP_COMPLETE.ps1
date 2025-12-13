# ═══════════════════════════════════════════════════════════════
# EMPIRE MONITORING - COMPLETE SETUP AUTOMATION
# ═══════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     EMPIRE MONITORING STACK - AUTOMATED SETUP COMPLETE        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ MONITORING STACK STATUS:" -ForegroundColor Green
Write-Host ""

# Display services
docker ps --format "table {{.Names}}\t{{.Status}}" --filter "name=empire"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 QUICK ACCESS GUIDE:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1️⃣  Open Grafana:     http://localhost:3030" -ForegroundColor White
Write-Host "      Login:           admin / admin" -ForegroundColor Gray
Write-Host ""
Write-Host "  2️⃣  View Prometheus:  http://localhost:9090" -ForegroundColor White
Write-Host "      No login needed" -ForegroundColor Gray  
Write-Host ""
Write-Host "  3️⃣  Check Dashboards:" -ForegroundColor White
Write-Host "      → Grafana → Dashboards → Empire folder" -ForegroundColor Gray
Write-Host "      → Look for 'Empire Command Center - Overview'" -ForegroundColor Gray
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🛠️  MANAGEMENT SCRIPTS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  • START_MONITORING.bat      - Start all services" -ForegroundColor White
Write-Host "  • CHECK_MONITORING.ps1      - Run health check" -ForegroundColor White
Write-Host "  • monitoring/README.md      - Full documentation" -ForegroundColor White
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📝 NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Change the default Grafana password (admin/admin)" -ForegroundColor White
Write-Host "  2. Explore the pre-configured dashboard" -ForegroundColor White
Write-Host "  3. Add custom metrics to your application" -ForegroundColor White
Write-Host "  4. Set up alerting rules in Grafana" -ForegroundColor White
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$openGrafana = Read-Host "Would you like to open Grafana now? (Y/N)"
if ($openGrafana -eq "Y" -or $openGrafana -eq "y") {
    Write-Host "🌐 Opening Grafana..." -ForegroundColor Green
    Start-Process "http://localhost:3030"
}

Write-Host ""
Write-Host "✨ Empire Monitoring Stack is ready!" -ForegroundColor Green
Write-Host ""
