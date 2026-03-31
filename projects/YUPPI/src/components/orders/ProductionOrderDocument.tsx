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

    manualNotes: isEng ? "SPECIAL NOTES" : "ÖZEL NOTLAR",
    ldDetay: isEng ? "L/D DETAIL :" : "L/D DETAY :",
    srlDetay: isEng ? "SRL DETAIL :" : "SRL DETAY :",
    ltDetay: isEng ? "LT DETAIL :" : "LT DETAY :"
  };

  const totalQuantity = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const getStatusDisplay = (status: string) => {
    if (status === 'YES') {
      return <span className="text-emerald-700 font-bold">YES</span>;
    }
    if (status === 'WAIT') {
      return <span className="text-rose-700 font-bold">WAIT</span>;
    }
    return <span className="text-slate-400 font-bold">NO</span>;
  };

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

      <div className="w-[1002px] print:w-full bg-white text-black font-['Arial_Narrow',_'Arial_Narrow_MT',_Arial,_sans-serif] text-[11px] leading-tight border-2 border-black relative">
        
        {/* MATCHED SÖZLEŞME HEADER START */}
        <div className="border-b-2 border-black text-[11px] leading-tight grid grid-cols-[265px_265px_265px_1fr] w-full h-[120px] min-h-[120px] max-h-[120px] overflow-hidden">
          {/* SATICI FİRMA */}
          <div className="border-r-2 border-black p-2 flex flex-col justify-start">
              <div className="font-bold text-[13px] mb-1 underline underline-offset-2">{isEng ? 'SELLER' : 'SATICI FİRMA'}</div>
              <div className="font-bold text-[11px] uppercase mb-1">{order.seller.name}</div>
              <div className="uppercase text-[11px]">{order.seller.address}</div>
              <div className="uppercase text-[11px]">TÜRKİYE &nbsp;&nbsp;&nbsp; {isEng ? 'TRD. REG. NO.' : 'TİC. SİC. NO.'} {order.seller.registrationNo || "-"}</div>
              <div className="uppercase text-[11px]">{order.seller.taxOffice} VD. {order.seller.taxNo}</div>
              <div className="uppercase text-[11px]">TEL. {order.seller.phone || "-"}</div>
          </div>
          
          {/* ALICI FİRMA */}
          <div className="border-r-2 border-black p-2 flex flex-col justify-start">
              <div className="font-bold text-[13px] mb-1 underline underline-offset-2">{isEng ? 'BUYER' : 'ALICI FİRMA'}</div>
              <div className="font-bold text-[11px] uppercase mb-1">{order.buyer.name}</div>
              <div className="uppercase text-[11px]">{order.buyer.address}</div>
              <div className="uppercase text-[11px]">TÜRKİYE</div>
              <div className="uppercase text-[11px]">{order.buyer.taxOffice} VD. {order.buyer.taxNo}</div>
              <div className="uppercase text-[11px]">{order.buyer.phone ? `TEL. ${order.buyer.phone}` : ''}</div>
          </div>

          {/* SEVK ADRESİ */}
          <div className="border-r-2 border-black p-2 flex flex-col justify-start">
              <div className="font-bold text-[13px] mb-1 underline underline-offset-2">{isEng ? 'SHIP TO / CONSIGNEE' : 'SEVK ADRESİ / ALICI'}</div>
              <div className="font-bold text-[11px] uppercase mb-1">{order.shipTo?.name || order.buyer.name}</div>
              <div className="uppercase text-[11px]">{order.shipTo?.address || order.buyer.address}</div>
              <div className="uppercase text-[11px]">TÜRKİYE &nbsp;&nbsp;&nbsp; VAT. {order.shipTo?.taxNo || order.buyer.taxNo}</div>
              <div className="uppercase text-[11px]">{order.shipTo?.phone ? `TEL. ${order.shipTo.phone}` : ''}</div>
          </div>

          {/* SÖZLEŞME VE TARİH */}
          <div className="flex flex-col text-center h-full">
              <div className="w-full h-[60px] min-h-[60px] max-h-[60px] flex flex-col justify-center px-2">
                  <div className="font-bold text-[13px]">{isEng ? 'CONTRACT NO' : 'SÖZLEŞME NO'}</div>
                  <div className="text-[11px] tracking-widest mt-0.5">{order.contractNo}</div>
              </div>
              <div className="w-full h-[60px] min-h-[60px] max-h-[60px] border-t-2 border-black flex flex-col justify-center px-2">
                  <div className="font-bold text-[13px]">{isEng ? 'CONTRACT DATE' : 'SÖZLEŞME TARİHİ'}</div>
                  <div className="text-[11px] tracking-widest mt-0.5">{order.contractDate ? new Date(order.contractDate).toLocaleDateString(isEng ? 'en-GB' : 'tr-TR') : "-"}</div>
              </div>
          </div>
        </div>

        {/* SUB-HEADER BLOCK */}
        <div className="border-b-2 border-black grid grid-cols-[205px_590px_1fr] w-full bg-white items-stretch">
           <div className="font-bold text-[11px] px-2 py-2 border-r-2 border-black flex flex-col items-center justify-center text-center uppercase leading-tight">
              <div>{isEng ? 'ORDER BRAND' : 'SİPARİŞ MARKASI'}</div>
              <div className="text-[13px] tracking-wide text-black mt-1">{order.brand?.name || (isEng ? "N/A" : "-")}</div>
           </div>
           <div className="p-2 flex items-center justify-center text-center border-r-2 border-black bg-white">
             <h2 className="text-[25px] font-bold text-green-600 tracking-widest uppercase mb-1">{isEng ? 'PRODUCTION ORDER' : 'ÜRETİM SİPARİŞİ'}</h2>
           </div>
           <div className="h-[60px] min-h-[60px] max-h-[60px] px-2 flex flex-col justify-center text-center font-normal bg-white">
             <div className="font-bold text-[13px] uppercase">{isEng ? "BUYER'S P.O. NO" : "ALICI SİPARİŞ NO"}</div>
             <div className="text-[11px] mt-0.5 uppercase">{order.buyerPoNo || "-"}</div>
           </div>
        </div>
        {/* MATCHED SÖZLEŞME HEADER END */}

        {/* ROW 3: ITEMS TABLE (20 Columns) */}
        <div className="w-full">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="border-b-2 border-black font-bold uppercase text-[10px] leading-tight bg-white">
                <th className="py-2 px-0.5 border-r border-black w-[95px]">{t.modelName}</th>
                <th className="py-2 px-0.5 border-r border-black w-[110px]">{t.qualityName}</th>
                <th className="py-2 px-0.5 border-r border-black w-[70px]">{t.qualityCode}</th>
                <th className="py-2 px-0.5 border-r border-black w-[80px]">{t.buyerColorCode}</th>
                <th className="py-2 px-0.5 border-r border-black w-[110px]">{t.composition}</th>
                <th className="py-2 px-0.5 border-r border-black w-[45px]">{t.weight}</th>
                <th className="py-2 px-0.5 border-r border-black w-[35px]">{t.width}</th>
                <th className="py-2 px-0.5 border-r border-black w-[20px]">B.S</th>
                <th className="py-2 px-0.5 border-r border-black w-[24px]">L/D</th>
                <th className="py-2 px-0.5 border-r border-black w-[24px]">PPS</th>
                <th className="py-2 px-0.5 border-r border-black w-[26px]">TOPS</th>
                <th className="py-2 px-0.5 border-r border-black w-[24px]">SRL</th>
                <th className="py-2 px-0.5 border-r border-black w-[20px]">FD</th>
                <th className="py-2 px-0.5 border-r border-black w-[30px]">PSHP</th>
                <th className="py-2 px-0.5 border-r border-black w-[24px]">SUS</th>
                <th className="py-2 px-0.5 border-r border-black w-[20px]">LT</th>
                <th className="py-2 px-0.5 border-r border-black w-[55px]">B/S DD</th>
                <th className="py-2 px-0.5 border-r border-black w-[34px]">B/S Q</th>
                <th className="py-2 px-0.5 border-r border-black w-[55px]">ExMD</th>
                <th className="py-2 px-1 text-right w-[60px]">{t.quantity}</th>
              </tr>
            </thead>
            <tbody>
              {/* Removed padding row to fix extra line rendering */}

              {order.items.map((item: any, i: number) => (
                <tr key={item.id} className="uppercase align-top text-[10px] leading-tight text-slate-900">
                  <td className="px-0.5 pb-2 align-top">
                     <div className="px-0.5 break-words">{item.buyerModelName || "-"}</div>
                  </td>
                  <td className="px-0.5 pb-2 leading-snug align-top break-words">{item.qualityName || "-"}</td>
                  <td className="px-0.5 pb-2 leading-snug align-top break-words">{item.qualityCode || "-"}</td>
                  <td className="px-0.5 pb-2 leading-snug align-top break-words">{item.colorCode || "-"}</td>
                  <td className="px-0.5 pb-2 leading-tight align-top break-words">{item.composition || "-"}</td>
                  
                  <td className="px-0.5 pb-2 text-center">{item.weight || "-"}</td>
                  <td className="px-0.5 pb-2 text-center">{item.width || "-"}</td>
                  
                  <td className="px-0.5 pb-2 text-center text-emerald-700 font-bold">{item.bsRequest ? "✓" : ""}</td>
                  <td className="px-0.5 pb-2 text-center">{getStatusDisplay(item.ldRequest)}</td>
                  <td className="px-0.5 pb-2 text-center text-emerald-700 font-bold">{item.ppsRequest ? "✓" : ""}</td>
                  <td className="px-0.5 pb-2 text-center text-emerald-700 font-bold">{item.topsRequest ? "✓" : ""}</td>
                  <td className="px-0.5 pb-2 text-center">{getStatusDisplay(item.srlRequest)}</td>
                  <td className="px-0.5 pb-2 text-center text-emerald-700 font-bold">{item.fdRequest ? "✓" : ""}</td>
                  <td className="px-0.5 pb-2 text-center text-emerald-700 font-bold">{item.pshpRequest ? "✓" : ""}</td>
                  <td className="px-0.5 pb-2 text-center text-emerald-700 font-bold">{item.susRequest ? "✓" : ""}</td>
                  <td className="px-0.5 pb-2 text-center">{getStatusDisplay(item.ltRequest)}</td>
                  
                  <td className="px-0.5 pb-2 text-center text-rose-700">{item.bdd ? new Date(item.bdd).toLocaleDateString('tr-TR') : "-"}</td>
                  <td className="px-0.5 pb-2 text-center">{item.bq || "-"}</td>
                  <td className="px-0.5 pb-2 text-center text-rose-700">{item.exmd ? new Date(item.exmd).toLocaleDateString('tr-TR') : "-"}</td>
                  
                  <td className="px-1 pb-2 text-right">{item.quantity.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.unit}</td>
                </tr>
              ))}
              {/* Removed bottom padding row */}
            </tbody>
          </table>

          {/* TOTAL ROW */}
          <div className="border-t-2 border-b-2 border-black w-full flex text-[13px] bg-white">
             <div className="w-[752px] p-2 font-bold uppercase border-r-2 border-black flex justify-between items-center text-slate-800 bg-white">
                <div className="text-[11px] text-black">
                   {t.orderTolerance} <span className="font-extrabold text-[13px] text-black">%{order.tolerance?.replace('%', '') || "-"}</span>
                </div>
                <div className="text-black">{t.totalQuantity}</div>
             </div>
             <div className="w-[250px] p-2 text-right font-bold text-[15px] uppercase flex justify-end items-center pr-2">
                {totalQuantity.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.unit}
             </div>
          </div>
        </div>

        {/* BOTTOM SECTION: GENERAL & MANUAL NOTES */}
        <div className="grid grid-cols-[1fr_300px] min-h-[140px] relative">
          
          {/* Left: Manual Special Remarks Area */}
          <div className="p-3 pb-8 relative flex flex-col justify-start overflow-hidden border-r-2 border-black">
             <div className="mb-2">
               <span className="font-bold underline uppercase text-slate-800">{t.manualNotes}</span>
               {order.productionOrder?.packingInstructions && (
                 <span className="ml-2 whitespace-pre-wrap text-[11px] font-normal text-slate-800">
                   {order.productionOrder.packingInstructions}
                 </span>
               )}
             </div>

             <div className="text-[10px] space-y-3 mt-1 flex flex-col font-mono text-slate-500">
                 {order.items.map((item: any, i: number) => (
                    <div key={item.id} className="flex flex-col gap-1 mb-1">
                       {/* Ürün İsmi Başlığı */}
                       <div className="font-bold text-slate-900 text-[11px] underline underline-offset-2 break-words whitespace-normal">
                         {item.qualityName || item.buyerModelName || `ITEM ${i+1}`}
                       </div>
                       
                       {/* LD / SRL / LT Detayları */}
                       <div className="flex gap-6 w-full mt-0">
                           <div className="border-b-2 border-dotted border-emerald-700 flex-1 flex flex-col pb-1 min-h-[30px]">
                               <span className="font-bold text-slate-700 uppercase mb-0.5">{t.ldDetay}</span>
                               <span className="text-slate-900 font-medium text-[10px] break-words whitespace-normal leading-tight">{item.ldDetail}</span>
                           </div>
                           <div className="border-b-2 border-dotted border-emerald-700 flex-1 flex flex-col pb-1 min-h-[30px]">
                               <span className="font-bold text-slate-700 uppercase mb-0.5">{t.srlDetay}</span>
                               <span className="text-slate-900 font-medium text-[10px] break-words whitespace-normal leading-tight">{item.srlDetail}</span>
                           </div>
                           <div className="border-b-2 border-dotted border-emerald-700 flex-1 flex flex-col pb-1 min-h-[30px]">
                               <span className="font-bold text-slate-700 uppercase mb-0.5">{t.ltDetay}</span>
                               <span className="text-slate-900 font-medium text-[10px] break-words whitespace-normal leading-tight">{item.ltDetail}</span>
                           </div>
                       </div>
                    </div>
                 ))}
             </div>
          </div>

          {/* Right: General Parameters */}
          <div className="p-4 space-y-6 bg-white">
             
             {/* SİPARİŞ TOLERANSI TOTAL SATIRINA TAŞINDI */}

             <div className="mb-4">
                 <span className="font-bold text-slate-800 underline uppercase">{isEng ? 'SPECIAL LOADING REQ.' : 'ÖZEL YÜKLEME TALEBİ'}</span>
                 {order.specialLoadingRequest && order.specialLoadingDetail && (
                   <span className="ml-2 text-[11px] font-normal text-slate-800 uppercase break-words">
                     {order.specialLoadingDetail}
                   </span>
                 )}
             </div>

             <div>
                 <span className="font-bold text-slate-800 underline uppercase">{t.transportInfo}</span>
                 <span className="ml-2 text-[11px] font-normal text-slate-800 uppercase break-words leading-snug">
                   {order.transporter || "-"}
                 </span>
             </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
