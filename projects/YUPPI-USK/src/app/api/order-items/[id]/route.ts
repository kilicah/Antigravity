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

    const oldItem = await prisma.orderItem.findUnique({ where: { id }});
    if (!oldItem) {
        return NextResponse.json({ error: "Sipariş kalemi bulunamadı" }, { status: 404 });
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id },
      data: updateData,
    });

    const changes: string[] = [];
    const formatVal = (v: any) => {
        if (v instanceof Date) return v.toLocaleDateString("tr-TR");
        return v === null || v === undefined || v === "" || v === false ? "Boş/Hayır" : (v === true ? "Evet" : String(v));
    };

    for (const key of Object.keys(updateData)) {
        const oldVal = (oldItem as any)[key];
        const newVal = updateData[key];

        let oldStr = oldVal instanceof Date ? oldVal.getTime() : oldVal;
        let newStr = newVal instanceof Date ? newVal.getTime() : newVal;

        if (oldStr === null || oldStr === undefined || oldStr === "") oldStr = null;
        if (newStr === null || newStr === undefined || newStr === "") newStr = null;

        if (oldStr !== newStr) {
            const label = oldItem.qualityCode || oldItem.qualityName || 'İsimsiz Kalem';
            changes.push(`• Takip Paneli - Kalem (${label}) [${key}] alanı: ${formatVal(oldVal)} ➔ ${formatVal(newVal)}`);
        }
    }

    if (changes.length > 0) {
        const username = request.headers.get("x-user-username") || "Bilinmeyen Kullanıcı";
        await prisma.orderLog.create({
            data: {
                orderId: oldItem.orderId,
                username: username,
                action: "TRACKING_UPDATE",
                details: changes.join("\n")
            }
        });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Tracking update error:", error);
    return NextResponse.json(
      { error: "Sipariş kalemi güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
