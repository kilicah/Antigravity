import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');
    if (role === 'USER') {
      return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
    }

    const body = await req.json();
    const { action, ids, data } = body;

    if (!ids || !ids.length) {
      return NextResponse.json({ error: "Ürün seçilmedi." }, { status: 400 });
    }

    if (action === 'aktifle') {
       await prisma.product.updateMany({
         where: { id: { in: ids } },
         data: { status: "ACTIVE" }
       });
    } else if (action === 'pasifle') {
       await prisma.product.updateMany({
         where: { id: { in: ids } },
         data: { status: "PASSIVE" }
       });
    } else if (action === 'iptal') {
       await prisma.product.updateMany({
         where: { id: { in: ids } },
         data: { status: "CANCELLED" }
       });
    } else if (action === 'cinsle') {
       await prisma.product.updateMany({
         where: { id: { in: ids } },
         data: { productTypes: data.types.join(",") }
       });
    } else {
       return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
    }

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
