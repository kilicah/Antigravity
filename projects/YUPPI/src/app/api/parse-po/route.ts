import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

// We extract text from the PDF, and then ask Gemini to shape it.
export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;
    
    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let extractedText = "";

    if (file.type === "application/pdf") {
       const pdfData = await pdfParse(buffer);
       extractedText = pdfData.text;
    } else {
       return NextResponse.json({ error: "Sadece PDF formatı destekleniyor." }, { status: 400 });
    }

    // Pass to Gemini to structure it
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return raw text if no API key is set, so the user knows it works partially
      // But in reality, we need AI to structure it.
      return NextResponse.json({ 
         warning: "GEMINI_API_KEY environement variable bulunamadı. Lütfen .env dosyasına ekleyin.",
         rawText: extractedText 
      }, { status: 200 });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // System Instruction for Gemini
    const prompt = `
Aşağıdaki metin bir tekstil satın alma siparişi (Purchase Order) veya üretim föyünden çıkarıldı. Lütfen ürün kalemlerini (items) bularak, tam olarak aşağıdaki JSON formatında bir dizi (array) döndür. JSON harici hiçbir şey (örneğin markdown tag'leri) yazma. Eğer bir alan yoksa null bırak.

Zorunlu Alanlar ve Mantığı:
- buyerModelName: Alıcının model ismi, PO'daki style no veya model no.
- qualityName: Kumaş cinsi / kalitesi
- colorCode: Renk veya Varyant (Örn: Siyah, Navy, vs.)
- composition: Kumaş karışımı (Örn: %100 Pamuk)
- weight: Gramaj (Örn: 200 gsm / 200 gr/m2)
- width: En (Örn: 150 cm)
- quantity: Sipariş miktarı (Sayısal değer olmalı)
- unitPrice: Birim Fiyat (Sayısal olmalı, para birimi dahil olmadan. Varsa "12.5" gibi nokta ile)

Hedef JSON yapısı örneği (Çıktıyı aynen bu şekilde dizi olarak döndür):
[
  {
    "buyerModelName": "Style123",
    "qualityName": "Süprem",
    "colorCode": "Navy",
    "composition": "%100 Cotton",
    "weight": "200 gsm",
    "width": "180 cm",
    "quantity": 5000,
    "unitPrice": 5.50
  }
]

Okunacak Metin:
${extractedText}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let jsonString = response.text || "[]";
    // Strip markdown formatting if any
    jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsedItems = JSON.parse(jsonString);

    return NextResponse.json({ items: parsedItems }, { status: 200 });
  } catch (error) {
    console.error("OCR API Hatası:", error);
    return NextResponse.json({ error: "Metin ayrıştırma sırasında hata oluştu." }, { status: 500 });
  }
}
