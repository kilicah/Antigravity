import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = req.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Sadece yöneticiler şifre sıfırlayabilir." }, { status: 403 });
    }

    const id = parseInt((await params).id, 10);
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    if (!user.email) {
      return NextResponse.json({ error: "Bu kullanıcının sistemde kayıtlı e-posta adresi bulunmuyor." }, { status: 400 });
    }

    // Rastgele 12 haneli kompleks şifre oluştur (Büyük, küçük harf, rakam ve özel karakter içerir)
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^*";
    let newPassword = "";
    for (let i = 0, n = charset.length; i < 12; ++i) {
        newPassword += charset.charAt(Math.floor(Math.random() * n));
    }

    // Şifreyi bcrypt ile şifrele
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // DB'yi güncelle
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Kullanıcıya şifre mailini gönder
    const subject = "YUPPI ERP Giriş Bilgileriniz";
    const htmlContent = `
      <h2 style="color: #4f46e5;">YUPPI ERP Sistemine Hoş Geldiniz</h2>
      <p>Merhaba <strong>${user.fullName}</strong>,</p>
      <p>Sistem yöneticiniz tarafından hesabınız için yeni bir giriş şifresi oluşturulmuştur.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Sistem Adresi:</strong> <a href="https://yuppi.usk.one" style="color: #4f46e5;">https://yuppi.usk.one</a></p>
        <p style="margin: 5px 0 0 0;"><strong>Kullanıcı Adı:</strong> ${user.username}</p>
        <p style="margin: 5px 0 0 0;"><strong>Geçici Şifreniz:</strong> <span style="font-size: 16px; font-weight: bold; background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${newPassword}</span></p>
      </div>
      <p>Sisteme giriş yaptıktan sonra profil sayfanızdan veya şifre değiştirme ekranından şifrenizi güncelleyebilirsiniz.</p>
      <p>İyi çalışmalar.</p>
    `;

    const success = await sendMail(user.email, subject, htmlContent);

    if (!success) {
      // Şifre değişti ama email gitmedi
      return NextResponse.json({ error: `Şifre "${newPassword}" olarak sıfırlandı ancak e-posta gönderilirken iletişim hatası oldu.` }, { status: 500 });
    }

    return NextResponse.json({ message: "Şifre başarıyla oluşturuldu ve kullanıcının e-posta adresine gönderildi." }, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Şifre sıfırlama sırasında hata oluştu." }, { status: 500 });
  }
}
