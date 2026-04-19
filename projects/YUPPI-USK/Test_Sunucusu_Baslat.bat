@echo off
echo ========================================================
echo TEST SUNUCUSU BASLATILIYOR (Port: 3000)
echo ========================================================
cd /d C:\X\Antigravity\projects\TEST-DB

echo [1/2] Veritabani Guncellemeleri (Prisma Push) Calistiriliyor...
call npx prisma db push --accept-data-loss

echo [2/2] YUPPI Test Sunucusu Baslatiliyor...
start /B cmd /c "npx next dev -p 3000"

echo Test sunucusu baslatildi! Baglanti adresleri:
echo - https://test.usk.one
echo - http://localhost:3000
echo Cikis yapmak icin bu pencereyi kapatabilirsiniz (Arka planda calismaya devam edebilir, tamamen kapatmak icin Gorev Yoneticisinden Node.js'i sonlandirin).
pause
