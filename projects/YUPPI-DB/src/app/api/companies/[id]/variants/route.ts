import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Geçersiz firma ID" }, { status: 400 });
    }
    // @ts-ignore
    const variants = await prisma.companyProductVariant.findMany({
      where: { companyId: id },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(variants, { status: 200 });
  } catch (error) {
    console.error("Error fetching company product variants:", error);
    return NextResponse.json(
      { error: "Varyantlar getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
