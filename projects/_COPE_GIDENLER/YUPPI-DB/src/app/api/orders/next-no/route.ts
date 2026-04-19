import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const prefix = url.searchParams.get("prefix") || "";

    let nextNo = "00001";

    if (prefix) {
      const lastOrder = await prisma.order.findFirst({
        where: {
           contractNo: { startsWith: prefix }
        },
        orderBy: {
          id: 'desc',
        },
      });

      if (lastOrder && lastOrder.contractNo) {
        // Strip the prefix to get the numeric part
        const withoutPrefix = lastOrder.contractNo.replace(prefix, "");
        const numericPart = parseInt(withoutPrefix.replace(/\D/g, ''), 10);
        
        if (!isNaN(numericPart)) {
           // Pad to 5 digits
           nextNo = String(numericPart + 1).padStart(5, '0');
        }
      }
    } else {
      // Fallback behavior if no prefix
      const lastOrder = await prisma.order.findFirst({
        orderBy: { id: 'desc' },
      });
      if (lastOrder && lastOrder.contractNo) {
         const numericPart = parseInt(lastOrder.contractNo.replace(/\D/g, ''), 10);
         if (!isNaN(numericPart)) {
            nextNo = String(numericPart + 1);
         }
      }
    }

    return NextResponse.json({ nextNo });
  } catch (error) {
    return NextResponse.json({ error: "Sıradaki numara alınırken hata oluştu" }, { status: 500 });
  }
}

