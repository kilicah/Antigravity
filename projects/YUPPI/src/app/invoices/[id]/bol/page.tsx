import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BoLPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const invoiceId = parseInt((await params).id, 10);
  
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      buyer: true,
      logisticsCompany: true,
      customsCompany: true,
      packingList: true,
      items: {
        include: {
          orderItem: {
             include: { order: { include: { seller: true, shipTo: true } } }
          }
        }
      }
    }
  });

  if (!invoice) notFound();

  // Pick first order details
  const firstOrder = invoice.items[0]?.orderItem?.order;
  const seller = firstOrder?.seller;
  
  const invoiceNo = invoice.invoiceNo || `USI2026${String(invoice.id).padStart(7, '0')}`;
  
  const totalAmount = invoice.items.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalQuantity = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
  const currency = firstOrder?.currency || "USD";
  const unit = firstOrder?.unit || "MTS";

  const dueDate = invoice.invoiceDate 
      ? new Date(new Date(invoice.invoiceDate).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR')
      : "11.06.2026";

  let productDesign = "WOWEN FABRIC";
  let productSpecs = "145CM WIDTH / 120GR2M";
  if (invoice.items.length > 0) {
      productDesign = Array.from(new Set(invoice.items.map(i => i.orderItem.composition))).join(", ");
      productSpecs = Array.from(new Set(invoice.items.map(i => `${i.orderItem.width || ''}CM WIDTH / ${i.orderItem.weight || ''}GR2M`))).join(" & ");
  }

  // Calculate gross/net from PL if it exists, otherwise from invoice
  const grossKg = invoice.packingList?.grossWeight || invoice.grossKg || 0;
  const netKg = invoice.packingList?.netWeight || invoice.netKg || 0;
  const rollCount = invoice.packingList?.totalRolls || invoice.rollCount || 0;
  const sackCount = invoice.sackCount || "-";

  return (
    <div className="max-w-[1000px] mx-auto bg-white p-6 min-h-[1414px] shadow-2xl print:shadow-none print:p-0 font-sans text-xs leading-tight text-black">
      
      {/* HEADER ACTION (HIDDEN IN PRINT) */}
      <div className="flex justify-between items-center print:hidden mb-4">
        <Link href={`/invoices/${invoiceId}`} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm">
          &larr; Faturaya Dön
        </Link>
        <button 
          className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded shadow flex items-center gap-2 transition-colors text-sm"
        >
          <span dangerouslySetInnerHTML={{ __html: `<a href="javascript:window.print()">Konşimento Talimatnamesi Yazdır</a>` }} />
        </button>
      </div>

      <div className="w-[1002px] bg-white text-black font-['Arial',_'Helvetica',_sans-serif] text-[12px] leading-tight border-2 border-black relative mx-auto mt-2">
        
        {/* ROW 1 */}
        <div className="grid grid-cols-[401px_401px_200px] border-b-2 border-black">
          {/* 1. SELLER (401px) */}
          <div className="border-r-2 border-black p-2 flex flex-col h-[135px]">
            <div className="font-bold underline mb-1 uppercase">SELLER / İHRACATÇI FİRMA</div>
            <div className="font-bold uppercase text-[12px]">{seller?.name || "USK TEKSTİL SANAYİ VE TİCARET LİMİTED ŞİRKETİ"}</div>
            <div className="uppercase whitespace-pre-wrap leading-snug">
               {seller?.address || "DEMİRTAŞ DUMLUPINAR OSB., MUSTAFA KARAER CD., NO:49/2,"}
               <br />
               {seller?.district || ""} {seller?.city || "OSMANGAZİ, BURSA"}, {seller?.country || "TÜRKİYE"}
            </div>
            <div className="mt-1 flex flex-col uppercase">
               {(seller?.taxNo || seller?.taxOffice || seller?.registrationNo) && (
                 <div>
                   {seller?.taxOffice ? seller?.taxOffice + " VD. " : ""}{seller?.taxNo ? seller?.taxNo : ""} / TİC.SİC.NO {seller?.registrationNo || "40640"}
                 </div>
               )}
               <div>T. {seller?.phone || "+90 224 261 21 00"}</div>
            </div>
          </div>
          
          {/* 2. TITLE (401px) */}
          <div className="border-r-2 border-black p-2 flex justify-center items-center h-[135px]">
            <h1 className="text-[#d81e1e] font-sans font-bold text-[28px] text-center leading-tight tracking-wider uppercase">
              KONSİMENTO<br/>TALİMATNAMESİ
            </h1>
          </div>

          {/* 3. LOGO (200px) */}
          <div className="p-2 flex justify-center items-center h-[135px]">
             <img src="/images/Defenni-M-Kirmizi.jpg" alt="Logo" className="max-h-[89px] max-w-[198px] object-contain mix-blend-multiply" />
          </div>
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-[401px_401px_200px] border-b-2 border-black">
          {/* 1. BUYER (401px) */}
          <div className="border-r-2 border-black p-2 flex flex-col h-[135px] leading-snug">
            <div className="font-bold underline mb-1 uppercase">BUYER / İTHALATÇI FİRMA</div>
            <div className="font-bold uppercase text-[12px]">{invoice.buyer?.nameEn || invoice.buyer?.name || "-"}</div>
            <div className="uppercase whitespace-pre-wrap">
               {invoice.buyer?.addressEn || invoice.buyer?.address || "-"}
               {(() => {
                 const d = invoice.buyer?.districtEn || invoice.buyer?.district;
                 const c = invoice.buyer?.cityEn || invoice.buyer?.city;
                 const cntry = invoice.buyer?.countryEn || invoice.buyer?.country;
                 const zip = invoice.buyer?.zipCode;
                 const locArr = [d, c, cntry].filter(Boolean);
                 const locStr = locArr.join(', ');
                 return (locStr || zip) ? `\n${locStr}${locStr && zip ? ' ' : ''}${zip || ''}` : '';
               })()}
            </div>
            <div className="mt-1 flex flex-col uppercase">
               {(invoice.buyer?.taxNo || invoice.buyer?.taxOffice) && (
                 <div>{invoice.buyer?.taxOffice ? invoice.buyer?.taxOffice + " VD. " : ""}{invoice.buyer?.taxNo ? invoice.buyer?.taxNo : ""}</div>
               )}
               {invoice.buyer?.phone && <div>T. {invoice.buyer.phone}</div>}
            </div>
          </div>

          {/* 2. DELIVERY ADDRESS (401px) */}
          <div className="border-r-2 border-black p-2 flex flex-col h-[135px] leading-snug">
            <div className="font-bold underline mb-1 uppercase">DELIVERY ADDRESS / SEVK ADRESİ</div>
            <div className="font-bold uppercase text-[12px]">{firstOrder?.shipTo ? (firstOrder.shipTo.nameEn || firstOrder.shipTo.name) : (invoice.buyer?.nameEn || invoice.buyer?.name || "-")}</div>
            <div className="uppercase whitespace-pre-wrap">
               {firstOrder?.shipTo ? (firstOrder.shipTo.addressEn || firstOrder.shipTo.address) : (invoice.buyer?.addressEn || invoice.buyer?.address || "-")}
               {(() => {
                 const target = firstOrder?.shipTo || invoice.buyer;
                 const d = target?.districtEn || target?.district;
                 const c = target?.cityEn || target?.city;
                 const cntry = target?.countryEn || target?.country;
                 const zip = target?.zipCode;
                 const locArr = [d, c, cntry].filter(Boolean);
                 const locStr = locArr.join(', ');
                 return (locStr || zip) ? `\n${locStr}${locStr && zip ? ' ' : ''}${zip || ''}` : '';
               })()}
            </div>
            {firstOrder?.shipTo?.contactName && <div>CONTACT PERSON. {firstOrder.shipTo.contactName}</div>}
          </div>

          {/* 3. INVOICE INFO (200px) */}
          <div className="flex flex-col h-[135px] leading-snug text-[11px] font-bold">
            <div className="border-b-2 border-black p-2 flex items-center h-[45px]">
              <span className="w-20 uppercase shrink-0">FATURA NO</span>
              <span className="font-normal">{invoiceNo}</span>
            </div>
            <div className="border-b-2 border-black p-2 flex items-center h-[45px]">
               <span className="w-20 uppercase shrink-0">FATURA TARİHİ</span>
               <span className="font-normal">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('tr-TR') : "-"}</span>
            </div>
            <div className="p-2 flex items-center h-[45px]">
               <span className="w-20 uppercase shrink-0">ALICI SİPARİŞ NO</span>
               <span className="font-normal">{Array.from(new Set(invoice.items.map(i => i.orderItem.order.buyerPoNo).filter(Boolean))).join(', ') || "-"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2">
          {/* TRANSPORTER COMPANY */}
          <div className="p-1 border-r border-black border-b min-h-[90px]">
             <div className="font-bold underline mb-1">TRANSPORTER COMPANY</div>
             <div className="font-bold">{invoice.logisticsCompany?.name || firstOrder?.transporter || "-"}</div>
             <div>{invoice.logisticsCompany?.address || "MASLAK MH, BUYUKDERE CD., NO.255"}</div>
             <div>{invoice.logisticsCompany?.city || "ISTANBUL, TURKIYE"}</div>
             <a href="#" className="text-purple-800 font-bold underline block mt-1">alper.gundogdu@dachser.com / M. +90 549 6630551</a>
          </div>

          {/* CUSTOM AGENCY */}
          <div className="p-1 border-b border-black min-h-[90px]">
             <div className="font-bold underline mb-1">CUSTOM AGENCY</div>
             <div>{invoice.customsCompany?.name || "HGL GUMRUK MUSAVIRLIGI LOJ. VE DIS TICARET A.S."}</div>
             <div>{invoice.customsCompany?.address || "BEYLIKDUZU MERMERCILER OSB MH., 7. CD., NO.4, K.2"}</div>
             <div>{invoice.customsCompany?.city || "BEYLIKDUZU, 34524, ISTANBUL, TURKIYE"}</div>
             <div>PHONE. +90 212 8757700 - 304</div>
             <a href="#" className="text-purple-800 font-bold underline">ergun.kadir@hgl.com.tr</a>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-[1fr_2fr] border-b border-black font-bold">
           <div className="p-1 border-r border-black border-b bg-gray-100/30">TYPES OF GOODS</div>
           <div className="p-1 border-b border-black bg-white">{productDesign}</div>

           <div className="p-1 border-r border-black border-b bg-gray-100/30">GTYPE NO</div>
           <div className="border-b border-black grid grid-cols-[1fr_0.4fr_1fr]">
              <div className="p-1 border-r border-black">{invoice.items[0]?.orderItem.composition?.includes('5407') ? '5407.61.90.90.19' : '5407.61.90.90.19'}</div>
              <div className="p-1 border-r border-black bg-gray-100/30">GOODS SPC.</div>
              <div className="p-1 text-[10px]">{productSpecs}</div>
           </div>

           <div className="p-1 border-r border-black border-b bg-gray-100/30">PAYMENT TERMS</div>
           <div className="border-b border-black grid grid-cols-[1fr_0.4fr_1fr]">
              <div className="p-1 border-r border-black">{firstOrder?.paymentTerms || "90 DAYS NET"}</div>
              <div className="p-1 border-r border-black bg-gray-100/30">DUE DATE</div>
              <div className="p-1">{dueDate}</div>
           </div>
           
           <div className="p-1 border-r border-black border-b bg-gray-100/30">DELIVERY TERMS</div>
           <div className="p-1 border-b border-black">{firstOrder?.deliveryTerms || "-"} {firstOrder?.deliveryDestination || ""}</div>

           <div className="p-1 border-r border-black border-b bg-gray-100/30">TOTAL QUANTITY</div>
           <div className="border-b border-black grid grid-cols-[1fr_1.4fr]">
              <div className="p-1 border-r border-black text-right pr-4 tracking-wider">{totalQuantity.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="p-1">{unit}</div>
           </div>

           <div className="p-1 border-r border-black border-b bg-gray-100/30">TOTAL AMAOUNT OF INVOICE</div>
           <div className="border-b border-black grid grid-cols-[1fr_1.4fr]">
              <div className="p-1 border-r border-black text-right pr-4 tracking-wider">{totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="p-1">{currency}</div>
           </div>

           <div className="p-1 border-r border-black border-b bg-gray-100/30">TOTAL GROSS KG</div>
           <div className="border-b border-black grid grid-cols-[1fr_0.4fr_0.6fr_0.4fr]">
              <div className="p-1 border-r border-black text-right pr-4 tracking-wider">{grossKg ? grossKg.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"}</div>
              <div className="p-1 border-r border-black">KG</div>
              <div className="p-1 border-r border-black bg-gray-100/30">N.OF ROLLS</div>
              <div className="p-1 text-center">{rollCount || "-"}</div>
           </div>

           <div className="p-1 border-r border-black border-b bg-gray-100/30">TOTAL NET KG</div>
           <div className="border-b border-black grid grid-cols-[1fr_0.4fr_0.6fr_0.4fr]">
              <div className="p-1 border-r border-black text-right pr-4 tracking-wider">{netKg ? netKg.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"}</div>
              <div className="p-1 border-r border-black">KG</div>
              <div className="p-1 border-r border-black bg-gray-100/30 text-[10px]">N. OF SACKS</div>
              <div className="p-1 text-center">{sackCount || "-"}</div>
           </div>
           
           <div className="p-1 border-r border-black bg-gray-100/30">MANUFACTURER COMPANY</div>
           <div className="p-1 text-center">{seller?.name || "U.S.K. TEKSTIL SANAYI VE TICARET LIMITED SIRKETI"}</div>
        </div>

        {/* BOTTOM NOTES */}
        <div className="border-t-[4px] border-black"></div>
        <div className="grid grid-cols-[1fr_2fr] border-b border-black font-bold">
           <div className="p-1 border-r border-black border-b">DOCUMENTS NEEDS</div>
           <div className="p-1 border-b border-black font-normal">EUR 1</div>

           <div className="p-1 border-r border-black">NOTES</div>
           <div className="p-1 font-normal">IN ALL DOCUMENTS, GOODS NAME AND SPECSIFICATIONS WILL BE SAME</div>
        </div>

        <div className="text-center font-bold border-t-[4px] border-black p-2 bg-gray-100/30">
           <div>THE GOODS ARE OF TURKISH ORIGIN</div>
           <div>URUNLER TURKIYE MENSEILIDIR</div>
        </div>
      </div>
    </div>
  );
}
