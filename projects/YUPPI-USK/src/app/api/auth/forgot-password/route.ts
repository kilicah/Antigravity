import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Kullanıcı adı eksik." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    // hk@usktextile.com adresine mail at
    const adminEmail = "hk@usktextile.com";
    const subject = "Şifre Sıfırlama Talebi (YUPPI ERP)";
    const htmlContent = `
      <h2 style="color: #4f46e5;">Şifre Sıfırlama Talebi</h2>
      <p>Sisteminizdeki <strong>${user.fullName} (${user.username})</strong> isimli kullanıcı şifresini unuttuğunu ve giriş yapamadığını bildirmiştir.</p>
      <p>Kullanıcıya yeni bir şifre vermek için lütfen <a href="https://yuppi.usk.one/admin/users">Yönetim Paneli > Kullanıcılar</a> bölümüne gidip, ilgili kullanıcının "Düzenle" ekranındaki "Şifre Sıfırla ve Gönder" butonunu kullanınız.</p>
    `;

    const success = await sendMail(adminEmail, subject, htmlContent);

    if (!success) {
      return NextResponse.json({ error: "Talep alınırken e-posta gönderilemedi." }, { status: 500 });
    }

    return NextResponse.json({ message: "Talep iletildi." }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "İşlem sırasında hata oluştu." }, { status: 500 });
  }
}
