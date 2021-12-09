Dim Arg,username,password
Set Arg = WScript.Arguments
username =  Arg(0)
password = Arg(1)

Dim ObjShell :Set ObjShell = CreateObject("Wscript.Shell")
Dim found
Do
found=ObjShell.AppActivate("Riot Client Main")
ObjShell.SendKeys("% {ENTER}")
WScript.Sleep 500
Loop While found=0
objShell.SendKeys username &"{TAB}"
WScript.Sleep 200
objShell.SendKeys password &"{ENTER}"
