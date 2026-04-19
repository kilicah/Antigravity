import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getNormalizedCode(str: any) {
  if (!str) return "";
  let s = String(str).toUpperCase().trim();
  s = s.replace(/İ/g, 'I').replace(/I/g, 'I').replace(/ı/g, 'I').replace(/i/g, 'I');
  s = s.replace(/[^A-Z0-9]/g, '');
  return s;
}

export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');
    if (role === 'USER') {
      return NextResponse.json({ error: "Ürün ekleme yetkiniz yok." }, { status: 403 });
    }

    const body = await req.json();
    
    // Auto generate a normalized code if code is missing but name is present for manual entries
    const codeBase = body.code || body.name || Date.now().toString();
    const normalized = getNormalizedCode(codeBase);

    const product = await prisma.product.create({
      data: {
        code: body.code,
        normalizedCode: normalized,
        name: body.name,
        composition: body.composition,
        weight: body.weight,
        width: body.width,
        gtipNo: body.gtipNo,
        minOrderQty: body.minOrderQty !== "" ? Number(body.minOrderQty) : 0,
        mcq: body.mcq !== "" ? Number(body.mcq) : undefined,
        tMoq: body.tMoq !== "" ? Number(body.tMoq) : undefined,
        costPrice: body.costPrice !== "" ? Number(body.costPrice) : undefined,
        priceTier1: body.priceTier1 !== "" ? Number(body.priceTier1) : undefined,
        priceTier2: body.priceTier2 !== "" ? Number(body.priceTier2) : undefined,
        priceTier3: body.priceTier3 !== "" ? Number(body.priceTier3) : undefined,
        poundPrice: body.poundPrice !== "" && body.poundPrice != null ? Number(body.poundPrice) : undefined,
        euroPrice: body.euroPrice !== "" && body.euroPrice != null ? Number(body.euroPrice) : undefined,
        status: body.status || "ACTIVE",
        productTypes: body.productTypes || null,
        priceNote: body.priceNote || null,
        priceUpdatedAt: new Date(),
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: "Bu ürün kodu (veya benzeri) zaten sistemde kayıtlı." }, { status: 400 });
    }
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Error creating product" },
      { status: 500 }
    );
  }
}
