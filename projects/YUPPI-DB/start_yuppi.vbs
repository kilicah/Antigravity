Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd C:\X\Antigravity\projects\YUPPI && npm run start -- -p 8080", 0, False
WshShell.Run "cmd /c cd C:\X\Antigravity\projects\YUPPI && cloudflared.exe tunnel run yuppi-server", 0, False
