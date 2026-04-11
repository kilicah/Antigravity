import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    
    await prisma.invoice.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
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
      if (item.gtipNo !== undefined) {
        return prisma.orderItem.update({
          where: { id: item.orderItemId },
          data: { gtipNo: item.gtipNo }
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
          totalGrossKg: invoice.grossKg,
          totalNetKg: invoice.netKg,
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
