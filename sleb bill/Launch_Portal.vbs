On Error Resume Next
Set objFSO = CreateObject("Scripting.FileSystemObject")
currentDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

Set WshShell = CreateObject("WScript.Shell")

' 1. Spin up the Node.js background backup server completely silently (0 = invisible console)
WshShell.CurrentDirectory = currentDir
WshShell.Run "node server.js", 0, False

' 2. Wait 1.5 seconds for the server to activate
WScript.Sleep 1500

' 3. Open the default web browser directly to the synced ERP portal
WshShell.Run "http://localhost:3000", 9

' 4. Automatically create/refresh convenient Desktop Shortcuts for future one-click launches
desktopPath = WshShell.SpecialFolders("Desktop")

' Create the first shortcut: "Sri Lakshmi e-Bikes Portal"
Set oShortcut = WshShell.CreateShortcut(desktopPath & "\Sri Lakshmi e-Bikes Portal.lnk")
oShortcut.TargetPath = "wscript.exe"
oShortcut.Arguments = """" & currentDir & "\Launch_Portal.vbs"""
oShortcut.WorkingDirectory = currentDir
oShortcut.Description = "Sri Lakshmi e-Bikes H BILLING SYSTEMS and Service Print Station"
oShortcut.IconLocation = currentDir & "\sleb_logo.ico"
oShortcut.Save

' Create the second shortcut: "Launch_Portal" (overwriting the default script icon with the beautiful brand logo)
Set oShortcut2 = WshShell.CreateShortcut(desktopPath & "\Launch_Portal.lnk")
oShortcut2.TargetPath = "wscript.exe"
oShortcut2.Arguments = """" & currentDir & "\Launch_Portal.vbs"""
oShortcut2.WorkingDirectory = currentDir
oShortcut2.Description = "Sri Lakshmi e-Bikes H BILLING SYSTEMS and Service Print Station"
oShortcut2.IconLocation = currentDir & "\sleb_logo.ico"
oShortcut2.Save

