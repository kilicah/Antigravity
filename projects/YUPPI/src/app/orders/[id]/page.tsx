import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SalesContractDocument from "@/components/orders/SalesContractDocument";

export default async function OrderViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const idStr = (await params).id;
  if (!idStr || idStr === 'undefined') notFound();
  
  const id = parseInt(idStr, 10);
  if (isNaN(id)) notFound();
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      seller: true,
      buyer: true,
      shipTo: true,
      brand: true,
      items: true
    }
  });

  if (!order) notFound();

  // Hesaplamalar
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = order.items.reduce((sum, item) => sum + item.totalAmount, 0);

  // Banka bilgisi getirme (Satıcı ve Para Birimine Göre)
  // Eğer aynı para biriminde birden fazla hesap varsa isDefault olanı tercih et
  const bankInfo = await prisma.bankInfo.findFirst({
    where: {
      companyId: order.sellerId,
      currency: order.currency,
      isDefault: true
    }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SalesContractDocument 
        order={order}
        bankInfo={bankInfo}
      />
    </div>
  );
}
