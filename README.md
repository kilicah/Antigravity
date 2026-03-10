# Antigravity Project

Bu depo (repository), tüm projelerimizin temel çatısı (Monorepo) olarak görev yapmaktadır.

## Klasör Yapısı (Önerilen)

- **`projects/` (veya `apps/`)**: Yeni geliştireceğiniz her bir bağımsız uygulama/proje buraya ayrı bir klasör olarak gelir. (örn: `projects/proje1`, `projects/web_app`)
- **`core/` (veya `shared/`)**: Projelerinizin ortak kullanacağı yardımcı kodlar, kütüphaneler (logger, veritabanı bağlantısı, auth servisleri vb.) burada bulunur.
- **`docs/`**: Tüm çatı projeyi ilgilendiren mimari kararlar ve notlar buraya eklenir.

## Yeni Proje Eklemek

Yeni bir projeye başlarken:
1. `projects/` altında projenize ait yeni bir klasör oluşturun (örn: `projects/yeni_projem`).
2. Projenize özel kodları bu klasör içinde geliştirin.
3. Eğer farklı projelerde de kullanılabilecek genel bir fonksiyon/sınıf yazıyorsanız, bunu `core/` klasörüne taşıyın. Böylece projeleriniz ortak kodu paylaşabilir ve bakım kolaylaşır!
