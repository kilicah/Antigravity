import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query || query.length < 2) {
      return NextResponse.json({ data: [] });
    }

    const items = await prisma.rnDItem.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { code: { contains: query } }
        ]
      },
      take: 20
    });

    return NextResponse.json({ data: items });
  } catch (error: any) {
    console.error("RnD Search Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
