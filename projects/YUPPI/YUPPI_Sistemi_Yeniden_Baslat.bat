@echo off
title YUPPI ERP Sunucu Yeniden Baslatma Araci
color 0b

echo ====================================================
echo      YUPPI ERP SISTEMI YENIDEN BASLATILIYOR...
echo ====================================================
echo.

:: PM2 üzerinden yayınlanıyorsa onu yeniden başlatır (npx pm2 restart yuppi-erp)
echo PM2 Production (Canlı) Sunucusu kontrol ediliyor...
set PM2_HOME=C:\YUPPI_PROD_PM2
call npx pm2 restart yuppi-erp

echo.
echo ====================================================
echo ISLEM TAMAMLANDI.
echo ----------------------------------------------------
echo NOT: Eger VS Code/Terminal uzerinden 'npm run dev' 
echo ile gelistirme yapiyorsaniz, bu pencere onu etkilemez.
echo Gelistirme sunucusuna terminalde CTRL + C basip
echo ardindan tekrar 'npm run dev' yazarak baslatmalisiniz.
echo ====================================================
pause
