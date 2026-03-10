import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function InvoiceViewPage({
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
      invoice: true,
      productionOrder: true,
    }
  });

  if (!order) notFound();

  const isEng = order.language === "ENG";

  // Ödeme Şekli Ayrıştırma (Örn: "HAVALE / EFT|BANK TRANSFER / WIRE TRANSFER")
  let displayPaymentTerms = order.paymentTerms || "-";
  if (order.paymentTerms && order.paymentTerms.includes('|')) {
    const parts = order.paymentTerms.split('|');
    displayPaymentTerms = isEng ? (parts[1] || parts[0]).trim() : parts[0].trim();
  }

  // Teslim Şekli Ayrıştırma
  let displayDeliveryTerms = order.deliveryTerms || "-";
  if (order.deliveryTerms && order.deliveryTerms.includes('|')) {
    const parts = order.deliveryTerms.split('|');
    displayDeliveryTerms = isEng ? (parts[1] || parts[0]).trim() : parts[0].trim();
  }

  // Hesaplamalar
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = order.items.reduce((sum, item) => sum + item.totalAmount, 0);

  // Banka bilgisi getirme (Satıcı ve Para Birimine Göre varsayılan)
  const bankInfo = await prisma.bankInfo.findFirst({
    where: {
      companyId: order.sellerId,
      currency: order.currency
    },
    orderBy: {
      isDefault: 'desc'
    }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* BAŞLIK & BUTONLAR */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{isEng ? 'Invoice Details' : 'Fatura Detayı'}</h1>
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
          <button 
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded shadow flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Yazdır / PDF Al
          </button>
        </div>
      </div>

      {/* YAZDIRILABİLİR FATURA ALANI (A4 ORANI) */}
      <div className="bg-white shadow-xl border border-slate-200 p-10 min-h-[1100px] print:shadow-none print:border-none print:p-0 font-sans text-sm text-slate-900 relative">
        
        {/* Antet */}
        <div className="text-center mb-10 pb-6 border-b-2 border-slate-800 flex justify-between items-end">
          <div className="text-left w-1/3">
             <div className="font-bold text-lg">{order.seller.name}</div>
             <div className="text-xs text-slate-500 mt-1">{order.seller.address}</div>
             <div className="text-xs text-slate-500">Tel: {order.seller.phone || "-"}</div>
          </div>
          <div className="text-center w-1/3">
            <h2 className="text-3xl font-black tracking-widest text-slate-800">{isEng ? 'INVOICE' : 'FATURA'}</h2>
            <p className="text-sm font-medium text-slate-500 uppercase mt-1">{isEng ? 'Commercial Invoice' : 'Ticari Fatura'}</p>
          </div>
          <div className="text-right w-1/3 invisible">Logo/Boşluk</div>
        </div>

        {/* ÜST KISIM: GENEL BİLGİLER GİRİŞİ */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-10">
           {/* Sol Sütun: Taraflar */}
           <div className="space-y-4">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{isEng ? 'Buyer (Billed To)' : 'Müşteri (Alıcı)'}</span>
                <div className="font-semibold text-base">{order.buyer.name}</div>
                <div className="text-slate-600 text-xs mt-1">{order.buyer.address}</div>
                <div className="text-slate-600 text-xs mt-1">{isEng ? 'Tax ID' : 'VKN'}: {order.buyer.taxNo} - {isEng ? 'Tax Office' : 'VD'}: {order.buyer.taxOffice}</div>
              </div>
              
              {order.shipTo && order.shipTo.id !== order.buyer.id && (
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
               <span className="font-semibold text-slate-600">{isEng ? 'Invoice No:' : 'Fatura No:'}</span>
               <span className="font-bold text-slate-800">{order.invoice?.invoiceNo || "-"}</span>
             </div>
             <div className="flex justify-between border-b border-slate-200 pb-2">
               <span className="font-semibold text-slate-600">{isEng ? 'Date:' : 'Fatura Tarihi:'}</span>
               <span className="font-medium text-slate-800">
                 {order.invoice?.invoiceDate ? new Date(order.invoice.invoiceDate).toLocaleDateString(isEng ? 'en-GB' : 'tr-TR') : "-"}
               </span>
             </div>
             <div className="flex justify-between border-b border-slate-200 pb-2">
               <span className="font-semibold text-slate-600">{isEng ? 'Contract Ref:' : 'Sözleşme Ref:'}</span>
               <span className="font-medium">{order.contractNo}</span>
             </div>
             <div className="flex justify-between border-b border-slate-200 pb-2">
               <span className="font-semibold text-slate-600">{isEng ? 'Buyer PO No:' : 'Müşteri PO No:'}</span>
               <span className="font-medium">{order.buyerPoNo || "-"}</span>
             </div>
             <div className="flex justify-between pb-1">
               <span className="font-semibold text-slate-600">{isEng ? 'Currency:' : 'Para Birimi:'}</span>
               <span className="font-bold text-indigo-700">{order.currency}</span>
             </div>
           </div>
        </div>

        {/* ORTA KISIM: ÜRÜN KALEMLERİ TABLOSU */}
        <div className="mb-8 min-h-[300px]">
           <table className="w-full text-left border-collapse border border-slate-300">
             <thead>
               <tr className="bg-slate-100 text-xs border-b border-slate-300">
                 <th className="p-3 border-r border-slate-300 w-10 text-center">#</th>
                 <th className="p-3 border-r border-slate-300">{isEng ? 'Description (Quality, Color, Composition)' : 'Açıklama (Kalite, Renk, Komp.)'}</th>
                 <th className="p-3 border-r border-slate-300 text-center w-24">{isEng ? 'Delivery' : 'Termin'}</th>
                 <th className="p-3 border-r border-slate-300 text-right w-24">{isEng ? 'Quantity' : 'Miktar'}</th>
                 <th className="p-3 border-r border-slate-300 text-right w-28">{isEng ? 'Unit Price' : 'Birim Fiyat'}</th>
                 <th className="p-3 text-right w-32">{isEng ? 'Total Amount' : 'Toplam Tutar'}</th>
               </tr>
             </thead>
             <tbody>
               {order.items.map((item, index) => (
                 <tr key={item.id} className="border-b border-slate-200 text-xs">
                   <td className="p-3 border-r border-slate-300 text-center text-slate-500">{index + 1}</td>
                   <td className="p-3 border-r border-slate-300">
                     <div className="font-bold">{item.buyerModelName ? `${item.buyerModelName} - ` : ''}{item.qualityName || "-"}</div>
                     <div className="text-slate-600 mt-1">
                       {item.colorCode && <span className="mr-2">{isEng ? 'Color:' : 'Renk:'} {item.colorCode}</span>}
                       {item.composition && <span className="mr-2">{isEng ? 'Comp:' : 'Komp:'} {item.composition}</span>}
                       {item.weight && <span className="mr-2">{item.weight}</span>}
                       {item.width && <span>{item.width}</span>}
                     </div>
                   </td>
                   <td className="p-3 border-r border-slate-300 text-center font-medium text-indigo-700">{item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString(isEng ? 'en-GB' : 'tr-TR') : "-"}</td>
                   <td className="p-3 border-r border-slate-300 text-right font-mono font-medium">{item.quantity.toLocaleString('tr-TR')} mt/kg</td>
                   <td className="p-3 border-r border-slate-300 text-right font-mono">{item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                   <td className="p-3 text-right font-mono font-bold text-sm tracking-tight">{item.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                 </tr>
               ))}
               
               {/* Boşluk bırakarak toplamları aşağı iter */}
               <tr>
                 <td colSpan={6} className="p-4 border-t-0"></td>
               </tr>

               {/* GENEL TOPLAM SATIRI */}
               <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
                 <td colSpan={3} className="p-4 text-right uppercase text-xs">{isEng ? 'Grand Total:' : 'Genel Toplam:'}</td>
                 <td className="p-4 text-right border-x border-slate-300 font-mono text-sm">{totalQuantity.toLocaleString('tr-TR')}</td>
                 <td className="p-4 text-right border-r border-slate-300 text-slate-500 text-xs">{order.currency}</td>
                 <td className="p-4 text-right text-lg text-indigo-800 font-mono tracking-tight">
                    {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {order.currency}
                 </td>
               </tr>
             </tbody>
           </table>
        </div>

        {/* ORTA ALT: TİCARİ VE ÇEKİ (PACKING) DETAYLARI */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          
           {/* Ticari Şartlar */}
           <div>
             <h3 className="text-sm font-bold border-b border-slate-300 pb-1 mb-3 uppercase tracking-wider text-slate-700">{isEng ? 'Commercial Terms' : 'Ticari Şartlar'}</h3>
             <table className="w-full text-xs">
               <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-500 font-medium w-32">{isEng ? 'Delivery Terms:' : 'Teslim Şekli:'}</td>
                    <td className="py-2 font-semibold">{displayDeliveryTerms}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-500 font-medium">{isEng ? 'Payment Terms:' : 'Ödeme Şekli:'}</td>
                    <td className="py-2 font-semibold text-rose-700 uppercase">{displayPaymentTerms}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-500 font-medium">{isEng ? 'Transporter:' : 'Nakliye / Taşıyıcı:'}</td>
                    <td className="py-2 font-semibold">{order.transporter || "-"}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-500 font-medium align-top">{isEng ? 'Seller Rep:' : 'Satıcı Temsilcisi:'}</td>
                    <td className="py-2 font-semibold">
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

           {/* Çeki Listesi (Packing List) Özeti */}
           <div>
             <h3 className="text-sm font-bold border-b border-slate-300 pb-1 mb-3 uppercase tracking-wider text-slate-700">{isEng ? 'Shipment Summary' : 'Sevk Özeti (Çeki Detayı)'}</h3>
             <table className="w-full text-xs bg-slate-50 border border-slate-200 rounded">
               <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 pl-3 text-slate-600 font-medium w-40">{isEng ? 'Gross Weight:' : 'Brüt Ağırlık:'}</td>
                    <td className="py-2 pr-3 font-bold text-right font-mono text-slate-800">{order.invoice?.grossKg?.toLocaleString('tr-TR') || "-"} KG</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 pl-3 text-slate-600 font-medium">{isEng ? 'Net Weight:' : 'Net Ağırlık:'}</td>
                    <td className="py-2 pr-3 font-bold text-right font-mono text-slate-800">{order.invoice?.netKg?.toLocaleString('tr-TR') || "-"} KG</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 pl-3 text-slate-600 font-medium">{isEng ? 'Roll Count:' : 'Top Sayısı:'}</td>
                    <td className="py-2 pr-3 font-bold text-right font-mono text-slate-800">{order.invoice?.rollCount?.toLocaleString('tr-TR') || "-"} {isEng ? 'Pcs' : 'Adet'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pl-3 text-slate-600 font-medium">{isEng ? 'Sack Count:' : 'Çuval Sayısı:'}</td>
                    <td className="py-2 pr-3 font-bold text-right font-mono text-slate-800">{order.invoice?.sackCount?.toLocaleString('tr-TR') || "-"} {isEng ? 'Pcs' : 'Adet'}</td>
                  </tr>
               </tbody>
             </table>
           </div>

        </div>

        {/* BANKA BİLGİLERİ */}
        <div className="mb-16">
            <h3 className="text-sm font-bold border-b border-slate-300 pb-1 mb-3 uppercase tracking-wider text-slate-700">{isEng ? 'Bank Details' : 'Banka Bilgileri'}</h3>
            {bankInfo ? (
               <div className="grid grid-cols-2 gap-4 text-xs">
                 <div>
                    <div className="font-bold text-sm text-slate-800">{bankInfo.bankName}</div>
                    <div className="text-slate-600">{isEng ? 'Branch:' : 'Şube:'} {bankInfo.branch || "-"}</div>
                 </div>
                 <div className="text-right">
                    <div><span className="text-slate-500">{isEng ? 'Account No' : 'Hesap No'} ({bankInfo.currency}):</span> <span className="font-bold ml-2">{bankInfo.accountNo || "-"}</span></div>
                    <div><span className="text-slate-500">IBAN:</span> <span className="font-mono font-bold ml-2">{bankInfo.iban || "-"}</span></div>
                    {bankInfo.swift && <div><span className="text-slate-500">SWIFT:</span> <span className="font-mono ml-2">{bankInfo.swift}</span></div>}
                 </div>
               </div>
            ) : (
                <div className="text-xs text-red-500 italic">
                  {isEng ? `No default bank account found for ${order.currency}.` : `Satıcı firmaya ait ${order.currency} para biriminde kayıtlı banka hesabı bulunamadı.`}
                </div>
            )}
        </div>

        {/* İMZA ALANI */}
        <div className="grid grid-cols-2 mt-auto pt-10 border-t border-slate-800 text-center">
            <div>
              <div className="font-bold text-sm mb-16 uppercase text-slate-500 tracking-wider">{isEng ? 'Buyer' : 'Müşteri (Alıcı)'}</div>
              <div className="border-t border-slate-400 mx-10 pt-2 text-xs text-slate-500">{isEng ? 'Stamp & Signature' : 'Kaşe & İmza'}</div>
            </div>
            <div>
              <div className="font-bold text-sm mb-16 uppercase text-slate-500 tracking-wider">{isEng ? 'Seller' : 'Satıcı'}</div>
              <div className="border-t border-slate-400 mx-10 pt-2 text-xs text-slate-500">{isEng ? 'Stamp & Signature' : 'Kaşe & İmza'}</div>
            </div>
        </div>

      </div>
    </div>
  );
}
