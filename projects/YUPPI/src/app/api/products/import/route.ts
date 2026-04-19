import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import * as xlsx from "xlsx";

function getNormalizedCode(str: any) {
  if (!str) return "";
  // Strip non-alphanumeric, spaces, dashes to create an absolute unique identifier for matching.
  let s = String(str).toUpperCase().trim();
  s = s.replace(/İ/g, 'I').replace(/I/g, 'I').replace(/ı/g, 'I').replace(/i/g, 'I');
  s = s.replace(/[^A-Z0-9]/g, '');
  return s;
}

function extractCodeAndName(kumasKodu: any) {
  const str = String(kumasKodu).trim();
  const lowerStr = str.toLowerCase();
  const keywords = ["jl", "ecovero", "bci", "recycle", "rcyc"];
  const hasKeyword = keywords.some(kw => lowerStr.includes(kw));

  // e.g. "A015 3D DOTS"
  const match = str.match(/^([\w\-]+)\s+(.+)$/);
  if (match) {
    const potentialCode = match[1];
    const hasDigitOrDash = /[0-9\-]/.test(potentialCode);
    
    // ZOE JL gibi durumlarda, ilk kelime rakam/tire içermiyorsa kod değildir.
    if (!hasDigitOrDash && hasKeyword) {
      return { code: `S-${str}`, name: str };
    }

    return { code: potentialCode.trim(), name: match[2].trim() };
  }
  
  if (hasKeyword) {
    return { code: `S-${str}`, name: str };
  }
  
  return { code: str, name: str };
}

export async function POST(req: Request) {
  try {
    const headerList = await headers();
    const role = headerList.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Sadece yöneticiler dosya yükleyebilir." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const note = (formData.get("note") as string) || null;
    
    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let workbook;
    try {
      workbook = xlsx.read(buffer, { type: "buffer" });
    } catch(e) {
      return NextResponse.json({ error: "Yüklenilen dosya geçerli bir Excel dosyası değil." }, { status: 400 });
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    if(rawData.length < 2) {
      return NextResponse.json({ error: "Boş tablo tespit edildi." }, { status: 400 });
    }

    const headersRow = rawData[0] as string[];
    const isPricing = headersRow.some(h => String(h).includes("MalDol") || String(h).includes("500-1000"));
    const isCollections = headersRow.some(h => String(h).includes("Konstrüksiyon") || String(h).includes("KALİTE ADI"));

    if (!isPricing && !isCollections) {
      return NextResponse.json({ error: "Tablo formatı anlaşılamadı. Lütfen 'FİYAT LİSTESİ' veya 'ÜR-GE' dosyası yükleyin." }, { status: 400 });
    }

    let processedCount = 0;
    const data = xlsx.utils.sheet_to_json(sheet);

    if (isPricing) {
       for (const row of data as any[]) {
          const rawKodu = row["KumasKodu"];
          if (!rawKodu) continue; 
          
          const codeName = extractCodeAndName(rawKodu);
          const normalized = getNormalizedCode(codeName.code);
          if (!normalized) continue;

          let costPrice = row["MalDol"] ? Number(row["MalDol"]) : null;
          let tier1 = row["500-1000"] ? Number(row["500-1000"]) : null;
          let tier2 = row["1000-5000"] ? Number(row["1000-5000"]) : null;
          
          const keys = Object.keys(row);
          const tier3Key = keys.find(k => k.includes("5000-10000"));
          const gbpKey = keys.find(k => k.includes("GBP"));
          
          let tier3 = tier3Key ? Number(row[tier3Key]) : null;
          let gbp = gbpKey ? Number(row[gbpKey]) : null;
          
          if(isNaN(costPrice as any)) costPrice = null;
          if(isNaN(tier1 as any)) tier1 = null;
          if(isNaN(tier2 as any)) tier2 = null;
          if(isNaN(tier3 as any)) tier3 = null;
          if(isNaN(gbp as any)) gbp = null;

          if (costPrice === null && tier1 === null && tier2 === null && tier3 === null && gbp === null) {
            continue; 
          }
          
          await prisma.product.upsert({
            where: { normalizedCode: normalized },
            update: {
              name: codeName.name,
              costPrice,
              priceTier1: tier1,
              priceTier2: tier2,
              priceTier3: tier3,
              poundPrice: gbp,
              priceUpdatedAt: new Date(),
              priceNote: note || `Excel Yükleme Tarihi: ${new Date().toLocaleDateString('tr-TR')}`
            },
            create: {
              code: codeName.code,
              normalizedCode: normalized,
              name: codeName.name,
              costPrice,
              priceTier1: tier1,
              priceTier2: tier2,
              priceTier3: tier3,
              poundPrice: gbp,
              status: "NEW",
              priceUpdatedAt: new Date(),
              priceNote: note || `Excel Yükleme Tarihi: ${new Date().toLocaleDateString('tr-TR')}`
            }
          });
          processedCount++;
       }
    } else if (isCollections) {
       for (const row of data as any[]) {
          let codeStr = row["KALİTE KODU "] || row["KALİTE KODU"] || row["ÜRETİM KODU"];
          let name = row["KALİTE ADI"];
          
          if (!codeStr && name) {
             const lowerName = String(name).toLowerCase();
             const keywords = ["jl", "ecovero", "bci", "recycle", "rcyc"];
             if (keywords.some(kw => lowerName.includes(kw))) {
                 codeStr = `S-${name}`;
             }
          }
          
          if (!codeStr || !name) continue;
          
          const normalized = getNormalizedCode(codeStr);
          if (!normalized) continue;

          let code = String(codeStr).trim();
          
          const compKey = Object.keys(row).find(k => String(k).includes("Konstrüksiyon"));
          let comp = compKey && row[compKey] ? String(row[compKey]).trim() : undefined;
          
          const widthKey = Object.keys(row).find(k => String(k).includes("GELEN EN"));
          let width = widthKey && row[widthKey] ? String(row[widthKey]).trim() : undefined;
          
          const weightKey = Object.keys(row).find(k => String(k).includes("GRamaj"));
          let weight = weightKey && row[weightKey] ? String(row[weightKey]).trim() : undefined;

          // Upsert into RnDItem library
          await prisma.rnDItem.upsert({
             where: { normalizedCode: normalized },
             update: {
               name: String(name).trim(),
               composition: comp,
               width: width,
               weight: weight,
               rawData: JSON.stringify(row)
             },
             create: {
               code: code,
               normalizedCode: normalized,
               name: String(name).trim(),
               composition: comp,
               width: width,
               weight: weight,
               rawData: JSON.stringify(row)
             }
          });
          
          // Overwrite Product's RnD properties if Product exists
          const existingProduct = await prisma.product.findUnique({
             where: { normalizedCode: normalized }
          });
          if (existingProduct) {
             await prisma.product.update({
                where: { id: existingProduct.id },
                data: {
                   composition: comp,
                   width: width,
                   weight: weight
                }
             });
          }
          processedCount++;
       }
    }

    return NextResponse.json({ message: "Başarıyla İçe Aktarıldı", count: processedCount });
  } catch (error: any) {
    console.error("Excel import error:", error);
    return NextResponse.json({ error: "Sunucu hatası: " + error.message }, { status: 500 });
  }
}
