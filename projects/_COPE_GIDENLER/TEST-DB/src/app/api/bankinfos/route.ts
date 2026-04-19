import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyIdParam = searchParams.get('companyId');

    const queryOptions: any = {
      orderBy: { bankName: "asc" },
      include: {
        company: {
          select: { name: true }
        }
      }
    };

    if (companyIdParam) {
      queryOptions.where = { companyId: parseInt(companyIdParam, 10) };
    }

    const bankInfos = await prisma.bankInfo.findMany(queryOptions);
    return NextResponse.json(bankInfos);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching bank infos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const bankInfo = await prisma.bankInfo.create({
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
    return NextResponse.json(bankInfo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating bank info" },
      { status: 500 }
    );
  }
}
