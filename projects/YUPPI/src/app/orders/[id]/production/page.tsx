import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";

export default async function ProductionOrderViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseInt((await params).id, 10);
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      seller: true,
      buyer: true,
      shipTo: true,
      brand: true,
      sellerRep: true,
      buyerRep: true,
      items: true,
      productionOrder: true
    }
  });

  if (!order) notFound();

  const isEng = order.language === "ENG";

  // Teslim Şekli Ayrıştırma
  let displayDeliveryTerms = order.deliveryTerms || "-";
  if (order.deliveryTerms && order.deliveryTerms.includes('|')) {
    const parts = order.deliveryTerms.split('|');
    displayDeliveryTerms = isEng ? (parts[1] || parts[0]).trim() : parts[0].trim();
  }

  // Hesaplamalar
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* BAŞLIK & BUTONLAR */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{isEng ? 'Production Order Details' : 'Üretim Siparişi Detayı'}</h1>
          <p className="text-slate-500">Ref: {order.contractNo}</p>
        </div>
        <div className="space-x-4 flex">
          <Link 
            href="/orders" 
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            &larr; {isEng ? 'Back to Orders' : 'Geri Dön'}
          </Link>
          <Link 
            href={`/orders/${order.id}/edit`}
            className="px-4 py-2 text-blue-600 bg-white border border-blue-300 shadow-sm rounded hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            Düzenle
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* YAZDIRILABİLİR SÖZLEŞME ALANI (A4 ORANI) */}
      <div className="bg-white shadow-xl border border-slate-200 p-10 min-h-[1100px] print:shadow-none print:border-none print:p-0 font-sans text-sm text-slate-900 relative">
        
        {/* Antet */}
        <div className="text-center mb-10 pb-6 border-b-2 border-slate-800">
          <h2 className="text-2xl font-black uppercase tracking-widest text-slate-800">{isEng ? 'PRODUCTION ORDER' : 'ÜRETİM SİPARİŞİ'}</h2>
          <p className="text-sm font-medium text-slate-500 uppercase mt-1">Production Order</p>
        </div>

        {/* ÜST KISIM: GENEL BİLGİLER GİRİŞİ */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-10">
           {/* Sol Sütun: Taraflar */}
           <div className="space-y-4">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{isEng ? 'Seller' : 'Satıcı Firma'}</span>
                <div className="font-semibold text-base">{order.seller.name}</div>
                <div className="text-slate-600 text-xs mt-1">{order.seller.address}</div>
              </div>
              
              <div className="pt-2">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{isEng ? 'Buyer' : 'Müşteri'}</span>
                <div className="font-semibold text-base">{order.buyer.name}</div>
              </div>
              
              {order.shipTo && (
                <div className="pt-2">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{isEng ? 'Ship To' : 'Teslimat Adresi'}</span>
                  <div className="font-semibold text-base">{order.shipTo.name}</div>
                  <div className="text-slate-600 text-xs mt-1">{order.shipTo.address}</div>
                </div>
              )}
           </div>

           {/* Sağ Sütun: Referanslar */}
           <div className="space-y-3 bg-slate-50 p-4 border border-slate-200 rounded">
             <div className="flex justify-between border-b border-slate-200 pb-2">
               <span className="font-semibold text-slate-600">{isEng ? 'Order Ref:' : 'Sipariş No (Ref):'}</span>
               <span className="font-bold text-indigo-700">{order.contractNo}</span>
             </div>
             <div className="flex justify-between border-b border-slate-200 pb-2">
               <span className="font-semibold text-slate-600">{isEng ? 'Date:' : 'Tarih:'}</span>
               <span className="font-medium">{new Date(order.contractDate).toLocaleDateString(isEng ? 'en-GB' : 'tr-TR')}</span>
             </div>
             <div className="flex justify-between border-b border-slate-200 pb-2">
               <span className="font-semibold text-slate-600">{isEng ? 'Buyer PO No:' : 'Müşteri PO No:'}</span>
               <span className="font-medium">{order.buyerPoNo || "-"}</span>
             </div>
            </div>
         </div>

        {/* ORTA KISIM: ÜRÜN KALEMLERİ TABLOSU */}
        <div className="mb-8">
           <h3 className="text-lg font-bold border-b border-slate-300 pb-2 mb-3">{isEng ? 'Ordered Items (Production Details)' : 'Sipariş Edilen Ürünler (Üretim Detayı)'}</h3>
           <table className="w-full text-left border-collapse border border-slate-300">
             <thead>
               <tr className="bg-slate-100 text-xs border-b border-slate-300">
                 <th className="p-2 border-r border-slate-300 w-8 text-center">#</th>
                 <th className="p-2 border-r border-slate-300 w-32">{isEng ? 'Model Name' : 'Model Adı'}</th>
                 <th className="p-2 border-r border-slate-300">{isEng ? 'Quality Name & Code' : 'Kalite İsim & Kod'}</th>
                 <th className="p-2 border-r border-slate-300 w-24">{isEng ? 'Color' : 'Renk'}</th>
                 <th className="p-2 border-r border-slate-300">{isEng ? 'Composition' : 'Kompozisyon'}</th>
                 <th className="p-2 border-r border-slate-300 w-24">{isEng ? 'Weight/Width' : 'Ağırlık/En'}</th>
                 <th className="p-2 border-r border-slate-300 w-32">{isEng ? 'Delivery' : 'Termin'}</th>
                 <th className="p-2 border-r border-slate-300 text-right w-24">{isEng ? 'Quantity (mt/kg)' : 'Miktar (mt/kg)'}</th>
                 <th className="p-2 border-r border-slate-300 w-28">{isEng ? 'Special Requests' : 'Özel İstekler'}</th>
                 <th className="p-2 border-r border-slate-300 w-24">BDD</th>
                 <th className="p-2 border-r border-slate-300 text-right w-20">BQ</th>
                 <th className="p-2 text-right w-24">ExMD</th>
               </tr>
             </thead>
             <tbody>
               {order.items.map((item, index) => (
                 <tr key={item.id} className="border-b border-slate-200 text-xs">
                   <td className="p-2 border-r border-slate-300 text-center text-slate-500">{index + 1}</td>
                   <td className="p-2 border-r border-slate-300 font-medium">{item.buyerModelName || "-"}</td>
                   <td className="p-2 border-r border-slate-300">
                     <div className="font-bold">{item.qualityName || "-"}</div>
                     <div className="text-slate-500 text-[11px]">{item.qualityCode || ""}</div>
                   </td>
                   <td className="p-2 border-r border-slate-300 font-medium">{item.colorCode || "-"}</td>
                   <td className="p-2 border-r border-slate-300">{item.composition || "-"}</td>
                   <td className="p-2 border-r border-slate-300">
                     <div className="whitespace-nowrap">{item.weight || "-"}</div>
                     <div className="whitespace-nowrap">{item.width || ""}</div>
                   </td>
                   <td className="p-2 border-r border-slate-300 text-center font-medium text-indigo-700">{item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString(isEng ? 'en-GB' : 'tr-TR') : "-"}</td>
                   <td className="p-2 border-r border-slate-300 text-right font-mono font-bold text-sm tracking-tight">{item.quantity.toLocaleString('tr-TR')}</td>
                   <td className="p-2 border-r border-slate-300 align-top">
                     <div className="flex flex-col gap-1">
                       {item.bsRequest && <span className="inline-block bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 font-bold text-slate-700">B.S</span>}
                       {item.ldRequest && (
                         <span className="inline-block bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 font-semibold text-blue-700">
                           L/D {item.ldDetail ? `: ${item.ldDetail}` : ''}
                         </span>
                       )}
                       {item.ppsRequest && <span className="inline-block bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5 font-bold text-orange-700">PPS</span>}
                        {item.topsRequest && <span className="inline-block bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 font-bold text-emerald-700">TOPS</span>}
                        {item.srlRequest && (
                          <span className="inline-block bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5 font-semibold text-purple-700">
                            SRL {item.srlDetail ? `: ${item.srlDetail}` : ''}
                          </span>
                        )}
                        {item.fdRequest && <span className="inline-block bg-teal-50 border border-teal-200 rounded px-1.5 py-0.5 font-bold text-teal-700">FD</span>}
                        {item.pshpRequest && <span className="inline-block bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 font-bold text-amber-700">PSHP</span>}
                        {item.susRequest && <span className="inline-block bg-green-50 border border-green-200 rounded px-1.5 py-0.5 font-bold text-green-700">SUS</span>}
                        {item.ltRequest && (
                          <span className="inline-block bg-sky-50 border border-sky-200 rounded px-1.5 py-0.5 font-semibold text-sky-700">
                            LT {item.ltDetail ? `: ${item.ltDetail}` : ''}
                          </span>
                        )}
                     </div>
                    </td>
                    <td className="p-2 border-r border-slate-300 text-center font-medium text-indigo-700">{item.bdd ? new Date(item.bdd).toLocaleDateString(isEng ? 'en-GB' : 'tr-TR') : "-"}</td>
                    <td className="p-2 border-r border-slate-300 text-right font-mono">{item.bq ? item.bq.toLocaleString('tr-TR') : "-"}</td>
                    <td className="p-2 text-right font-mono font-bold text-sm tracking-tight">{item.exmd ? new Date(item.exmd).toLocaleDateString(isEng ? 'en-GB' : 'tr-TR') : "-"}</td>
                 </tr>
               ))}
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
                 <td colSpan={11} className="p-3 text-right uppercase text-xs">{isEng ? 'Total Quantity:' : 'Genel Toplam Miktar:'}</td>
                 <td className="p-3 text-right text-base text-indigo-800 font-mono tracking-tight">
                    {totalQuantity.toLocaleString('tr-TR')}
                 </td>
               </tr>
             </tbody>
           </table>
        </div>

        {/* ORTA ALT: ÜRETİM VE SEVKİYAT TALİMATLARI */}
        <div className="grid grid-cols-2 gap-8 mb-10">
           
           {/* Üretim Şartları */}
           <div>
             <h3 className="text-sm font-bold border-b border-slate-300 pb-1 mb-3 uppercase tracking-wider text-slate-700">{isEng ? 'Production & Delivery Terms' : 'Üretim & Sevkiyat Şartları'}</h3>
             <table className="w-full text-xs">
               <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-500 font-medium w-40">{isEng ? 'Tolerance:' : 'Miktar Toleransı:'}</td>
                    <td className="py-2 font-bold text-slate-800">{order.tolerance || "-"}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-500 font-medium w-32">{isEng ? 'Delivery Terms:' : 'Teslim Şekli:'}</td>
                    <td className="py-2 font-medium">{displayDeliveryTerms}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-500 font-medium align-top">{isEng ? 'Seller Rep:' : 'Satıcı Temsilcisi:'}</td>
                    <td className="py-2 font-medium">
                      {order.sellerRep ? (
                        <div>
                          <div>{order.sellerRep.name.includes('|') ? order.sellerRep.name.split('|')[isEng ? 1 : 0] : order.sellerRep.name}</div>
                          {order.sellerRep.email && <div className="text-xs font-normal text-slate-500 mt-0.5">{order.sellerRep.email}</div>}
                          {order.sellerRep.phone && <div className="text-xs font-normal text-slate-500">{order.sellerRep.phone}</div>}
                        </div>
                      ) : "-"}
                    </td>
                  </tr>
               </tbody>
             </table>
           </div>

           {/* Paketleme ve Koli Talimatları */}
           <div>
             <h3 className="text-sm font-bold border-b border-slate-300 pb-1 mb-3 uppercase tracking-wider text-slate-700">{isEng ? 'Packing Instructions' : 'Paketleme Talimatları'}</h3>
             <div className="bg-amber-50 p-4 border border-amber-200 rounded text-sm text-amber-900 whitespace-pre-wrap min-h-[120px]">
                {order.productionOrder?.packingInstructions || (isEng ? "No specific packing instructions." : "Belirli bir paketleme talimatı girilmemiş.")}
             </div>
           </div>

        </div>

        {/* BİLGİ TALEPLERİ (Checkbox'lar) */}
        <div className="mb-12">
            <h3 className="text-sm font-bold border-b border-slate-300 pb-1 mb-3 uppercase tracking-wider text-slate-700">{isEng ? 'Approvals & Remarks' : 'Kontrol ve Onay Talepleri'}</h3>
            <div className="flex flex-col gap-2 text-xs">
                <div className={`p-2 border rounded ${order.specialDocsRequest ? 'border-rose-400 bg-rose-50 text-rose-800 font-bold' : 'border-slate-200 text-slate-400 opacity-60'}`}>
                 <span className="">☑ {isEng ? 'Special Docs Request:' : 'Özel Evrak İsteği:'}</span> {order.specialDocsDetail || ""}
               </div>
                <div className={`p-2 border rounded ${order.specialLoadingRequest ? 'border-orange-400 bg-orange-50 text-orange-800 font-bold' : 'border-slate-200 text-slate-400 opacity-60'}`}>
                 <span className="">☑ {isEng ? 'Special Loading/Packing Request:' : 'Özel Yükleme / Paketleme İsteği:'}</span> {order.specialLoadingDetail || ""}
               </div>
            </div>
        </div>

        {/* İMZA ALANI */}
        <div className="grid grid-cols-2 mt-20 pt-10 border-t border-dashed border-slate-300 text-center">
            <div>
              <div className="font-bold text-sm mb-16 uppercase">{isEng ? 'PRODUCTION APPROVAL' : 'ÜRETİM ONAYI'}</div>
              <div className="border-t border-slate-400 mx-10 pt-2 text-xs text-slate-500">{isEng ? 'Signature / Date' : 'İmza / Tarih'}</div>
            </div>
            <div>
              <div className="font-bold text-sm mb-16 uppercase">{isEng ? 'ORDER PLACED BY' : 'SİPARİŞİ GİREN'}</div>
              <div className="border-t border-slate-400 mx-10 pt-2 text-xs text-slate-500">{order.sellerRep?.name || (isEng ? 'Signature / Date' : 'İmza / Tarih')}</div>
            </div>
        </div>

      </div>
    </div>
  );
}
