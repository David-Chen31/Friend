Set ws = CreateObject("Wscript.Shell")
ws.run "cmd /c cd /d """ & CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & """ && npm start", 0
