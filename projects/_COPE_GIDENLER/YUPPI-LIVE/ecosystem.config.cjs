module.exports = {
  apps: [
    {
      name: "YUPPI-LIVE",
      // Next.js statik dosyayı çalıştırmak için `npm run start` veya direkt next modülünü çalıştırmalıyız.
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env_production: {
        NODE_ENV: "production",
        // Seçtiğimiz ofis/lokal ağ portu
        PORT: 8080
      },
      env: {
        NODE_ENV: "production",
        PORT: 8080,
        DATABASE_URL: "file:./USK.DB"
      },
      // Yüksek CPU kullanımında tekrar başlat, bellek limitini ayarla (isteğe bağlı)
      max_memory_restart: '1G'
    },
    {
      name: "YUPPI-LIVE-BACKUP",
      script: "backup_db.js",
      cron_restart: "0 */2 * * *", // Her 2 saatte bir tetiklenir
      autorestart: false, // Kod bitince kapanır, arkada gereksiz çalışmaz
      watch: false
    }
  ] // PM2 ayar dosyası
};
