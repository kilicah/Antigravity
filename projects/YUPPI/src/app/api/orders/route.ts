import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        buyer: { select: { name: true } },
        seller: { select: { name: true } },
        brand: { select: { name: true } },
      }
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required relationships
    if (!body.sellerId || !body.buyerId) {
      return NextResponse.json(
        { error: "Alıcı ve Satıcı zorunludur." },
        { status: 400 }
      );
    }

    // Auto-generate Contract No
    // Start from 26001 if no orders exist, otherwise increment the highest numeric contractNo
    const lastOrder = await prisma.order.findFirst({
      orderBy: {
        id: 'desc', // Assuming ids grow monotonically with contract number
      },
    });

    let autoContractNo = "26001";
    if (lastOrder && lastOrder.contractNo) {
       const numericPart = parseInt(lastOrder.contractNo.replace(/\D/g, ''), 10);
       if (!isNaN(numericPart)) {
          autoContractNo = String(numericPart + 1);
       }
    }

    // Creating the order and items in a transaction using nested writes
    const newOrder = await prisma.order.create({
      data: {
        contractNo: autoContractNo,
        contractDate: new Date(body.contractDate),
        buyerPoNo: body.buyerPoNo || null,
        sellerId: body.sellerId,
        buyerId: body.buyerId,
        shipToId: body.shipToId || null,
        brandId: body.brandId || null,
        agencyId: body.agencyId ? parseInt(body.agencyId) : null,
        sellerRep: body.sellerRep || null,
        buyerRep: body.buyerRep || null,
        commission: body.commission || null,
        deliveryTerms: body.deliveryTerms || null,
        deliveryDestination: body.deliveryDestination || null,
        paymentTerms: body.paymentTerms || null,
        transporter: body.transporter || null,
        currency: body.currency,
        unit: body.unit || "MT",
        language: body.language || "TR",
        tolerance: body.tolerance || null,
        specialDocsRequest: body.specialDocsRequest || false,
        specialDocsDetail: body.specialDocsDetail || null,
        specialLoadingRequest: body.specialLoadingRequest || false,
        specialLoadingDetail: body.specialLoadingDetail || null,
        items: {
          create: body.items.map((item: any) => ({
            buyerModelName: item.buyerModelName || null,
            qualityName: item.qualityName || null,
            qualityCode: item.qualityCode || null,
            colorCode: item.colorCode || null,
            composition: item.composition || null,
            weight: item.weight || null,
            width: item.width || null,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            totalAmount: Number(item.totalAmount),
            deliveryDate: item.deliveryDate || null,
            bsRequest: item.bsRequest || false,
            ldRequest: item.ldRequest || "WAIT",
            ppsRequest: item.ppsRequest || false,
            topsRequest: item.topsRequest || false,
            srlRequest: item.srlRequest || false,
            srlDetail: item.srlDetail || null,
            fdRequest: item.fdRequest || false,
            pshpRequest: item.pshpRequest || false,
            susRequest: item.susRequest || false,
            ltRequest: item.ltRequest || false,
            ltDetail: item.ltDetail || null,
            bdd: item.bdd ? new Date(item.bdd) : null,
            bq: item.bq ? Number(item.bq) : null,
            bsSentDate: item.bsSentDate ? new Date(item.bsSentDate) : null,
            bsApprovalDate: item.bsApprovalDate ? new Date(item.bsApprovalDate) : null,
            exmd: item.exmd ? new Date(item.exmd) : null,
            etd: item.etd ? new Date(item.etd) : null,
            fds: item.fds || "WAIT",
            cs: item.cs || "WAIT",
            csSentDate: item.csSentDate ? new Date(item.csSentDate) : null,
            csApprovalDate: item.csApprovalDate ? new Date(item.csApprovalDate) : null,
            ldSentDate: item.ldSentDate ? new Date(item.ldSentDate) : null,
            ldApprovalDate: item.ldApprovalDate ? new Date(item.ldApprovalDate) : null,
            mpa: item.mpa || false,
            dpa: item.dpa || false,
            rs: item.rs || "WAIT",
            rsMs: item.rsMs ? new Date(item.rsMs) : null,
            bsMs: item.bsMs ? new Date(item.bsMs) : null,
            bltRd: item.bltRd ? new Date(item.bltRd) : null,
            bltMs: item.bltMs ? new Date(item.bltMs) : null,
            bltMa: item.bltMa ? new Date(item.bltMa) : null,
            ltAd: item.ltAd ? new Date(item.ltAd) : null,
            bsad: item.bsad ? new Date(item.bsad) : null,
            pl: item.pl || false,
            fabricType: item.fabricType || null,
            apQuantity: item.apQuantity ? Number(item.apQuantity) : null,
          }))
        },
        productionOrder: {
          create: {
            packingInstructions: body.productionOrder?.packingInstructions || null,
            fabricDirection: body.productionOrder?.fabricDirection || null,
            partialShipmentAllowed: body.productionOrder?.partialShipmentAllowed || false,
            exMillDate: body.productionOrder?.exMillDate ? new Date(body.productionOrder.exMillDate) : null,
            bulkDate: body.productionOrder?.bulkDate ? new Date(body.productionOrder.bulkDate) : null,
          }
        },
        invoice: {
          create: {
            invoiceNo: body.invoice?.invoiceNo || null,
            invoiceDate: body.invoice?.invoiceDate ? new Date(body.invoice.invoiceDate) : null,
            grossKg: body.invoice?.grossKg || null,
            netKg: body.invoice?.netKg || null,
            rollCount: body.invoice?.rollCount || null,
            sackCount: body.invoice?.sackCount || null,
            customsCompanyId: body.invoice?.customsCompanyId ? parseInt(body.invoice.customsCompanyId) : null,
            logisticsCompanyId: body.invoice?.logisticsCompanyId ? parseInt(body.invoice.logisticsCompanyId) : null,
            insuranceCompanyId: body.invoice?.insuranceCompanyId ? parseInt(body.invoice.insuranceCompanyId) : null,
          }
        }
      },
      include: {
        items: true,
      }
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error("Order creation error:", error);
    
    // Check for unique constraint violation on contractNo
    if (error.code === 'P2002' && error.meta?.target?.includes('contractNo')) {
       return NextResponse.json(
        { error: "Bu Sözleşme Numarası zaten kullanımda. Lütfen farklı bir numara girin." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Sipariş kaydedilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
