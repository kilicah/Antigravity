import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    const representative = await prisma.representative.findUnique({ where: { id } });

    if (!representative) return NextResponse.json({ error: "Representative not found" }, { status: 404 });
    return NextResponse.json(representative);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching representative" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    const body = await req.json();
    const representative = await prisma.representative.update({
      where: { id },
      data: { name: body.name },
    });
    return NextResponse.json(representative);
  } catch (error) {
    return NextResponse.json({ error: "Error updating representative" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    await prisma.representative.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting representative" }, { status: 500 });
  }
}
