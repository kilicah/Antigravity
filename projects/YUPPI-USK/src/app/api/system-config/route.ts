import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    let config = await prisma.systemConfig.findUnique({
      where: { id: 1 }
    });

    if (!config) {
      config = await prisma.systemConfig.create({
        data: {
          id: 1,
          baseTier: "T2",
          usdToGbpRate: 1.30,
          usdToEurRate: 1.10,
          usdToTryRate: 50.00,
          usdFreight: 0.0,
          gbpFreight: 0.20,
          eurFreight: 0.25,
          tryFreight: 0.0,
          usdCommission: 0.0,
          gbpCommission: 5.0,
          eurCommission: 0.0,
          tryCommission: 0.0
        }
      });
    }

    return NextResponse.json({ data: config });
  } catch (error: any) {
    console.error("SystemConfig GET Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const dataObj = {
        baseTier: body.baseTier || "T2",
        usdToGbpRate: parseFloat(body.usdToGbpRate) || 1.30,
        usdToEurRate: parseFloat(body.usdToEurRate) || 1.10,
        usdToTryRate: parseFloat(body.usdToTryRate) || 50.00,
        usdFreight: parseFloat(body.usdFreight) || 0,
        gbpFreight: parseFloat(body.gbpFreight) || 0,
        eurFreight: parseFloat(body.eurFreight) || 0,
        tryFreight: parseFloat(body.tryFreight) || 0,
        usdCommission: parseFloat(body.usdCommission) || 0,
        gbpCommission: parseFloat(body.gbpCommission) || 0,
        eurCommission: parseFloat(body.eurCommission) || 0,
        tryCommission: parseFloat(body.tryCommission) || 0,
    };

    const config = await prisma.systemConfig.upsert({
      where: { id: 1 },
      update: dataObj,
      create: { id: 1, ...dataObj }
    });

    return NextResponse.json({ data: config });
  } catch (error: any) {
    console.error("SystemConfig POST Error:", error);
    return NextResponse.json({ error: "Ayar kaydedilemedi" }, { status: 500 });
  }
}
