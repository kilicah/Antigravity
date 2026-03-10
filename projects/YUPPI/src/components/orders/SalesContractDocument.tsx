"use client";

import React from "react";
import Image from "next/image";
import PrintButton from "@/components/PrintButton";

export default function SalesContractDocument({
  order,
  bankInfo,
  isEng,
  displayPaymentTerms,
  displayDeliveryTerms
}: any) {
  const totalQuantity = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const totalAmount = order.items.reduce((sum: number, item: any) => sum + item.totalAmount, 0);

  const trTerms = [
    "1) İşbu satış sözleşmesi, yukarıda unvanları belirtilen 'Satıcı Firma' ve 'Alıcı Firma' arasında resmi iletişim kanalları (e-posta vb.) aracılığıyla yapılmaktadır.",
    "2) Sözleşmede yer alan ürün fiyatlarına Katma Değer Vergisi (KDV) dahil değildir.",
    "3) Tüm satışlar depo teslimi şeklindedir. Aksi sözleşmede belirtilmediği sürece nakliye hizmeti fiyata dahil değildir. Sevkiyat ve taşıma sırasında oluşabilecek her türlü hasar ve kayıp Alıcı Firma sorumluluğundadır.",
    "4) Alıcı Firma, siparişlerin sevki için sevk adresi bildirmediği takdirde, firma merkez adresi sevk adresine olarak kabul edilecektir.",
    "5) Satış faturaları, ilgili tarihte Türkiye Cumhuriyet Merkez Bankası’nın döviz satış kuru esas alınarak düzenlenir. Ödemeler, bu kur üzerinden takip edilerek tahsil edilir.",
    "6) Alıcı Firma'nın cari hesap borç/alacak hareketleri (KDV dahil), sözleşmede belirtilen döviz cinsi üzerinden takip edilir.",
    "7) Kumaş bedeli tamamen ödenene kadar, sözleşme kapsamında sevk edilen tüm ürünler Satıcı Firman’nın mülkiyetinde kalır.",
    "8) Hazır olan ürünler, en geç 15 gün içinde Alıcı Firma tarafından teslim alınmalıdır. Aksi takdirde, ürünlerin sevkiyatı re’sen gerçekleştirilir ve faturası düzenlenir.",
    "9) Renk başına düşen ürün miktarında, artı (+) veya eksi (-) %5 oranında tolerans uygulanır.",
    "10) Renk onaylarında, standart olarak spektrofotometre ölçüm sonucu “Delta 1” değerine kadar olan farklılıklar kabul edilmiş sayılacaktır.",
    "11) Devam eden laboratuvar renk çalışmaları, “Delta 1” değerine kadar olan tüm farklılıkların kabul göreceği ilkesine bağlı olarak, resmi iletişim kanalı aracılığıyla onayları bildirilecektir.",
    "12) Alıcı Firma, talep ettiği ürünler için kendi belirlediği test standartlarını sözleşme öncesinde yazılı olarak bildirmelidir. Aksi halde, sözleşmenin Ek-1’inde yer alan ürün FDS formundaki teknik değerler esas alınır.",
    "13) Ürün test değerleri, orijinal numunede olduğu gibi olacaktır. Alıcı Firma tarafından onaylanmayan bir değer mevcutsa, resmi yazışma kanalları aracılığıyla bildirilmelidir. Ürün sevki sonrasında yapılacak değişiklik (tebdil) taleplerine ilişkin tüm masraflar ile kumaşta oluşabilecek problemler (örneğin renk, en, gramaj, tuşe ve test değerlerindeki sapmalar) Alıcı Firma'ya aittir.",
    "14) Konfeksiyon üretim araçlarıyla yapılan testlerin (örneğin buhar sonrası çekme vb.) sonuçları, firmamızca geçerli kabul edilmeyecektir. Ayrıca, elastan iplik içeren ürünlerde (likralı kumaşlar) buhar sonrası çekme değerleri için herhangi bir garanti verilmemektedir.",
    "15) Kesilen veya konfeksiyonu yapılan ürünlerin iadesi ve reklamasyonu kabul edilmez.",
    "16) Ürün sevk tarihi geldiği halde sevk talebi iletilmeyen ürünlerde; gramaj, tuşe, çekme, metraj ve genel görünüm açısından oluşabilecek sapmalardan Alıcı Firma sorumludur. Bu gerekçelerle yapılan iade veya reklamasyon talepleri kabul edilmez.",
    "17) Alıcı Firma, siparişi onayladığı andan itibaren sözleşme hükümlerini kabul etmiş sayılır. Taraflarca aksi yazılı olarak kararlaştırılmadıkça, bu sözleşmede yapılacak herhangi bir değişiklik geçersizdir. Sipariş iptali, yalnızca satıcı firmanın yazılı onayı ve üretim/tedarik sürecinden doğan yükümlülüklerin Alıcı Firma tarafından tazmin edilmesi şartıyla mümkündür.",
    "18) Taraflar arasında doğabilecek her türlü uyuşmazlıkta, Bursa Mahkemeleri ve İcra Daireleri yetkilidir.",
    "19) Sözleşme, üzerinde belirtilen tarihte ve Ek-1 FDS formu ile imzalanıp, resmi yazışma kanalları aracılığıyla gönderilmediği takdirde geçerli sayılmaz, işleme alınmaz ve sevkiyat yapılmaz."
  ];

  const engTerms = [
    "1) This sales agreement is made between the 'Seller Company' and 'Buyer Company' whose titles are specified above through official communication channels (e-mail, etc.).",
    "2) Unless otherwise stated in the contract, transportation service is not included in the price. Any damage or loss that may occur during shipment and transportation is the responsibility of the Buyer.",
    "3) If the buyer does not provide a shipping address for the orders, the company headquarters address will be accepted as the shipping address.",
    "4) All products shipped under the contract remain the property of the Seller until the fabric cost is fully paid.",
    "5) Ready products must be collected by the Buyer within 15 days at the latest. Otherwise, the products will be shipped ex officio and the invoice will be issued.",
    "6) A tolerance of plus (+) or minus (-) 5% applies to the product quantity per color.",
    "7) In color approvals, differences up to the 'Delta 1' value as a result of standard spectrophotometer measurement will be considered accepted.",
    "8) Ongoing laboratory color studies will be notified via official communication channels, subject to the principle that all differences up to 'Delta 1' will be accepted.",
    "9) The Buyer must provide their specific test standards in writing prior to the contract. Otherwise, the technical values in the FDS form in Annex-1 of the contract will be taken as the basis.",
    "10) Product test values will be the same as the original sample. All costs regarding replacement requests to be made after product shipment and problems that may occur in the fabric (e.g., deviations in color, width, weight, touch, and test values) belong to the Buyer.",
    "11) The results of tests performed with garment production tools (e.g., shrinkage after steam, etc.) will not be considered valid by our company.",
    "12) The return or claim of products that have been cut or made into garments is not accepted.",
    "13) For products for which a shipping request is not forwarded despite the arrival of the shipment date; The Buyer is responsible for any deviations that may occur in terms of weight, touch, shrinkage, length and general appearance. Return or claim requests made for these reasons are not accepted.",
    "14) By approving the order, the Buyer is deemed to have accepted the terms of the contract. Order cancellation is only possible with the written approval of the seller company.",
    "15) The Courts and Enforcement Offices of Bursa are authorized for any disputes that may arise between the parties.",
    "16) The contract is not considered valid, will not be processed, and shipment will not be made unless it is signed on the specified date together with the Annex-1 FDS form."
  ];

  const termsToUse = isEng ? engTerms : trTerms;

  const renderHeader = () => {
    const isMensucat = order.seller.name.toUpperCase().includes('MENSUCAT');
    const logoSrc = isMensucat ? '/images/Defenni-M.jpg' : '/images/Defenni-T.jpg';

    return (
      <div className="border border-slate-800 text-[10px] leading-tight flex w-full h-[150px]">
          {/* SATICI FİRMA */}
          <div className="flex-1 border-r border-slate-800 p-2 flex flex-col justify-start">
              <div className="font-bold mb-1 underline underline-offset-2">{isEng ? 'SELLER' : 'SATICI FİRMA'}</div>
              <div className="font-bold text-xs uppercase mb-1">{order.seller.name}</div>
              <div className="uppercase">{order.seller.address}</div>
              <div className="uppercase">TÜRKİYE &nbsp;&nbsp;&nbsp; {isEng ? 'TRD. REG. NO.' : 'TİC. SİC. NO.'} {order.seller.registrationNo || "-"}</div>
              <div className="uppercase">{order.seller.taxOffice} VD. {order.seller.taxNo}</div>
              <div className="uppercase">TEL. {order.seller.phone || "-"}</div>
          </div>
          
          {/* ALICI FİRMA */}
          <div className="flex-1 border-r border-slate-800 p-2 flex flex-col justify-start">
              <div className="font-bold mb-1 underline underline-offset-2">{isEng ? 'BUYER' : 'ALICI FİRMA'}</div>
              <div className="font-bold text-xs uppercase mb-1">{order.buyer.name}</div>
              <div className="uppercase">{order.buyer.address}</div>
              <div className="uppercase">TÜRKİYE</div>
              <div className="uppercase">{order.buyer.taxOffice} VD. {order.buyer.taxNo}</div>
              <div className="uppercase">{order.buyer.phone ? `TEL. ${order.buyer.phone}` : ''}</div>
          </div>

          {/* SEVK ADRESİ */}
          <div className="flex-1 border-r border-slate-800 p-2 flex flex-col justify-start">
              <div className="font-bold mb-1 underline underline-offset-2">{isEng ? 'SHIP TO / CONSIGNEE' : 'SEVK ADRESİ / ALICI'}</div>
              <div className="font-bold text-xs uppercase mb-1">{order.shipTo?.name || order.buyer.name}</div>
              <div className="uppercase">{order.shipTo?.address || order.buyer.address}</div>
              <div className="uppercase">TÜRKİYE &nbsp;&nbsp;&nbsp; VAT. {order.shipTo?.taxNo || order.buyer.taxNo}</div>
              <div className="uppercase">{order.shipTo?.phone ? `TEL. ${order.shipTo.phone}` : ''}</div>
          </div>

          {/* SÖZLEŞME VE TARİH */}
          <div className="w-[200px] flex flex-col text-center">
              <div className="flex-1 flex flex-col items-center justify-center relative p-1">
                 <div className="relative w-full h-full">
                    <Image 
                      src={logoSrc} 
                      alt="Defenni Logo" 
                      fill 
                      className="object-contain"
                      sizes="200px"
                    />
                 </div>
              </div>
              <div className="w-full border-t border-slate-800 p-2 bg-slate-50">
                  <div className="font-bold text-[11px] mb-1">{isEng ? 'CONTRACT NO' : 'SÖZLEŞME NO'}</div>
                  <div className="text-sm tracking-widest">{order.contractNo}</div>
              </div>
              <div className="w-full border-t border-slate-800 p-2 bg-slate-50">
                  <div className="font-bold text-[11px] mb-1">{isEng ? 'CONTRACT DATE' : 'SÖZLEŞME TARİHİ'}</div>
                  <div className="text-sm tracking-widest">{new Date(order.contractDate).toLocaleDateString(isEng ? 'en-GB' : 'tr-TR')}</div>
              </div>
          </div>
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto print:overflow-visible">
      <div className="mx-auto min-w-[750px] md:min-w-[900px] w-full max-w-[1100px] space-y-4 print:space-y-0 text-black print:min-w-0 print:w-full">
        {/* YAZDIRILABİLİR SÖZLEŞME ALANI (SAYFA 1) */}
        <div className="bg-white p-4 print:p-0 font-sans text-[10px] md:text-xs print:text-[11px] relative overflow-hidden min-h-[1050px]">
        {renderHeader()}

        {/* Sub-header block (SATIŞ SÖZLEŞMESİ) */}
        <div className="border-x border-b-2 border-slate-800 flex w-full bg-white items-stretch">
           <div className="w-[30%] font-bold text-[9px] px-2 py-4 border-r border-slate-800 flex items-center justify-center text-center uppercase leading-tight">
             {isEng ? 'ALL GOODS ARE OF TURKISH ORIGIN. OUR TEXTILE PRODUCTS NO AZO.' : 'TÜM MALLAR TÜRK MENŞELİDİR. TEKSTİL ÜRÜNLERİMİZ AZO İÇERMEZ.'}
           </div>
           <div className="flex-1 p-2 flex items-center justify-center text-center border-r border-slate-800">
             <h2 className="text-2xl font-bold text-blue-600 tracking-widest uppercase mb-1">{isEng ? 'SALES CONTRACT' : 'SATIŞ SÖZLEŞMESİ'}</h2>
           </div>
           <div className="w-[200px] p-2 flex flex-col justify-center text-center space-y-1 bg-slate-50">
             <div className="font-bold text-[11px] uppercase">{isEng ? 'BUYER PO NO' : 'ALICI S. NO'}</div>
             <div className="text-sm">{order.buyerPoNo || "-"}</div>
           </div>
        </div>

        {/* ITEMS TABLE */}
        <table className="w-full text-left border-collapse border-b border-x border-slate-800 text-[9px]">
          <thead>
            <tr className="border-b-2 border-slate-800 font-semibold text-center leading-snug">
               <th className="p-1.5 border-r border-slate-800 align-middle w-[9%]">{isEng ? 'BUYER MODEL NAME' : 'ALICI MODEL ADI'}</th>
               <th className="p-1.5 border-r border-slate-800 align-middle w-[12%]">{isEng ? 'QUALITY NAME' : 'KALİTE İSMİ'}</th>
               <th className="p-1.5 border-r border-slate-800 align-middle w-[8%]">{isEng ? 'QUALITY CODE' : 'KALİTE KODU'}</th>
               <th className="p-1.5 border-r border-slate-800 align-middle w-[15%]">{isEng ? 'BUYER QUALITY & COLOR CODE' : 'ALICI KALİTE VE RENK KODU'}</th>
               <th className="p-1.5 border-r border-slate-800 align-middle w-[15%]">{isEng ? 'QUALITY COMPOSITION' : 'KALİTE KOMPOZİSYONU'}</th>
               <th className="p-1.5 border-r border-slate-800 align-middle">{isEng ? 'WEIGHT' : 'GRAMAJ'}<br/>(+/- 5%)</th>
               <th className="p-1.5 border-r border-slate-800 align-middle">GR/M²</th>
               <th className="p-1.5 border-r border-slate-800 align-middle">{isEng ? 'WIDTH' : 'EN'} (+/- 3%)</th>
               <th className="p-1.5 border-r border-slate-800 align-middle">{isEng ? 'EX-MILL' : 'FABRİKA ÇIKIŞ'}<br/>{isEng ? 'DATE' : 'TARİHİ'}</th>
               <th className="p-1.5 border-r border-slate-800 align-middle text-right">{isEng ? 'QUANTITY' : 'MİKTAR'} <br/><span className="text-[7px]">MT</span></th>
               <th className="p-1.5 border-r border-slate-800 align-middle text-right">{isEng ? 'UNIT' : 'BİRİM'}<br/>{isEng ? 'PRICE' : 'FİYAT'} <span className="text-[7px]">{order.currency}</span></th>
               <th className="p-1.5 align-middle text-right w-[10%]">{isEng ? 'TOTAL AMOUNT' : 'TOPLAM TUTAR'}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any) => (
              <tr key={item.id} className="border-b border-slate-300">
                 <td className="p-1.5 border-r border-slate-800 font-medium uppercase">{item.buyerModelName || "-"}</td>
                 <td className="p-1.5 border-r border-slate-800 font-bold uppercase">{item.qualityName || "-"}</td>
                 <td className="p-1.5 border-r border-slate-800 uppercase">{item.qualityCode || "-"}</td>
                 <td className="p-1.5 border-r border-slate-800 uppercase leading-snug">{item.colorCode || "-"}</td>
                 <td className="p-1.5 border-r border-slate-800 uppercase leading-snug">{item.composition || "-"}</td>
                 <td className="p-1.5 border-r border-slate-800 uppercase text-center">{item.weight || "-"}</td>
                 <td className="p-1.5 border-r border-slate-800 text-center uppercase">GR/M²</td>
                 <td className="p-1.5 border-r border-slate-800 uppercase text-center">{item.width || "-"}</td>
                 <td className="p-1.5 border-r border-slate-800 text-center uppercase">{item.deliveryDate || "-"}</td>
                 <td className="p-1.5 border-r border-slate-800 text-right"><span className="font-bold">{item.quantity.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span> <span className="text-[8px] ml-1">MT</span></td>
                 <td className="p-1.5 border-r border-slate-800 text-right"><span className="font-bold">{item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span> <span className="text-[8px] ml-1">{order.currency}</span></td>
                 <td className="p-1.5 text-right font-bold">{item.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {order.currency}</td>
              </tr>
            ))}
             <tr className="border-b border-t border-slate-800 font-bold text-[10px]">
                <td colSpan={8} className="p-2 border-r border-slate-800 align-middle">
                   {isEng ? 'QUANTITY TOLERANCE:' : 'METRAJ TOLERANSI:'} {order.tolerance || "-"}%
                </td>
                <td className="p-2 text-center border-r border-slate-800 whitespace-pre-wrap">{isEng ? 'GRAND\nTOTALS' : 'GENEL\nTOPLAMLAR'}</td>
                <td className="p-2 text-right border-r border-slate-800">
                  {totalQuantity.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}<br/><span className="text-[8px]">MT</span>
                </td>
                <td colSpan={2} className="p-2 text-right text-sm">
                  {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}<br/><span className="text-[10px]">{order.currency}</span>
                </td>
             </tr>
          </tbody>
        </table>

        {/* TERMS TR BLOCK */}
        <div className="border border-slate-800 border-t-0 text-[10px] w-full bg-white leading-tight">
           <div className="flex border-b border-slate-800">
              <div className="w-[12%] font-bold p-1.5 border-r border-slate-800 uppercase">{isEng ? 'PAYMENT TERMS' : 'ÖDEME ŞEKLİ'}</div>
              <div className="w-[36%] p-1.5 border-r border-slate-800 uppercase">{displayPaymentTerms}</div>
              <div className="w-[17%] font-bold p-1.5 border-r border-slate-800 uppercase">{isEng ? 'SELLER REP.' : 'SATICI TEMSİLCİSİ'}</div>
              <div className="w-[20%] p-1.5 border-r border-slate-800 text-center uppercase">{order.sellerRep ? order.sellerRep.name.includes('|') ? order.sellerRep.name.split('|')[isEng ? 1 : 0] : order.sellerRep.name : "-"}</div>
              <div className="w-[15%] p-1.5 text-center text-blue-600 underline text-[9px]">{order.sellerRep?.email || "-"}</div>
           </div>
           <div className="flex border-b border-slate-800">
              <div className="w-[12%] font-bold p-1.5 border-r border-slate-800 uppercase">{isEng ? 'DELIVERY TERMS' : 'TESLİMAT ŞEKLİ'}</div>
              <div className="w-[36%] p-1.5 border-r border-slate-800 uppercase">{displayDeliveryTerms}</div>
              <div className="w-[17%] font-bold p-1.5 border-r border-slate-800 uppercase">{isEng ? 'BUYER REP.' : 'ALICI TEMSİLCİSİ'}</div>
              <div className="w-[20%] p-1.5 border-r border-slate-800 text-center uppercase">{order.buyerRep ? order.buyerRep.name.includes('|') ? order.buyerRep.name.split('|')[isEng ? 1 : 0] : order.buyerRep.name : "-"}</div>
              <div className="w-[15%] p-1.5 text-center text-blue-600 underline text-[9px]">{order.buyerRep?.email || "-"}</div>
           </div>

           {/* Bank Info Rows */}
           <div className="flex border-b border-slate-800">
              <div className="w-[12%] font-bold p-1.5 border-r border-slate-800 uppercase">{isEng ? 'BANK NAME' : 'BANKA ADI'}</div>
              <div className="w-[28%] p-1.5 border-r border-slate-800 font-bold uppercase">{bankInfo?.bankName || "-"}</div>
              <div className="w-[18%] font-bold p-1.5 border-r border-slate-800 uppercase">{isEng ? 'BRANCH NAME & CODE' : 'ŞUBE ADI & KODU'}</div>
              <div className="w-[22%] p-1.5 border-r border-slate-800 uppercase">{bankInfo?.branch || "-"}</div>
              <div className="w-[10%] font-bold p-1.5 border-r border-slate-800 uppercase text-center bg-white">{isEng ? 'SWIFT CODE' : 'SWIFT KODU'}</div>
              <div className="w-[10%] p-1.5 uppercase font-mono text-center">{bankInfo?.swift || "-"}</div>
           </div>
           <div className="flex">
              <div className="w-[12%] font-bold p-1.5 border-r border-slate-800 uppercase">{isEng ? 'ACCOUNT NO' : 'HESAP NO'}</div>
              <div className="w-[28%] p-1.5 border-r border-slate-800 font-mono tracking-wider">{bankInfo?.accountNo || "-"}</div>
              <div className="w-[18%] font-bold p-1.5 border-r border-slate-800 uppercase">{isEng ? 'IBAN NO' : 'IBAN NO'}</div>
              <div className="w-[32%] p-1.5 border-r border-slate-800 font-mono font-bold tracking-wider">{bankInfo?.iban || "-"}</div>
              <div className="w-[10%] font-bold p-1.5 text-center items-center flex justify-center text-lg italic">{order.currency}</div>
           </div>
        </div>

        {/* Signature Block */}
        <div className="flex text-[11px] text-center border-x border-b border-slate-800">
          <div className="w-1/2 p-3 border-r border-slate-800 min-h-[140px] flex flex-col justify-between items-start relative overflow-hidden">
            <div className="font-bold underline text-left mb-6">{isEng ? 'AUTHORIZED SIGNATURE & STAMP' : 'YETKİLİ İMZA VE KAŞE'}</div>
            {/* Stamp simulation */}
            <div className="text-[8px] text-left leading-tight text-slate-800 font-medium max-w-[80%] absolute bottom-4 left-4 border-b border-blue-900/20 pb-1 italic z-10">
              <div className="font-bold text-[9px] mb-1">{order.seller.name}</div>
              {order.seller.address && <div>{order.seller.address}</div>}
              {order.seller.phone && <div>T: {order.seller.phone}  E: info@usktekstil.com.tr</div>}
              <div>{order.seller.taxOffice} VD. {order.seller.taxNo} / Sicil No: {order.seller.registrationNo}</div>
            </div>
          </div>
          <div className="w-1/2 p-3 min-h-[140px] flex flex-col justify-between items-end">
            <div className="font-bold underline text-right">{isEng ? 'AUTHORIZED SIGNATURE & STAMP' : 'YETKİLİ İMZA VE KAŞE'}</div>
          </div>
        </div>

      </div>

      <div className="pagebreak print:break-before-page w-full p-4 print:p-0 min-h-[1050px]">
        {renderHeader()}
        <div className="border border-t-0 border-slate-800 p-8 text-[11px] leading-relaxed text-justify bg-white space-y-2 pb-20">
          <h3 className="font-bold text-base text-center mb-6 uppercase tracking-widest">{isEng ? 'SALES CONTRACT' : 'SATIŞ SÖZLEŞMESİ'}</h3>
          {termsToUse.map((term, i) => (
             <div key={i}>{term}</div>
          ))}
        </div>
        {/* Signature Block Page 2 */}
        <div className="flex text-[11px] text-center border-x border-b border-slate-800 bg-white shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)] relative z-10 w-full mt-[-10px]">
          <div className="w-1/2 p-3 border-r border-slate-800 min-h-[140px] flex flex-col justify-between items-start">
            <div className="font-bold underline text-left mb-6">{isEng ? 'AUTHORIZED SIGNATURE & STAMP' : 'AUTHORIZED SIGNATURE & STAMP'}</div>
          </div>
          <div className="w-1/2 p-3 min-h-[140px] flex flex-col justify-between items-end">
            <div className="font-bold underline text-right">{isEng ? 'AUTHORIZED SIGNATURE & STAMP' : 'AUTHORIZED SIGNATURE & STAMP'}</div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
