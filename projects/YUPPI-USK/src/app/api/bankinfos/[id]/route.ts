import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    const bankInfo = await prisma.bankInfo.findUnique({
      where: { id },
      include: {
        company: {
           select: { name: true }
        }
      }
    });

    if (!bankInfo) {
      return NextResponse.json({ error: "Bank Info not found" }, { status: 404 });
    }

    return NextResponse.json(bankInfo);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching bank info" },
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

    const bankInfo = await prisma.bankInfo.update({
      where: { id },
      data: {
        companyId: body.companyId,
        currency: body.currency,
        bankName: body.bankName,
        branch: body.branch,
        accountNo: body.accountNo,
        iban: body.iban,
        swift: body.swift,
      },
      include: {
        company: {
           select: { name: true }
        }
      }
    });

    return NextResponse.json(bankInfo);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating bank info" },
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
    await prisma.bankInfo.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting bank info" },
      { status: 500 }
    );
  }
}
