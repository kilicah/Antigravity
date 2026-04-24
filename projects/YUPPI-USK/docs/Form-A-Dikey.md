# Form-A-Dikey (A4 Dikey Fatura) Format Spesifikasyonu

Bu doküman, YUPPI-USK sistemi için geliştirilen ve standartlaştırılan "Form-A-Dikey" (eski adıyla Format 2) faturasının tüm piksel, renk, tipografi ve ızgara (grid) ölçülerini eksiksiz olarak belgelemektedir.

## 1. Genel Belge Ayarları
*   **Kağıt Boyutu:** A4 Dikey (Portrait)
*   **Toplam Genişlik (Kapsayıcı):** 794px
*   **Ana Yazı Tipi:** Arial, Helvetica, sans-serif
*   **Genel Standart Yazı Boyutu:** 11px
*   **Satır Aralığı (Line Height):** Dar (leading-tight)
*   **Dış Çerçeve ve Ana Çizgiler:** 1px kalınlığında düz Siyah (`border border-black`)

## 2. Üst Bilgi Blokları (Satır 1 ve Satır 2)

### Satır 1 (Yükseklik: 135px sabit)
Toplam 3 sütundan oluşan ızgara yapısı (Grid Columns: 315px - 315px - 158px). Alt çizgi: 1px Siyah.

*   **Sütun 1: İhracatçı Firma (Genişlik: 315px)**
    *   İç boşluk (padding): 8px (p-2)
    *   Sağ çizgi: 1px Siyah.
    *   Başlık (EXPORTER): Kalın (Bold), Altı Çizili (Underline), 11px. Alt boşluk: 2px.
    *   Firma Adı: Kalın (Bold), Tüm Harfler Büyük (Uppercase), 11px.
    *   Adres Metni: Satır aralığı esnek (leading-snug).
*   **Sütun 2: Fatura Başlığı (Genişlik: 315px)**
    *   İç boşluk: 8px (p-2)
    *   Sağ çizgi: 1px Siyah.
    *   İçerik: Yatay ve dikey ortalanmış.
    *   Başlık Metni (COMMERCIAL INVOICE): Kırmızı Renk (`#d81e1e`), Kalın (Bold), **30px Boyut**. Harf arası açık (tracking-wider). Satır aralığı dar (leading-tight).
*   **Sütun 3: Firma Logosu (Genişlik: 158px)**
    *   İç boşluk: 8px (p-2). İçerik ortalanmış.
    *   Logo Maksimum Boyutları: Yükseklik **84px**, Genişlik **188px** (max-h-[84px] max-w-[188px]). Object-fit: contain. Blend mode: multiply.

### Satır 2 (Yükseklik: 135px sabit)
Toplam 3 sütundan oluşan ızgara yapısı (Grid Columns: 315px - 315px - 158px). Alt çizgi: 1px Siyah.

*   **Sütun 1: Alıcı Firma (Genişlik: 315px)**
    *   Format: Satır 1 / Sütun 1 ile birebir aynı (padding: 8px, sağ çizgi 1px, başlıklar 11px Bold Underline).
*   **Sütun 2: Sevk Alıcısı (Genişlik: 315px)**
    *   Format: Satır 1 / Sütun 1 ile birebir aynı (padding: 8px, sağ çizgi 1px, başlıklar 11px Bold Underline).
*   **Sütun 3: Doküman Bilgileri (Genişlik: 158px)**
    *   İçerisinde alt alta 3 hücre barındırır. Her hücre **45px** sabit yüksekliğe sahiptir.
    *   Hücre 1 (Fatura No): Alt çizgi 1px siyah. Yatay iç boşluk (px-4). Başlık: 11px Bold.
    *   Hücre 2 (Fatura Tarihi): Alt çizgi 1px siyah. Yatay iç boşluk (px-4). Başlık: 11px Bold.
    *   Hücre 3 (Sipariş No): Alt çizgi yok. Yatay iç boşluk (px-4). Başlık: 11px Bold.

## 3. Ürünler Tablosu (Items Table)
Ana tablo tüm genişliği (794px) kaplar. Hücre aralarında dikey çizgi yoktur. Tablo başlığı ile içerik arasında 8px'lik (h-2) yapısal boşluklar bulunur.

*   **Tablo Başlıkları (THEAD)**
    *   Alt Çizgi: 1px Siyah (`border-b border-black`)
    *   Yazı Stili: 11px, Kalın (Bold), Büyük Harf.
    *   **Kolon Genişlikleri:**
        *   Ürün Cinsi: 115px (Sol hizalı)
        *   Kalite İsmi: 105px (Orta hizalı)
        *   Kalite Kodu: 85px (Orta hizalı)
        *   Renk Kodu: 75px (Orta hizalı)
        *   Kompozisyon: 125px (Sol hizalı)
        *   Fiyat: 70px (Sol hizalı)
        *   Miktar: 95px (Sağ hizalı)
        *   Toplam Tutar: 105px (Sağ hizalı, 8px sağdan iç boşluk pr-2)
*   **Tablo İçeriği (TBODY)**
    *   Hücre içi boşluklar: Sadece alttan 8px (pb-2) ve yatay 4px (px-1).
    *   Kalite isminde ürün modeli mevcutsa: Normal font (bold değil) parantez içi gösterim.
*   **Alt Toplamlar (TFOOT)**
    *   Üst Çizgi: 1px Siyah (`border-t border-black`)
    *   İçerik: Sol kısımda üretim ibaresi ("ALL GOODS MADE IN TURKEY..."), sağ kısımda Kalın (Bold) formatta Genel Toplam miktarları.

## 4. Yazıyla Tutar Bölümü
*   Yükseklik / Çizgiler: Üstten ve alttan 1px Siyah çizgi. Yükseklik esnek (p-2 padding ile).
*   Başlık (AMOUNT IN WORDS): Kalın (Bold), 11px. Sağdan boşluk 8px (mr-2).

## 5. Detaylar ve Banka (Alt Kısım)
Bu alan `Grid Columns: 450px - 1fr` olarak iki ana bloğa bölünmüştür. Sağlık-solluk kaymaları önlemek için sabit tablo mantığında tasarlanmıştır.

### Sol Bloğun (Genişlik: 450px) Satır Yapıları
*   **Hücre Şablonu:** `Grid Columns: 150px - 1fr`. Alt çizgiler 1px siyah.
*   **Başlık Kısmı (150px):** Kalın (Bold), 11px, Tüm harfler büyük. Sağ çizgisi 1px siyah (`border-r border-black`).
*   **İçerik Kısmı (1fr):** 11px, Normal.
*   **Kilogram/Paket Satırları (Özel Bölme):** Yatayda ortadan 2'ye bölünür. (Sol 150px Başlık + Veri) | (Sol 140px Başlık + Veri).

### Sağ Bloğun (Genişlik: 344px) Banka Satırları
*   **Hücre Şablonu:** `Grid Columns: 130px - 1fr`. Alt çizgiler 1px siyah.
*   **Başlık Kısmı (130px):** Kalın (Bold), 11px. Sağ çizgisi 1px siyah (`border-r border-black`).
*   **Hesap No Satırı (Özel):** `Grid Columns: 130px - 1fr - 40px`. En sağda 40px genişlikte ortalanmış Para Birimi (USD/EUR vb.) bulunur.

## 6. Alt Bölüm (İmza ve Menşe Bildirimi)
Sayfa sonu kırılmalarında (PDF yazdırma) çizgilerin kopmaması için tamamen CSS Grid olarak yeniden modellenmiştir.

*   **Boşluk ve Menşe Başlık Satırı:**
    *   Grid: `450px - 1fr`. 
    *   Sol taraf (450px): İçi boş, sağ kenarlığı 1px siyah (`border-r border-black`). Minimum yükseklik 30px.
    *   Sağ taraf (344px): Ortalanmış Kalın (Bold) "THE GOODS ARE OF TURKISH ORIGIN" başlığı.
*   **Kaşe ve Menşe Metin Satırı:**
    *   Grid: `450px - 1fr`. Üst çizgi: 1px siyah (Ortadan tam boy boydan boya kesen ana çizgi).
    *   **Sol Taraf (YETKİLİ İMZA VE KAŞE):**
        *   Sağ çizgi: 1px siyah (`border-r border-black`).
        *   Minimum Yükseklik: **65px**.
        *   Hizalama: Sütun formatı (flex-col), üstten başlangıçlı (pt-3 / 12px üstten boşluk).
        *   Kaşe Resmi: Absolute (Bağımsız) konumlandırma. Üstten 30px (top-[30px]), soldan 40px (left-10). **Genişlik: 240px**. Mix-blend-multiply ile transparanlık efekti.
    *   **Sağ Taraf (Menşe Uzun Metni):**
        *   Yazı boyutu 11px, her iki yana yaslı (text-justify), esnek satır aralığı (leading-snug). Dikey ortalanmış.

---
**Belge Sürümü:** V1.03 (Nihai)
**Oluşturulma:** Nisan 2026
**Uygulanan Dosya:** `src/components/orders/CommercialInvoicePortrait2.tsx`
