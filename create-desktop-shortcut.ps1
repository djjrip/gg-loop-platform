# Create Desktop Shortcut for Ghost Bot Launcher

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Ghost Bot Launcher.lnk")
$Shortcut.TargetPath = "$PSScriptRoot\GhostBotLauncher.bat"
$Shortcut.WorkingDirectory = "$PSScriptRoot"
$Shortcut.Description = "Ghost Bot - Your Virtual Assistant"
$Shortcut.IconLocation = "C:\Windows\System32\shell32.dll,137"  # Robot icon
$Shortcut.Save()

Write-Host "Desktop shortcut created!" -ForegroundColor Green
Write-Host "You can now pin it to your taskbar or start menu" -ForegroundColor Cyan

