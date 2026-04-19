import { prisma } from "@/lib/prisma";

export async function syncOrderItemsToVariants(buyerId: number, items: any[]) {
  if (!buyerId || !items || !Array.isArray(items)) return;

  for (const item of items) {
    if (!item.qualityName) continue; // qualityName (Base Product) is required

    const qualityName = item.qualityName.trim();
    const buyerModelName = item.buyerModelName ? item.buyerModelName.trim() : null;
    const colorCode = item.colorCode ? item.colorCode.trim() : null;

    if (!buyerModelName && !colorCode) continue; // Default product, no distinct variant info to save

    try {
      const existingVariant = await prisma.companyProductVariant.findFirst({
        where: {
          companyId: buyerId,
          qualityName: qualityName,
          buyerModelName: buyerModelName,
          colorCode: colorCode,
        }
      });

      if (existingVariant) {
        // Update existing variant with latest specs
        await prisma.companyProductVariant.update({
          where: { id: existingVariant.id },
          data: {
            composition: item.composition || existingVariant.composition,
            weight: item.weight || existingVariant.weight,
            width: item.width || existingVariant.width,
          }
        });
      } else {
        // Create new variant
        await prisma.companyProductVariant.create({
          data: {
            companyId: buyerId,
            qualityName: qualityName,
            buyerModelName: buyerModelName,
            colorCode: colorCode,
            composition: item.composition || null,
            weight: item.weight || null,
            width: item.width || null,
          }
        });
      }
    } catch (err) {
      console.error("Failed to sync variant for item:", qualityName, err);
    }
  }
}
