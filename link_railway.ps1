$wshell = New-Object -ComObject wscript.shell;
Start-Process "railway" -ArgumentList "link" -NoNewWindow
Start-Sleep -Seconds 4
# Select Project (Down twice, Enter)
$wshell.SendKeys("{DOWN}")
Start-Sleep -Milliseconds 500
$wshell.SendKeys("{DOWN}")
Start-Sleep -Milliseconds 500
$wshell.SendKeys("{ENTER}")
# Select Environment (Enter)
Start-Sleep -Seconds 2
$wshell.SendKeys("{ENTER}")
# Select Service (Esc)
Start-Sleep -Seconds 2
$wshell.SendKeys("{ESC}")
