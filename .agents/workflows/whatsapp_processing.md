---
description: WhatsApp Sohbetlerini Analiz Etme ve Asistan ile Paylaşma
---

Bu workflow, kişisel WhatsApp mesajlarınızı asistanınızla güvenli ve düzenli bir şekilde paylaşmanıza olanak tanır.

### Adım 1: WhatsApp Mesajlarını Dışa Aktarın
1.  Telefonunuzda WhatsApp'ı açın ve ilgili sohbeti seçin.
2.  **Sohbet Ayarları** (IOS: Kişi ismine tıklayın, Android: Üç nokta) -> **Sohbeti Dışa Aktar** seçeneğine dokunun.
3.  **Medya Olmadan** seçeneğini belirleyin.
4.  Oluşan `.txt` dosyasını bilgisayarınıza aktarın (E-posta, Kablo, iCloud vb.).

### Adım 2: Dosyayı Proje Klasörüne Kaydedin
1.  Dışa aktardığınız `.txt` dosyasını şu klasöre yapıştırın:
    `c:/X/Antigravity/Whatsapp/exports/`

### Adım 3: Analizi Başlatın
Aşağıdaki komutu terminalde çalıştırarak mesajların özetini ve yapılacak işleri (to-do) oluşturun:

// turbo
```powershell
python c:/X/Antigravity/Whatsapp/analyze_whatsapp.py
```

### Adım 4: Raporu İnceleyin
1.  Analiz tamamlandığında raporunuz şu klasöre kaydedilecektir:
    `c:/X/Antigravity/Whatsapp/reports/`
2.  Asistanınız (ben), bu raporu okuyarak size yardımcı olabilir, sorularınızı yanıtlayabilir veya iş takibi yapabilir.
