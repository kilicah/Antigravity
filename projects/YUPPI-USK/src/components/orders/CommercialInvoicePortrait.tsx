"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { numberToWords } from "@/utils/numberToWords";
import { usePathname } from "next/navigation";

export default function CommercialInvoicePortrait({ order, bankInfo, repUser }: { order: any; bankInfo: any; repUser?: any }) {
  const [isEng, setIsEng] = useState(order.language === 'ENG');
  const [isSigned, setIsSigned] = useState(false);
  const pathname = usePathname();

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
      {/* Dil Seçimi Butonları (Sadece Ekranda Görünür, Yazdırmada Gizlenir) */}
      <div className="flex justify-between items-center mb-6 print:hidden w-full max-w-[794px]">
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

      <div className="w-[794px] bg-white text-black font-['Arial',_'Helvetica',_sans-serif] text-[11px] leading-tight border-2 border-black relative">
        
        {/* ROW 1 */}
        <div className="grid grid-cols-[318px_318px_158px] border-b-2 border-black">
          {/* 1. SELLER TITLE (401px x 135px) */}
          <div className="border-r-2 border-black p-2 flex flex-col h-[135px]">
             <div className="font-bold underline uppercase mb-0.5 text-[12px]">{t.sellerTitle}</div>
             <div className="font-bold uppercase text-[11px]">{isEng && order.seller.nameEn ? order.seller.nameEn : order.seller.name}</div>
             <div className="uppercase whitespace-pre-wrap leading-snug">
               {isEng && order.seller.addressEn ? order.seller.addressEn : order.seller.address}
               {(() => {
                 const d = isEng && order.seller.districtEn ? order.seller.districtEn : order.seller.district;
                 const c = isEng && order.seller.cityEn ? order.seller.cityEn : order.seller.city;
                 const cntry = isEng && order.seller.countryEn ? order.seller.countryEn : order.seller.country;
                 const zip = order.seller.zipCode;
                 const locArr = [d, c, cntry].filter(Boolean);
                 const locStr = locArr.join(', ');
                 return (locStr || zip) ? `\n${locStr}${locStr && zip ? ' ' : ''}${zip || ''}` : '';
               })()}
             </div>
              <div className="mt-1 flex flex-col uppercase">
                {/* Tax & Registration Line */}
                {(order.seller.taxNo || order.seller.taxOffice || order.seller.registrationNo) && (
                  <div>
                    {isEng ? (
                      [
                        order.seller.taxNo && `VAT NO. ${order.seller.taxNo} ${order.seller.taxOfficeEn || order.seller.taxOffice || ""}`.trim(),
                        order.seller.registrationNo && `TRD. REG.NO. ${order.seller.registrationNo}`
                      ].filter(Boolean).join(' / ')
                    ) : (
                      [
                        order.seller.taxNo && `${order.seller.taxOffice ? order.seller.taxOffice + " VD." : ""} ${order.seller.taxNo}`.trim(),
                        order.seller.registrationNo && `TİC. SİC. NO ${order.seller.registrationNo}`
                      ].filter(Boolean).join(' / ')
                    )}
                  </div>
                )}
                {/* Phone Line */}
                {order.seller.phone && <div>{isEng ? 'P.' : 'T.'} {order.seller.phone}</div>}
              </div>
          </div>
          
          {/* 2. COMMERCIAL INVOICE (401px x 135px) */}
          <div className="border-r-2 border-black p-2 flex justify-center items-center h-[135px]">
              <h1 className="text-[#d81e1e] font-sans font-bold text-[36px] text-center leading-tight tracking-wider uppercase">
                {isEng ? (
                  <>COMMERCIAL<br/>INVOICE</>
                ) : (
                  <>TİCARİ<br/>FATURA</>
                )}
              </h1>
          </div>

          {/* 3. LOGO (200px x 135px) */}
          <div className="p-2 flex justify-center items-center h-[135px]">
               {isUSKM ? (
                 <img src="/images/Defenni-M-Kirmizi.jpg" alt="Logo" className="max-h-[89px] max-w-[198px] object-contain mix-blend-multiply" />
               ) : isUSKT ? (
                 <img src="/images/Defenni-T-Kirmizi.jpg" alt="Logo" className="max-h-[89px] max-w-[198px] object-contain mix-blend-multiply" />
               ) : sellerName.includes("DEFENNİ") || sellerName.includes("DEFENNI") ? (
                 <img src="/defenni-logo.png" alt="Logo" className="max-h-[89px] max-w-[198px] object-contain mix-blend-multiply" />
               ) : (
                 <div className="text-xl font-bold text-slate-300">{order.seller.name.split(' ')[0]}</div>
               )}
          </div>
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-[318px_318px_158px] border-b-2 border-black">
          {/* 1. CUSTOMER TITLE (401px x 135px) */}
          <div className="border-r-2 border-black p-2 flex flex-col h-[135px] leading-snug">
             <div className="font-bold underline uppercase mb-0.5 text-[12px]">{t.customerTitle}</div>
             <div className="font-bold uppercase text-[11px]">{isEng && order.buyer.nameEn ? order.buyer.nameEn : order.buyer.name}</div>
             <div className="uppercase whitespace-pre-wrap">
               {isEng && order.buyer.addressEn ? order.buyer.addressEn : order.buyer.address}
               {(() => {
                 const d = isEng && order.buyer.districtEn ? order.buyer.districtEn : order.buyer.district;
                 const c = isEng && order.buyer.cityEn ? order.buyer.cityEn : order.buyer.city;
                 const cntry = isEng && order.buyer.countryEn ? order.buyer.countryEn : order.buyer.country;
                 const zip = order.buyer.zipCode;
                 const locArr = [d, c, cntry].filter(Boolean);
                 const locStr = locArr.join(', ');
                 return (locStr || zip) ? `\n${locStr}${locStr && zip ? ' ' : ''}${zip || ''}` : '';
               })()}
             </div>
             <div className="mt-1 flex flex-col uppercase">
                {(order.buyer.taxNo || order.buyer.taxOffice || order.buyer.registrationNo) && (
                  <div>
                    {isEng ? (
                      [
                        order.buyer.taxNo && `VAT NO. ${order.buyer.taxNo} ${order.buyer.taxOfficeEn || order.buyer.taxOffice || ""}`.trim(),
                        order.buyer.registrationNo && `TRD. REG.NO. ${order.buyer.registrationNo}`
                      ].filter(Boolean).join(' / ')
                    ) : (
                      [
                        order.buyer.taxNo && `${order.buyer.taxOffice ? order.buyer.taxOffice + " VD." : ""} ${order.buyer.taxNo}`.trim(),
                        order.buyer.registrationNo && `TİC. SİC. NO ${order.buyer.registrationNo}`
                      ].filter(Boolean).join(' / ')
                    )}
                  </div>
                )}
                {order.buyer.phone && <div>{isEng ? 'P.' : 'T.'} {order.buyer.phone}</div>}
             </div>
          </div>
          
          {/* 2. DELIVERY ADDRESS (401px x 135px) */}
          <div className="border-r-2 border-black p-2 flex flex-col h-[135px] leading-snug">
              <div className="font-bold underline uppercase mb-0.5 text-[12px]">{t.deliveryTitle}</div>
              {order.shipTo ? (
                <>
                  <div className="font-bold uppercase text-[11px]">{isEng && order.shipTo.nameEn ? order.shipTo.nameEn : order.shipTo.name}</div>
                  <div className="uppercase whitespace-pre-wrap">
                    {isEng && order.shipTo.addressEn ? order.shipTo.addressEn : order.shipTo.address}
                    {(() => {
                      const d = isEng && order.shipTo.districtEn ? order.shipTo.districtEn : order.shipTo.district;
                      const c = isEng && order.shipTo.cityEn ? order.shipTo.cityEn : order.shipTo.city;
                      const cntry = isEng && order.shipTo.countryEn ? order.shipTo.countryEn : order.shipTo.country;
                      const zip = order.shipTo.zipCode;
                      const locArr = [d, c, cntry].filter(Boolean);
                      const locStr = locArr.join(', ');
                      return (locStr || zip) ? `\n${locStr}${locStr && zip ? ' ' : ''}${zip || ''}` : '';
                    })()}
                  </div>
                  <div className="mt-1 flex flex-col uppercase">
                    {(order.shipTo.taxNo || order.shipTo.taxOffice || order.shipTo.registrationNo) && (
                      <div>
                        {isEng ? (
                          [
                            order.shipTo.taxNo && `VAT NO. ${order.shipTo.taxNo} ${order.shipTo.taxOfficeEn || order.shipTo.taxOffice || ""}`.trim(),
                            order.shipTo.registrationNo && `TRD. REG.NO. ${order.shipTo.registrationNo}`
                          ].filter(Boolean).join(' / ')
                        ) : (
                          [
                            order.shipTo.taxNo && `${order.shipTo.taxOffice ? order.shipTo.taxOffice + " VD." : ""} ${order.shipTo.taxNo}`.trim(),
                            order.shipTo.registrationNo && `TİC. SİC. NO ${order.shipTo.registrationNo}`
                          ].filter(Boolean).join(' / ')
                        )}
                      </div>
                    )}
                    {order.shipTo.phone && <div>{isEng ? 'P.' : 'T.'} {order.shipTo.phone}</div>}
                  </div>
                </>
              ) : (
                 <div className="font-bold text-slate-400 mt-2">SAME AS BUYER</div>
              )}
          </div>
          
          {/* 3. DOCS INFO (200px x 135px) */}
          <div className="flex flex-col h-[135px]">
              {/* Fatura No (45px) */}
              <div className="h-[45px] border-b border-black flex flex-col justify-center px-4 leading-snug">
                  <div className="font-bold uppercase text-[12px] mb-0.5">{t.invoiceNo}</div>
                  <div className="text-[11px]">{order.invoice?.invoiceNo || "-"}</div>
              </div>
              
              {/* Tarihi (45px) */}
              <div className="h-[45px] border-b border-black flex flex-col justify-center px-4 leading-snug">
                  <div className="font-bold uppercase text-[12px] mb-0.5">{t.invoiceDate}</div>
                  <div className="text-[11px]">{order.invoice?.invoiceDate ? new Date(order.invoice.invoiceDate).toLocaleDateString('tr-TR') : "-"}</div>
              </div>
              
              {/* PO Alanı (45px) */}
              <div className="h-[45px] flex flex-col justify-center px-4 leading-snug">
                  <div className="font-bold uppercase text-[12px] mb-0.5">{t.customerPo}</div>
                  <div className="text-[11px] uppercase">{order.buyerPoNo || "-"}</div>
              </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="w-full">
          <table className="w-full text-center table-fixed border-collapse">
            <thead>
              <tr className="border-b-2 border-black font-bold uppercase text-[11px] leading-tight">
                <th className="py-2 px-1 w-[115px]">{t.typeOfGoods}</th>
                <th className="py-2 px-1 w-[105px]">{t.articleName}</th>
                <th className="py-2 px-1 w-[85px]">{t.articleCode}</th>
                <th className="py-2 px-1 w-[75px]">{t.colorCode}</th>
                <th className="py-2 px-1 w-[125px]">{t.composition}</th>
                <th className="py-2 px-1 w-[70px]">{t.priceUsd}</th>
                <th className="py-2 px-1 w-[95px] text-right">{t.quantity} <span className="ml-1">{order.unit}</span></th>
                <th className="py-2 px-1 w-[105px] text-right pr-2">{t.totalAmount}</th>
              </tr>
            </thead>
            <tbody>
              {/* Padding map for perfect top spacing */}
              <tr><td colSpan={8} className="h-2"></td></tr>
              
              {order.items.map((item: any) => (
                <tr key={item.id} className="uppercase align-top leading-snug">
                  <td className="px-1 pb-2">
                    <div>{item.typeOfGoods ? `${item.typeOfGoods} ` : ''}{item.width ? `${item.width}CM ` : ''}{item.weight ? `/ ${item.weight}${/^[0-9.,]+$/.test(item.weight.toString().trim()) ? ' GR/M2' : ''}` : ''}</div>
                  </td>
                  <td className="px-1 pb-2 break-words text-center font-bold">
                     <span className="font-normal">{item.qualityName || "-"}</span>{item.buyerModelName ? ` (${item.buyerModelName})` : ""}
                  </td>
                  <td className="px-1 pb-2 break-words">{item.qualityCode || "-"}</td>
                  <td className="px-1 pb-2 break-words text-center">{item.colorCode || "-"}</td>
                  <td className="px-1 pb-2 break-words">{item.composition || "-"}</td>
                  <td className="px-1 pb-2">{item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency}</td>
                  <td className="px-1 pb-2 text-right">{item.quantity.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.unit}</td>
                  <td className="px-1 pb-2 text-right pr-2">{item.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency}</td>
                </tr>
              ))}
              
              {/* Removing forced height empty row to let table grow dynamically with natural padding */}
              <tr className="h-2"><td colSpan={8}></td></tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-black text-[11px]">
                 <td colSpan={4} className="p-1 uppercase border-r border-black text-left align-middle">
                    {t.madeInDecl}
                 </td>
                 <td colSpan={2} className="p-1 text-right font-bold uppercase border-r border-black align-middle pr-2">
                    {t.grandTotals}
                 </td>
                 <td className="p-1 text-right font-bold align-middle">
                    {totalQuantity.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.unit}
                 </td>
                 <td className="p-1 text-right font-bold align-middle pr-2">
                    {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency}
                 </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* AMOUNT IN WORDS */}
        <div className="border-t-2 border-b-2 border-black py-2 px-1 flex items-center">
           <div className="uppercase">
              <span className="font-bold mr-2">{t.amountInWords}</span>
              <span>{numberToWords(totalAmount, order.currency, isEng ? "ENG" : "TR")}</span>
           </div>
        </div>

        {/* DETAILS & BANK FOOTER */}
        <div className="grid grid-cols-[450px_1fr] border-b-2 border-black">
           {/* Left details */}
           <div className="border-r-2 border-black flex flex-col">
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
                   <div className="flex-1 p-1 text-right pr-4 text-[11px]">{order.invoice?.grossKg?.toLocaleString('tr-TR') || "-"}</div>
                 </div>
                 <div className="flex flex-1">
                   <div className="w-[140px] p-1 font-bold uppercase border-r border-black pl-2 flex items-center">{t.numberRolls}</div>
                   <div className="flex-1 p-1 text-right pr-2 text-[11px]">{order.invoice?.rollCount || "-"}</div>
                 </div>
              </div>
              <div className="flex w-full divide-x divide-black border-b border-black">
                 <div className="flex flex-1">
                   <div className="w-[150px] p-1 font-bold uppercase border-r border-black flex items-center">{t.totalNetKg}</div>
                   <div className="flex-1 p-1 text-right pr-4 text-[11px]">{order.invoice?.netKg?.toLocaleString('tr-TR') || "-"}</div>
                 </div>
                 <div className="flex flex-1">
                   <div className="w-[140px] p-1 font-bold uppercase border-r border-black pl-2 flex items-center">{t.numberSacks}</div>
                   <div className="flex-1 p-1 text-right pr-2 text-[11px]">{order.invoice?.sackCount || "-"}</div>
                 </div>
              </div>
              
              {/* This flex-1 div absorbs all remaining height securely, preventing rows above from stretching vertically */}
              <div className="flex-1 bg-white min-h-[50px]"></div>

              <div className="border-t-2 border-black uppercase bg-white flex items-center justify-center font-bold tracking-wide py-2 text-[12px] mt-auto">
                 {t.authSign}
              </div>
           </div>

           {/* Right Bank */}
           <div className="flex flex-col">
              <div className="grid grid-cols-[130px_1fr] border-b border-black">
                 <div className="p-1 font-bold uppercase border-r border-black">{t.bankName}</div>
                 <div className="p-1 uppercase text-[11px] leading-tight flex items-center">{bankInfo?.bankName || "-"}</div>
              </div>
              <div className="grid grid-cols-[130px_1fr] border-b border-black">
                 <div className="p-1 font-bold uppercase border-r border-black">{t.branchNameNo}</div>
                 <div className="p-1 uppercase text-[11px] leading-tight flex items-center">{bankInfo?.branch || "-"}</div>
              </div>
              <div className="grid grid-cols-[130px_1fr_40px] border-b border-black">
                 <div className="p-1 font-bold uppercase border-r border-black">{t.accountNo}</div>
                 <div className="p-1 uppercase text-[11px] leading-tight border-r border-black flex items-center">{bankInfo?.accountNo || "-"}</div>
                 <div className="p-1 font-bold uppercase text-[11px] leading-tight text-center flex items-center justify-center">{order.currency}</div>
              </div>
              <div className="grid grid-cols-[130px_1fr] border-b border-black">
                 <div className="p-1 font-bold uppercase border-r border-black">{t.swiftCode}</div>
                 <div className="p-1 uppercase text-[11px] leading-tight flex items-center">{bankInfo?.swift || "-"}</div>
              </div>
              <div className="grid grid-cols-[130px_1fr] border-b border-black">
                 <div className="p-1 font-bold uppercase border-r border-black">{t.ibanNo}</div>
                 <div className="p-1 uppercase text-[11px] leading-tight flex items-center">{bankInfo?.iban || "-"}</div>
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
        <div className="w-full flex justify-between px-10 py-2 relative">
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

