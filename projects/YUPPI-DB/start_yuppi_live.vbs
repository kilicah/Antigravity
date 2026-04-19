Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd C:\X\Antigravity\projects\YUPPI-DB && npm run start -- -p 8080", 0, False
WshShell.Run "cmd /c cd C:\X\Antigravity\projects\YUPPI-DB && cloudflared.exe tunnel --config C:\Users\kilicah.USK\.cloudflared\config.yml run yuppi-server", 0, False
