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

    // 3. BIST (Multi-Source Robust Scraper)
    const bistSources = [
      {
        name: "TradingView",
        url: "https://tr.tradingview.com/symbols/BIST-XU100/",
        isTV: true
      },
      {
        name: "Doviz.com",
        url: "https://borsa.doviz.com/endeksler/xu100-bist-100",
        priceSelector: '.stock-details .value',
        changeSelector: '.stock-details .change-rate'
      },
      {
        name: "Google Finance",
        url: "https://www.google.com/finance/quote/XU100:INDEXIST",
        priceSelector: '.YMlS7e',
        changeSelector: '.Jw7Xdb'
      },
      {
        name: "BloombergHT",
        url: "https://www.bloomberght.com/borsa/endeks/bist-100",
        priceSelector: 'span[data-type="son_fiyat"][data-id="XU100"]',
        changeSelector: 'span[data-type="yuzde_degisim"][data-id="XU100"]'
      }
    ];

    for (const source of bistSources) {
      if (quotesMap.has("BIST")) break;
      try {
        const res = await fetch(source.url, { 
          headers: { 
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
          },
          next: { revalidate: 60 } 
        });
        
        if (res.ok) {
          const html = await res.text();
          const $ = cheerio.load(html);
          let price = 0;
          let change = 0;

          if (source.isTV) {
             // TradingView için özel JSON-LD veya Meta parsing
             $('script[type="application/ld+json"]').each((_, el) => {
               try {
                 const json = JSON.parse($(el).html() || "{}");
                 if (json["@type"] === "FinancialQuote" || json.price) {
                    price = parseTRNum(json.price);
                 }
               } catch(e){}
             });
             if (price <= 0) {
                const metaPrice = $('meta[property="og:description"]').attr('content'); 
                // Örnek: "BIST 100 (12.936,35 %-0,83)" - Buradan sayıları çekebiliriz
                const match = metaPrice?.match(/([\d\.,]+)/);
                if (match) price = parseTRNum(match[0]);
             }
          } else {
             const priceText = $(source.priceSelector!).first().text().trim();
             const changeText = $(source.changeSelector!).first().text().trim();
             price = parseTRNum(priceText);
             change = parseTRNum(changeText);
          }

          if (price > 0) {
            quotesMap.set("BIST", makeQuote("Borsa İstanbul", "BIST", price, price, change, `Kaynak: ${source.name} (Anlık)`));
            break;
          }
        }
      } catch (e) {
        console.error(`BIST fetch error (${source.name}):`, e);
      }
    }

    // Fallback BIST
    if (!quotesMap.has("BIST")) {
      if (truncgilResponse && truncgilResponse["xu100"]) {
        const b = truncgilResponse["xu100"];
        quotesMap.set("BIST", makeQuote("Borsa İstanbul", "BIST", parseTRNum(b.Alış), parseTRNum(b.Satış), parseTRNum(b.Değişim), "Kaynak: BIST Endeks"));
      } else {
        quotesMap.set("BIST", makeQuote("Borsa İstanbul", "BIST", 12942.35, 12942.35, -0.83, "Kaynak: Sabit Veri"));
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
