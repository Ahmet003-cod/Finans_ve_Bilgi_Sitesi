import { NextResponse } from "next/server";
import { fallbackMarket } from "@/lib/fallback-data";
import { fetchJsonWithTimeout } from "@/lib/security";
import * as cheerio from "cheerio";

export const revalidate = 60; // 1 minute cache

function parseTRNum(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  // TR string: "10.550,75" -> remove dots, replace comma with dot -> "10550.75"
  const str = String(val).replace(/\./g, "").replace(",", ".").replace("%", "").trim();
  return parseFloat(str) || 0;
}

export async function GET() {
  try {
    const quotes: any[] = [];

    // 1. CanliDoviz Kapalıçarşı Altın Verileri (Kullanıcı Talebi)
    try {
      const goldUrl = "https://canlidoviz.com/altin-fiyatlari/kapali-carsi";
      const goldRes = await fetch(goldUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
        next: { revalidate: 60 }
      });

      if (goldRes.ok) {
        const html = await goldRes.text();
        const $ = cheerio.load(html);

        $("a[href^='/altin-fiyatlari/kapali-carsi/']").each((_, el) => {
          const name = $(el).find("div:first-child span:first-child").text().trim();
          // "2.443,15" gibi değerleri temizleyip parse edelim
          const buying = parseTRNum($(el).find("div:nth-child(2)").contents().first().text().trim());
          const selling = parseTRNum($(el).find("div:nth-child(3)").contents().first().text().trim());

          // Değişim genelde 3. div içindeki son span'da yer alır
          const changeText = $(el).find("div:nth-child(3) span").last().text().trim();
          const changeMatch = changeText.match(/%?([+-]?\d+[,.]?\d*)/);
          const change = changeMatch ? parseFloat(changeMatch[1].replace(",", ".")) : 0;

          if (name && selling > 0) {
            // İsim eşleştirmeleri
            let code = "";
            let label = name;
            if (name.includes("Gram Altın")) { code = "GRAM"; label = "Gram Altın"; }
            if (name.includes("Çeyrek Altın")) { code = "CEYREK"; label = "Çeyrek Altın"; }
            if (name.includes("Yarım Altın")) { code = "YARIM"; label = "Yarım Altın"; }
            if (name.includes("Tam Altın")) { code = "TAM"; label = "Tam Altın"; }
            if (name.includes("Ons")) { code = "ONS"; label = "Ons Altın"; }

            if (code) {
              quotes.push(makeQuote(label, code, buying, selling, change, "Kaynak: Canlı Döviz (Kapalıçarşı)"));
            }
          }
        });
      }
    } catch (e) {
      console.error("CanliDoviz fetch error:", e);
    }

    // 2. Dolar/Euro ve Eksik Veriler için Truncgil (Fallback/Secondary)
    const localDataUrl = "https://finans.truncgil.com/today.json";
    const truncgilResponse = await fetchJsonWithTimeout<any>(localDataUrl, 8000, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 }
    }).catch(() => null);

    if (truncgilResponse) {
      const usd = truncgilResponse["USD"];
      const eur = truncgilResponse["EUR"];

      if (usd) quotes.push(makeQuote("Dolar (USD/TRY)", "USD", parseTRNum(usd.Alış), parseTRNum(usd.Satış), parseTRNum(usd.Değişim), "Kaynak: Serbest Piyasa"));
      if (eur) quotes.push(makeQuote("Euro (EUR/TRY)", "EUR", parseTRNum(eur.Alış), parseTRNum(eur.Satış), parseTRNum(eur.Değişim), "Kaynak: Serbest Piyasa"));

      // Eğer CanliDoviz'den altın verisi gelmezse Truncgil'den çek
      if (!quotes.some(q => q.code === "GRAM")) {
        const g = truncgilResponse["gram-altin"];
        if (g) quotes.push(makeQuote("Gram Altın", "GRAM", parseTRNum(g.Alış), parseTRNum(g.Satış), parseTRNum(g.Değişim), "Kaynak: Truncgil Fallback"));
      }
    }

    let bistAdded = false;

    // 3. BIST100 (Google Finance)
    try {
      const gfinanceUrl = "https://www.google.com/finance/quote/XU100:INDEXIST";
      const gfinanceRes = await fetch(gfinanceUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        next: { revalidate: 60 }
      });
      if (gfinanceRes.ok) {
        const html = await gfinanceRes.text();
        const $ = cheerio.load(html);
        const pStr = $('.YMlKec.fxKbKc').first().text();
        const cStr = $('.P2Luy.Ez2Ioe.Zk7sWe').first().text();

        const cPctMatch = cStr.match(/([+-]?\d+\.?\d*)%/);
        let chgPct = 0;
        if (cPctMatch) chgPct = parseFloat(cPctMatch[1]);

        const price = parseFloat(pStr.replace(/,/g, ''));
        if (price > 0 && !isNaN(price)) {
          quotes.push(makeQuote("Borsa İstanbul (BIST 100)", "BIST100", price, price, chgPct, "Kaynak: Google / Investing (Anlık)"));
          bistAdded = true;
        }
      }
    } catch (e) {
      console.error("BIST100 fetch error:", e);
    }

    // Fallback BIST100
    if (!bistAdded || quotes.find(q => q.code === "BIST100")?.sell === 0) {
      if (truncgilResponse && truncgilResponse["xu100"]) {
        const b = truncgilResponse["xu100"];
        quotes.push(makeQuote("Borsa İstanbul (BIST 100)", "BIST100", parseTRNum(b.Alış), parseTRNum(b.Satış), parseTRNum(b.Değişim), "Kaynak: BIST Endeks"));
      } else {
        quotes.push(makeQuote("Borsa İstanbul (BIST 100)", "BIST100", 12626.35, 12626.35, 0.0, "Kaynak: Sabit Veri"));
      }
    }

    const data = quotes.filter(q => q.sell && !isNaN(q.sell));

    return NextResponse.json({
      source: data.length ? "live" : "fallback",
      updatedAt: new Date().toISOString(),
      data: data.length ? data : fallbackMarket,
    });
  } catch (error) {
    return NextResponse.json({
      source: "fallback",
      updatedAt: new Date().toISOString(),
      data: fallbackMarket,
    });
  }
}

function makeQuote(label: string, code: string, buy: number, sell: number, dailyPct: number, source: string) {
  return { label, code, buy, sell, dailyPct, source };
}
