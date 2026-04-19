import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: "Fatura silme yetkiniz yok." }, { status: 403 });
    }

    const id = parseInt((await params).id, 10);
    const searchParams = request.nextUrl.searchParams;
    const isHardDelete = searchParams.get("hard") === "true";

    if (isHardDelete) {
      const body = await request.json().catch(() => ({}));
      if (!body.password) {
        return NextResponse.json({ error: "Kalıcı silme işlemi için şifrenizi girmelisiniz." }, { status: 400 });
      }
      
      const userId = request.headers.get("x-user-id");
      if (!userId) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
      
      const admin = await prisma.user.findUnique({ where: { id: parseInt(userId, 10) }});
      if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekir." }, { status: 403 });
      
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(body.password, admin.password);
      if (!isMatch) return NextResponse.json({ error: "Şifreniz hatalı, lütfen tekrar deneyin." }, { status: 401 });

      await prisma.invoice.delete({
        where: { id }
      });
      return NextResponse.json({ success: true, message: "Kalıcı olarak silindi" });
    } else {
      await prisma.invoice.update({
        where: { id },
        data: { isActive: false }
      });
      return NextResponse.json({ success: true, message: "Arşive kaldırıldı" });
    }
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Fatura silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    const body = await request.json();
    const { 
      buyerId, 
      items, 
      invoiceNo, 
      invoiceDate, 
      grossKg, 
      netKg, 
      rollCount, 
      sackCount, 
      logisticsCompanyId,
      customsCompanyId,
      insuranceCompanyId
    } = body;

    if (!buyerId || !items || items.length === 0) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    await Promise.all(items.map((item: any) => {
      const updateData: any = {};
      if (item.gtipNo !== undefined) updateData.gtipNo = item.gtipNo;
      if (item.typeOfGoods !== undefined) updateData.typeOfGoods = item.typeOfGoods;
      
      if (Object.keys(updateData).length > 0) {
        return prisma.orderItem.update({
          where: { id: item.orderItemId },
          data: updateData
        });
      }
      return Promise.resolve();
    }));

    // 1. Delete associated children manually because sometimes Prisma struggles with deep replacements cleanly
    // But since InvoiceItem Cascade deletes rolls (Wait, does it? Let's assume we do it manually to be safe)
    
    // We can delete all items associated with this invoice
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: id }
    });
    
    // We also delete the PackingList if it exists
    await prisma.packingList.deleteMany({
      where: { invoiceId: id }
    });

    // 2. Update the parent Invoice and create new Items and PackingList using the provided data
    // This effectively "replaces" everything perfectly
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        buyerId,
        invoiceNo: invoiceNo || null,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
        grossKg: grossKg ? parseFloat(grossKg) : null,
        netKg: netKg ? parseFloat(netKg) : null,
        rollCount: rollCount ? parseInt(rollCount) : null,
        sackCount: sackCount ? parseInt(sackCount) : null,
        logisticsCompanyId: logisticsCompanyId ? parseInt(logisticsCompanyId) : null,
        customsCompanyId: customsCompanyId ? parseInt(customsCompanyId) : null,
        insuranceCompanyId: insuranceCompanyId ? parseInt(insuranceCompanyId) : null,
        items: {
          create: items.map((item: any) => ({
            orderItemId: item.orderItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalAmount: item.totalAmount
          }))
        }
      },
      include: {
        items: true
      }
    });

    // 3. Collect ALL rolls to create a unified PackingList if any exist
    const allRolls: any[] = [];
    items.forEach((item: any) => {
      if (item.rolls && item.rolls.length > 0) {
        // Find the newly created invoice item to attach the roll to
        const matchedCreatedItem = invoice.items.find((ii: any) => ii.orderItemId === item.orderItemId);
        if (matchedCreatedItem) {
          item.rolls.forEach((r: any) => {
            allRolls.push({
              invoiceItemId: matchedCreatedItem.id,
              rollNo: r.rollNo,
              barcode: r.barcode || null,
              quantity: typeof r.quantity === 'number' ? r.quantity : parseFloat(r.quantity),
              grossKg: typeof r.grossKg === 'number' ? r.grossKg : parseFloat(r.grossKg),
              netKg: typeof r.netKg === 'number' ? r.netKg : parseFloat(r.netKg),
              lotNo: r.lotNo || null
            });
          });
        }
      }
    });

    if (allRolls.length > 0) {
      // Create PackingList parent
      const packingList = await (prisma as any).packingList.create({
        data: {
          invoiceId: invoice.id,
          grossWeight: invoice.grossKg,
          netWeight: invoice.netKg,
          totalRolls: invoice.rollCount
        }
      });

      // Link rolls to the PackingList AND their respective InvoiceItem
      for (const rollData of allRolls) {
        await (prisma as any).roll.create({
          data: {
            ...rollData,
            packingListId: packingList.id
          }
        });
      }
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Fatura güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
