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
      <div className="border border-slate-800 text-[11px] leading-tight grid grid-cols-[265px_265px_265px_1fr] w-full h-[120px] min-h-[120px] max-h-[120px] overflow-hidden">
          {/* SATICI FİRMA */}
          <div className="border-r border-slate-800 p-2 flex flex-col justify-start">
              <div className="font-bold text-[13px] mb-1 underline underline-offset-2">{isEng ? 'SELLER' : 'SATICI FİRMA'}</div>
              <div className="font-bold text-[11px] uppercase mb-1">{order.seller.name}</div>
              <div className="uppercase text-[11px]">{order.seller.address}</div>
              <div className="uppercase text-[11px]">TÜRKİYE &nbsp;&nbsp;&nbsp; {isEng ? 'TRD. REG. NO.' : 'TİC. SİC. NO.'} {order.seller.registrationNo || "-"}</div>
              <div className="uppercase text-[11px]">{order.seller.taxOffice} VD. {order.seller.taxNo}</div>
              <div className="uppercase text-[11px]">TEL. {order.seller.phone || "-"}</div>
          </div>
          
          {/* ALICI FİRMA */}
          <div className="border-r border-slate-800 p-2 flex flex-col justify-start">
              <div className="font-bold text-[13px] mb-1 underline underline-offset-2">{isEng ? 'BUYER' : 'ALICI FİRMA'}</div>
              <div className="font-bold text-[11px] uppercase mb-1">{order.buyer.name}</div>
              <div className="uppercase text-[11px]">{order.buyer.address}</div>
              <div className="uppercase text-[11px]">TÜRKİYE</div>
              <div className="uppercase text-[11px]">{order.buyer.taxOffice} VD. {order.buyer.taxNo}</div>
              <div className="uppercase text-[11px]">{order.buyer.phone ? `TEL. ${order.buyer.phone}` : ''}</div>
          </div>

          {/* SEVK ADRESİ */}
          <div className="border-r border-slate-800 p-2 flex flex-col justify-start">
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
              <div className="w-full h-[60px] min-h-[60px] max-h-[60px] border-t border-slate-800 flex flex-col justify-center px-2">
                  <div className="font-bold text-[13px]">{isEng ? 'CONTRACT DATE' : 'SÖZLEŞME TARİHİ'}</div>
                  <div className="text-[11px] tracking-widest mt-0.5">{new Date(order.contractDate).toLocaleDateString(isEng ? 'en-GB' : 'tr-TR')}</div>
              </div>
          </div>
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto print:overflow-visible">
      <div className="mx-auto w-[1002px] min-w-[1002px] max-w-[1002px] space-y-4 print:space-y-0 text-black">
        {/* YAZDIRILABİLİR SÖZLEŞME ALANI (SAYFA 1) */}
        <div className="bg-white print:p-0 font-['Arial_Narrow',_'Arial_Narrow_MT',_Arial,_sans-serif] text-[11px] relative overflow-hidden min-h-[1050px] print:min-h-0 print:h-auto">
        {renderHeader()}

        {/* Sub-header block (SATIŞ SÖZLEŞMESİ) */}
        <div className="border-x border-b border-slate-800 grid grid-cols-[205px_590px_1fr] w-full bg-white items-stretch">
           <div className="font-bold text-[11px] px-2 py-4 border-r border-slate-800 flex items-center justify-center text-center uppercase leading-tight">
             
           </div>
           <div className="p-2 flex items-center justify-center text-center border-r border-slate-800">
             <h2 className="text-[25px] font-bold text-blue-600 tracking-widest uppercase mb-1">{isEng ? 'SALES CONTRACT' : 'SATIŞ SÖZLEŞMESİ'}</h2>
           </div>
           <div className="h-[60px] min-h-[60px] max-h-[60px] px-2 flex flex-col justify-center text-center font-normal">
             <div className="font-bold text-[13px] uppercase">{isEng ? 'BUYER PO NO' : 'ALICI S. NO'}</div>
             <div className="text-[11px] mt-0.5">{order.buyerPoNo || "-"}</div>
           </div>
        </div>

        {/* ITEMS TABLE */}
        <table className="table-fixed w-full text-left border-collapse border-b border-x border-slate-800 text-[11px]">
          <thead>
            <tr className="border-b border-slate-800 font-bold text-[11px] text-center leading-snug">
               <th className="p-1.5 border-r border-slate-800 align-middle w-[110px] min-w-[110px] max-w-[110px]">{isEng ? 'BUYER MODEL NAME' : 'ALICI MODEL ADI'}</th>
               <th className="p-1.5 border-r border-slate-800 align-middle w-[115px] min-w-[115px] max-w-[115px]">{isEng ? 'QUALITY NAME' : 'KALİTE İSMİ'}</th>
               <th className="p-1.5 border-r border-slate-800 align-middle w-[80px] min-w-[80px] max-w-[80px]">{isEng ? 'QUALITY CODE' : 'KALİTE KODU'}</th>
               <th className="p-1.5 border-r border-slate-800 align-middle w-[110px] min-w-[110px] max-w-[110px]">{isEng ? 'BUYER QUALITY & COLOR CODE' : 'ALICI KALİTE VE RENK KODU'}</th>
               <th className="p-1.5 border-r border-slate-800 align-middle w-[115px] min-w-[115px] max-w-[115px]">{isEng ? 'QUALITY COMPOSITION' : 'KALİTE KOMPOZİSYONU'}</th>
               <th className="p-1.5 border-r border-slate-800 align-middle w-[60px] min-w-[60px] max-w-[60px]">{isEng ? 'WEIGHT' : 'GRAMAJ'}<br/>(+/- 5%)</th>
               <th className="p-1.5 border-r border-slate-800 align-middle w-[50px] min-w-[50px] max-w-[50px]">{isEng ? 'WIDTH' : 'EN'} (+/- 3%)</th>
               <th className="p-1.5 border-r border-slate-800 align-middle w-[105px] min-w-[105px] max-w-[105px]">{isEng ? 'EX-MILL' : 'FABRİKA ÇIKIŞ'}<br/>{isEng ? 'DATE' : 'TARİHİ'}</th>
               <th className="py-1.5 pl-1.5 pr-[8px] border-r border-slate-800 align-middle w-[95px] min-w-[95px] max-w-[95px] text-right whitespace-nowrap">{isEng ? 'QUANTITY' : 'MİKTAR'} <span className="font-bold text-[11px]">MT</span></th>
               <th className="p-1.5 border-r border-slate-800 align-middle w-[60px] min-w-[60px] max-w-[60px] text-right whitespace-nowrap">{isEng ? 'UNIT' : 'BİRİM'}<br/>{isEng ? 'PRICE' : 'FİYAT'} <span className="font-bold text-[11px]">{order.currency}</span></th>
               <th className="p-1.5 align-middle text-right w-auto whitespace-nowrap">{isEng ? 'TOTAL AMOUNT' : 'TOPLAM TUTAR'}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any) => (
              <tr key={item.id} className="border-b border-slate-300">
                 <td className="p-1.5 border-r border-slate-800 uppercase">{item.buyerModelName || "-"}</td>
                 <td className="p-1.5 border-r border-slate-800 uppercase">{item.qualityName || "-"}</td>
                 <td className="p-1.5 border-r border-slate-800 uppercase">{item.qualityCode || "-"}</td>
                 <td className="p-1.5 border-r border-slate-800 uppercase leading-snug">{item.colorCode || "-"}</td>
                 <td className="p-1.5 border-r border-slate-800 uppercase leading-snug">{item.composition || "-"}</td>
                 <td className="p-1.5 border-r border-slate-800 uppercase text-center">{item.weight ? `${item.weight} GR/M²` : "-"}</td>
                 <td className="p-1.5 border-r border-slate-800 uppercase text-center">{item.width ? `${item.width} CM` : "-"}</td>
                 <td className="p-1.5 border-r border-slate-800 text-center uppercase">{item.deliveryDate || "-"}</td>
                 <td className="py-1.5 pl-1.5 pr-[8px] border-r border-slate-800 text-right"><span className="text-[11px]">{item.quantity.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span> <span className="text-[11px] ml-1">MT</span></td>
                 <td className="p-1.5 border-r border-slate-800 text-right"><span className="text-[11px]">{item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span> <span className="text-[11px] ml-1">{order.currency}</span></td>
                 <td className="p-1.5 text-right text-[11px]">{item.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {order.currency}</td>
              </tr>
            ))}
             <tr className="border-b border-t border-slate-800 text-[11px]">
                <td colSpan={6} className="p-2 border-r border-slate-800 align-middle w-[590px] min-w-[590px] max-w-[590px]">
                   {isEng ? 'QUANTITY TOLERANCE:' : 'METRAJ TOLERANSI:'} {order.tolerance || "-"}%
                </td>
                <td colSpan={2} className="p-2 text-center align-middle border-r border-slate-800 whitespace-nowrap w-[155px] min-w-[155px] max-w-[155px] text-[12px] font-bold">{isEng ? 'GRAND TOTALS' : 'GENEL TOPLAMLAR'}</td>
                <td className="py-2 pl-2 pr-[10px] text-right border-r border-slate-800 w-[95px] min-w-[95px] max-w-[95px] text-[12px] font-bold">
                  {totalQuantity.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <span className="text-[12px] font-bold">MT</span>
                </td>
                <td colSpan={2} className="p-2 text-right w-auto text-[12px] font-bold">
                  {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <span className="text-[12px] font-bold">{order.currency}</span>
                </td>
             </tr>
          </tbody>
        </table>

        {/* TERMS TR BLOCK */}
        <div className="border-x border-b border-slate-800 text-[11px] w-full bg-white leading-tight font-normal">
           <div className="grid grid-cols-[110px_420px_110px_200px_1fr] border-b border-slate-800">
              <div className="font-bold p-1.5 border-r border-slate-800 uppercase">{isEng ? 'PAYMENT TERMS' : 'ÖDEME ŞEKLİ'}</div>
              <div className="p-1.5 border-r border-slate-800 uppercase min-w-0 break-words">{displayPaymentTerms}</div>
              <div className="font-bold p-1.5 border-r border-slate-800 uppercase">{isEng ? 'SELLER REP.' : 'SATICI TEMSİLCİSİ'}</div>
              <div className="p-1.5 border-r border-slate-800 text-center uppercase min-w-0 break-words">{order.sellerRep ? order.sellerRep.name.includes('|') ? order.sellerRep.name.split('|')[isEng ? 1 : 0] : order.sellerRep.name : "-"}</div>
              <div className="p-1.5 text-center text-[11px] text-blue-600 border-r border-slate-800 underline min-w-0 break-all flex items-center justify-center">{order.sellerRep?.email || "-"}</div>
           </div>
           <div className="grid grid-cols-[110px_420px_110px_200px_160px] border-b border-slate-800">
              <div className="font-bold p-1.5 border-r border-slate-800 uppercase">{isEng ? 'DELIVERY TERMS' : 'TESLİMAT ŞEKLİ'}</div>
              <div className="p-1.5 border-r border-slate-800 uppercase min-w-0 break-words">
                 {displayDeliveryTerms} 
                 {order.deliveryDestination && <span className="ml-2 font-bold">— {order.deliveryDestination}</span>}
              </div>
              <div className="font-bold p-1.5 border-r border-slate-800 uppercase">{isEng ? 'BUYER REP.' : 'ALICI TEMSİLCİSİ'}</div>
              <div className="p-1.5 border-r border-slate-800 text-center uppercase min-w-0 break-words">{order.buyerRep ? order.buyerRep.name.includes('|') ? order.buyerRep.name.split('|')[isEng ? 1 : 0] : order.buyerRep.name : "-"}</div>
              <div className="p-1.5 text-center text-[11px] text-blue-600 border-r border-slate-800 underline min-w-0 break-all flex items-center justify-center">{order.buyerRep?.email || "-"}</div>
           </div>

           {/* Bank Info Rows */}
           <div className="grid grid-cols-[110px_195px_110px_115px_110px_105px_255px]">
              <div className="font-bold p-1.5 border-r border-b border-slate-800 uppercase">{isEng ? 'BANK NAME' : 'BANKA ADI'}</div>
              <div className="p-1.5 border-r border-b border-slate-800 uppercase min-w-0 break-words">{bankInfo?.bankName || "-"}</div>
              <div className="font-bold p-1.5 border-r border-b border-slate-800 uppercase">{isEng ? 'BRANCH NAME & CODE' : 'ŞUBE ADI & KODU'}</div>
              <div className="p-1.5 border-r border-b border-slate-800 uppercase text-center min-w-0 break-words">{bankInfo?.branch || "-"}</div>
              <div className="font-bold p-1.5 border-r border-b border-slate-800 uppercase text-center bg-white">{isEng ? 'SWIFT CODE' : 'SWIFT KODU'}</div>
              <div className="p-1.5 uppercase border-r border-b border-slate-800 text-center font-normal min-w-0 break-all flex items-center justify-center">{bankInfo?.swift || "-"}</div>
              <div className="p-1.5 flex items-center justify-center text-center font-bold text-[11px] uppercase">
                 {isEng ? 'ALL GOODS ARE OF TURKISH ORIGIN.' : 'TÜM MALLAR TÜRK MENŞELİDİR.'}
              </div>
           </div>
           <div className="grid grid-cols-[110px_195px_110px_225px_105px_1fr]">
              <div className="font-bold p-1.5 border-r border-slate-800 uppercase">{isEng ? 'ACCOUNT NO' : 'HESAP NO'}</div>
              <div className="p-1.5 border-r border-slate-800 tracking-wider uppercase min-w-0 break-all">{bankInfo?.accountNo || "-"}</div>
              <div className="font-bold p-1.5 border-r border-slate-800 uppercase">{isEng ? 'IBAN NO' : 'IBAN NO'}</div>
              <div className="p-1.5 border-r border-slate-800 tracking-wider uppercase min-w-0 break-all">{bankInfo?.iban || "-"}</div>
              <div className="font-bold p-1.5 border-r border-slate-800 text-center items-center flex justify-center text-[11px] italic">{order.currency}</div>
              <div className="p-1.5 flex items-center justify-center text-center font-bold text-[11px] uppercase">
                 {isEng ? 'OUR TEXTILE PRODUCTS NO AZO.' : 'TEKSTİL ÜRÜNLERİMİZ AZO İÇERMEZ.'}
              </div>
           </div>
        </div>

        {/* Signature Block */}
        <div className="flex text-[11px] text-center border-x border-b border-slate-800">
          <div className="w-1/2 p-3 border-r border-slate-800 min-h-[140px] flex flex-col justify-between items-start relative overflow-hidden">
            <div className="font-bold text-[11px] underline text-left mb-6">{isEng ? 'AUTHORIZED SIGNATURE & STAMP' : 'YETKİLİ İMZA VE KAŞE'}</div>
            {/* Stamp simulation */}
            <div className="text-[11px] text-left leading-tight text-slate-800 font-normal max-w-[80%] absolute bottom-4 left-4 border-b border-blue-900/20 pb-1 italic z-10">
              <div className="font-bold text-[11px] mb-1">{order.seller.name}</div>
              {order.seller.address && <div>{order.seller.address}</div>}
              {order.seller.phone && <div>T: {order.seller.phone}  E: info@usktekstil.com.tr</div>}
              <div>{order.seller.taxOffice} VD. {order.seller.taxNo} / Sicil No: {order.seller.registrationNo}</div>
            </div>
          </div>
          <div className="w-1/2 p-3 min-h-[140px] flex flex-col justify-between items-end">
            <div className="font-bold text-[11px] underline text-right">{isEng ? 'AUTHORIZED SIGNATURE & STAMP' : 'YETKİLİ İMZA VE KAŞE'}</div>
          </div>
        </div>

      </div>

      <div className="pagebreak print:break-before-page border border-transparent w-full p-4 print:p-0 min-h-[1050px] font-['Arial_Narrow',_'Arial_Narrow_MT',_Arial,_sans-serif]">
        {renderHeader()}
        <div className="border border-t-0 border-slate-800 p-8 text-[11px] leading-relaxed text-justify bg-white space-y-2 pb-20">
          <h3 className="font-bold text-[13px] text-center mb-6 uppercase tracking-widest">{isEng ? 'CONTRACT GENERAL CONDITIONS' : 'SÖZLEŞME GENEL ŞARTLARI'}</h3>
          {termsToUse.map((term, i) => (
             <div key={i}>{term}</div>
          ))}
        </div>
        {/* Signature Block Page 2 */}
        <div className="flex text-[11px] text-center border-x border-b border-slate-800 bg-white shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)] relative z-10 w-full mt-[-10px]">
          <div className="w-1/2 p-3 border-r border-slate-800 min-h-[140px] flex flex-col justify-between items-start">
            <div className="font-bold text-[11px] underline text-left mb-6">{isEng ? 'AUTHORIZED SIGNATURE & STAMP' : 'YETKİLİ İMZA VE KAŞE'}</div>
          </div>
          <div className="w-1/2 p-3 min-h-[140px] flex flex-col justify-between items-end">
            <div className="font-bold text-[11px] underline text-right">{isEng ? 'AUTHORIZED SIGNATURE & STAMP' : 'YETKİLİ İMZA VE KAŞE'}</div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}



