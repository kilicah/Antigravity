import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PackingListClientPortrait from "@/components/orders/PackingListClientPortrait";

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
             include: { order: { include: { seller: true, shipTo: true } } }
          }
        }
      }
    }
  });

  if (!invoice || !invoice.packingList) notFound();

  const rolls = invoice.packingList.rolls;
  const firstOrder = invoice.items[0]?.orderItem?.order;
  const seller = firstOrder?.seller;
  
  let productText = "-";
  if (invoice.items.length > 0) {
      const parts = invoice.items.map(i => {
         const oi: any = i.orderItem;
         const model = [oi.qualityName, oi.qualityCode].filter(Boolean).join(' / ') || '';
         const color = oi.colorCode || '';
         const comp = oi.composition || '';
         const typeOfGoods = oi.typeOfGoods || '';
         const widthStr = oi.width ? `${oi.width}CM` : '';
         const weightStr = oi.weight ? `${oi.weight}${/^[0-9.,]+$/.test(oi.weight.toString().trim()) ? ' GR/M2' : ''}` : '';
         
         const components = [model, color, comp, typeOfGoods, widthStr, weightStr].filter(Boolean);
         return components.join(' / ');
      });
      productText = Array.from(new Set(parts)).join(" & ");
  }

  const invoiceNo = invoice.invoiceNo || `USI2026${String(invoice.id).padStart(7, '0')}`;
  const contractNoStr = Array.from(new Set(invoice.items.map(i => i.orderItem.order.contractNo).filter(Boolean))).join(', ');
  const buyerPoNos = Array.from(new Set(invoice.items.map(ix => ix.orderItem.order.buyerPoNo).filter(Boolean))).join(', ');
  const buyerModelNames = Array.from(new Set(invoice.items.map(ix => ix.orderItem.buyerModelName).filter(Boolean))).join(', ');
  
  return (
    <PackingListClientPortrait
      invoice={invoice}
      firstOrder={firstOrder}
      seller={seller}
      productText={productText}
      invoiceNo={invoiceNo}
      contractNoStr={contractNoStr}
      buyerPoNos={buyerPoNos}
      buyerModelNames={buyerModelNames}
      rolls={rolls}
    />
  );
}
