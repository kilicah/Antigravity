import { prisma } from "@/lib/prisma";
import CompanyTableClient from "./components/CompanyTableClient";

export const dynamic = 'force-dynamic';

export default async function CompaniesPage() {
  const rawCompanies = await prisma.company.findMany();

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
    <CompanyTableClient companies={companies} />
  );
}
