# YUPPI ERP - UI & UX Standartları

Bu doküman, YUPPI ERP sisteminde bundan sonra geliştirilecek **tüm yeni sayfa, form ve ekranlarda** uygulanması zorunlu olan Kullanıcı Deneyimi (UX) ve Arayüz (UI) standartlarını listeler. Bu kurallar 04.04.2026 tarihinde onaylanmış ve sisteme entegre edilmiştir.

## 1. Ekran Genişliği ve Merkezleme (Max-Width)
Hiçbir form veya tablo geniş ekranlarda sonsuza kadar uzamamalıdır. Kullanıcı gözünü yormamak için yatay sınırlar korunmalıdır:
* **Form Kapsayıcıları:** `<form className="max-w-6xl mx-auto space-y-6">` veya `max-w-5xl`. Formlar kesinlikle ekranın sağına ve soluna tamamen yapışıp uzamamalı, merkeze hizalanıp maksimum bir genişlikte (`1152px` - `6xl` vb) tutulmalıdır.

## 2. Mobil "Touch Target" (Dokunma) & Font Standartları
Apple iOS (iPhone) ve genel mobil web tarayıcı standartlarına uygunluk için form girdi alanları katı bir şablona bağlanmıştır:
* **Girdi Boyutu (Inputs & Selects):** Mobil cihazlarda tarayıcının otomatik yakınlaştırmasını (zoom-in) önlemek için input içerisine girilen verilerin boyutu **KESSİNLİKLE en az 16px (`text-base`)** olmalıdır.
* **Padding (Touch Target):** Mobilde parmakla rahat tıklanabilmesi için kutuların yüksekliğini sağlayan padding değeri `py-2.5` (`px-4 py-2.5`) olmalıdır.

## 3. Label (Etiket) Tasarımı
Eski soluk ve standart yapı yerine modern, dikkat dağıtmayan kurumsal bir etiket standartı kullanılacaktır:
* **Sınıflar:** `className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5"`
* Özellikler: Ufak punto (`11px`), tamamı BÜYÜK HARF (`uppercase`), belirgin (`font-bold`), geniş aralıklı (`tracking-wider`).

## 4. Akıllı Menü (Sidebar)
* Geniş ekranlı veri girilen sayfalarda kullanıcı alanını korumak için, Sidebar her zaman daraltılmış ve "Hover" (üzerine gelince) açılır (Collapsible) şekilde bırakılmalıdır veya Pin (Sabit) özelliği açık bırakılmalıdır. 

---
**ÖZET - GELECEK GELİŞTİRİCİLERE / AJANLARA NOT:**
`Input` tanımlarken mutlaka `px-4 py-2.5 text-base border-slate-300 rounded-md` kullan.
`Label` tanımlarken mutlaka `text-[11px] uppercase font-bold tracking-wider text-slate-500` kullan.
`Form` tanımlarken mutlaka `max-w-6xl mx-auto` ile merkeze oturt.
