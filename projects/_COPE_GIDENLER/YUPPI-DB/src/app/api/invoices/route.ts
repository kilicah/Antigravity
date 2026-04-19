import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const role = req.headers.get('x-user-role');
    if (role === 'USER') {
      return NextResponse.json({ error: "Fatura oluşturma yetkiniz yok." }, { status: 403 });
    }
    const body = await req.json();
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

    // items is an array of { orderItemId, quantity, unitPrice, totalAmount, rolls: [] }

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

    // First create the invoice structure
    const invoice = await prisma.invoice.create({
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

    // Check if any rolls are provided across items
    const allRolls = items.flatMap((item: any) => item.rolls || []);

    if (allRolls.length > 0) {
      // Calculate totals
      const totalGross = allRolls.reduce((s: number, r: any) => s + (parseFloat(r.grossKg) || 0), 0);
      const totalNet = allRolls.reduce((s: number, r: any) => s + (parseFloat(r.netKg) || 0), 0);

      // Create PackingList
      const pl = await prisma.packingList.create({
        data: {
          invoiceId: invoice.id,
          totalRolls: allRolls.length,
          grossWeight: totalGross,
          netWeight: totalNet,
        }
      });

      // Prepare Roll insertions
      const rollInserts: any[] = [];
      for (const item of items) {
        if (item.rolls && item.rolls.length > 0) {
          // Find the corresponding created InvoiceItem id
          const createdInvoiceItem = invoice.items.find(ii => ii.orderItemId === item.orderItemId);
          if (createdInvoiceItem) {
            for (const r of item.rolls) {
              rollInserts.push({
                packingListId: pl.id,
                invoiceItemId: createdInvoiceItem.id,
                rollNo: r.rollNo,
                barcode: r.barcode,
                quantity: parseFloat(r.quantity) || 0,
                grossKg: parseFloat(r.grossKg) || 0,
                netKg: parseFloat(r.netKg) || 0,
                lotNo: r.lotNo
              });
            }
          }
        }
      }

      if (rollInserts.length > 0) {
        await prisma.roll.createMany({
          data: rollInserts
        });
      }
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: error.message || "Fatura oluşturulamadı" }, { status: 500 });
  }
}
