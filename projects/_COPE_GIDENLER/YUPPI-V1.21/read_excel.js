const xlsx = require('xlsx');

const files = [
  "C:\\Users\\kilicah.USK\\OneDrive\\Desktop\\YUPPI\\(A) Fiyat Listesi 2026.03.31.xlsx",
  "C:\\Users\\kilicah.USK\\OneDrive\\Desktop\\YUPPI\\FİYAT LİSTESİ 31.03.2026.xls",
  "C:\\Users\\kilicah.USK\\OneDrive\\Desktop\\YUPPI\\KOLLEKSİYON LİST ÜR-GE.xlsx"
];

files.forEach(file => {
  console.log(`\n\n=== Reading ${file} ===`);
  try {
    const workbook = xlsx.readFile(file);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    // Print first 5 rows, but only non-null cells
    for(let i=0; i<5; i++) {
        if(!data[i]) continue;
        console.log(`ROW ${i}:`);
        console.dir(data[i].filter(v => v !== null && v !== undefined), { maxArrayLength: null });
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
});
