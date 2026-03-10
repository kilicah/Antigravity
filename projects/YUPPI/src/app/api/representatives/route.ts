import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const representatives = await prisma.representative.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(representatives);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching representatives" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const representative = await prisma.representative.create({
      data: { name: body.name },
    });
    return NextResponse.json(representative, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error creating representative" }, { status: 500 });
  }
}
