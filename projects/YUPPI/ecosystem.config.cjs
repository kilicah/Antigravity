module.exports = {
  apps: [
    {
      name: "YUPPI",
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
        PORT: 8080
      },
      // Yüksek CPU kullanımında tekrar başlat, bellek limitini ayarla (isteğe bağlı)
      max_memory_restart: '1G'
    }
  ] // PM2 ayar dosyası
};
