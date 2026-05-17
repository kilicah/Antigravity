# AI MASTER BRAIN (YUPPI-USK Ortak Zeka ve Sistem Anayasası)

Bu doküman, projede çalışan tüm yapay zeka ajanlarının (Antigravity, Captain, Uzman vb.) ortak hafızasıdır.
**Herhangi bir ajan göreve başlamadan önce bu dosyayı OKUMAK ve SİNDİRMEK ZORUNDADIR.**

Sisteme yeni bir mekanizma ekleyen veya kronik bir hatayı çözen ajan, bu dosyayı anında güncelleyerek "Ortak Hafıza"ya katkıda bulunmalıdır.

---

## BÖLÜM 1: AĞ VE ALTYAPI (Tailscale Topology)
*Yazarlar: Captain & Uzman*

Projedeki tüm bilgisayarlar birbirine **Tailscale VPN** üzerinden bağlıdır.
- **USK2024-12:** 172.20.10.x (iPhone üzerinden internet alır). Ana Geliştirme cihazıdır.
- **USK2024-11:** 192.168.13.1 / 14.1. Server ve Geliştirme sunucusudur. Sadece uzak erişim (RDP) vardır.
- **HK-Business:** 192.168.12.1. Günlük iş bilgisayarı ve NAS sunucu hostu (192.168.12.252).
- **HK iPhone (17e) & HK Pad (Mi Pad Pro 7):** Mobil cihazlar. iPhone genelde Hotspot sağlayıcısıdır.

### 🔴 Kritik Ağ Kuralları (Ajanlar İçin)
1. **ASLA** Tailscale Subnet rotalarını veya MagicDNS'i (`100.100.100.100`) kapatmayın/değiştirmeyin. Sistemdeki yerel ağ ve RDP buna bağlıdır.
2. Eğer makineler arası bağlantı kopuyorsa, iPhone Hotspot'unun dayattığı IPv6 (TCP/IPv6) protokolünü ana Wi-Fi ve Ethernet bağdaştırıcılarından manuel kapattırın (Tailscale IPv4 ile çakışır).
3. Tailscale Ağ Önceliğini daima `100` yapın (InterfaceMetric = 100).
4. Ağ adaptörleriyle ilgili derin komutları (`Disable-NetAdapterBinding`, `Set-NetIPInterface` vb.) ajan olarak **otomatik (arka planda) ÇALIŞTIRMAYIN!** Windows Güvenlik politikaları bunu engeller (UAC çıksa bile düşer). Kod bloğunu oluşturup kullanıcıya "Bunu Administrator olarak PowerShell'de çalıştır" deyin.

---

## BÖLÜM 2: OTONOM İYİLEŞTİRME VE DEVOPS (Auto-Healing)
*Yazar: Antigravity*

YUPPI-USK sistemi reaktif değil, **PROAKTİF** olarak tasarlanmıştır. Sistem kendi kendini 7/24 izler ve tedavi eder.

### 🔴 Kritik Sunucu Kuralları (Ajanlar İçin)
1. **Watchdog Ajanı Devrededir:** Sunucuda (`c:\X\Antigravity\projects\YUPPI-USK\scripts\YUPPI_Watchdog.ps1`) her 5 dakikada bir çalışan görünmez bir Task Scheduler (Görev Zamanlayıcı) bulunur.
2. **Kriz Anında Müdahale Etmeyin:** Eğer PM2 çökmüşse, port 8080 yanıt vermiyorsa, RAM şişmişse veya Disk dolmuşsa ajan olarak panik yapıp Node.js'i manuel öldürmeye kalkmayın! Watchdog sistemi bunu zaten fark edip `Force-Kill` ve `Reload` mekanizmalarıyla sistemi otonom olarak ayağa kaldıracaktır.
3. **Yedekleme Otonomdur:** `yuppi_backup.ps1` scripti her gece saat 03:00'te çalışır. SQLite veritabanına `VACUUM` yapar, PM2 loglarını temizler, dosyaları ZIP'leyip `C:\YUPPI_BACKUPS` içine atar ve 30 günden eski yedekleri siler.
4. **Loglar:** Sistem anlık bir çökme yaşayıp Watchdog tarafından kurtarıldıysa, bunun nedeni `C:\YUPPI_BACKUPS\AutoHealing_Logs.txt` dosyasında yazar. Hata analizi yapacaksanız ilk buraya bakın.

---

## BÖLÜM 3: GÜVENLİK VE TOKEN (Gelecek Planı)
(Şu an beklemede. Sistem tam oturduğunda GitHub Token ve diğer hassas veriler .env veya Credential Manager içine alınacaktır. Token'ları düz metin olarak yazdırmayın.)

---
**Ortak Zeka Senkronizasyonu Başarılı.**
