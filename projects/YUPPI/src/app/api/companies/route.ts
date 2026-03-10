import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
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
