import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const username = req.headers.get('x-user-username');
    const role = req.headers.get('x-user-role');
    const id = req.headers.get('x-user-id');
    
    if (!username || !role || !id) {
      return NextResponse.json({ error: 'Oturum bulunamadı. Lütfen giriş yapın.' }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Şifrenizi girmediniz.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Girdiğiniz şifre hatalı, lütfen tekrar deneyin.' }, { status: 401 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Şifre doğrulanırken sunucuda bir hata oluştu.' }, 
      { status: 500 }
    );
  }
}
