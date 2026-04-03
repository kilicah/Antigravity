import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PackingListPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const invoiceId = parseInt((await params).id, 10);
  
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      buyer: true,
      packingList: {
        include: {
          rolls: {
            orderBy: { id: 'asc' }
          }
        }
      },
      items: {
        include: {
          orderItem: {
             include: { order: { include: { seller: true } } }
          }
        }
      }
    }
  });

  if (!invoice || !invoice.packingList) notFound();

  const rolls = invoice.packingList.rolls;
  const firstOrder = invoice.items[0]?.orderItem?.order;
  const seller = firstOrder?.seller;
  
  // Create a combined product description string for all rows since generic excel has no row-specific articles
  let productText = "-";
  if (invoice.items.length > 0) {
      const parts = invoice.items.map(i => {
         const oi = i.orderItem;
         return `${oi.productName || ''} / ${oi.color || ''} / ${oi.composition || ''} / ${oi.width || ''}CM`.replace(/\s+\/\s+/g, ' / ').replace(/^\s*\/\s*/, '').trim();
      });
      productText = Array.from(new Set(parts)).join(" & ");
  }

  const invoiceNo = invoice.invoiceNo || `USI2026${String(invoice.id).padStart(7, '0')}`;
  const contractNoStr = Array.from(new Set(invoice.items.map(i => i.orderItem.order.contractNo))).join(', ');
  
  return (
    <div className="max-w-[1000px] mx-auto bg-white p-6 min-h-[1414px] shadow-2xl print:shadow-none print:p-0 font-sans text-[11px] leading-tight text-black">
      
      {/* HEADER ACTION (HIDDEN IN PRINT) */}
      <div className="flex justify-between items-center print:hidden mb-4">
        <Link href={`/invoices/${invoiceId}`} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm">
          &larr; Faturaya Dön
        </Link>
        <button 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded shadow flex items-center gap-2 transition-colors text-sm"
        >
          <span dangerouslySetInnerHTML={{ __html: `<a href="javascript:window.print()">Çeki Listesi Yazdır</a>` }} />
        </button>
      </div>

      <div className="w-[1002px] bg-white text-black font-['Arial',_'Helvetica',_sans-serif] text-[12px] leading-tight border-2 border-black relative mx-auto">
        
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
            <h1 className="text-[#d81e1e] font-sans font-bold text-[36px] text-center leading-tight tracking-wider uppercase">
              PACKING<br/>LIST
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

        {/* ROLLS TABLE */}
        <table className="w-full text-center border-collapse border-b border-black">
          <thead className="font-bold">
            <tr>
              <th className="border-r border-b border-black p-1 w-12">ROLL</th>
              <th className="border-r border-b border-black p-1">DESIGN/COLOR/COMPOSITION</th>
              <th className="border-r border-b border-black p-1 w-32">ORDER NO</th>
              <th className="border-r border-b border-black p-1 w-12">LOT</th>
              <th className="border-r border-b border-black p-1 w-16">BAR NO</th>
              <th className="border-r border-b border-black p-1 w-16">METERS</th>
              <th className="border-r border-b border-black p-1 w-16">NET KG</th>
              <th className="border-b border-black p-1 w-16">GROSS KG</th>
            </tr>
          </thead>
          <tbody>
            {rolls.map((roll, i) => (
              <tr key={roll.id}>
                <td className="border-r border-black p-1">{roll.rollNo || (i+1).toString()}</td>
                <td className="border-r border-black p-1 text-[10px] break-words">
                  {productText}
                </td>
                <td className="border-r border-black p-1 text-[10px]">
                  {contractNoStr ? `PO. ${contractNoStr} / DOCKER` : "-"}
                </td>
                <td className="border-r border-black p-1">{roll.lotNo || "1"}</td>
                <td className="border-r border-black p-1">{roll.barcode || "-"}</td>
                <td className="border-r border-black p-1 text-right pr-2">
                   {roll.quantity?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "-"}
                </td>
                <td className="border-r border-black p-1 text-right pr-2">
                   {roll.netKg?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "-"}
                </td>
                <td className="p-1 text-right pr-2">
                   {roll.grossKg?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "-"}
                </td>
              </tr>
            ))}
            {/* ROW FILLER FOR SMALL LISTS */}
            {rolls.length === 0 && (
              <tr><td colSpan={8} className="p-4 italic">No rolls recorded.</td></tr>
            )}
            
            {/* INLINE SUBTOTAL */}
            <tr className="font-bold border-t border-black">
              <td colSpan={5} className="border-r border-black p-1"></td>
              <td className="border-r border-black p-1 text-right pr-2">
                {rolls.reduce((s, r) => s + (r.quantity || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="border-r border-black p-1 text-right pr-2">
                {rolls.reduce((s, r) => s + (r.netKg || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="p-1 text-right pr-2">
                {rolls.reduce((s, r) => s + (r.grossKg || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>

        {/* BOTTOM TOTAL SUMMARY BOXES */}
        <div className="grid grid-cols-[1fr_0.4fr]">
           <div className="font-bold border-r border-black p-2 flex items-center justify-center">
             THE GOODS ARE OF TURKISH ORIGIN
           </div>
           
           <div className="grid grid-cols-2 font-bold text-sm">
             <div className="p-1 border-r border-b border-black">TOTAL METERS</div>
             <div className="p-1 border-b border-black text-center">{rolls.reduce((s, r) => s + (r.quantity || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
             
             <div className="p-1 border-r border-b border-black">TOTAL NET KG</div>
             <div className="p-1 border-b border-black text-center">{rolls.reduce((s, r) => s + (r.netKg || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>

             <div className="p-1 border-r border-b border-black">TOTAL GROSS KG</div>
             <div className="p-1 border-b border-black text-center">{rolls.reduce((s, r) => s + (r.grossKg || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>

             <div className="p-1 border-r border-black">TOTAL ROLLS</div>
             <div className="p-1 text-center">{invoice.packingList.totalRolls || rolls.length}</div>
           </div>
        </div>

      </div>
    </div>
  );
}
