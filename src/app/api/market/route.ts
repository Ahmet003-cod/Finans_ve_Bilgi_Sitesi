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
      const gbp = truncgilResponse["GBP"];

      if (usd && !quotesMap.has("USD")) quotesMap.set("USD", makeQuote("Dolar (USD/TRY)", "USD", parseTRNum(usd.Alış), parseTRNum(usd.Satış), parseTRNum(usd.Değişim), "Kaynak: Serbest Piyasa"));
      if (eur && !quotesMap.has("EUR")) quotesMap.set("EUR", makeQuote("Euro (EUR/TRY)", "EUR", parseTRNum(eur.Alış), parseTRNum(eur.Satış), parseTRNum(eur.Değişim), "Kaynak: Serbest Piyasa"));
      if (gbp && !quotesMap.has("GBP")) quotesMap.set("GBP", makeQuote("Sterlin (GBP/TRY)", "GBP", parseTRNum(gbp.Alış), parseTRNum(gbp.Satış), parseTRNum(gbp.Değişim), "Kaynak: Serbest Piyasa"));

      // Eğer CanliDoviz'den altın verisi gelmezse Truncgil'den çek
      const goldMappings = [
        { key: "gram-altin", code: "GRAM", label: "Gram Altın" },
        { key: "ceyrek-altin", code: "CEYREK", label: "Çeyrek Altın" },
        { key: "yarim-altin", code: "YARIM", label: "Yarım Altın" },
        { key: "tam-altin", code: "TAM", label: "Tam Altın" },
        { key: "cumhuriyet-altini", code: "CUMHURIYET", label: "Cumhuriyet Altını" },
        { key: "gumus", code: "SILVER", label: "Gümüş (Gram)" }
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

    // 3. Bitcoin, Gümüş ve BIST100 (Investing.com + Google Finance + CanlıDöviz)
    const extraQuotes = [
      { id: "XU100:INDEXBIST", code: "BIST100", label: "BIST 100 Endeksi" },
      { id: "BTC-USD", code: "BTC", label: "Bitcoin (BTC/USD)" },
      { id: "XAG-TRY", code: "SILVER", label: "Gümüş (Gram)" },
      { id: "UKOIL:CUR", code: "BRENT", label: "Brent Petrol ($)" }
    ];

    await Promise.all(extraQuotes.map(async (item) => {
      try {
        // 3a. BIST100 Özel Akışı
        if (item.code === "BIST100") {
            // -- 1. Deneme: Doviz.com (En Güncel ve Çalışan) --
            try {
                const dvzRes = await fetch("https://www.doviz.com", {
                    headers: { 
                      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                      "Referer": "https://www.google.com/" 
                    },
                    next: { revalidate: 60 }
                });
                if (dvzRes.ok) {
                    const html = await dvzRes.text();
                    const $d = cheerio.load(html);
                    const priceText = $d('a[href*="xu100-bist-100"] span:nth-of-type(2)').first().text().trim();
                    const changeText = $d('a[href*="xu100-bist-100"] div:nth-of-type(1)').first().text().trim();
                    
                    const price = parseTRNum(priceText);
                    const change = parseTRNum(changeText);
                    
                    if (price > 1000) {
                        quotesMap.set("BIST100", makeQuote("BIST 100 Endeksi", "BIST100", price, price, change, "Kaynak: Doviz.com"));
                        return;
                    }
                }
            } catch (e) { console.error("Doviz.com BIST failed:", e); }

            // -- 2. Deneme: Investing.com --
            try {
                const invRes = await fetch("https://tr.investing.com/indices/ise-100", {
                    headers: { 
                      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                      "Referer": "https://www.google.com/" 
                    },
                    next: { revalidate: 60 }
                });
                if (invRes.ok) {
                    const html = await invRes.text();
                    const $i = cheerio.load(html);
                    const priceText = $i('[data-test="instrument-price-last"]').first().text().trim();
                    const changeText = $i('[data-test="instrument-price-change-percent"]').first().text().replace(/[()%]/g, "").trim();
                    
                    const price = parseTRNum(priceText);
                    const change = parseTRNum(changeText);
                    
                    if (price > 1000) { // BIST100 genelde 1000+ puandadır
                        quotesMap.set("BIST100", makeQuote("BIST 100 Endeksi", "BIST100", price, price, change, "Kaynak: Investing.com"));
                        return;
                    }
                }
            } catch (e) { console.error("Investing BIST failed:", e); }

            // -- 3. Deneme: CanliDoviz --
            try {
                const cdRes = await fetch("https://canlidoviz.com/borsa-istanbul", { 
                    headers: { "User-Agent": "Mozilla/5.0" }, 
                    next: { revalidate: 60 } 
                });
                if (cdRes.ok) {
                    const html = await cdRes.text();
                    const $cd = cheerio.load(html);
                    const bistRow = $cd("tr").filter((_, el) => $cd(el).text().includes("BIST 100")).first();
                    if (bistRow.length > 0) {
                        const price = parseTRNum(bistRow.find("td").eq(1).text());
                        const change = parseTRNum(bistRow.find("td").eq(4).text());
                        if (price > 1000) {
                            quotesMap.set("BIST100", makeQuote("BIST 100 Endeksi", "BIST100", price, price, change, "Kaynak: Canlı Döviz"));
                            return;
                        }
                    }
                }
            } catch (e) { console.error("CanliDoviz BIST failed:", e); }
        }

        // 3b. Gümüş Özel Akışı
        if (item.code === "SILVER") {
            const silverRes = await fetch("https://canlidoviz.com/altin-fiyatlari/gumus", { 
              headers: { "User-Agent": "Mozilla/5.0" }, 
              next: { revalidate: 60 } 
            });
            if (silverRes.ok) {
               const $s = cheerio.load(await silverRes.text());
               const buying = parseTRNum($s("span[data-id='GAG_BUY']").text());
               const selling = parseTRNum($s("span[data-id='GAG_SELL']").text());
               const change = parseTRNum($s("span[data-id='GAG_RATE']").text() || $s("span[data-id='GAG_CHANGE_PERCENT']").text());
               if (selling > 0) {
                  quotesMap.set("SILVER", makeQuote("Gümüş (Gram)", "SILVER", buying, selling, change, "Kaynak: Canlı Döviz"));
                  return;
               }
            }
        }

        // 3c. Standart Akış (Google Finance)
        if (!quotesMap.has(item.code)) {
            const res = await fetch(`https://www.google.com/finance/quote/${item.id}`, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
              next: { revalidate: 60 }
            });
            if (res.ok) {
              const $ = cheerio.load(await res.text());
              let priceStr = $(".YMlKec.fxKbKc").first().text().replace(/[^0-9.,]/g, "");
              let price = item.code === "BTC" ? parseFloat(priceStr.replace(/,/g, "")) : parseTRNum(priceStr);
              const changeStr = $(".P2Luy").first().text();
              const changePctMatch = changeStr.match(/([+-]?\d+[,.]?\d*)%/);
              const changePct = changePctMatch ? parseFloat(changePctMatch[1].replace(",", ".")) : 0;

              if (price > 0) {
                quotesMap.set(item.code, makeQuote(item.label, item.code, price, price, changePct, "Kaynak: Google Finance"));
              }
            }
        }
      } catch (e) {
        console.error(`${item.code} total fetch error:`, e);
      }
    }));

    // Önemli verileri en üste çekmek için sıralama yapalım
    const order = ["BIST100", "USD", "EUR", "GBP", "BRENT", "BTC", "GRAM", "CEYREK", "YARIM", "TAM", "SILVER"];
    const data = Array.from(quotesMap.values())
      .filter(q => q.sell && !isNaN(q.sell))
      .sort((a, b) => {
        const idxA = order.indexOf(a.code);
        const idxB = order.indexOf(b.code);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });

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
