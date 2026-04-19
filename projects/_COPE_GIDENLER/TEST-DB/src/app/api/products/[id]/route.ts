import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getNormalizedCode(str: any) {
  if (!str) return "";
  let s = String(str).toUpperCase().trim();
  s = s.replace(/İ/g, 'I').replace(/I/g, 'I').replace(/ı/g, 'I').replace(/i/g, 'I');
  s = s.replace(/[^A-Z0-9]/g, '');
  return s;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = req.headers.get('x-user-role');
    if (role === 'USER') {
      return NextResponse.json({ error: "Ürün düzenleme yetkiniz yok." }, { status: 403 });
    }

    const id = parseInt((await params).id, 10);
    const body = await req.json();
    
    // Process normalization if code/name changed
    const codeBase = body.code || body.name || Date.now().toString();
    const normalized = getNormalizedCode(codeBase);

    const product = await prisma.product.update({
      where: { id },
      data: {
        code: body.code !== undefined ? body.code : undefined,
        normalizedCode: normalized,
        name: body.name !== undefined ? body.name : undefined,
        composition: body.composition !== undefined ? body.composition : undefined,
        weight: body.weight !== undefined ? body.weight : undefined,
        width: body.width !== undefined ? body.width : undefined,
        gtipNo: body.gtipNo !== undefined ? body.gtipNo : undefined,
        minOrderQty: body.minOrderQty !== "" ? Number(body.minOrderQty) : undefined,
        mcq: body.mcq !== "" ? Number(body.mcq) : undefined,
        tMoq: body.tMoq !== "" ? Number(body.tMoq) : undefined,
        costPrice: body.costPrice !== "" ? Number(body.costPrice) : undefined,
        priceTier1: body.priceTier1 !== "" ? Number(body.priceTier1) : undefined,
        priceTier2: body.priceTier2 !== "" ? Number(body.priceTier2) : undefined,
        priceTier3: body.priceTier3 !== "" ? Number(body.priceTier3) : undefined,
        poundPrice: body.poundPrice !== "" && body.poundPrice !== null ? Number(body.poundPrice) : undefined,
        euroPrice: body.euroPrice !== "" && body.euroPrice !== null ? Number(body.euroPrice) : undefined,
        status: body.status !== undefined ? body.status : undefined,
        productTypes: body.productTypes !== undefined ? body.productTypes : undefined,
        priceNote: body.priceNote !== undefined ? body.priceNote : undefined,
        priceUpdatedAt: new Date(),
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: "Bu ürün kodu başka bir ürün tarafından kullanılıyor." }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Error updating product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    const role = req.headers.get("x-user-role");

    if (role === "USER") {
      return NextResponse.json({ error: "Silme yetkiniz yok." }, { status: 403 });
    }
    
    // Hard delete
    await prisma.product.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting product" },
      { status: 500 }
    );
  }
}
