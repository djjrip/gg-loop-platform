# ═══════════════════════════════════════════════════════════════════════
# ⚠️ DEPRECATED — LOCAL EXECUTION REMOVED
# ═══════════════════════════════════════════════════════════════════════
#
# This script has been DEPRECATED as of 2026-01-03.
#
# REASON:
# - Founder (Jayson) is non-technical
# - Founder will NOT execute local PowerShell scripts
# - All reporting is now repo-native via /REPORTS/CANONICAL/
#
# DO NOT USE THIS SCRIPT.
# DO NOT REQUIRE THE FOUNDER TO RUN LOCAL COMMANDS.
#
# REPLACEMENT:
# - All canonical reports live in: /REPORTS/CANONICAL/
# - Single source of truth: CANONICAL_SYSTEM_STATE.md
# - No local mirroring required
#
# ═══════════════════════════════════════════════════════════════════════

# ORIGINAL SCRIPT PRESERVED FOR REFERENCE ONLY (DO NOT EXECUTE)

<#
$RepoRoot = "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"
$DestDir = "C:\Users\Jayson Quindao\Desktop\GG LOOP\Detailed CHATGPT reports"
$FilesToCopy = @(
    "STATE_OF_REALITY_LEVERAGE_REPORT.md",
    "AG_GIT_STATE_RESOLUTION_REPORT.md"
)

foreach ($FileName in $FilesToCopy) {
    $SourcePath = Join-Path $RepoRoot $FileName
    $DestPath = Join-Path $DestDir $FileName
    if (Test-Path $SourcePath) {
        Copy-Item -Path $SourcePath -Destination $DestPath -Force
    }
}
#>

Write-Host "⚠️ DEPRECATED: This script no longer executes. See /REPORTS/CANONICAL/ for all reports."
