import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import https from "https";

// Https Agent for bypassing SSL cert issues that often occur with government websites
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export const revalidate = 7200; // Cache for 2 hours (rates don't change by the minute)

// Basic helper to fetch via Node HTTPS directly to bypass Next.js strict fetch behaviors
async function fetchWithAgent(url: string, timeoutMs: number = 8000): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { agent: httpsAgent, timeout: timeoutMs, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.abort();
      reject(new Error('Timeout'));
    });
  });
}

export async function GET() {
  // Varsayılan Kullanıcının Beklediği/Sağladığı Referans Değerleri (Fallback)
  let tcmbPolicyRate = 37.0; 
  let depositMin = 44.0;
  let depositMax = 45.0;
  let sourceStatus = "live";

  try {
    // 1. TCMB Politika Faizi Kazıma İşlemi (Bigpara üzerinden garantili çekelim, kurumsal site duvarına takılmamak için)
    try {
      const htmlTcmb = await fetchWithAgent('https://bigpara.hurriyet.com.tr/kobi/tcmb-gosterge-faiz-oranlari/');
      const $1 = cheerio.load(htmlTcmb);
      
      // İlk sıradaki güncel repo (politika) faizini bul. 
      // class="tBody" içinde li > ul > li ler var. Biz basit regex ile de arayabiliriz ya da genel textten çekebiliriz.
      const text = $1('.tableCnt').text();
      // İçerisinde "Bir Hafta Vadeli Repo" geçen ifadenin yanındaki ilk sayıyı arayalım
      const match = text.match(/Repo\s*[:\-]?\s*(\d+[,.]\d+|\d+)/i);
      if (match && match[1]) {
         const parsedVal = parseFloat(match[1].replace(',', '.'));
         if (parsedVal > 1 && parsedVal < 100) {
           tcmbPolicyRate = parsedVal;
         }
      }
    } catch (e) {
      console.error("TCMB Fetch Error:", e);
      sourceStatus = "partial_fallback";
    }

    // 2. Mevduat Faiz Oranları (Hesapkurdu / Hangikredi vb. genel arama ile maksimumları bulma simülasyonu)
    try {
       const htmlDeposit = await fetchWithAgent('https://www.hesapkurdu.com/mevduat');
       const $2 = cheerio.load(htmlDeposit);
       // Sitenin genel HTML metni üzerinde "%45" gibi sayıları bulup en yükseği hesaplayalım
       const allText = $2('body').text();
       const percentMatches = allText.match(/%(\d{2}[,.]?\d*)/g) || [];
       const validRates = percentMatches
            .map(p => parseFloat(p.replace('%', '').replace(',', '.')))
            .filter(r => r > 20 && r < 65); // Mantıklı aralık
       
       if (validRates.length > 0) {
           const maxRate = Math.max(...validRates);
           depositMax = maxRate;
           depositMin = maxRate - 2; // Genelde bankalar arası min-max makası %2 civarıdır
       }
    } catch (e) {
       console.error("Deposit Fetch Error:", e);
       sourceStatus = "fallback";
    }

  } catch (err) {
    sourceStatus = "fallback";
  }

  // Yuvarlamalar
  tcmbPolicyRate = parseFloat(tcmbPolicyRate.toFixed(2));
  depositMax = parseFloat(depositMax.toFixed(2));
  depositMin = parseFloat(depositMin.toFixed(2));

  return NextResponse.json({
    source: sourceStatus,
    updatedAt: new Date().toISOString(),
    data: {
      tcmbPolicyRate,
      depositMin,
      depositMax
    }
  });
}
