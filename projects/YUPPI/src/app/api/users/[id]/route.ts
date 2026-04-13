import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    const body = await req.json();
    const { password, isActive, role, fullName, avatar } = body;

    const updateData: any = {};
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role) updateData.role = role;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (avatar !== undefined) updateData.avatar = avatar;

    await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Kullanıcı güncellenemedi.' }, { status: 500 });
  }
}
