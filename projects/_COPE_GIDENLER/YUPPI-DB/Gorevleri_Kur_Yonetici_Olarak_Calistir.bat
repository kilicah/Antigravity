@echo off
echo =======================================================
echo YUPPI SISTEM RUTINLERI KURULUMU
echo Lutfen bu dosyayi "Yonetici Olarak Calistir" diyerek acin!
echo =======================================================

echo.
echo [1/3] YUPPI Canli Sunucu (Port 8080) Baslangic Gorevi Kuruluyor...
schtasks /create /tn "Start_YUPPI_Server" /tr "wscript.exe C:\X\Antigravity\projects\YUPPI-DB\start_yuppi_live.vbs" /sc onstart /ru SYSTEM /rl HIGHEST /f

echo.
echo [2/3] Veritabani 2 Saatlik Otomatik Yedekleme Gorevi Kuruluyor...
schtasks /create /tn "YUPPI_Database_Backup_Hourly" /tr "C:\Program Files\nodejs\node.exe C:\X\Antigravity\projects\YUPPI-DB\backup_db.js" /sc hourly /mo 2 /ru SYSTEM /rl HIGHEST /f

echo.
echo [3/3] Veritabani Baslangicta Ilk Yedekleme Gorevi Kuruluyor...
schtasks /create /tn "YUPPI_Database_Backup_Boot" /tr "C:\Program Files\nodejs\node.exe C:\X\Antigravity\projects\YUPPI-DB\backup_db.js" /sc onstart /ru SYSTEM /rl HIGHEST /f

echo.
echo KURULUM TAMAMLANDI!
echo Artik bilgisayar yeniden basladiginda YUPPI ve Yedekleme otomatik calisacak.
pause
