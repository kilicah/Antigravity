# USK ve HK Sistemleri - Ağ ve Altyapı Master Rehberi

Bu belge, **USK2024-12, USK2024-11 ve HK-Business** cihazları arasındaki Tailscale uzak bağlantı omurgasının mimarisini, geçmişte yaşanan çökme/kopma sorunlarının nedenlerini ve bu sistemlerin gelecekteki olası format/çökme durumlarında nasıl yeniden ayağa kaldırılacağını detaylandırmaktadır. 

**Oluşturulma Tarihi:** 25 Nisan 2026
**Yazar:** Antigravity (USK2024-12 Ajanı)

---

## 1. Ağ Topolojisi ve Cihaz Rolleri

| Cihaz Adı | İşletim Sistemi | Yerel IP Bloğu / Ağ | Görevi ve Önemi |
| :--- | :--- | :--- | :--- |
| **USK2024-12** | Windows 11 Home | 172.20.10.x (iPhone) | İşyerindeki diğer cihazlara bağlanmak için kullanılan **Köprü ve Ana Geliştirme** cihazıdır. Tüm fikir ve geliştirmelerin kaynağıdır. İnternetini ağırlıklı olarak iPhone üzerinden (USB/Wi-Fi Hotspot) alır. |
| **USK2024-11** | Windows 11 Pro | 192.168.13.1 & 14.1 | Server ve Geliştirme sunucusudur. Sadece uzak erişimi (Tailscale üzerinden) vardır. |
| **HK-Business** | Windows 11 Pro | 192.168.12.1 | Günlük kullanım ve iş bilgisayarıdır. Aynı zamanda `192.168.12.252` IP'li bir NAS (Ağ Depolama) sunucusuna ev sahipliği yapar. |
| **Mobil Cihazlar** | iOS / Android | Değişken | **HK iPhone** (iPhone 17e) internet sağlayıcı (Hotspot) rolündedir. **HK Pad** (Mi Pad Pro 7) mobil erişim cihazıdır. |

**Bağlantı Omurgası:** Cihazların tamamı **Tailscale** VPN altyapısıyla birbirine güvenli (P2P) tünellerle bağlıdır. `192.168.x.x` alt ağlarına (Subnet) Tailscale'in "Subnet Router" özelliği ile erişilmektedir.

---

## 2. Kronik Sorunlar ve Çözümleri (Olası Çökmeler İçin)

Eğer bir bilgisayara (özellikle USK2024-12) format atılırsa veya Tailscale yeniden kurulursa, telefon üzerinden (USB veya Wi-Fi) internet alınırken internet **tamamen kopacak** ve sistem "sapıtacaktır". 

Bunun yaşanmaması için sistem kurulduktan hemen sonra aşağıdaki **Kritik Optimizasyonlar** yapılmalıdır:

### Sorun: Tailscale açılınca internetin kesilmesi ve sistemin kitlenmesi
* **Sebep 1 (DNS Çakışması):** iPhone internet paylaşırken bilgisayara IPv6 DNS dayatır. Tailscale ise IPv4 (`100.100.100.100`) kullanır. Windows ikisi arasında kilitlenir.
* **Sebep 2 (Bağdaştırıcı Önceliği):** Tailscale kendini 100Gbps hızında sanal ağ gösterir, Windows tüm internet trafiğini (Google'a gidişi bile) Tailscale'e sokmaya çalışıp trafiği boğar.
* **Sebep 3 (Güç Yönetimi & Roaming):** Intel Wi-Fi kartı sinyal aramak için saniyelik kopmalar yapar, USB Ethernet ise güç tasarrufu için anlık uykuya dalar.

### Çözüm Adımları (Recovery)

> [!WARNING]
> **Windows Güvenlik & UAC Uyarısı:** Aşağıdaki komutların *Antigravity Ajanları tarafından* (`Start-Process powershell -Verb RunAs` vb. kullanılarak) arka planda otomatik çalıştırılmaya çalışılması, UAC onaylansa dahi Windows Güvenlik Politikaları (veya Defender) tarafından sessizce engellenebilir (Hata vermeden işlem boşa düşer). 
> **Kesin Çözüm:** Bu yüzden ajan üzerinden otomatize etmeye çalışmak vakit kaybıdır. Kullanıcı olarak Başlat menüsünden **PowerShell'i Yönetici Olarak Çalıştırıp** aşağıdaki kod bloğunu bizzat konsola yapıştırın. Saniyeler içinde tüm optimizasyon başarıyla işlenecektir.

```powershell
# 1. iPhone USB ve Wi-Fi için IPv6'yı Kesinlikle Kapatın (İsimler her bilgisayarda farklı olabileceği için dinamik tarama yapılır)
Get-NetAdapter | Where-Object { $_.Name -match "Ethernet|Wi-Fi" } | Disable-NetAdapterBinding -ComponentID ms_tcpip6

# 2. Tailscale Ağ Önceliğini (Metric) Düşürün (Sadece Subnet rotaları oradan geçsin)
Set-NetIPInterface -InterfaceAlias "Tailscale" -InterfaceMetric 100

# 3. Tailscale Ağ Profilini "Private" (Özel Ağ) Yapın
Set-NetConnectionProfile -InterfaceAlias "Tailscale" -NetworkCategory Private
```
*(Güç seçenekleri ve Roaming ayarları donanıma özel olduğundan Aygıt Yöneticisi -> Ağ Bağdaştırıcıları bölümünden manuel olarak "Güç kazancı sağlamak için bu aygıtı kapat" tikleri kaldırılmalıdır.)*

---

## 3. Diğer Antigravity Ajanları İçin Bağlam (Context Yönergesi)

Eğer `HK-Business` veya `USK2024-11` bilgisayarlarındaki **Antigravity Ajanlarına** bir görev verecekseniz, onlara ağın nasıl çalıştığını anlatmak için aşağıdaki metni doğrudan Prompt (İstem) olarak gönderebilirsiniz:

<context_for_other_agents>
### SYSTEM CONTEXT FOR ANTIGRAVITY AGENTS
You are operating within a distributed infrastructure connected entirely via **Tailscale**.

**Tanımlamalar (Network Topology):**
* Bu bilgisayar USK2024-12 işyerindeki 2 bilgisayarıma ulaşmak için kullandığım Bilgisayardır.
* USK2024-11 Server ve Geliştirme olarak kullandığım W11 Pro Bilgisayardır ve sadece uzak erişimi vardır. Local 192.168.13.1 ve 192.168.14.1 blok erşimine sahiptir.
* HK-Business Günlük kullanım olarak kullandığım W11 Pro Bilgisayardır. Local 192.168.12.1 blok erşimine sahiptir. 192.168.12.252 Nas Sunucu erişimi vardır.
* HK iPhone kullandığım telefon iPhone 17e modelidir.
* HK Pad kullandığım tablet Mi Pad Pro 7 modelidir.
* Tüm alt yapıda birbirini bağlamak için Tailscale kullanılmaktadır.

**Kritik Kurallar:**
- **Rule 1:** NEVER disable or modify Tailscale Subnet routes or MagicDNS (`100.100.100.100`). The user relies heavily on local IP (`192.168.x.x`) file sharing and RDP.
- **Rule 2:** If you experience connection drops between machines, verify that Tailscale Interface Metric is set to `100` and IPv6 is DISABLED on the main physical adapters providing internet to the machines.
- **Rule 3:** DO NOT attempt to run network adapter modification commands (`Disable-NetAdapterBinding`, `Set-NetIPInterface`) automatically in the background using `run_command` and `Start-Process powershell -Verb RunAs`. Windows Security policies or Defender will silently block background agent UAC executions. Instead, generate the exact PowerShell snippet and instruct the USER to manually open an elevated PowerShell prompt and execute it.
- Always check firewall rules to ensure they allow traffic originating from `100.64.0.0/10` (Tailscale) and `192.168.x.x` subnets.
</context_for_other_agents>

---
**Öneri:** Bu dosyayı OneDrive, GitHub veya NAS üzerinde her zaman ulaşabileceğiniz güvenli bir klasörde saklayın. Ajanlara bu dosyanın yolunu vererek ağı hemen tanımalarını sağlayabilirsiniz.
