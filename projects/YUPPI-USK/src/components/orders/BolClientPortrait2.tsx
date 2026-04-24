"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BolClientPortrait22({
  invoice,
  firstOrder,
  seller,
  productDesign,
  productSpecs,
  dueDate,
  grossKg,
  netKg,
  rollCount,
  sackCount,
  totalAmount,
  totalQuantity,
  currency,
  unit,
  invoiceNo
}: any) {
  const [isEng, setIsEng] = useState(true);
  const [isSigned, setIsSigned] = useState(false);
  const pathname = usePathname();

  const extractContact = (companyObj: any, orderRepName?: string) => {
    let contactName = "";
    let phone = "";
    let email = "";
    if (companyObj?.repsJson) {
       try {
           const reps = JSON.parse(companyObj.repsJson);
           if (reps && reps.length > 0) {
              let found = reps[0];
              if (orderRepName) {
                 const nameToMatch = orderRepName.includes('|') ? orderRepName.split('|')[0].trim().toLocaleUpperCase('tr-TR') : orderRepName.trim().toLocaleUpperCase('tr-TR');
                 const matched = reps.find((r: any) => {
                     const raw = r.name || "";
                     const n = raw.includes('|') ? raw.split('|')[0] : raw;
                     return n.trim().toLocaleUpperCase('tr-TR') === nameToMatch;
                 });
                 if (matched) found = matched;
              }
              contactName = found.name || "";
              if (contactName.includes('|')) {
                  contactName = isEng ? (contactName.split('|')[1]?.trim() || contactName.split('|')[0].trim()) : contactName.split('|')[0].trim();
              }
              phone = found.phone || "";
              email = found.email || "";
           }
       } catch(e) {}
    }
    return { contactName, phone, email };
  };

  const deliveryContact = extractContact(firstOrder?.shipTo || invoice?.buyer, firstOrder?.shipTo ? undefined : firstOrder?.buyerRep);
  const buyerContact = extractContact(invoice?.buyer, firstOrder?.buyerRep);
  const customContact = extractContact(invoice?.customsCompany);
  const transporterContact = extractContact(invoice?.logisticsCompany);

  const t = {
    sellerTitle: isEng ? "SELLER" : "İHRACATÇI FİRMA",
    buyerTitle: isEng ? "BUYER" : "İTHALATÇI FİRMA",
    deliveryTitle: isEng ? "DELIVERY ADDRESS" : "SEVK ADRESİ",
    documentTitle: isEng ? "BILL OF\nLADING INSTRUCTION" : "KONŞİMENTO\nTALİMATNAMESİ",
    invoiceNo: isEng ? "INVOICE NO" : "FATURA NO",
    invoiceDate: isEng ? "INVOICE DATE" : "FATURA TARİHİ",
    customerPo: isEng ? "BUYER ORDER NO" : "ALICI SİPARİŞ NO",
    transporterComp: isEng ? "TRANSPORTER COMPANY" : "NAKLİYE FİRMASI",
    customAgency: isEng ? "CUSTOM AGENCY" : "GÜMRÜK MÜŞAVİRLİĞİ",
    typesOfGoods: isEng ? "TYPES OF GOODS" : "ÜRÜN CİNSİ",
    gtypeNo: isEng ? "GTYPE NO" : "GTİP NO",
    goodsSpc: isEng ? "GOODS SPC." : "KUMAŞ DETAYI",
    paymentTerms: isEng ? "PAYMENT TERMS" : "ÖDEME ŞEKLİ",
    dueDate: isEng ? "DUE DATE" : "VADE TARİHİ",
    deliveryTerms: isEng ? "DELIVERY TERMS" : "TESLİMAT ŞEKLİ",
    totalQuantity: isEng ? "TOTAL QUANTITY" : "TOPLAM MİKTAR",
    totalAmount: isEng ? "TOTAL AMOUNT OF INVOICE" : "FATURA TOPLAM TUTARI",
    totalGrossKg: isEng ? "TOTAL GROSS KG" : "TOPLAM BRÜT KG",
    nofRolls: isEng ? "N. OF ROLLS" : "TOP SAYISI",
    totalNetKg: isEng ? "TOTAL NET KG" : "TOPLAM NET KG",
    nofSacks: isEng ? "N. OF SACKS" : "ÇUVAL SAYISI",
    manufacturer: isEng ? "MANUFACTURER COMPANY" : "ÜRETİCİ FİRMA",
    documentsNeeds: isEng ? "DOCUMENTS NEEDS" : "GEREKLİ BELGELER",
    notes: isEng ? "NOTES" : "NOTLAR",
    turkishOrigin: isEng ? "THE GOODS ARE OF TURKISH ORIGIN" : "MALLAR TÜRK MENŞELİDİR"
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
      <div className="flex justify-between items-center mb-6 print:hidden w-full max-w-[794px]">
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
          <div className="flex bg-slate-200 p-1 rounded items-center gap-1 mr-2">
             <Link href={`/invoices/${invoice.id}/bol?format=1`} className="px-3 py-1 text-sm font-bold rounded text-slate-500 hover:text-slate-700">Format 1</Link>
             <Link href={`/invoices/${invoice.id}/bol?format=2`} className="px-3 py-1 text-sm font-bold rounded bg-white text-indigo-700 shadow-sm">Format 2</Link>
          </div>
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

      <div className="bg-white shadow-2xl print:shadow-none flex justify-center py-6 print:py-0 w-[794px]">
        <div className="w-[794px] shrink-0 bg-white text-black font-['Arial',_'Helvetica',_sans-serif] text-[11px] leading-tight border border-black relative box-border">
          
          {/* ROW 1 */}
          <div className="grid grid-cols-[315px_315px_158px] border-b border-black">
            {/* 1. SELLER */}
            <div className="border-r border-black p-2 flex flex-col h-[135px]">
               <div className="font-bold underline uppercase mb-0.5 text-[11px]">{t.sellerTitle}</div>
               <div className="font-bold uppercase text-[11px]">{isEng && seller?.nameEn ? seller?.nameEn : (seller?.name || "USK TEKSTİL SANAYİ VE TİCARET LİMİTED ŞİRKETİ")}</div>
               <div className="uppercase whitespace-pre-wrap leading-snug">
                 {isEng && seller?.addressEn ? seller?.addressEn : (seller?.address || "DEMİRTAŞ DUMLUPINAR OSB., MUSTAFA KARAER CD., NO:49/2,")}
                 <br />
                 {(isEng && seller?.districtEn ? seller?.districtEn : seller?.district) || ""} {(isEng && seller?.cityEn ? seller?.cityEn : seller?.city) || "OSMANGAZİ, BURSA"}, {(isEng && seller?.countryEn ? seller?.countryEn : seller?.country) || "TÜRKİYE"}
               </div>
               <div className="mt-1 flex flex-col uppercase">
                  {(seller?.taxNo || seller?.taxOffice || seller?.registrationNo) && (
                    <div>
                      {seller?.taxOffice ? seller?.taxOffice + (isEng ? " TAX OFFICE" : " VD.") : ""} {seller?.taxNo ? seller?.taxNo : ""} / {isEng ? "REG NO " : "TİC.SİC.NO "}{seller?.registrationNo || "40640"}
                    </div>
                  )}
                  <div>T. {seller?.phone || "+90 224 261 21 00"}</div>
               </div>
            </div>
            
            {/* 2. TITLE */}
            <div className="border-r border-black p-2 flex justify-center items-center h-[135px]">
              <h1 className="text-[#d81e1e] font-sans font-bold text-[30px] text-center leading-tight tracking-wider uppercase whitespace-pre-wrap">
                {t.documentTitle}
              </h1>
            </div>

            {/* 3. LOGO */}
            <div className="p-2 flex justify-center items-center h-[135px] relative">
              {(() => {
                 const sellerN = (seller?.name || "USK TEKSTİL").toUpperCase();
                 const isM = sellerN.includes("MENSUCAT") || sellerN.includes("USKM");
                 const isT = sellerN.includes("TEKSTİL") || sellerN.includes("TEKSTIL") || sellerN.includes("USKT");
                 if (isM) return <img src="/images/Defenni-M-Kirmizi.jpg" alt="Logo" className="max-h-[84px] max-w-[188px] object-contain mix-blend-multiply" />;
                 if (isT) return <img src="/images/Defenni-T-Kirmizi.jpg" alt="Logo" className="max-h-[84px] max-w-[188px] object-contain mix-blend-multiply" />;
                 if (sellerN.includes("DEFENNİ") || sellerN.includes("DEFENNI")) return <img src="/defenni-logo.png" alt="Logo" className="max-h-[84px] max-w-[188px] object-contain mix-blend-multiply" />;
                 return <div className="text-xl font-bold text-slate-300">{sellerN.split(' ')[0]}</div>;
              })()}
            </div>
          </div>

          {/* ROW 2 */}
          <div className="grid grid-cols-[315px_315px_158px] border-b border-black">
            {/* 1. BUYER */}
            <div className="border-r border-black p-2 flex flex-col h-[135px] leading-snug">
               <div className="font-bold underline uppercase mb-0.5 text-[11px]">{t.buyerTitle}</div>
               <div className="font-bold uppercase text-[11px]">{isEng && invoice.buyer?.nameEn ? invoice.buyer?.nameEn : (invoice.buyer?.name || "-")}</div>
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
                      {isEng ? (
                        [
                          invoice.buyer?.taxNo && `VAT NO. ${invoice.buyer?.taxNo} ${invoice.buyer?.taxOfficeEn || invoice.buyer?.taxOffice || ""}`.trim(),
                          invoice.buyer?.registrationNo && `TRD. REG.NO. ${invoice.buyer?.registrationNo}`
                        ].filter(Boolean).join(' / ')
                      ) : (
                        [
                          invoice.buyer?.taxNo && `${invoice.buyer?.taxOffice ? invoice.buyer?.taxOffice + " VD." : ""} ${invoice.buyer?.taxNo}`.trim(),
                          invoice.buyer?.registrationNo && `TİC. SİC. NO ${invoice.buyer?.registrationNo}`
                        ].filter(Boolean).join(' / ')
                      )}
                    </div>
                  )}
                  {buyerContact.contactName && <div>CONTACT PERSON. {buyerContact.contactName}</div>}
                  {(buyerContact.phone || buyerContact.email) && (
                    <div className="normal-case">
                      {[
                        buyerContact.phone ? `${isEng ? 'P.' : 'T.'} ${buyerContact.phone}` : null,
                        buyerContact.email ? `E. ${buyerContact.email}` : null
                      ].filter(Boolean).join(' / ')}
                    </div>
                  )}
               </div>
            </div>
            
            {/* 2. DELIVERY ADDRESS */}
            <div className="border-r border-black p-2 flex flex-col h-[135px] leading-snug">
                <div className="font-bold underline uppercase mb-0.5 text-[11px]">{t.deliveryTitle}</div>
                <div className="font-bold uppercase text-[11px]">{firstOrder?.shipTo ? ((isEng && firstOrder.shipTo.nameEn) ? firstOrder.shipTo.nameEn : firstOrder.shipTo.name) : ((isEng && invoice.buyer?.nameEn) ? invoice.buyer?.nameEn : (invoice.buyer?.name || "-"))}</div>
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
                  {deliveryContact.contactName && <div>CONTACT PERSON. {deliveryContact.contactName}</div>}
                  {(deliveryContact.phone || deliveryContact.email) && (
                    <div className="normal-case">
                      {[
                        deliveryContact.phone ? `${isEng ? 'P.' : 'T.'} ${deliveryContact.phone}` : null,
                        deliveryContact.email ? `E. ${deliveryContact.email}` : null
                      ].filter(Boolean).join(' / ')}
                    </div>
                  )}
                </div>
            </div>
            
            {/* 3. INVOICE INFO */}
            <div className="flex flex-col h-[135px]">
                <div className="h-[45px] border-b border-black flex flex-col justify-center px-4 leading-snug">
                    <div className="font-bold uppercase text-[11px] mb-0.5">{t.invoiceNo}</div>
                    <div className="text-[11px]">{invoiceNo}</div>
                </div>
                <div className="h-[45px] border-b border-black flex flex-col justify-center px-4 leading-snug">
                    <div className="font-bold uppercase text-[11px] mb-0.5">{t.invoiceDate}</div>
                    <div className="text-[11px]">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('tr-TR') : "-"}</div>
                </div>
                <div className="h-[45px] flex flex-col justify-center px-4 leading-snug">
                    <div className="font-bold uppercase text-[11px] mb-0.5">{t.customerPo}</div>
                    <div className="text-[11px] uppercase">{Array.from(new Set(invoice.items.map((i: any) => i.orderItem.order.buyerPoNo).filter(Boolean))).join(', ') || "-"}</div>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-[315px_1fr] border-b border-black min-h-[90px]">
            {/* TRANSPORTER COMPANY */}
            <div className="p-2 border-r border-black relative">
               <div className="font-bold underline uppercase mb-1 text-[11px]">{t.transporterComp}</div>
               <div className="font-bold uppercase text-[11px]">{invoice.logisticsCompany?.name || firstOrder?.transporter || "-"}</div>
               <div className="uppercase">{invoice.logisticsCompany?.address || "MASLAK MH, BUYUKDERE CD., NO.255"}</div>
               <div className="uppercase">{invoice.logisticsCompany?.city || "ISTANBUL, TURKIYE"}</div>
               <div className="mt-1 flex flex-col uppercase">
                  {transporterContact.contactName && <div>CONTACT PERSON. {transporterContact.contactName}</div>}
                  {(transporterContact.phone || transporterContact.email) ? (
                    <div className="normal-case font-bold text-purple-800 underline">
                      {[
                        transporterContact.phone ? `${isEng ? 'P.' : 'T.'} ${transporterContact.phone}` : null,
                        transporterContact.email ? `E. ${transporterContact.email}` : null
                      ].filter(Boolean).join(' / ')}
                    </div>
                  ) : (
                    <div className="text-purple-800 font-bold underline block mt-1 uppercase">alper.gundogdu@dachser.com / P. +90 549 6630551</div>
                  )}
               </div>
            </div>

            {/* CUSTOM AGENCY */}
            <div className="p-2 relative border-b-0 border-black">
               <div className="font-bold underline uppercase mb-1 text-[11px]">{t.customAgency}</div>
               <div className="uppercase text-[11px]">{invoice.customsCompany?.name || "HGL GUMRUK MUSAVIRLIGI LOJ. VE DIS TICARET A.S."}</div>
               <div className="uppercase">{invoice.customsCompany?.address || "BEYLIKDUZU MERMERCILER OSB MH., 7. CD., NO.4, K.2"}</div>
               <div className="uppercase">{invoice.customsCompany?.city || "BEYLIKDUZU, 34524, ISTANBUL, TURKIYE"}</div>
               <div className="mt-1 flex flex-col uppercase">
                  {customContact.contactName && <div>CONTACT PERSON. {customContact.contactName}</div>}
                  {(customContact.phone || customContact.email) ? (
                    <div className="normal-case font-bold text-purple-800 underline">
                      {[
                        customContact.phone ? `${isEng ? 'P.' : 'T.'} ${customContact.phone}` : null,
                        customContact.email ? `E. ${customContact.email}` : null
                      ].filter(Boolean).join(' / ')}
                    </div>
                  ) : (
                    <>
                       <div className="uppercase">PHONE. +90 212 8757700 - 304</div>
                       <div className="text-purple-800 font-bold underline uppercase">ergun.kadir@hgl.com.tr</div>
                    </>
                  )}
               </div>
            </div>
          </div>

          {/* DETAILS GRID */}
          <div className="grid grid-cols-[238px_1fr] border-b border-black font-bold uppercase text-[11px] leading-tight">
             <div className="p-1 px-2 border-r border-black border-b flex items-center">{t.typesOfGoods}</div>
             <div className="p-1 px-2 border-b border-black font-normal flex items-center">{productDesign}</div>

             <div className="p-1 px-2 border-r border-black border-b flex items-center">{t.gtypeNo}</div>
             <div className="border-b border-black grid grid-cols-[1fr_158px_1fr]">
                <div className="p-1 px-2 border-r border-black font-normal flex items-center">{invoice.items[0]?.orderItem.composition?.includes('5407') ? '5407.61.90.90.19' : '5407.61.90.90.19'}</div>
                <div className="p-1 px-2 border-r border-black flex items-center">{t.goodsSpc}</div>
                <div className="p-1 px-2 font-normal text-[11px] leading-tight flex items-center break-words">{productSpecs}</div>
             </div>

             <div className="p-1 px-2 border-r border-black border-b flex items-center">{t.paymentTerms}</div>
             <div className="border-b border-black grid grid-cols-[1fr_158px_1fr]">
                <div className="p-1 px-2 border-r border-black font-normal flex items-center">
                   {(() => {
                      const pt = firstOrder?.paymentTerms || "90 DAYS NET";
                      return pt.includes('|') ? (isEng ? pt.split('|')[1].trim() : pt.split('|')[0].trim()) : pt;
                   })()}
                </div>
                <div className="p-1 px-2 border-r border-black flex items-center">{t.dueDate}</div>
                <div className="p-1 px-2 font-normal flex items-center">{dueDate}</div>
             </div>
             
             <div className="p-1 px-2 border-r border-black border-b flex items-center">{t.deliveryTerms}</div>
             <div className="p-1 px-2 border-b border-black font-normal flex items-center">
                 {(() => {
                    const dt = `${firstOrder?.deliveryTerms || "-"} ${firstOrder?.deliveryDestination || ""}`.trim();
                    return dt.includes('|') ? (isEng ? dt.split('|')[1].trim() : dt.split('|')[0].trim()) : dt;
                 })()}
             </div>

             <div className="p-1 px-2 border-r border-black border-b flex items-center">{t.totalQuantity}</div>
             <div className="border-b border-black grid grid-cols-[1fr_1fr]">
                <div className="p-1 px-2 border-r border-black text-right pr-6 tracking-wider font-normal flex items-center justify-end">{totalQuantity.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="p-1 px-4 font-normal flex items-center">{unit}</div>
             </div>

             <div className="p-1 px-2 border-r border-black border-b flex items-center">{t.totalAmount}</div>
             <div className="border-b border-black grid grid-cols-[1fr_1fr]">
                <div className="p-1 px-2 border-r border-black text-right pr-6 tracking-wider font-normal flex items-center justify-end">{totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="p-1 px-4 font-normal flex items-center">{currency}</div>
             </div>

             <div className="p-1 px-2 border-r border-black border-b flex items-center">{t.totalGrossKg}</div>
             <div className="border-b border-black grid grid-cols-[1fr_64px_158px_1fr]">
                <div className="p-1 px-2 border-r border-black text-right pr-6 tracking-wider font-normal flex items-center justify-end">{grossKg ? grossKg.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"}</div>
                <div className="p-1 px-2 border-r border-black font-normal flex items-center">KG</div>
                <div className="p-1 px-2 border-r border-black flex items-center">{t.nofRolls}</div>
                <div className="p-1 px-2 text-center font-normal flex items-center justify-center">{rollCount || "-"}</div>
             </div>

             <div className="p-1 px-2 border-r border-black border-b flex items-center">{t.totalNetKg}</div>
             <div className="border-b border-black grid grid-cols-[1fr_64px_158px_1fr]">
                <div className="p-1 px-2 border-r border-black text-right pr-6 tracking-wider font-normal flex items-center justify-end">{netKg ? netKg.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"}</div>
                <div className="p-1 px-2 border-r border-black font-normal flex items-center">KG</div>
                <div className="p-1 px-2 border-r border-black text-[11px] flex items-center">{t.nofSacks}</div>
                <div className="p-1 px-2 text-center font-normal flex items-center justify-center">{sackCount || "-"}</div>
             </div>
             
             <div className="p-1 px-2 border-r border-black flex items-center">{t.manufacturer}</div>
             <div className="p-1 px-2 text-center font-normal flex items-center justify-center">{isEng && seller?.nameEn ? seller?.nameEn : (seller?.name || "U.S.K. TEKSTIL SANAYI VE TICARET LIMITED SIRKETI")}</div>
          </div>

          {/* BOTTOM NOTES */}
          <div className="grid grid-cols-[238px_1fr] border-b border-black font-bold uppercase text-[11px] leading-tight">
             <div className="p-1 px-2 border-r border-black border-b flex items-center">{t.documentsNeeds}</div>
             <div className="p-1 px-2 border-b border-black font-normal flex items-center">EUR 1</div>

             <div className="p-1 px-2 border-r border-black min-h-[40px] flex items-center">{t.notes}</div>
             <div className="p-1 px-2 font-normal min-h-[40px] flex items-center">IN ALL DOCUMENTS, GOODS NAME AND SPECSIFICATIONS WILL BE SAME</div>
          </div>

          <div className="text-center font-bold text-[11px] uppercase tracking-wider p-3 relative min-h-[65px]">
             <div className="relative z-10 bg-white inline-block px-2">{t.turkishOrigin}</div>
             
             {isSigned && (() => {
                  const sellerN = (isEng && seller?.nameEn ? seller?.nameEn : (seller?.name || "USK TEKSTİL")).toUpperCase();
                  const isUSKM = sellerN.includes("MENSUCAT") || sellerN.includes("USKM");
                  const isUSKT = sellerN.includes("TEKSTİL") || sellerN.includes("TEKSTIL") || sellerN.includes("USKT");
                  return (
                    <div className="absolute top-[1px] left-10 flex justify-center items-center opacity-90 z-0 pointer-events-none overflow-visible">
                      {isUSKM ? (
                         <img src="/images/USKM-Kase-Imza.png" alt="Stamp" className="w-[240px] h-auto object-contain mix-blend-multiply filter contrast-125 sepia-[0.3]" />
                      ) : isUSKT ? (
                         <img src="/images/USKT-Kase-Imza.png" alt="Stamp" className="w-[240px] h-auto object-contain mix-blend-multiply filter contrast-125 sepia-[0.3]" />
                      ) : (
                         <div className="font-bold border px-10 py-6 uppercase bg-slate-50 text-slate-400 border-slate-300 transform -rotate-6">STAMP</div>
                      )}
                    </div>
                  );
             })()}
          </div>
        </div>
      </div>
    </div>
  );
}

