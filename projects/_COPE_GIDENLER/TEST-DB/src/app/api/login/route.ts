import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı veya şifre boş bırakılamaz.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user || user.isActive === false) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı veya hesabınız dondurulmuş.' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Hatalı şifre.' }, { status: 401 });
    }

    const token = await signToken({
      id: user.id,
      username: user.username,
      role: user.role
    });

    const response = NextResponse.json({ 
        success: true, 
        user: { username: user.username, role: user.role } 
    });
    
    response.cookies.set({
      name: 'yuppi_session',
      value: token,
      httpOnly: true,
      secure: false, // Tailscale IP (100.x.x.x) HTTP kullanımında cookie düşmemesi için
      maxAge: 60 * 60 * 24, // 24 Saat kuralı
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
