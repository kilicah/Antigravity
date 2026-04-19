export function numberToWords(amount: number, currency: string, lang: "TR" | "ENG" = "ENG"): string {
  if (!amount || isNaN(amount)) return "";

  const isTR = lang === "TR";

  // Define currency names
  const currencies: Record<string, { mainTR: string, subTR: string, mainEN: string, subEN: string, subENPlural: string }> = {
    USD: { mainTR: "AMERİKAN DOLARI", subTR: "SENT", mainEN: "US DOLLARS", subEN: "CENT", subENPlural: "CENTS" },
    EUR: { mainTR: "EURO", subTR: "SENT", mainEN: "EUROS", subEN: "CENT", subENPlural: "CENTS" },
    TRY: { mainTR: "TÜRK LİRASI", subTR: "KURUŞ", mainEN: "TURKISH LIRAS", subEN: "KURUS", subENPlural: "KURUS" },
    GBP: { mainTR: "İNGİLİZ STERLİNİ", subTR: "PENİ", mainEN: "BRITISH POUNDS", subEN: "PENNY", subENPlural: "PENCE" },
  };

  const curr = currencies[currency] || { mainTR: currency, subTR: "BİRİM", mainEN: currency, subEN: "UNIT", subENPlural: "UNITS" };

  const integerPart = Math.floor(amount);
  const fractionalPart = Math.round((amount - integerPart) * 100);

  const convertTR = (num: number): string => {
    if (num === 0) return "SIFIR";
    const ones = ["", "BİR", "İKİ", "ÜÇ", "DÖRT", "BEŞ", "ALTI", "YEDİ", "SEKİZ", "DOKUZ"];
    const tens = ["", "ON", "YİRMİ", "OTUZ", "KIRK", "ELLİ", "ALTMIŞ", "YETMİŞ", "SEKSEN", "DOKSAN"];
    
    function parseHundreds(n: number) {
      if (n === 0) return "";
      let res = "";
      const h = Math.floor(n / 100);
      const rem = n % 100;
      if (h === 1) res += "YÜZ ";
      else if (h > 1) res += ones[h] + " YÜZ ";
      
      const t = Math.floor(rem / 10);
      const o = rem % 10;
      if (t > 0) res += tens[t] + " ";
      if (o > 0) res += ones[o] + " ";
      return res;
    }

    let result = "";
    const millions = Math.floor(num / 1000000);
    const thousands = Math.floor((num % 1000000) / 1000);
    const remainder = num % 1000;

    if (millions > 0) {
      result += parseHundreds(millions) + "MİLYON ";
    }
    if (thousands > 0) {
      if (thousands === 1) result += "BİN ";
      else result += parseHundreds(thousands) + "BİN ";
    }
    if (remainder > 0) {
      result += parseHundreds(remainder);
    }
    return result.trim();
  };

  const convertEN = (num: number): string => {
    if (num === 0) return "ZERO";
    const ones = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
    const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];

    function parseHundreds(n: number) {
      if (n === 0) return "";
      let res = "";
      const h = Math.floor(n / 100);
      const rem = n % 100;
      if (h > 0) res += ones[h] + " HUNDRED ";
      
      if (rem > 0) {
        if (h > 0) res += "AND ";
        if (rem < 20) {
          res += ones[rem] + " ";
        } else {
          const t = Math.floor(rem / 10);
          const o = rem % 10;
          res += tens[t] + " ";
          if (o > 0) res += ones[o] + " ";
        }
      }
      return res;
    }

    let result = "";
    const millions = Math.floor(num / 1000000);
    const thousands = Math.floor((num % 1000000) / 1000);
    const remainder = num % 1000;

    if (millions > 0) {
      result += parseHundreds(millions) + "MILLION ";
    }
    if (thousands > 0) {
      result += parseHundreds(thousands) + "THOUSAND ";
    }
    if (remainder > 0) {
      result += parseHundreds(remainder);
    }
    return result.trim();
  };

  const mainStr = isTR ? convertTR(integerPart) : convertEN(integerPart);
  const currencyMain = isTR ? curr.mainTR : curr.mainEN;
  
  let finalStr = `${mainStr} ${currencyMain}`;
  
  if (fractionalPart > 0) {
    const subStr = isTR ? convertTR(fractionalPart) : convertEN(fractionalPart);
    const currencySub = isTR ? curr.subTR : (fractionalPart === 1 ? curr.subEN : curr.subENPlural);
    finalStr += isTR ? ` VE ${subStr} ${currencySub}` : ` AND ${subStr} ${currencySub}`;
  }

  return finalStr.replace(/\s+/g, ' ').trim();
}
