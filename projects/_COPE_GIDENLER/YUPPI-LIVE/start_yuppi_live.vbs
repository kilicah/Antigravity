Set WshShell = CreateObject(WScript.Shell)
WshShell.Run cmd /c cd C:\X\Antigravity\projects\YUPPI-LIVE && cloudflared.exe tunnel --config C:\Users\kilicah.USK\.cloudflared\config.yml run yuppi-server, 0, False
