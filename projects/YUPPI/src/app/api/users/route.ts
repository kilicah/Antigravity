import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { 
        id: true, username: true, role: true, isActive: true, createdAt: true, fullName: true, avatar: true,
        email: true, phone: true, assignedSellerId: true, allowedCompanies: { select: { id: true, name: true } }
      },
      orderBy: { id: 'desc' }
    });
    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json({ error: 'Kullanıcılar getirilirken hata oluştu.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password, role, fullName, avatar, email, phone, assignedSellerId, allowedCompanyIds } = body;
    
    if (!username || !password) {
        return NextResponse.json({ error: 'Kullanıcı adı ve şifre zorunludur.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role || 'USER',
        fullName: fullName || null,
        avatar: avatar || null,
        email: email || null,
        phone: phone || null,
        assignedSellerId: assignedSellerId ? parseInt(assignedSellerId) : null,
        ...(allowedCompanyIds && Array.isArray(allowedCompanyIds) ? {
          allowedCompanies: {
            connect: allowedCompanyIds.map((id: any) => ({ id: parseInt(id) }))
          }
        } : {})
      }
    });

    return NextResponse.json({ success: true, user: { id: newUser.id, username: newUser.username } });
  } catch (err: any) {
    if (err.code === 'P2002') return NextResponse.json({ error: 'Bu kullanıcı adı zaten alınmış.' }, { status: 400 });
    return NextResponse.json({ error: 'Kullanıcı oluşturulamadı.' }, { status: 500 });
  }
}
