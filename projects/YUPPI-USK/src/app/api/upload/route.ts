import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
    }

    // 5MB Boyut Sınırı
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Dosya boyutu 5MB'dan büyük olamaz." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Eşsiz dosya adı oluştur
    const ext = path.extname(file.name);
    const fileName = `${randomUUID()}${ext}`;
    
    // Klasör yolu
    const targetDir = path.join(process.cwd(), "public", "uploads", "packing-lists");
    
    // Klasör yoksa oluştur
    await mkdir(targetDir, { recursive: true });

    const filePath = path.join(targetDir, fileName);
    await writeFile(filePath, buffer);

    // Herkesin erişebileceği URL
    const publicUrl = `/uploads/packing-lists/${fileName}`;

    return NextResponse.json({ success: true, url: publicUrl, originalName: file.name });
  } catch (err: any) {
    console.error("Upload Error:", err);
    return NextResponse.json({ error: "Dosya kaydedilirken sunucu hatası oluştu." }, { status: 500 });
  }
}
