const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'prisma', 'production.db');
const destFolder = 'Z:\\Z.Backup\\YUPPI_Database_Yedekleri';

console.log("YUPPI OTOMATIK YEDEKLEME SISTEMI BASLADI...");

if (!fs.existsSync(destFolder)) {
  try { 
      fs.mkdirSync(destFolder, { recursive: true }); 
  } catch (e) {
    console.error("HATA: Z: Surucusune ulasilamiyor veya yedek klasoru olusturulamadi.", e);
    process.exit(1);
  }
}

const dateStr = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
                .replace(/[\/\s:]/g, '_');
const dest = path.join(destFolder, `production_backup_${dateStr}.db`);

try {
    fs.copyFileSync(src, dest);
    console.log(`[BASARILI] Yeni yedek alindi: ${dest}`);
} catch (error) {
    console.error("[HATA] Veritabani kopyalanamadi:", error);
}

// 30 günden eski yedekleri sil
try {
    const files = fs.readdirSync(destFolder);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    files.forEach(file => {
       if (file.endsWith('.db')) {
          const filePath = path.join(destFolder, file);
          const stat = fs.statSync(filePath);
          if (stat.mtimeMs < thirtyDaysAgo) {
              fs.unlinkSync(filePath);
              console.log(`[TEMIZLIK] Eski yedek silindi: ${file}`);
          }
       }
    });
} catch (error) {
    console.error("[HATA] Eski yedekler temizlenirken sorun olustu:", error);
}
