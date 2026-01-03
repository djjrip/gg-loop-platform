# LOCAL REPORT MIRRORING SCRIPT (LOCKED)
# Copies markdown reports to Detailed CHATGPT reports directory
# Idempotent: Safe to run multiple times

$RepoRoot = "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"
$DestDir = "C:\Users\Jayson Quindao\Desktop\GG LOOP\Detailed CHATGPT reports"
$FilesToCopy = @(
    "STATE_OF_REALITY_LEVERAGE_REPORT.md",
    "AG_GIT_STATE_RESOLUTION_REPORT.md"
)

# Ensure destination directory exists
if (-not (Test-Path $DestDir)) {
    New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
}

# Copy each file if it exists
foreach ($FileName in $FilesToCopy) {
    $SourcePath = Join-Path $RepoRoot $FileName
    $DestPath = Join-Path $DestDir $FileName
    
    if (Test-Path $SourcePath) {
        if (Test-Path $DestPath) {
            # File exists - append timestamp
            $Timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"
            $NameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($FileName)
            $Extension = [System.IO.Path]::GetExtension($FileName)
            $NewFileName = "${NameWithoutExt}_${Timestamp}${Extension}"
            $DestPath = Join-Path $DestDir $NewFileName
        }
        Copy-Item -Path $SourcePath -Destination $DestPath -Force | Out-Null
    }
}
