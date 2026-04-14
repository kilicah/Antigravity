import { prisma } from "@/lib/prisma";
import CompanyTableClient from "./components/CompanyTableClient";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function CompaniesPage() {
  const headersList = await headers();
  const role = headersList.get("x-user-role");
  const userId = headersList.get("x-user-id");

  let whereClause: any = {};
  if (role === "USER" && userId) {
    whereClause = {
      OR: [
        { isSeller: true },
        { allowedUsers: { some: { id: parseInt(userId) } } }
      ]
    };
  }

  const rawCompanies = await prisma.company.findMany({
    where: whereClause
  });

  const companies = rawCompanies.sort((a, b) => {
    // Both have codes -> Sort alphabetically by code
    if (a.code && b.code) return a.code.localeCompare(b.code);
    
    // Only 'a' has a code -> 'a' goes first (to top)
    if (a.code && !b.code) return -1;
    
    // Only 'b' has a code -> 'b' goes first (to top)
    if (!a.code && b.code) return 1;
    
    // Neither has a code -> Sort alphabetically by name
    return a.name.localeCompare(b.name);
  });

  return (
    <CompanyTableClient companies={companies} userRole={role || "USER"} />
  );
}
