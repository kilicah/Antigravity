"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function PackingListClient({
  invoice,
  firstOrder,
  seller,
  productText,
  invoiceNo,
  contractNoStr,
  buyerPoNos,
  buyerModelNames,
  rolls
}: any) {
  const [isEng, setIsEng] = useState(true);
  const [isSigned, setIsSigned] = useState(false);

  const t = {
    sellerTitle: isEng ? "SELLER" : "İHRACATÇI FİRMA",
    buyerTitle: isEng ? "BUYER" : "İTHALATÇI FİRMA",
    deliveryTitle: isEng ? "DELIVERY ADDRESS" : "SEVK ADRESİ",
    packingListTitle: isEng ? "PACKING\nLIST" : "ÇEKİ\nLİSTESİ",
    invoiceNo: isEng ? "INVOICE NO" : "FATURA NO",
    invoiceDate: isEng ? "INVOICE DATE" : "FATURA TARİHİ",
    customerPo: isEng ? "BUYER ORDER NO" : "ALICI SİPARİŞ NO",
    roll: isEng ? "ROLL" : "TOP",
    design: isEng ? "DESIGN/COLOR/COMPOSITION" : "DESEN/RENK/İÇERİK",
    orderNo: isEng ? "ORDER NO" : "SİPARİŞ NO",
    lot: isEng ? "LOT" : "LOT",
    barNo: isEng ? "BAR NO" : "BAR NO",
    meters: isEng ? "METERS" : "METRE",
    netKg: isEng ? "NET KG" : "NET KG",
    grossKg: isEng ? "GROSS KG" : "BRÜT KG",
    turkishOrigin: isEng ? "THE GOODS ARE OF TURKISH ORIGIN" : "MALLAR TÜRK MENŞELİDİR",
    totalMeters: isEng ? "TOTAL METERS" : "TOPLAM METRE",
    totalNetKg: isEng ? "TOTAL NET KG" : "TOPLAM NET KG",
    totalGrossKg: isEng ? "TOTAL GROSS KG" : "TOPLAM BRÜT KG",
    totalRolls: isEng ? "TOTAL ROLLS" : "TOPLAM TOP"
  };

  return (
    <div className="w-full flex flex-col items-center print:p-[10mm]">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      
      {/* HEADER ACTION (HIDDEN IN PRINT) */}
      <div className="flex justify-between items-center print:hidden mb-4 w-full max-w-[1002px]">
        <div className="space-x-4 flex items-center">
          <Link href={`/invoices/${invoice.id}`} className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors">
            &larr; Faturaya Dön
          </Link>
          <Link 
            href={`/orders/${firstOrder?.id || ''}/tracking`}
            className="px-4 py-2 text-indigo-700 bg-indigo-50 border border-indigo-200 shadow-sm rounded hover:bg-indigo-100 transition-colors flex items-center gap-2 font-bold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Sipariş Takip Tablosu
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEng(false)}
            className={`px-4 py-2 font-bold rounded shadow-sm border ${!isEng ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-300'}`}
          >
            🇹🇷 TÜRKÇE
          </button>
          <button
            onClick={() => setIsEng(true)}
            className={`px-4 py-2 font-bold rounded shadow-sm border ${isEng ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-300'}`}
          >
            🇬🇧 ENGLISH
          </button>
          <button
            onClick={() => setIsSigned(!isSigned)}
            className={`px-4 py-2 font-bold rounded shadow-sm border ${isSigned ? 'bg-green-600 text-white border-green-700' : 'bg-white text-green-600 hover:bg-green-50 border-green-300'}`}
          >
            ✍️ {isSigned ? 'İMZAYI KALDIR' : 'İMZALA'}
          </button>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 text-white bg-slate-800 shadow-sm rounded hover:bg-slate-700 transition-colors flex items-center gap-2 font-bold ml-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Yazdır / PDF Al
          </button>
        </div>
      </div>

      <div className="bg-white shadow-2xl print:shadow-none flex justify-center py-6 print:py-0 w-[1002px]">
        {/* Changed grid-cols from 401_401_200 to 400_400_198 to fix right-side border overflow when container box is 1002 with border-box */}
        <div className="w-[1002px] shrink-0 bg-white text-black font-['Arial',_'Helvetica',_sans-serif] text-[12px] leading-tight border-2 border-black relative box-border">
          
        {/* ROW 1 */}
        <div className="grid grid-cols-[400px_400px_198px] border-b-2 border-black">
          {/* 1. SELLER TITLE */}
          <div className="border-r-2 border-black p-2 flex flex-col h-[135px]">
             <div className="font-bold underline uppercase mb-0.5 text-[13px]">{t.sellerTitle}</div>
             <div className="font-bold uppercase text-[12px]">{isEng && seller?.nameEn ? seller?.nameEn : (seller?.name || "-")}</div>
             <div className="uppercase whitespace-pre-wrap leading-snug">
               {isEng && seller?.addressEn ? seller?.addressEn : (seller?.address || "-")}
               {(() => {
                 const d = isEng && seller?.districtEn ? seller?.districtEn : (seller?.district);
                 const c = isEng && seller?.cityEn ? seller?.cityEn : (seller?.city);
                 const cntry = isEng && seller?.countryEn ? seller?.countryEn : (seller?.country);
                 const zip = seller?.zipCode;
                 const locArr = [d, c, cntry].filter(Boolean);
                 const locStr = locArr.join(', ');
                 return (locStr || zip) ? `\n${locStr}${locStr && zip ? ' ' : ''}${zip || ''}` : '';
               })()}
             </div>
             <div className="mt-1 flex flex-col uppercase">
                {(seller?.taxNo || seller?.taxOffice || seller?.registrationNo) && (
                  <div>
                      {seller?.taxNo ? `${seller?.taxOffice ? seller?.taxOffice + (isEng ? " TAX OFFICE" : " VD.") : ""} ${seller?.taxNo}`.trim() : ""}
                      {seller?.taxNo && seller?.registrationNo ? " / " : ""}
                      {seller?.registrationNo ? `${isEng ? "REG NO " : "TİC. SİC. NO "}${seller?.registrationNo}` : ""}
                  </div>
                )}
                {seller?.phone && <div>T. {seller?.phone}</div>}
              </div>
          </div>
          
          {/* 2. PACKING LIST TITLE */}
          <div className="border-r-2 border-black p-2 flex justify-center items-center h-[135px]">
              <h1 className="text-[#d81e1e] font-sans font-bold text-[36px] text-center leading-tight tracking-wider uppercase whitespace-pre-wrap">
                {t.packingListTitle}
              </h1>
          </div>

          {/* 3. LOGO */}
          <div className="p-2 flex justify-center items-center h-[135px] relative">
            {(() => {
               const sellerN = (seller?.name || "").toUpperCase();
               const isM = sellerN.includes("MENSUCAT") || sellerN.includes("USKM");
               const isT = sellerN.includes("TEKSTİL") || sellerN.includes("TEKSTIL") || sellerN.includes("USKT");
               if (isM) return <img src="/images/Defenni-M-Kirmizi.jpg" alt="Logo" className="max-h-[89px] max-w-[198px] object-contain mix-blend-multiply" />;
               if (isT) return <img src="/images/Defenni-T-Kirmizi.jpg" alt="Logo" className="max-h-[89px] max-w-[198px] object-contain mix-blend-multiply" />;
               if (sellerN.includes("DEFENNİ") || sellerN.includes("DEFENNI")) return <img src="/defenni-logo.png" alt="Logo" className="max-h-[89px] max-w-[198px] object-contain mix-blend-multiply" />;
               return <div className="text-xl font-bold text-slate-300">{sellerN.split(' ')[0]}</div>;
            })()}
          </div>
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-[400px_400px_198px] border-b-2 border-black">
          {/* 1. CUSTOMER TITLE */}
          <div className="border-r-2 border-black p-2 flex flex-col h-[135px] leading-snug">
             <div className="font-bold underline uppercase mb-0.5 text-[13px]">{t.buyerTitle}</div>
             <div className="font-bold uppercase text-[12px]">{isEng && invoice.buyer?.nameEn ? invoice.buyer?.nameEn : (invoice.buyer?.name || "-")}</div>
             <div className="uppercase whitespace-pre-wrap">
               {isEng && invoice.buyer?.addressEn ? invoice.buyer?.addressEn : (invoice.buyer?.address || "-")}
               {(() => {
                 const d = isEng && invoice.buyer?.districtEn ? invoice.buyer?.districtEn : invoice.buyer?.district;
                 const c = isEng && invoice.buyer?.cityEn ? invoice.buyer?.cityEn : invoice.buyer?.city;
                 const cntry = isEng && invoice.buyer?.countryEn ? invoice.buyer?.countryEn : invoice.buyer?.country;
                 const zip = invoice.buyer?.zipCode;
                 const locArr = [d, c, cntry].filter(Boolean);
                 const locStr = locArr.join(', ');
                 return (locStr || zip) ? `\n${locStr}${locStr && zip ? ' ' : ''}${zip || ''}` : '';
               })()}
             </div>
             <div className="mt-1 flex flex-col uppercase">
                {(invoice.buyer?.taxNo || invoice.buyer?.taxOffice || invoice.buyer?.registrationNo) && (
                  <div>
                      {invoice.buyer?.taxNo ? `${invoice.buyer?.taxOffice ? invoice.buyer?.taxOffice + (isEng ? " TAX OFFICE" : " VD.") : ""} ${invoice.buyer?.taxNo}`.trim() : ""}
                      {invoice.buyer?.taxNo && invoice.buyer?.registrationNo ? " / " : ""}
                      {invoice.buyer?.registrationNo ? `${isEng ? "REG NO " : "TİC. SİC. NO "}${invoice.buyer?.registrationNo}` : ""}
                  </div>
                )}
                {invoice.buyer?.phone && <div>T. {invoice.buyer.phone}</div>}
             </div>
          </div>
          
          {/* 2. DELIVERY ADDRESS */}
          <div className="border-r-2 border-black p-2 flex flex-col h-[135px] leading-snug">
              <div className="font-bold underline uppercase mb-0.5 text-[13px]">{t.deliveryTitle}</div>
              <div className="font-bold uppercase text-[12px]">{firstOrder?.shipTo ? ((isEng && firstOrder.shipTo.nameEn) ? firstOrder.shipTo.nameEn : firstOrder.shipTo.name) : ((isEng && invoice.buyer?.nameEn) ? invoice.buyer?.nameEn : (invoice.buyer?.name || "-"))}</div>
              <div className="uppercase whitespace-pre-wrap">
                {firstOrder?.shipTo ? ((isEng && firstOrder.shipTo.addressEn) ? firstOrder.shipTo.addressEn : firstOrder.shipTo.address) : ((isEng && invoice.buyer?.addressEn) ? invoice.buyer?.addressEn : (invoice.buyer?.address || "-"))}
                {(() => {
                  const target = firstOrder?.shipTo || invoice.buyer;
                  const d = isEng && target?.districtEn ? target?.districtEn : target?.district;
                  const c = isEng && target?.cityEn ? target?.cityEn : target?.city;
                  const cntry = isEng && target?.countryEn ? target?.countryEn : target?.country;
                  const zip = target?.zipCode;
                  const locArr = [d, c, cntry].filter(Boolean);
                  const locStr = locArr.join(', ');
                  return (locStr || zip) ? `\n${locStr}${locStr && zip ? ' ' : ''}${zip || ''}` : '';
                })()}
              </div>
              <div className="mt-1 flex flex-col uppercase">
                {(firstOrder?.shipTo as any)?.contactName && <div>CONTACT PERSON. {(firstOrder.shipTo as any).contactName}</div>}
              </div>
          </div>
          
          {/* 3. DOCS INFO */}
          <div className="flex flex-col h-[135px]">
              <div className="h-[45px] border-b border-black flex flex-col justify-center px-4 leading-snug">
                  <div className="font-bold uppercase text-[13px] mb-0.5">{t.invoiceNo}</div>
                  <div className="text-[12px]">{invoiceNo}</div>
              </div>
              <div className="h-[45px] border-b border-black flex flex-col justify-center px-4 leading-snug">
                  <div className="font-bold uppercase text-[13px] mb-0.5">{t.invoiceDate}</div>
                  <div className="text-[12px]">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('tr-TR') : "-"}</div>
              </div>
              <div className="h-[45px] flex flex-col justify-center px-4 leading-snug">
                  <div className="font-bold uppercase text-[13px] mb-0.5">{t.customerPo}</div>
                  <div className="text-[12px] uppercase">{buyerPoNos || "-"}</div>
              </div>
          </div>
        </div>

        {/* ROLLS TABLE */}
        <table className="w-full text-center border-collapse">
          <thead className="font-bold">
            <tr className="border-b-2 border-black font-bold uppercase text-[12px] leading-tight">
              <th className="py-2 px-1 border-r border-black w-12">{t.roll}</th>
              <th className="py-2 px-1 border-r border-black">{t.design}</th>
              <th className="py-2 px-1 border-r border-black w-32">{t.orderNo}</th>
              <th className="py-2 px-1 border-r border-black w-10">{t.lot}</th>
              <th className="py-2 px-1 border-r border-black w-24">{t.barNo}</th>
              <th className="py-2 px-1 border-r border-black w-[80px] text-right pr-3">{t.meters}</th>
              <th className="py-2 px-1 border-r border-black w-[80px] text-right pr-3">{t.netKg}</th>
              <th className="py-2 px-1 w-[80px] text-right pr-3">{t.grossKg}</th>
            </tr>
          </thead>
          <tbody className="align-middle">
            {rolls.map((roll: any, i: number) => (
              <tr key={roll.id} className="border-b border-black hover:bg-slate-50 transition-colors uppercase leading-snug">
                <td className="border-r border-black px-1 pb-1 pt-1">{(i+1).toString()}</td>
                <td className="border-r border-black px-1 pb-1 pt-1 break-words uppercase leading-snug">
                  {productText}
                </td>
                <td className="border-r border-black px-1 pb-1 pt-1 uppercase leading-snug">
                  {(buyerPoNos || buyerModelNames) && (
                     <>
                       {buyerPoNos ? `PO. ${buyerPoNos}` : ""}
                       {buyerPoNos && buyerModelNames ? " / " : ""}
                       {buyerModelNames ? buyerModelNames : ""}
                       <br/>
                     </>
                  )}
                  {contractNoStr ? `(NO. ${contractNoStr})` : ""}
                </td>
                <td className="border-r border-black px-1 pb-1 pt-1">{roll.lotNo || "1"}</td>
                <td className="border-r border-black px-1 pb-1 pt-1">{roll.barcode || "-"}</td>
                <td className="border-r border-black px-1 pb-1 pt-1 text-right pr-2">
                   {roll.quantity?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "-"}
                </td>
                <td className="border-r border-black px-1 pb-1 pt-1 text-right pr-2">
                   {roll.netKg?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "-"}
                </td>
                <td className="px-1 pb-1 pt-1 text-right pr-2">
                   {roll.grossKg?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "-"}
                </td>
              </tr>
            ))}
            
            {rolls.length === 0 && (
              <tr><td colSpan={8} className="p-4 italic text-slate-500">No rolls recorded.</td></tr>
            )}
            
            {/* INLINE SUBTOTAL AND ORIGIN */}
            <tr className="font-bold border-b-2 border-t-2 border-black bg-white">
              <td colSpan={5} className="border-r border-black p-1 uppercase text-center tracking-wider text-[11px]">
                {t.turkishOrigin}
              </td>
              <td className="border-r border-black p-1 text-right pr-2">
                {rolls.reduce((s: any, r: any) => s + (r.quantity || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="border-r border-black p-1 text-right pr-2">
                {rolls.reduce((s: any, r: any) => s + (r.netKg || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="p-1 text-right pr-2">
                {rolls.reduce((s: any, r: any) => s + (r.grossKg || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>

            {/* SUMMARY BOX - ROW 1 */}
            <tr className="font-bold border-b border-black">
              <td colSpan={5} rowSpan={4} className="border-r border-black p-2 align-middle text-center uppercase tracking-wider bg-white relative">
                {isSigned && (
                  <div className="absolute inset-0 flex justify-center items-center opacity-90 z-20 pointer-events-none drop-shadow-md">
                    <img 
                      src="/images/Kase-Imza.png" 
                      alt="Stamp" 
                      className="w-[180px] h-auto object-contain mix-blend-multiply" 
                    />
                  </div>
                )}
              </td>
              <td colSpan={2} className="border-r border-black p-1.5 text-left uppercase pl-3 bg-white text-[12px]">{t.totalMeters}</td>
              <td className="p-1.5 text-right pr-2 font-normal bg-white text-[12px]">
                {rolls.reduce((s: any, r: any) => s + (r.quantity || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
            {/* SUMMARY BOX - ROW 2 */}
            <tr className="font-bold border-b border-black">
              <td colSpan={2} className="border-r border-black p-1.5 text-left uppercase pl-3 bg-white text-[12px]">{t.totalNetKg}</td>
              <td className="p-1.5 text-right pr-2 font-normal bg-white text-[12px]">
                {rolls.reduce((s: any, r: any) => s + (r.netKg || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
            {/* SUMMARY BOX - ROW 3 */}
            <tr className="font-bold border-b border-black">
              <td colSpan={2} className="border-r border-black p-1.5 text-left uppercase pl-3 bg-white text-[12px]">{t.totalGrossKg}</td>
              <td className="p-1.5 text-right pr-2 font-normal bg-white text-[12px]">
                {rolls.reduce((s: any, r: any) => s + (r.grossKg || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
            {/* SUMMARY BOX - ROW 4 (missing border-b previously, now fixed) */}
            <tr className="font-bold border-b-2 border-black">
              <td colSpan={2} className="border-r border-black p-1.5 text-left uppercase pl-3 bg-white text-[12px]">{t.totalRolls}</td>
              <td className="p-1.5 text-right pr-2 font-normal bg-white text-[12px]">
                {invoice.packingList?.totalRolls || rolls.length}
              </td>
            </tr>

          </tbody>
        </table>

        </div>
      </div>
    </div>
  );
}
