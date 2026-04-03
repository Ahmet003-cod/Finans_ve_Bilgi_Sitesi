import { NextResponse } from "next/server";
import { fallbackMarket } from "@/lib/fallback-data";
import { fetchJsonWithTimeout } from "@/lib/security";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic"; // Her istekte taze veri çekmek için

function parseTRNum(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let str = String(val).replace("%", "").trim();
  
  // Eğer hem nokta hem virgül varsa (örn: 1.234,56)
  if (str.includes(".") && str.includes(",")) {
    str = str.replace(/\./g, "").replace(",", ".");
  } 
  // Eğer sadece virgül varsa (örn: 1234,56)
  else if (str.includes(",")) {
    str = str.replace(",", ".");
  }
  // Sadece nokta varsa dokunma (örn: 6651.84)
  
  return parseFloat(str) || 0;
}

export async function GET() {
  try {
    const quotesMap = new Map<string, any>();

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

        $("tr.currency-list-row").each((_, el) => {
          const name = $(el).find("span[itemprop='name']").text().trim();
          const buying = parseTRNum($(el).find("span[dt='bA']").text().trim());
          const selling = parseTRNum($(el).find("span[dt='amount']").text().trim());

          // Değişim dt='change' span'ında yer alır
          const changeText = $(el).find("span[dt='change']").text().trim();
          const changeMatch = changeText.match(/([+-]?\d+[,.]?\d*)/);
          const change = changeMatch ? parseFloat(changeMatch[1].replace(",", ".")) : 0;

          if (name && selling > 0) {
            // İsim eşleştirmeleri
            let code = "";
            let label = name;
            // "Eski" olmayan versiyonları tercih edelim
            if (name === "Gram Altın") { code = "GRAM"; label = "Gram Altın"; }
            if (name === "Çeyrek Altın") { code = "CEYREK"; label = "Çeyrek Altın"; }
            if (name === "Yarım Altın") { code = "YARIM"; label = "Yarım Altın"; }
            if (name === "Tam Altın") { code = "Tam Altın"; code = "TAM"; label = "Tam Altın"; }
            if (name === "Cumhuriyet Altını") { code = "CUMHURIYET"; label = "Cumhuriyet Altını"; }
            if (name.includes("Ons")) { code = "ONS"; label = "Ons Altın"; }

            if (code && !quotesMap.has(code)) {
              quotesMap.set(code, makeQuote(label, code, buying, selling, change, "Kaynak: Canlı Döviz (Kapalıçarşı)"));
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

      if (usd && !quotesMap.has("USD")) quotesMap.set("USD", makeQuote("Dolar (USD/TRY)", "USD", parseTRNum(usd.Alış), parseTRNum(usd.Satış), parseTRNum(usd.Değişim), "Kaynak: Serbest Piyasa"));
      if (eur && !quotesMap.has("EUR")) quotesMap.set("EUR", makeQuote("Euro (EUR/TRY)", "EUR", parseTRNum(eur.Alış), parseTRNum(eur.Satış), parseTRNum(eur.Değişim), "Kaynak: Serbest Piyasa"));

      // Eğer CanliDoviz'den altın verisi gelmezse Truncgil'den çek
      const goldMappings = [
        { key: "gram-altin", code: "GRAM", label: "Gram Altın" },
        { key: "ceyrek-altin", code: "CEYREK", label: "Çeyrek Altın" },
        { key: "yarim-altin", code: "YARIM", label: "Yarım Altın" },
        { key: "tam-altin", code: "TAM", label: "Tam Altın" },
        { key: "cumhuriyet-altini", code: "CUMHURIYET", label: "Cumhuriyet Altını" }
      ];

      goldMappings.forEach(gm => {
        if (!quotesMap.has(gm.code)) {
          const g = truncgilResponse[gm.key];
          if (g) {
            quotesMap.set(gm.code, makeQuote(gm.label, gm.code, parseTRNum(g.Alış), parseTRNum(g.Satış), parseTRNum(g.Değişim), "Kaynak: Serbest Piyasa (Altın)"));
          }
        }
      });
    }

    // 3. BIST100 (BloombergHT - En Güncel Yerel Kaynak)
    try {
      const bistRes = await fetch("https://www.bloomberght.com/borsa/endeks/bist-100", { 
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
        next: { revalidate: 60 } 
      });
      
      if (bistRes.ok) {
        const bistHtml = await bistRes.text();
        const $bist = cheerio.load(bistHtml);
        
        const priceText = $bist('span[data-type="son_fiyat"][data-id="XU100"]').text().trim();
        const changeText = $bist('span[data-type="yuzde_degisim"][data-id="XU100"]').text().trim();
        
        const bistPrice = parseTRNum(priceText);
        const bistChange = parseTRNum(changeText);
        
        if (bistPrice > 0) {
          quotesMap.set("BIST100", makeQuote("Borsa İstanbul (BIST 100)", "BIST100", bistPrice, bistPrice, bistChange, "Kaynak: BloombergHT (Anlık)"));
        }
      }
    } catch (e) {
      console.error("BIST100 fetch error:", e);
    }

    // Fallback BIST100
    if (!quotesMap.has("BIST100")) {
      if (truncgilResponse && truncgilResponse["xu100"]) {
        const b = truncgilResponse["xu100"];
        quotesMap.set("BIST100", makeQuote("Borsa İstanbul (BIST 100)", "BIST100", parseTRNum(b.Alış), parseTRNum(b.Satış), parseTRNum(b.Değişim), "Kaynak: BIST Endeks"));
      } else {
        quotesMap.set("BIST100", makeQuote("Borsa İstanbul (BIST 100)", "BIST100", 12626.35, 12626.35, 0.0, "Kaynak: Sabit Veri"));
      }
    }

    const data = Array.from(quotesMap.values()).filter(q => q.sell && !isNaN(q.sell));

    return NextResponse.json({
      source: data.length > 0 ? "live" : "fallback",
      updatedAt: new Date().toISOString(),
      data: data.length > 0 ? data : fallbackMarket,
    });
  } catch (error) {
    console.error("GET market error:", error);
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
