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
          commissionRate: 1.05,
          freightCost: 0.20,
          usdToGbpRate: 1.25,
          usdToEurRate: 1.08
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
    
    const config = await prisma.systemConfig.upsert({
      where: { id: 1 },
      update: {
        commissionRate: parseFloat(body.commissionRate),
        freightCost: parseFloat(body.freightCost),
        usdToGbpRate: parseFloat(body.usdToGbpRate),
        usdToEurRate: parseFloat(body.usdToEurRate),
        baseTier: body.baseTier || "T2"
      },
      create: {
        id: 1,
        commissionRate: parseFloat(body.commissionRate) || 1.05,
        freightCost: parseFloat(body.freightCost) || 0.20,
        usdToGbpRate: parseFloat(body.usdToGbpRate) || 1.25,
        usdToEurRate: parseFloat(body.usdToEurRate) || 1.08,
        baseTier: body.baseTier || "T2"
      }
    });

    return NextResponse.json({ data: config });
  } catch (error: any) {
    console.error("SystemConfig POST Error:", error);
    return NextResponse.json({ error: "Ayar kaydedilemedi" }, { status: 500 });
  }
}
