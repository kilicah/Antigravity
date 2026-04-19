import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    if (!config) return NextResponse.json({ error: "Config not found" }, { status: 400 });

    const products = await prisma.product.findMany({});
    let updatedCount = 0;

    for (const p of products) {
      let baseVal = 0;
      if (config.baseTier === "T1" && p.priceTier1) baseVal = p.priceTier1;
      else if (config.baseTier === "T2" && p.priceTier2) baseVal = p.priceTier2;
      else if (config.baseTier === "T3" && p.priceTier3) baseVal = p.priceTier3;
      
      if (baseVal > 0) {
        const res = (baseVal * config.commissionRate) + config.freightCost;
        const newGbp = parseFloat((res / config.usdToGbpRate).toFixed(2));
        const newEur = parseFloat((res / config.usdToEurRate).toFixed(2));

        await prisma.product.update({
          where: { id: p.id },
          data: {
            poundPrice: newGbp,
            euroPrice: newEur
          }
        });
        updatedCount++;
      }
    }

    return NextResponse.json({ success: true, count: updatedCount });
  } catch (error: any) {
    console.error("Bulk Recalc Error:", error);
    return NextResponse.json({ error: "Hesaplama hatası" }, { status: 500 });
  }
}
