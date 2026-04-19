import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');
    const userId = req.headers.get('x-user-id');
    
    let whereClause: any = {};
    if (role === 'USER' && userId) {
       whereClause = {
         OR: [
           { isSeller: true },
           { allowedUsers: { some: { id: parseInt(userId) } } }
         ]
       };
    }

    const companies = await prisma.company.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    });
    return NextResponse.json(companies);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching companies" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');
    if (role === 'USER') {
      return NextResponse.json({ error: "Firma ekleme yetkiniz yok." }, { status: 403 });
    }

    const body = await req.json();
    const company = await prisma.company.create({
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
      },
    });
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating company" },
      { status: 500 }
    );
  }
}
