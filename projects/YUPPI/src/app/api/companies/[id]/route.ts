import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        bankInfos: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching company" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    const body = await req.json();

    const company = await prisma.company.update({
      where: { id },
      data: {
        name: body.name,
        address: body.address,
        district: body.district,
        city: body.city,
        country: body.country,
        zipCode: body.zipCode,
        taxOffice: body.taxOffice,
        taxNo: body.taxNo,
        registrationNo: body.registrationNo,
        phone: body.phone,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating company" },
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
    
    // Check relationships
    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            sellerOrders: true,
            buyerOrders: true,
            shipToOrders: true,
            brandOrders: true,
            agencyOrders: true,
            invoiceCustoms: true,
            invoiceLogistics: true,
            invoiceInsurance: true,
            buyerInvoices: true
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: "Firma bulunamadı." }, { status: 404 });
    }

    const totalRelations = Object.values(company._count).reduce((acc, val) => acc + val, 0);

    if (totalRelations > 0) {
      return NextResponse.json(
        { error: "Bu firma geçmiş siparişlerde veya faturalarda kullanıldığı için veritabanından tamamen silinemez. Lütfen firmayı düzenleyerek pasife alınız." },
        { status: 400 }
      );
    }

    await prisma.company.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting company" },
      { status: 500 }
    );
  }
}
