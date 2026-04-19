import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
    }

    const body = await request.json();
    
    // Yalnızca geçerli alanların güncellenmesine izin ver
    const allowedFields = [
      "etd", "fds", "cs", "csSentDate", "csApprovalDate",
      "ldSentDate", "ldApprovalDate", "bsSentDate", "bsApprovalDate",
      "mpa", "dpa", "rs", "rsMs", "bsMs", "bltRd", "bltMs", "bltMa",
      "ltAd", "bsad", "pl"
    ];

    const dateFields = [
      "etd", "csSentDate", "csApprovalDate", "ldSentDate", "ldApprovalDate", 
      "bsSentDate", "bsApprovalDate", "rsMs", "bsMs", "bltRd", "bltMs", "bltMa", 
      "ltAd", "bsad"
    ];

    const updateData: any = {};
    for (const key of Object.keys(body)) {
      if (allowedFields.includes(key)) {
        if (dateFields.includes(key)) {
            updateData[key] = body[key] ? new Date(body[key]) : null;
        } else {
            updateData[key] = body[key];
        }
      }
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Tracking update error:", error);
    return NextResponse.json(
      { error: "Sipariş kalemi güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
