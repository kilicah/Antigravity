"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { numberToWords } from "@/utils/numberToWords";

export default function CommercialInvoiceDocument({ order, bankInfo }: { order: any; bankInfo: any }) {
  const [isEng, setIsEng] = useState(order.language === 'ENG');
  const [isSigned, setIsSigned] = useState(false);

  const sellerName = order.seller.name.toUpperCase();
  const isUSKM = sellerName.includes("MENSUCAT") || sellerName.includes("USKM");
  const isUSKT = sellerName.includes("TEKSTİL") || sellerName.includes("TEKSTIL") || sellerName.includes("USKT");

  // Helper arrays for language toggle
  const t = {
    sellerTitle: isEng ? "EXPORTER" : "İHRACATÇI FİRMA",
    customerTitle: isEng ? "IMPORTER" : "İTHALATÇI FİRMA",
    deliveryTitle: isEng ? "SHIP TO / CONSIGNEE" : "SEVK ADRESİ / ALICI",
    invoiceNo: isEng ? "INVOICE NO" : "FATURA NO",
    invoiceDate: isEng ? "INVOICE DATE" : "FATURA TARİHİ",
    customerPo: isEng ? "BUYER'S P.O. NO" : "ALICI SİPARİŞ NO",
    typeOfGoods: isEng ? "TYPE OF GOODS" : "ÜRÜN CİNSİ",
    articleName: isEng ? "ARTICLE NAME" : "KALİTE İSMİ",
    articleCode: isEng ? "ARTICLE CODE" : "KALİTE KODU",
    colorCode: isEng ? "COLOR CODE" : "RENK KODU",
    composition: isEng ? "ARTICLE COMPOSITION" : "KALİTE KOMPOSİZYONU",
    priceUsd: isEng ? `PRICE ${order.currency}` : `FİYAT ${order.currency}`,
    quantity: isEng ? "QUANTITY" : "MİKTAR",
    totalAmount: isEng ? "TOTAL AMOUNT" : "TOPLAM TUTAR",
    grandTotals: isEng ? "GRAND TOTALS" : "GENEL TOPLAM",
    amountInWords: isEng ? "AMOUNT IN WORDS" : "YAZIYLA TUTAR",
    paymentTerms: isEng ? "PAYMENT TERMS:" : "ÖDEME ŞEKLİ:",
    deliveryTerms: isEng ? "DELIVERY TERMS:" : "TESLİMAT ŞEKLİ:",
    transporter: isEng ? "TRANSPORTER:" : "NAKLİYECİ:",
    totalGrossKg: isEng ? "TOTAL GROSS KG:" : "TOPLAM BRÜT KG:",
    totalNetKg: isEng ? "TOTAL NET KG:" : "TOPLAM NET KG:",
    numberRolls: isEng ? "NUMBER OF ROLLS:" : "RULO SAYISI:",
    numberSacks: isEng ? "NUMBER OF SACKS:" : "ÇUVAL SAYISI:",
    bankName: isEng ? "BANK NAME:" : "BANKA ADI:",
    branchNameNo: isEng ? "BCH NAME & NO:" : "ŞUBE ADI & KODU:",
    accountNo: isEng ? "ACCOUNT NO:" : "HESAP NO:",
    swiftCode: isEng ? "SWIFT CODE :" : "SWIFT KODU :",
    ibanNo: isEng ? "IBAN NO:" : "IBAN NO:",
    authSign: isEng ? "AUTHORIZED SIGNATURE & STAMP" : "YETKİLİ İMZA VE KAŞE",
    originDecl: isEng ? "THE GOODS ARE OF TURKISH ORIGIN" : "MALLAR TÜRK MENŞELİDİR",
    madeInDecl: isEng ? "ALL GOODS MADE IN TURKEY, OUR TEXTILES ARE AZO FREE." : "TÜM MALLAR TÜRKİYE'DE ÜRETİLMİŞTİR, KUMAŞLARIMIZ AZO İÇERMEZ.",
    originPreferential: isEng ? "The exporter of the products covered by this document declares that, except where otherwise clearly indicated, these products are of Turkish preferential origin." : "Bu belge kapsamındaki ürünlerin ihracatçısı, aksi açıkça belirtilmedikçe, bu ürünlerin Türkiye menşeli olduğunu beyan eder."
  };

  const totalQuantity = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const totalAmount = order.items.reduce((sum: number, item: any) => sum + item.totalAmount, 0);

  // Parse delivery/payment terms safely
  const getDualPhrase = (str: string) => {
    if (!str) return "-";
    if (str.includes('|')) return str.split('|')[isEng ? 1 : 0] || str.split('|')[0];
    return str;
  };

  const paymentTerms = getDualPhrase(order.paymentTerms);
  const deliveryTerms = getDualPhrase(order.deliveryTerms);
  const deliveryDest = order.deliveryDestination ? `${deliveryTerms} ${order.deliveryDestination}` : deliveryTerms;

  return (
    <div className="w-full flex flex-col items-center">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      {/* Dil Seçimi Butonları (Sadece Ekranda Görünür, Yazdırmada Gizlenir) */}
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

      <div className="w-[1002px] print:w-full bg-white text-black font-['Arial',_'Helvetica',_sans-serif] text-[12px] leading-tight border-2 border-black relative">
        
        {/* ROW 1 */}
        <div className="grid grid-cols-[401px_401px_200px] border-b-2 border-black">
          {/* 1. SELLER TITLE (401px x 150px) */}
          <div className="border-r-2 border-black p-2 flex flex-col h-[150px]">
             <div className="font-bold underline uppercase mb-1">{t.sellerTitle}</div>
             <div className="font-bold uppercase text-[13px] mb-2">{isEng && order.seller.nameEn ? order.seller.nameEn : order.seller.name}</div>
             <div className="uppercase mt-1 whitespace-pre-wrap leading-snug">
               {isEng && order.seller.addressEn ? order.seller.addressEn : order.seller.address}
               {order.seller.district || order.seller.city ? `\n${isEng && order.seller.districtEn ? order.seller.districtEn : order.seller.district}, ${isEng && order.seller.cityEn ? order.seller.cityEn : order.seller.city}` : ""}
               {(order.seller.country || order.seller.zipCode) ? `\n${isEng && order.seller.countryEn ? order.seller.countryEn : order.seller.country}    ${order.seller.zipCode || ""}`.trim() : ""}
             </div>
             <div className="mt-3 flex gap-4 uppercase">
               {order.seller.taxNo && <span>{isEng ? 'VAT NO' : 'VERGİ NO'}. {order.seller.taxNo}</span>}
               {order.seller.taxOffice && <span>{isEng && order.seller.taxOfficeEn ? order.seller.taxOfficeEn : order.seller.taxOffice}</span>}
               {order.seller.registrationNo && <span>{isEng ? 'REG.NO.' : 'SİC. NO'} {order.seller.registrationNo}</span>}
             </div>
             {order.seller.phone && <div className="mt-1 uppercase">PHN. {order.seller.phone}</div>}
          </div>
          
          {/* 2. COMMERCIAL INVOICE (401px x 150px) */}
          <div className="border-r-2 border-black p-2 flex justify-center items-center h-[150px]">
              <h1 className="text-[#d81e1e] font-sans font-bold text-[34px] text-center leading-tight tracking-wider uppercase">
                {isEng ? (
                  <>COMMERCIAL<br/>INVOICE</>
                ) : (
                  <>TİCARİ<br/>FATURA</>
                )}
              </h1>
          </div>

          {/* 3. LOGO (200px x 150px) */}
          <div className="p-2 flex justify-center items-center h-[150px]">
               {isUSKM ? (
                 <img src="/images/Defenni-M-Kirmizi.jpg" alt="Logo" className="max-h-[80px] max-w-[180px] object-contain mix-blend-multiply" />
               ) : isUSKT ? (
                 <img src="/images/Defenni-T-Kirmizi.jpg" alt="Logo" className="max-h-[80px] max-w-[180px] object-contain mix-blend-multiply" />
               ) : sellerName.includes("DEFENNİ") || sellerName.includes("DEFENNI") ? (
                 <img src="/defenni-logo.png" alt="Logo" className="max-h-[80px] max-w-[180px] object-contain mix-blend-multiply" />
               ) : (
                 <div className="text-xl font-bold text-slate-300">{order.seller.name.split(' ')[0]}</div>
               )}
          </div>
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-[401px_401px_200px] border-b-2 border-black">
          {/* 1. CUSTOMER TITLE (401px x 150px) */}
          <div className="border-r-2 border-black p-2 flex flex-col h-[150px] leading-snug">
             <div className="font-bold underline uppercase mb-1">{t.customerTitle}</div>
             <div className="font-bold uppercase text-[13px] mb-2">{isEng && order.buyer.nameEn ? order.buyer.nameEn : order.buyer.name}</div>
             <div className="uppercase mb-2 whitespace-pre-wrap">
               {isEng && order.buyer.addressEn ? order.buyer.addressEn : order.buyer.address}
               {order.buyer.district || order.buyer.city ? `\n${isEng && order.buyer.districtEn ? order.buyer.districtEn : order.buyer.district}, ${isEng && order.buyer.cityEn ? order.buyer.cityEn : order.buyer.city}` : ""}
               {(order.buyer.country || order.buyer.zipCode) ? `\n${isEng && order.buyer.countryEn ? order.buyer.countryEn : order.buyer.country}    ${order.buyer.zipCode || ""}`.trim() : ""}
             </div>
             {order.buyer.taxNo && <div className="uppercase mt-auto">VAT NO: {order.buyer.taxNo}</div>}
             <div className="uppercase flex flex-wrap gap-x-4">
                {order.buyer.phone && <span>PHN. {order.buyer.phone}</span>}
             </div>
          </div>
          
          {/* 2. DELIVERY ADDRESS (401px x 150px) */}
          <div className="border-r-2 border-black p-2 flex flex-col h-[150px] leading-snug">
              <div className="font-bold underline uppercase mb-1">{t.deliveryTitle}</div>
              {order.shipTo ? (
                <>
                  <div className="font-bold uppercase text-[13px] mb-2">{isEng && order.shipTo.nameEn ? order.shipTo.nameEn : order.shipTo.name}</div>
                  <div className="uppercase mb-2 whitespace-pre-wrap flex-1">
                    {isEng && order.shipTo.addressEn ? order.shipTo.addressEn : order.shipTo.address}
                    {order.shipTo.district || order.shipTo.city ? `\n${isEng && order.shipTo.districtEn ? order.shipTo.districtEn : order.shipTo.district}, ${isEng && order.shipTo.cityEn ? order.shipTo.cityEn : order.shipTo.city}` : ""}
                    {(order.shipTo.country || order.shipTo.zipCode) ? `\n${isEng && order.shipTo.countryEn ? order.shipTo.countryEn : order.shipTo.country}    ${order.shipTo.zipCode || ""}`.trim() : ""}
                  </div>
                  <div className="uppercase mt-auto">
                     {order.shipTo.phone && `PHN. ${order.shipTo.phone}`}
                  </div>
                </>
              ) : (
                 <div className="font-bold text-slate-400 mt-2">SAME AS BUYER</div>
              )}
          </div>
          
          {/* 3. DOCS INFO (200px x 150px) */}
          <div className="flex flex-col h-[150px]">
              {/* Fatura No (50px) */}
              <div className="h-[50px] border-b border-black flex flex-col justify-center px-4 leading-snug">
                  <div className="font-bold uppercase text-[11px] mb-0.5">{t.invoiceNo}</div>
                  <div className="font-bold text-[12px]">{order.invoice?.invoiceNo || "-"}</div>
              </div>
              
              {/* Tarihi (50px) */}
              <div className="h-[50px] border-b border-black flex flex-col justify-center px-4 leading-snug">
                  <div className="font-bold uppercase text-[11px] mb-0.5">{t.invoiceDate}</div>
                  <div className="font-bold text-[12px]">{order.invoice?.invoiceDate ? new Date(order.invoice.invoiceDate).toLocaleDateString('tr-TR') : "-"}</div>
              </div>
              
              {/* PO Alanı (50px) */}
              <div className="h-[50px] flex flex-col justify-center px-4 leading-snug">
                  <div className="font-bold uppercase text-[11px] mb-0.5">{t.customerPo}</div>
                  <div className="font-bold text-[12px]">{order.buyerPoNo || "-"}</div>
              </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="w-full">
          <table className="w-full text-center table-fixed border-collapse">
            <thead>
              <tr className="border-b-4 border-double border-black font-bold uppercase text-[11px] leading-tight">
                <th className="py-2 px-1 w-[130px]">{t.typeOfGoods}</th>
                <th className="py-2 px-1 w-[110px]">{t.articleName}</th>
                <th className="py-2 px-1 w-[100px]">{t.articleCode}</th>
                <th className="py-2 px-1 w-[70px]">{t.colorCode}</th>
                <th className="py-2 px-1 w-[130px]">{t.composition}</th>
                <th className="py-2 px-1 w-[90px]">{t.priceUsd}</th>
                <th className="py-2 px-1 w-[100px] text-right">{t.quantity} <span className="ml-1">{order.unit}</span></th>
                <th className="py-2 px-1 w-[120px] text-right pr-2">{t.totalAmount}</th>
              </tr>
            </thead>
            <tbody>
              {/* Padding map for perfect top spacing */}
              <tr><td colSpan={8} className="h-2"></td></tr>
              
              {order.items.map((item: any) => (
                <tr key={item.id} className="uppercase align-top leading-snug">
                  <td className="px-1 pb-2">
                    {item.buyerModelName ? <div className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.buyerModelName}</div> : null}
                    <div className="text-[11px]">{item.width ? `${item.width}CM ` : ''}{item.weight ? `/ ${item.weight}` : ''}</div>
                  </td>
                  <td className="px-1 pb-2 font-medium break-words">{item.qualityName || "-"}</td>
                  <td className="px-1 pb-2 break-words">{item.qualityCode || "-"}</td>
                  <td className="px-1 pb-2 break-words text-center">{item.colorCode || "-"}</td>
                  <td className="px-1 pb-2 break-words">{item.composition || "-"}</td>
                  <td className="px-1 pb-2">{item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {order.currency}</td>
                  <td className="px-1 pb-2 text-right">{item.quantity.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {order.unit}</td>
                  <td className="px-1 pb-2 text-right pr-2">{item.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {order.currency}</td>
                </tr>
              ))}
              
              {/* Removing forced height empty row to let table grow dynamically with natural padding */}
              <tr className="h-6"><td colSpan={8}></td></tr>
            </tbody>
          </table>
          
          <div className="border-t border-black w-full flex text-[13px]">
             <div className="w-[580px] p-1 uppercase font-medium border-r border-black flex items-center">
                {t.madeInDecl}
             </div>
             <div className="w-[200px] p-1 text-right font-bold uppercase flex justify-end items-center pr-2 border-r border-black">
                {t.grandTotals}
             </div>
             <div className="flex-1 flex font-medium">
                <div className="w-1/2 p-1 text-right">{totalQuantity.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {order.unit}</div>
                <div className="w-1/2 p-1 text-right pr-2">{totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {order.currency}</div>
             </div>
          </div>
        </div>

        {/* AMOUNT IN WORDS */}
        <div className="border-t-2 border-b-2 border-black grid grid-cols-[130px_1fr] min-h-[44px]">
           <div className="p-1.5 font-bold uppercase">{t.amountInWords}</div>
           <div className="p-1.5 uppercase font-medium">{numberToWords(totalAmount, order.currency, isEng ? "ENG" : "TR")}</div>
        </div>

        {/* DETAILS & BANK FOOTER */}
        <div className="grid grid-cols-[580px_1fr] border-b-2 border-black">
           {/* Left details */}
           <div className="border-r-2 border-black flex flex-col font-medium">
              <div className="grid grid-cols-[150px_1fr] border-b border-black">
                 <div className="p-1 font-bold uppercase border-r border-black">{t.paymentTerms}</div>
                 <div className="p-1 uppercase text-[11px] leading-tight">{paymentTerms}</div>
              </div>
              <div className="grid grid-cols-[150px_1fr] border-b border-black">
                 <div className="p-1 font-bold uppercase border-r border-black">{t.deliveryTerms}</div>
                 <div className="p-1 uppercase text-[11px] leading-tight">{deliveryDest}</div>
              </div>
              <div className="grid grid-cols-[150px_1fr] border-b border-black">
                 <div className="p-1 font-bold uppercase border-r border-black">{t.transporter}</div>
                 <div className="p-1 uppercase">{order.transporter || "-"}</div>
              </div>
              
              {/* Weights and boxes row */}
              <div className="flex w-full divide-x divide-black border-b border-black">
                 <div className="flex flex-1">
                   <div className="w-[150px] p-1 font-bold uppercase border-r border-black flex items-center">{t.totalGrossKg}</div>
                   <div className="flex-1 p-1 text-right pr-4">{order.invoice?.grossKg?.toLocaleString('tr-TR') || "-"}</div>
                 </div>
                 <div className="flex flex-1">
                   <div className="w-[140px] p-1 font-bold uppercase border-r border-black pl-2 flex items-center">{t.numberRolls}</div>
                   <div className="flex-1 p-1 text-right pr-2">{order.invoice?.rollCount || "-"}</div>
                 </div>
              </div>
              <div className="flex w-full divide-x divide-black min-h-[29px]">
                 <div className="flex flex-1">
                   <div className="w-[150px] p-1 font-bold uppercase border-r border-black flex items-center">{t.totalNetKg}</div>
                   <div className="flex-1 p-1 text-right pr-4">{order.invoice?.netKg?.toLocaleString('tr-TR') || "-"}</div>
                 </div>
                 <div className="flex flex-1">
                   <div className="w-[140px] p-1 font-bold uppercase border-r border-black pl-2 flex items-center">{t.numberSacks}</div>
                   <div className="flex-1 p-1 text-right pr-2">{order.invoice?.sackCount || "-"}</div>
                 </div>
              </div>
              <div className="border-t-2 border-black mt-auto uppercase bg-slate-100 flex items-center justify-center font-bold tracking-wide py-1 text-[13px]">
                 {t.authSign}
              </div>
           </div>

           {/* Right Bank */}
           <div className="flex flex-col font-medium">
              <div className="grid grid-cols-[130px_1fr] border-b border-black">
                 <div className="p-1 font-bold uppercase border-r border-black">{t.bankName}</div>
                 <div className="p-1 uppercase text-[11px] leading-tight flex items-center">{bankInfo?.bankName || "-"}</div>
              </div>
              <div className="border-b border-black flex flex-col h-[40px] justify-center">
                 <div className="grid grid-cols-[130px_1fr]">
                    <div className="p-1 font-bold uppercase border-r border-black">{t.branchNameNo}</div>
                    <div className="p-1 uppercase text-[11px] leading-tight flex items-center">{bankInfo?.branch || "-"}</div>
                 </div>
              </div>
              <div className="grid grid-cols-[130px_1fr_40px] border-b border-black">
                 <div className="p-1 font-bold uppercase border-r border-black">{t.accountNo}</div>
                 <div className="p-1 uppercase border-r border-black font-bold tracking-wider">{bankInfo?.accountNo || "-"}</div>
                 <div className="p-1 font-bold text-center flex items-center justify-center">{order.currency}</div>
              </div>
              <div className="grid grid-cols-[130px_1fr] border-b border-black">
                 <div className="p-1 font-bold uppercase border-r border-black">{t.swiftCode}</div>
                 <div className="p-1 uppercase font-bold tracking-wider flex items-center">{bankInfo?.swift || "-"}</div>
              </div>
              <div className="grid grid-cols-[130px_1fr] border-b border-black">
                 <div className="p-1 font-bold uppercase border-r border-black">{t.ibanNo}</div>
                 <div className="p-1 font-bold tracking-tighter uppercase text-[11px] flex items-center">{bankInfo?.iban || "-"}</div>
              </div>
              
              {/* Origin Section exactly like screenshot */}
              <div className="font-bold text-center uppercase border-b border-black py-1">
                {t.originDecl}
              </div>
              <div className="p-2 text-[11px] text-justify leading-snug">
                {t.originPreferential}
              </div>
           </div>
        </div>

        {/* BOTTOM STAMPS */}
        <div className="w-full flex justify-between px-10 pt-4 pb-20 relative min-h-[160px]">
            {/* Kaşe Resmi Dinamik */}
           <div className="w-1/2 flex justify-start -ml-6 -mt-3">
              {isSigned && (
                 isUSKM ? (
                   <img src="/images/USKM-Kase-Imza.png" alt="Stamp" className="w-[300px] object-contain opacity-90 mix-blend-multiply filter contrast-125 sepia-[0.3]" />
                 ) : isUSKT ? (
                   <img src="/images/USKT-Kase-Imza.png" alt="Stamp" className="w-[300px] object-contain opacity-90 mix-blend-multiply filter contrast-125 sepia-[0.3]" />
                 ) : sellerName.includes("DEFENNİ") || sellerName.includes("DEFENNI") ? (
                    <img src="/defenni-logo.png" alt="Stamp" className="w-[300px] object-contain opacity-90 mix-blend-multiply grayscale" />
                 ) : (
                    <div className="font-bold border px-10 py-6 uppercase bg-slate-50 text-slate-400 border-slate-300 transform -rotate-6">STAMP</div>
                 )
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
