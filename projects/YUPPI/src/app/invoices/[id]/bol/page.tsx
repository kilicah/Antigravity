import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BolClient from "@/components/orders/BolClient";

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
    <BolClient
      invoice={invoice}
      firstOrder={firstOrder}
      seller={seller}
      productDesign={productDesign}
      productSpecs={productSpecs}
      dueDate={dueDate}
      grossKg={grossKg}
      netKg={netKg}
      rollCount={rollCount}
      sackCount={sackCount}
      totalAmount={totalAmount}
      totalQuantity={totalQuantity}
      currency={currency}
      unit={unit}
      invoiceNo={invoiceNo}
    />
  );
}
