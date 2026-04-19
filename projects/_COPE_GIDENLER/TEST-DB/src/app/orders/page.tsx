import { prisma } from "@/lib/prisma";
import Link from "next/link";
import OrderTableClient from "./components/OrderTableClient";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const headersList = await headers();
  const role = headersList.get("x-user-role");
  const userId = headersList.get("x-user-id");

  let whereClause: any = {};
  if (role === "USER" && userId) {
    const allowedUserId = parseInt(userId);
    whereClause = {
      OR: [
        { buyer: { allowedUsers: { some: { id: allowedUserId } } } },
        { shipTo: { allowedUsers: { some: { id: allowedUserId } } } },
        { brand: { allowedUsers: { some: { id: allowedUserId } } } }
      ]
    };
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
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
      <OrderTableClient orders={orders} userRole={role || "USER"} />
    </div>
  );
}
