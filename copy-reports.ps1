$files = @(
    'STATE_OF_REALITY_LEVERAGE_REPORT.md',
    'AUTONOMOUS_STATUS_REPORT.md',
    'FINAL_STATUS_REPORT.md',
    'EMPIRE_STATUS_REPORT.md',
    'TACTICAL_REPORT.md',
    'HONESTY_AUDIT_REPORT.md',
    'BRAND_SITE_READINESS_REPORT.md',
    'LEVEL_4_SAFETY_REPORT.md',
    'LEVEL_4_CONSISTENCY_REPORT.md',
    'AWS_VERIFICATION_REPORT.md',
    'SECURITY_AUDIT_REPORT.md',
    'PRODUCTION_RECOVERY_REPORT.md',
    'ACTUAL_STATUS.md',
    'OPERATIONAL_STATUS.md',
    'AUTHENTICITY_AUDIT.md',
    'BRAND_ALIGNMENT_AUDIT.md',
    'COPY_AUDIT_L3.md',
    'ENV_AUDIT_COMPLETE.md',
    'CLEANUP_AUDIT.md',
    'RIOT_COMPLIANCE_AUDIT.md',
    'COMPLETE_BUSINESS_ANALYSIS.md',
    'LAUNCH_STATUS_HONEST_ASSESSMENT.md'
)

$dest = 'Detailed CHATGPT reports'

foreach ($f in $files) {
    if (Test-Path $f) {
        Copy-Item $f -Destination $dest -Force
        Write-Host "Copied $f"
    } else {
        Write-Host "Not found: $f"
    }
}

Write-Host "Done!"


