import { prisma } from "@/lib/prisma";
import Link from "next/link";
import OrderTableClient from "./components/OrderTableClient";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      buyer: true,
      seller: true,
      brand: true,
      items: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 w-full h-full">
      <OrderTableClient orders={orders} />
    </div>
  );
}
