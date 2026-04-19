import { prisma } from "@/lib/prisma";
import ProductTableClient from "./components/ProductTableClient";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const headersList = await headers();
  const role = headersList.get("x-user-role");

  const rawProducts = await prisma.product.findMany();

  const products = rawProducts.sort((a, b) => {
    if (a.code && b.code) return a.code.localeCompare(b.code);
    if (a.code && !b.code) return -1;
    if (!a.code && b.code) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <ProductTableClient products={products} userRole={role || "USER"} />
  );
}
