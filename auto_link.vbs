Set WshShell = WScript.CreateObject("WScript.Shell")
WScript.Sleep 4000 
' Assume we are at project selection list
' Down arrow twice to select 3rd item (GG LOOP)
WshShell.SendKeys "{DOWN}"
WScript.Sleep 500
WshShell.SendKeys "{DOWN}"
WScript.Sleep 500
WshShell.SendKeys "{ENTER}"

' Wait for Environment selection
WScript.Sleep 2000
' Select FIRST environment (Production)
WshShell.SendKeys "{ENTER}"
