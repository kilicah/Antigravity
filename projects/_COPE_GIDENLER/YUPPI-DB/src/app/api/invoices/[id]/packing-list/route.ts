import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    const body = await request.json();
    const { rolls } = body;

    if (!rolls || !Array.isArray(rolls)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // Step 1: Ensure PackingList exists for this invoice
    let packingList = await prisma.packingList.findUnique({
      where: { invoiceId: id }
    });

    if (!packingList) {
      packingList = await prisma.packingList.create({
        data: {
          invoiceId: id,
          totalRolls: rolls.length,
          grossWeight: rolls.reduce((sum, r) => sum + (r.grossKg || 0), 0),
          netWeight: rolls.reduce((sum, r) => sum + (r.netKg || 0), 0)
        }
      });
    }

    // Step 2: Clear old rolls if they exist to replace with the fresh upload
    await prisma.roll.deleteMany({
      where: { packingListId: packingList.id }
    });

    // Step 3: Insert new rolls
    // Convert to Prisma Input format
    const dbRolls = rolls.map((r: any) => ({
      packingListId: packingList!.id,
      rollNo: r.rollNo,
      barcode: r.barcode,
      quantity: r.quantity,
      grossKg: r.grossKg,
      netKg: r.netKg,
      lotNo: r.lotNo
    }));

    await prisma.roll.createMany({
      data: dbRolls
    });

    // Update the invoice overall stats to match the packing list
    await prisma.invoice.update({
      where: { id },
      data: {
        rollCount: rolls.length,
        grossKg: dbRolls.reduce((sum, r) => sum + (r.grossKg || 0), 0),
        netKg: dbRolls.reduce((sum, r) => sum + (r.netKg || 0), 0)
      }
    });

    return NextResponse.json({ success: true, count: rolls.length });
  } catch (error: any) {
    console.error("Packing List save error:", error);
    return NextResponse.json({ error: "Could not save packing list" }, { status: 500 });
  }
}
