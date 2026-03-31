"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ProductionOrderDocument({ order }: { order: any }) {
  const [isEng, setIsEng] = useState(order.language === 'ENG');
  const [isSigned, setIsSigned] = useState(false); // Can be used to show a signature/approval sign if needed

  const sellerName = order.seller?.name?.toUpperCase() || "";
  const isUSKM = sellerName.includes("MENSUCAT") || sellerName.includes("USKM");
  const isUSKT = sellerName.includes("TEKSTİL") || sellerName.includes("TEKSTIL") || sellerName.includes("USKT");

  // Translation Dictionary
  const t = {
    seller: isEng ? "SELLER" : "SATICI FİRMA",
    buyer: isEng ? "BUYER" : "ALICI FİRMA",
    shipTo: isEng ? "SHIP TO / CONSIGNEE" : "SEVK ADRESİ / ALICI",
    title: isEng ? "PRODUCTION ORDER" : "ÜRETİM SİPARİŞİ",
    contractNo: isEng ? "CONTRACT NO" : "SÖZLEŞME NO",
    contractDate: isEng ? "CONTRACT DATE" : "SÖZLEŞME TARİHİ",
    buyerPoNo: isEng ? "BUYER'S P.O. NO" : "ALICI SİPARİŞ NO",
    brandTitle: isEng ? "BRAND" : "MARKA ÜNVANI",
    
    // Table Headers
    modelName: isEng ? "MODEL NAME" : "MODEL ADI",
    qualityName: isEng ? "QUALITY NAME" : "KALİTE İSMİ",
    qualityCode: isEng ? "QUALITY CODE" : "KAL. KODU",
    buyerColorCode: isEng ? "COLOR CODE" : "RENK KODU",
    composition: isEng ? "COMPOSITION" : "KOMPOZİSYON",
    weight: isEng ? "WEIGHT" : "GRAMAJ",
    width: isEng ? "WIDTH" : "EN",
    quantity: isEng ? "QTY" : "MİKTAR",
    totalQuantity: isEng ? "GRAND TOTAL QUANTITY" : "GENEL TOPLAM MİKTAR",

    // Bottom info
    orderTolerance: isEng ? "ORDER TOLERANCE" : "SİPARİŞ TOLERANSI",
    marketType: isEng ? "MARKET TYPE" : "PİYASA TİPİ",
    domestic: isEng ? "DOMESTIC" : "İÇ PİYASA",
    export: isEng ? "EXPORT" : "DIŞ PİYASA",
    transportInfo: isEng ? "TRANSPORT INFO" : "NAKLİYE BİLGİSİ",

    // Manual Sections
    manualNotes: isEng ? "SPECIAL INSTRUCTIONS & REMARKS" : "ÖZEL AÇIKLAMALAR (Manuel Giriş)",
    ldDetay: isEng ? "L/D DETAIL :" : "L/D DETAY :",
    srlDetay: isEng ? "SRL DETAIL :" : "SRL DETAY :",
    ltDetay: isEng ? "LT DETAIL :" : "LT DETAY :"
  };

  const totalQuantity = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const marketTypeStr = order.language === 'ENG' ? t.export : t.domestic; // Inferred from contract language

  return (
    <div className="w-full flex flex-col items-center">
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Toggles */}
      <div className="flex justify-between items-center mb-6 print:hidden w-full max-w-[1002px]">
        <div className="space-x-4 flex items-center">
          <Link 
            href={`/orders/${order.id}`}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            &larr; Siparişe Dön
          </Link>
          <Link 
            href={`/orders/${order.id}/tracking`}
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
            onClick={() => window.print()}
            className="px-4 py-2 text-white bg-slate-800 shadow-sm rounded hover:bg-slate-700 transition-colors flex items-center gap-2 font-bold ml-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Yazdır / PDF Al
          </button>
        </div>
      </div>

      <div className="w-[1002px] print:w-full bg-white text-black font-['Arial',_'Helvetica',_sans-serif] text-[11px] leading-tight border-2 border-black relative">
        
        {/* ROW 1: Taraflar */}
        <div className="grid grid-cols-[334px_334px_334px] border-b-2 border-black min-h-[120px]">
          {/* 1. SELLER TITLE */}
          <div className="border-r-2 border-black p-2 flex flex-col">
             <div className="font-bold underline uppercase mb-0.5">{t.seller}</div>
             <div className="font-bold uppercase text-[12px] mb-1">{isEng && order.seller.nameEn ? order.seller.nameEn : order.seller.name}</div>
             <div className="uppercase leading-snug text-[10px]">
               {isEng && order.seller.addressEn ? order.seller.addressEn : order.seller.address}
               {order.seller.district || order.seller.city ? `\n${isEng && order.seller.districtEn ? order.seller.districtEn : order.seller.district}, ${isEng && order.seller.cityEn ? order.seller.cityEn : order.seller.city}` : ""}
             </div>
             {order.seller.phone && <div className="mt-auto text-[10px] uppercase">PHN. {order.seller.phone}</div>}
          </div>
          
          {/* 2. BUYER TITLE */}
          <div className="border-r-2 border-black p-2 flex flex-col leading-snug">
             <div className="font-bold underline uppercase mb-0.5">{t.buyer}</div>
             <div className="font-bold uppercase text-[12px] mb-1">{isEng && order.buyer.nameEn ? order.buyer.nameEn : order.buyer.name}</div>
             <div className="uppercase text-[10px] whitespace-pre-wrap">
               {isEng && order.buyer.addressEn ? order.buyer.addressEn : order.buyer.address}
               {order.buyer.district || order.buyer.city ? `\n${isEng && order.buyer.districtEn ? order.buyer.districtEn : order.buyer.district}, ${isEng && order.buyer.cityEn ? order.buyer.cityEn : order.buyer.city}` : ""}
             </div>
          </div>

          {/* 3. SHIP TO TITLE */}
          <div className="p-2 flex flex-col leading-snug">
              <div className="font-bold underline uppercase mb-0.5">{t.shipTo}</div>
              {order.shipTo ? (
                <>
                  <div className="font-bold uppercase text-[12px] mb-1">{isEng && order.shipTo.nameEn ? order.shipTo.nameEn : order.shipTo.name}</div>
                  <div className="uppercase mb-1 text-[10px] whitespace-pre-wrap flex-1">
                    {isEng && order.shipTo.addressEn ? order.shipTo.addressEn : order.shipTo.address}
                    {order.shipTo.district || order.shipTo.city ? `\n${isEng && order.shipTo.districtEn ? order.shipTo.districtEn : order.shipTo.district}, ${isEng && order.shipTo.cityEn ? order.shipTo.cityEn : order.shipTo.city}` : ""}
                  </div>
                </>
              ) : (
                 <div className="font-bold text-slate-400 mt-1 uppercase text-[10px]">{isEng ? "SAME AS BUYER" : "ALICI İLE AYNI"}</div>
              )}
          </div>
        </div>

        {/* ROW 2: Title & Details */}
        <div className="grid grid-cols-[668px_334px] border-b-2 border-black">
          {/* 1. PRODUCTION ORDER TITLE (668px) */}
          <div className="border-r-2 border-black p-2 flex justify-center items-center h-[120px]">
              <h1 className="text-[#d81e1e] font-sans font-bold text-[36px] text-center tracking-widest uppercase">
                 {t.title}
              </h1>
          </div>
          
          {/* 2. DOCS INFO (334px) */}
          <div className="flex flex-col h-[120px] divide-y divide-black">
              {/* Sözleşme No (30px) */}
              <div className="h-[30px] flex items-center px-2">
                  <div className="w-[140px] font-bold text-[10px]">{t.contractNo}</div>
                  <div className="font-bold text-[11px]">: {order.contractNo}</div>
              </div>
              {/* Tarihi (30px) */}
              <div className="h-[30px] flex items-center px-2">
                  <div className="w-[140px] font-bold text-[10px]">{t.contractDate}</div>
                  <div className="font-bold text-[11px]">: {order.contractDate ? new Date(order.contractDate).toLocaleDateString('tr-TR') : "-"}</div>
              </div>
              {/* PO Alanı (30px) */}
              <div className="h-[30px] flex items-center px-2">
                  <div className="w-[140px] font-bold text-[10px]">{t.buyerPoNo}</div>
                  <div className="font-bold text-[11px] truncate">: {order.buyerPoNo || "-"}</div>
              </div>
              {/* Marka (30px) */}
              <div className="h-[30px] flex items-center px-2 bg-slate-50">
                  <div className="w-[140px] font-bold text-[10px] text-indigo-800">{t.brandTitle}</div>
                  <div className="font-bold text-[11px] text-indigo-900 truncate">: {order.brand?.name || (isEng ? "N/A" : "BELİRTİLMEDİ")}</div>
              </div>
          </div>
        </div>

        {/* ROW 3: ITEMS TABLE (20 Columns) */}
        <div className="w-full">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="border-b-4 border-double border-black font-bold uppercase text-[9px] leading-tight bg-slate-100">
                <th className="py-2 px-0.5 border-r border-slate-400 w-[95px]">{t.modelName}</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[110px]">{t.qualityName}</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[70px]">{t.qualityCode}</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[80px]">{t.buyerColorCode}</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[110px]">{t.composition}</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[45px]">{t.weight}</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[35px]">{t.width}</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[20px]">B.S</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[24px]">L/D</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[24px]">PPS</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[26px]">TOPS</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[24px]">SRL</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[20px]">FD</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[30px]">PSHP</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[24px]">SUS</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[20px]">LT</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[55px]">B/S DD</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[34px]">B/S Q</th>
                <th className="py-2 px-0.5 border-r border-slate-400 w-[55px]">ExMD</th>
                <th className="py-2 px-1 text-right w-[60px]">{t.quantity}</th>
              </tr>
            </thead>
            <tbody>
              {/* Padding array */}
              <tr><td colSpan={20} className="h-2"></td></tr>
              
              {order.items.map((item: any, i: number) => (
                <tr key={item.id} className="uppercase align-top text-[9px] leading-tight">
                  <td className="px-0.5 pb-2">
                     <div className="font-bold truncate max-w-[90px]">{item.buyerModelName || "-"}</div>
                  </td>
                  <td className="px-0.5 pb-2 font-bold truncate max-w-[105px]">{item.qualityName || "-"}</td>
                  <td className="px-0.5 pb-2 truncate max-w-[65px]">{item.qualityCode || "-"}</td>
                  <td className="px-0.5 pb-2 truncate max-w-[75px]">{item.colorCode || "-"}</td>
                  <td className="px-0.5 pb-2 truncate max-w-[105px] text-[8px]">{item.composition || "-"}</td>
                  
                  <td className="px-0.5 pb-2 text-center font-bold">{item.weight || "-"}</td>
                  <td className="px-0.5 pb-2 text-center font-bold">{item.width || "-"}</td>
                  
                  <td className="px-0.5 pb-2 text-center">{item.bsRequest ? "X" : ""}</td>
                  <td className="px-0.5 pb-2 text-center font-bold text-indigo-700">{item.ldRequest === 'YES' ? "YES" : item.ldRequest === 'WAIT' ? "WAIT" : ""}</td>
                  <td className="px-0.5 pb-2 text-center">{item.ppsRequest ? "X" : ""}</td>
                  <td className="px-0.5 pb-2 text-center">{item.topsRequest ? "X" : ""}</td>
                  <td className="px-0.5 pb-2 text-center">{item.srlRequest ? "X" : ""}</td>
                  <td className="px-0.5 pb-2 text-center">{item.fdRequest ? "X" : ""}</td>
                  <td className="px-0.5 pb-2 text-center">{item.pshpRequest ? "X" : ""}</td>
                  <td className="px-0.5 pb-2 text-center">{item.susRequest ? "X" : ""}</td>
                  <td className="px-0.5 pb-2 text-center">{item.ltRequest ? "X" : ""}</td>
                  
                  <td className="px-0.5 pb-2 text-center text-rose-700">{item.bdd ? new Date(item.bdd).toLocaleDateString('tr-TR') : "-"}</td>
                  <td className="px-0.5 pb-2 text-center">{item.bq || "-"}</td>
                  <td className="px-0.5 pb-2 text-center font-bold text-rose-700">{item.exmd ? new Date(item.exmd).toLocaleDateString('tr-TR') : "-"}</td>
                  
                  <td className="px-1 pb-2 text-right font-bold text-[10px]">{item.quantity.toLocaleString('tr-TR')} {order.unit}</td>
                </tr>
              ))}
              <tr className="h-2"><td colSpan={20}></td></tr>
            </tbody>
          </table>

          {/* TOTAL ROW */}
          <div className="border-t-2 border-b-2 border-black w-full flex text-[13px] bg-slate-50">
             <div className="w-[752px] p-2 font-bold uppercase border-r-2 border-black flex justify-end items-center text-slate-600">
                {t.totalQuantity}
             </div>
             <div className="w-[250px] p-2 text-right font-bold text-[15px] uppercase flex justify-end items-center pr-2">
                {totalQuantity.toLocaleString('tr-TR')} {order.unit}
             </div>
          </div>
        </div>

        {/* BOTTOM SECTION: GENERAL & MANUAL NOTES */}
        <div className="grid grid-cols-[1fr_300px] min-h-[140px] relative">
          
          {/* Left: Manual Special Remarks Area */}
          <div className="p-3 pb-8 relative flex flex-col justify-start overflow-hidden border-r-2 border-black">
             <div className="font-bold underline uppercase mb-3 text-slate-800">{t.manualNotes}</div>
             <div className="text-[10px] space-y-6 mt-2 flex flex-col font-mono text-slate-500">
                 {order.items.map((item: any, i: number) => (
                    <div key={item.id} className="flex flex-col gap-4 mb-2">
                       {/* Ürün İsmi Başlığı */}
                       <div className="font-bold text-indigo-900 text-[11px] underline underline-offset-2">
                         {item.buyerModelName || `ITEM ${i+1}`} {item.qualityName ? `- ${item.qualityName}` : ''}
                       </div>
                       
                       {/* 1. Satır Çizgiler */}
                       <div className="flex gap-6 w-full">
                           <div className="border-b-2 border-dotted border-slate-400 flex-1 flex pb-1">
                               <span className="font-bold text-slate-700 uppercase">{t.ldDetay}</span>
                           </div>
                           <div className="border-b-2 border-dotted border-slate-400 flex-1 flex pb-1">
                               <span className="font-bold text-slate-700 uppercase">{t.srlDetay}</span>
                           </div>
                           <div className="border-b-2 border-dotted border-slate-400 flex-1 flex pb-1">
                               <span className="font-bold text-slate-700 uppercase">{t.ltDetay}</span>
                           </div>
                       </div>
                       
                       {/* 2. Satır Çizgiler (Geniş alan için opsiyonel) */}
                       <div className="flex gap-6 w-full mt-2">
                           <div className="border-b-2 border-dotted border-slate-400 flex-1"></div>
                           <div className="border-b-2 border-dotted border-slate-400 flex-1"></div>
                           <div className="border-b-2 border-dotted border-slate-400 flex-1"></div>
                       </div>
                    </div>
                 ))}
             </div>
          </div>

          {/* Right: General Parameters */}
          <div className="p-4 space-y-6 bg-slate-50">
             
             <div className="flex flex-col w-full uppercase">
                 <div className="font-bold mb-1 text-slate-500 underline underline-offset-2">{t.orderTolerance}</div>
                 <div className="font-bold text-[13px]">: {order.tolerance || "-"} %</div>
             </div>

             <div className="flex flex-col w-full uppercase">
                 <div className="font-bold mb-1 text-slate-500 underline underline-offset-2">{t.marketType}</div>
                 <div className="font-bold text-[13px] text-indigo-800">: {marketTypeStr}</div>
             </div>

             <div className="flex flex-col w-full uppercase">
                 <div className="font-bold mb-1 text-slate-500 underline underline-offset-2">{t.transportInfo}</div>
                 <div className="font-bold text-[13px] break-words leading-snug">: {order.transporter || "-"}</div>
             </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
