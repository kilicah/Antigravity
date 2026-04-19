import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');
    if (role === 'USER') {
      return NextResponse.json({ error: "Bu işlemi yapmaya yetkiniz yok." }, { status: 403 });
    }

    const { productIds, updates } = await req.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "Lütfen en az bir ürün seçin." }, { status: 400 });
    }

    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: {
        costPrice: updates.costPrice,
        priceTier1: updates.priceTier1,
        priceTier2: updates.priceTier2,
        priceTier3: updates.priceTier3,
        poundPrice: updates.poundPrice,
        euroPrice: updates.euroPrice,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error applying custom matrix:", error);
    return NextResponse.json({ error: "Hesaplama uygulanırken bir hata oluştu." }, { status: 500 });
  }
}
