const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/app/components/orders/OrderEntryForm.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add currentStep state
content = content.replace(
  'const [itemToDelete, setItemToDelete] = useState<number | null>(null);',
  'const [itemToDelete, setItemToDelete] = useState<number | null>(null);\n  const [currentStep, setCurrentStep] = useState(1);'
);

// 2. Fix Dropdowns (Slash)
content = content.replace(
  /const display = nameEn \? `\$\{nameTr\} \/ \$\{nameEn\}` : nameTr;/g,
  "const display = (formData.language === 'ENG' && nameEn) ? nameEn : nameTr;"
);

// 3. Wizard Wrapper - Start
const oldStart = `<>
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* GENEL BİLGİLER */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold bg-slate-100 p-3 rounded-lg text-slate-700 mb-6 border border-slate-200">
          {formData.language === 'ENG' ? 'ORDER GENERAL INFORMATION' : 'SIPARIS GENEL BILGILERI'}
        </h2>`;

const newStart = `<div className="max-w-[1400px] mx-auto bg-slate-50/30 md:p-6 p-2 rounded-2xl shadow-sm border border-slate-200/60 transition-all duration-500">
    
    {/* ADIM GÖSTERGESİ (WIZARD STEPS) */}
    <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-200 pb-6 pt-2">
       <div className="flex space-x-2 md:space-x-8 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide py-2 px-1">
          {[1, 2, 3, 4].map(s => (
             <button type="button" key={s} onClick={() => setCurrentStep(s)} className={\`flex items-center space-x-3 transition-all duration-300 group min-w-max \${currentStep === s ? 'opacity-100' : 'opacity-50 hover:opacity-80'}\`}>
                <div className={\`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-all duration-500 \${currentStep === s ? 'bg-blue-600 text-white scale-110 shadow-blue-500/30' : currentStep > s ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}\`}>
                   {currentStep > s ? '✓' : s}
                </div>
                <div className="hidden md:block text-left">
                   <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Adım {s}</p>
                   <p className={\`text-sm font-semibold whitespace-nowrap transition-colors \${currentStep === s ? 'text-blue-700' : 'text-slate-600'}\`}>
                     {s === 1 ? 'Genel Bilgiler' : s === 2 ? 'Firma & Temsilciler' : s === 3 ? 'Sipariş Kalemleri' : 'Lojistik & Ödeme'}
                   </p>
                </div>
             </button>
          ))}
       </div>
    </div>

    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto max-w-5xl">
      
      {/* ADIM 1: GENEL BİLGİLER */}
      <div className={\`\${currentStep === 1 ? 'block' : 'hidden'} space-y-6 bg-white p-8 rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]\`}>
        <h2 className="text-xl font-bold bg-slate-50/50 p-4 rounded-xl text-slate-700 mb-6 border border-slate-200/50 flex items-center gap-3">
          <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
          {formData.language === 'ENG' ? 'ORDER GENERAL INFORMATION' : 'SIPARIS GENEL BILGILERI'}
        </h2>`;

content = content.replace(oldStart, newStart);

// 4. Step 2 Wrapper
const oldStep2 = `<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-4">`;
          
const newStep2 = `</div>
      </div>
      
      {/* ADIM 2: FİRMA & TEMSİLCİLER */}
      <div className={\`\${currentStep === 2 ? 'block animate-in fade-in slide-in-from-right-8 duration-500' : 'hidden'} space-y-6 bg-white p-8 rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]\`}>
        <h2 className="text-xl font-bold bg-slate-50/50 p-4 rounded-xl text-slate-700 mb-6 border border-slate-200/50 flex items-center gap-3">
          <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
          {formData.language === 'ENG' ? 'COMPANIES & REPRESENTATIVES' : 'FIRMALAR VE TEMSILCILER'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">`;

content = content.replace(oldStep2, newStep2);

// 5. Step 4 Wrapper (Occurs before Step 3 physically)
const oldStep4 = `<div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 border-t border-slate-200 mt-6">`;

const newStep4 = `</div>
      </div>

      {/* ADIM 4: LOJİSTİK, ÖDEME VE NOTLAR */}
      <div className={\`\${currentStep === 4 ? 'block animate-in fade-in slide-in-from-right-8 duration-500' : 'hidden'} bg-white p-8 rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]\`}>
        <h2 className="text-xl font-bold bg-slate-50/50 p-4 rounded-xl text-slate-700 mb-6 border border-slate-200/50 flex items-center gap-3">
          <span className="w-2 h-6 bg-fuchsia-500 rounded-full"></span>
          {formData.language === 'ENG' ? 'LOGISTICS, PAYMENT & NOTES' : 'LOJISTIK, ODEME VE NOTLAR'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">`;

content = content.replace(oldStep4, newStep4);

// 6. Step 3 Wrapper (Product items)
const oldStep3 = `{/* ÜRÜN KALEMLERİ */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold bg-slate-100 px-4 py-2 rounded-lg text-slate-700 border border-slate-200">
            {formData.language === 'ENG' ? 'ORDER ITEMS' : 'SIPARIS URUNLERI'}
          </h2>`;

const newStep3 = `</div>
      </div>

      {/* ADIM 3: ÜRÜN KALEMLERİ */}
      <div className={\`\${currentStep === 3 ? 'block animate-in fade-in slide-in-from-right-8 duration-500' : 'hidden'} !max-w-[1400px] w-full bg-white p-3 md:p-6 rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]\`} style={{marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)'}}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold bg-slate-50/50 p-4 rounded-xl text-slate-700 border border-slate-200/50 flex items-center gap-3">
            <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
            {formData.language === 'ENG' ? 'ORDER ITEMS' : 'SIPARIS URUNLERI'}
          </h2>`;

content = content.replace(oldStep3, newStep3);

// 7. Footer buttons
const oldFooter = `<div className="flex justify-end pt-4 pb-12 mt-6 border-t border-slate-200">
        <button 
          type="button"
          onClick={() => router.back()}
          className="mr-4 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
        >
          İptal
        </button>
        <button 
          type="submit"
          className="px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-bold shadow-md transition-colors text-lg"
        >
          {initialData ? 'Siparişi Güncelle' : 'Siparişi Sisteme Kaydet'}
        </button>
      </div>

    </form>`;

const newFooter = `</div>
      </div>

      {/* WIZARD ACTIONS */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center pt-8 mt-4 border-t border-slate-200/60 w-full mb-10 gap-4 md:gap-0">
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            type="button"
            onClick={() => router.back()}
            className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold shadow-sm transition-all active:scale-95"
          >
            İptal
          </button>
          {currentStep > 1 && (
            <button 
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex-1 md:flex-none px-6 py-3 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              &larr; Geri
            </button>
          )}
        </div>
        
        <div className="w-full md:w-auto">
          {currentStep < 4 ? (
            <button 
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setCurrentStep(prev => prev + 1);
              }}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-[0_8px_20px_rgb(37,99,235,0.2)] transition-all hover:-translate-y-0.5 active:scale-95 active:translate-y-0 flex items-center justify-center gap-2 group"
            >
              İlerle <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>
          ) : (
            <button 
              type="submit"
              className="w-full md:w-auto px-10 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold shadow-[0_8px_25px_rgb(5,150,105,0.3)] transition-all hover:-translate-y-0.5 active:scale-95 active:translate-y-0 flex items-center justify-center gap-2 text-lg animate-bounce"
            >
              ✓ {initialData ? 'GÜNCELLE' : 'SİSTEME KAYDET'}
            </button>
          )}
        </div>
      </div>
    </form>`;

content = content.replace(oldFooter, newFooter);

// 8. Close Root Div
const oldEnd = `)}
  </>
  );`;

const newEnd = `)}
    </div>
  </>
  );`;

content = content.replace(oldEnd, newEnd);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Update Complete.');
