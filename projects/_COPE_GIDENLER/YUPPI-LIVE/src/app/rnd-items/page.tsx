import { prisma } from "@/lib/prisma";
import RnDTableClient from "./components/RnDTableClient";

export const dynamic = 'force-dynamic';

export default async function RnDItemsPage() {
  const rawItems = await prisma.rnDItem.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <RnDTableClient items={rawItems} />
  );
}
