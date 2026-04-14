import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = req.headers.get('x-user-role');
    if (role === 'USER') {
      return NextResponse.json({ error: "Siparişleri düzenleme yetkiniz yok." }, { status: 403 });
    }

    const id = parseInt((await params).id, 10);
    const body = await req.json();

    if (!body.sellerId || !body.buyerId) {
      return NextResponse.json(
        { error: "Alıcı ve Satıcı zorunludur." },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Find existing items to safely manage updates vs deletes
      const existingItems = await tx.orderItem.findMany({ where: { orderId: id }});
      const incomingItemIds = body.items.filter((i: any) => i.id).map((i: any) => parseInt(i.id));
      const itemsToDelete = existingItems.filter(item => !incomingItemIds.includes(item.id));
      
      if (itemsToDelete.length > 0) {
        await tx.orderItem.deleteMany({
          where: { id: { in: itemsToDelete.map(i => i.id) } }
        });
      }

      // Upsert existing items and create new ones manually
      for (const item of body.items) {
        const itemData = {
          buyerModelName: item.buyerModelName || null,
          qualityName: item.qualityName || null,
          qualityCode: item.qualityCode || null,
          colorCode: item.colorCode || null,
          composition: item.composition || null,
          weight: item.weight || null,
          width: item.width || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalAmount: item.totalAmount,
          deliveryDate: item.deliveryDate || null,
          bsRequest: item.bsRequest || false,
          ldRequest: item.ldRequest || "WAIT",
          ldDetail: item.ldDetail || null,
          ppsRequest: item.ppsRequest || false,
          topsRequest: item.topsRequest || false,
          srlRequest: item.srlRequest || "WAIT",
          srlDetail: item.srlDetail || null,
          fdRequest: item.fdRequest || false,
          pshpRequest: item.pshpRequest || false,
          susRequest: item.susRequest || false,
          ltRequest: item.ltRequest || "WAIT",
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
        };

        if (item.id) {
          await tx.orderItem.update({
             where: { id: parseInt(item.id) },
             data: itemData
          });
        } else {
          await tx.orderItem.create({
             data: { ...itemData, orderId: id }
          });
        }
      }

      return await tx.order.update({
        where: { id },
        data: {
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
          productionOrder: {
            upsert: {
              create: {
                packingInstructions: body.productionOrder?.packingInstructions || null,
                fabricDirection: body.productionOrder?.fabricDirection || null,
                partialShipmentAllowed: body.productionOrder?.partialShipmentAllowed || false,
                exMillDate: body.productionOrder?.exMillDate ? new Date(body.productionOrder.exMillDate) : null,
                bulkDate: body.productionOrder?.bulkDate ? new Date(body.productionOrder.bulkDate) : null,
              },
              update: {
                packingInstructions: body.productionOrder?.packingInstructions || null,
                fabricDirection: body.productionOrder?.fabricDirection || null,
                partialShipmentAllowed: body.productionOrder?.partialShipmentAllowed || false,
                exMillDate: body.productionOrder?.exMillDate ? new Date(body.productionOrder.exMillDate) : null,
                bulkDate: body.productionOrder?.bulkDate ? new Date(body.productionOrder.bulkDate) : null,
              }
            }
          },
        },
        include: {
          items: true,
        }
      });
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: any) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { error: "Sipariş güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: "Siparişleri silme yetkiniz yok." }, { status: 403 });
    }

    const id = parseInt((await params).id, 10);
    const searchParams = req.nextUrl.searchParams;
    const isHardDelete = searchParams.get("hard") === "true";

    if (isNaN(id)) {
      return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
    }

    if (isHardDelete) {
      const body = await req.json().catch(() => ({}));
      if (!body.password) {
        return NextResponse.json({ error: "Kalıcı silme işlemi için şifrenizi girmelisiniz." }, { status: 400 });
      }
      
      const userId = req.headers.get("x-user-id");
      if (!userId) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
      
      const admin = await prisma.user.findUnique({ where: { id: parseInt(userId, 10) }});
      if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekir." }, { status: 403 });
      
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(body.password, admin.password);
      if (!isMatch) return NextResponse.json({ error: "Şifreniz hatalı, lütfen tekrar deneyin." }, { status: 401 });

      // Kalıcı silme (Önce itemleri, production orderleri, vb. silmeli)
      await prisma.$transaction(async (tx) => {
        // İlgili productionOrder kaydını varsa sil
        await tx.productionOrder.deleteMany({
          where: { orderId: id }
        });
        
        // Itemleri sil
        await tx.orderItem.deleteMany({
          where: { orderId: id }
        });

        // Siparişi kalıcı sil
        await tx.order.delete({
          where: { id }
        });
      });
      return NextResponse.json({ message: "Sipariş kalıcı olarak silindi." }, { status: 200 });
    } else {
      // Soft-delete (Pasife Al)
      // @ts-ignore: isActive generated yetmeyebilir
      await prisma.order.update({
        where: { id },
        data: { isActive: false }
      });
      return NextResponse.json({ message: "Sipariş arşive (pasife) alındı." }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Order delete error:", error);
    return NextResponse.json(
      { error: "Sipariş silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
