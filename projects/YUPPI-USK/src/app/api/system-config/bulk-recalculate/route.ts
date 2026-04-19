import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const selectedTypes = body.types || [];

    const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    if (!config) return NextResponse.json({ error: "Config not found" }, { status: 400 });

    let products = await prisma.product.findMany({});
    
    if (selectedTypes.length > 0) {
      products = products.filter(p => {
        if (!p.productTypes) return false;
        const pTypes = p.productTypes.split(",");
        return selectedTypes.some((t: string) => pTypes.includes(t));
      });
    }

    let updatedCount = 0;

    for (const p of products) {
      let baseVal = 0;
      if (config.baseTier === "T1" && p.priceTier1) baseVal = p.priceTier1;
      else if (config.baseTier === "T2" && p.priceTier2) baseVal = p.priceTier2;
      else if (config.baseTier === "T3" && p.priceTier3) baseVal = p.priceTier3;
      
      if (baseVal > 0) {
        // Formül: ( Fiyat_USD / Döviz_Kuru ) * ( 1 + Yüzde_Komisyon / 100 ) + Döviz_İçi_Navlun

        const gbpBase = baseVal / config.usdToGbpRate;
        const gbpCif = (gbpBase * (1 + config.gbpCommission / 100)) + config.gbpFreight;
        const newGbp = parseFloat(gbpCif.toFixed(2));

        const eurBase = baseVal / config.usdToEurRate;
        const eurCif = (eurBase * (1 + config.eurCommission / 100)) + config.eurFreight;
        const newEur = parseFloat(eurCif.toFixed(2));

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
