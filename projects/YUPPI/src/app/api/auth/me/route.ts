import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  const role = req.headers.get('x-user-role');
  const id = req.headers.get('x-user-id');
  
  if (!id || !role) {
    return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, username: true, role: true, fullName: true, avatar: true }
    });
    
    if (!user) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: 'Hata oluştu' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const id = req.headers.get('x-user-id');
    if (!id) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const body = await req.json();
    const { password, fullName, avatar } = body;
    
    const updateData: any = {};
    if (password && password.trim() !== '') {
       updateData.password = await bcrypt.hash(password, 10);
    }
    if (fullName !== undefined) updateData.fullName = fullName;
    if (avatar !== undefined) updateData.avatar = avatar;

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData
      });
      return NextResponse.json({ success: true, message: 'Profiliniz başarıyla güncellendi.' });
    }
    
    return NextResponse.json({ error: 'Değişiklik yapılmadı.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Şifre güncellenirken sunucuda bir hata oluştu.' }, { status: 500 });
  }
}
