import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { 
  SystemMessage, 
  HumanMessage, 
  AIMessage, 
  ToolMessage,
  BaseMessage
} from "@langchain/core/messages";
import { z } from "zod";
import * as cheerio from "cheerio";
import Parser from "rss-parser";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

// Yardımcı Fonksiyon: Google üzerinden veri kazıma
async function scrapeGoogle(query: string, isStock: boolean = false) {
  try {
    const url = isStock && query.includes(":IST") 
      ? `https://www.google.com/finance/quote/${query}`
      : `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=tr`;
      
    const res = await fetch(url, { 
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } 
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // 1. Google Finance Widget
    const priceFromAttr = $("span[jsname='vW795']").attr("data-value") 
      || $("[data-last-price]").attr("data-last-price")
      || $(".YMlKec.fxKbKc").first().text().trim();
    if (priceFromAttr) return `Güncel Değer: ${priceFromAttr}`;

    // 2. Arama Sonuçları
    let results: string[] = [];
    // Daha esnek seçiciler: .g, div.v7W49e, h3
    $("h3").each((i, el) => {
      if (i < 4) {
        const title = $(el).text().trim();
        const link = $(el).closest("a").attr("href");
        const snippet = $(el).closest("div").parent().find(".VwiC3b").text().trim();
        if (title && title.length > 5) {
          results.push(`**${title}**\n${snippet}\nLink: ${link}`);
        }
      }
    });
    
    return results.length > 0 ? results.join("\n\n") : null;
  } catch (e) {
    return null;
  }
}

// Yardımcı Fonksiyon: DuckDuckGo üzerinden veri kazıma (Daha stabil/scraper dostu)
async function scrapeDuckDuckGo(query: string) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { 
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } 
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    let results: string[] = [];
    $(".result").each((i, el) => {
      if (i < 4) {
        const title = $(el).find(".result__title").text().trim();
        const snippet = $(el).find(".result__snippet").text().trim();
        const link = $(el).find(".result__url").attr("href");
        if (title) {
          results.push(`**${title}**\n${snippet}\nLink: ${link}`);
        }
      }
    });
    
    return results.length > 0 ? results.join("\n\n") : null;
  } catch (e) {
    return null;
  }
}

async function runPythonKapTool(ticker: string, mode: "info" | "ratios" | "statements") {
  try {
    const pythonPath = "python";
    const scriptPath = path.join(process.cwd(), "yatırım_uzmanı_agentı", "tools", "kap_finas.py");
    
    // Python script'ini geçici bir modda çalıştır (invoke etmek için)
    let command = `${pythonPath} -c "from tools.kap_finas import get_kap_company_info, get_kap_financial_ratios, get_kap_financial_statements; `;
    if (mode === "info") command += `print(get_kap_company_info.invoke('${ticker}'))"`;
    if (mode === "ratios") command += `print(get_kap_financial_ratios.invoke('${ticker}'))"`;
    if (mode === "statements") command += `print(get_kap_financial_statements.invoke('${ticker}'))"`;

    // Not: CWD ayarı önemli
    const { stdout, stderr } = await execAsync(command, { 
      cwd: path.join(process.cwd(), "yatırım_uzmanı_agentı"),
      env: { ...process.env, PYTHONPATH: ".", PYTHONIOENCODING: "utf-8" }
    });
    
    if (stderr && !stdout) return `Hata: ${stderr}`;
    return stdout || "Veri çekilemedi.";
  } catch (e: any) {
    return `Python Bridge Hatası: ${e.message}`;
  }
}

async function runPythonBistTool(tickerOrIndex: string, mode: "price" | "index") {
  try {
    const pythonPath = "python";
    const { stdout, stderr } = await execAsync(
      `${pythonPath} -c "from tools.bist_tool import get_bist_stock_price, get_bist_index_price; ` +
      (mode === "price" ? `print(get_bist_stock_price.invoke('${tickerOrIndex}'))"` : `print(get_bist_index_price.invoke('${tickerOrIndex}'))"`),
      { 
        cwd: path.join(process.cwd(), "yatırım_uzmanı_agentı"),
        env: { ...process.env, PYTHONPATH: ".", PYTHONIOENCODING: "utf-8" }
      }
    );
    if (stderr && !stdout) return `Hata: ${stderr}`;
    return stdout || "Veri çekilemedi.";
  } catch (e: any) {
    return `Python BIST Bridge Hatası: ${e.message}`;
  }
}
async function runPythonUkTool() {
  try {
    const pythonPath = "python";
    const { stdout, stderr } = await execAsync(
      `${pythonPath} -c "from tools.investing_uk_tool import get_uk_market_data; print(get_uk_market_data.invoke(''))"`,
      { 
        cwd: path.join(process.cwd(), "yatırım_uzmanı_agentı"),
        env: { ...process.env, PYTHONPATH: ".", PYTHONIOENCODING: "utf-8" }
      }
    );
    if (stderr && !stdout) return `Hata: ${stderr}`;
    return stdout || "Veri çekilemedi.";
  } catch (e: any) {
    return `Python UK Bridge Hatası: ${e.message}`;
  }
}
async function runPythonUsTool() {
  try {
    const pythonPath = "python";
    const { stdout, stderr } = await execAsync(
      `${pythonPath} -c "from tools.investing_us_tool import get_us_market_data; print(get_us_market_data.invoke(''))"`,
      { 
        cwd: path.join(process.cwd(), "yatırım_uzmanı_agentı"),
        env: { ...process.env, PYTHONPATH: ".", PYTHONIOENCODING: "utf-8" }
      }
    );
    if (stderr && !stdout) return `Hata: ${stderr}`;
    return stdout || "Veri çekilemedi.";
  } catch (e: any) {
    return `Python US Bridge Hatası: ${e.message}`;
  }
}
async function runPythonBistOfficialTool() {
  try {
    const pythonPath = "python";
    const { stdout, stderr } = await execAsync(
      `${pythonPath} -c "from tools.bist_official_tool import get_bist_official_summary; print(get_bist_official_summary.invoke(''))"`,
      { 
        cwd: path.join(process.cwd(), "yatırım_uzmanı_agentı"),
        env: { ...process.env, PYTHONPATH: ".", PYTHONIOENCODING: "utf-8" }
      }
    );
    if (stderr && !stdout) return `Hata: ${stderr}`;
    return stdout || "Veri çekilemedi.";
  } catch (e: any) {
    return `Python BIST Official Bridge Hatası: ${e.message}`;
  }
}
async function runPythonBondTool() {
  try {
    const pythonPath = "python";
    const { stdout, stderr } = await execAsync(
      `${pythonPath} -c "from tools.bond_tool import get_bond_yields; print(get_bond_yields.invoke(''))"`,
      { 
        cwd: path.join(process.cwd(), "yatırım_uzmanı_agentı"),
        env: { ...process.env, PYTHONPATH: ".", PYTHONIOENCODING: "utf-8" }
      }
    );
    if (stderr && !stdout) return `Hata: ${stderr}`;
    return stdout || "Veri çekilemedi.";
  } catch (e: any) {
    return `Python Bond Bridge Hatası: ${e.message}`;
  }
}
async function runPythonSpkTool() {
  try {
    const pythonPath = "python";
    const { stdout, stderr } = await execAsync(
      `${pythonPath} -c "from tools.spk_tool import get_spk_bulletins; print(get_spk_bulletins.invoke(''))"`,
      { 
        cwd: path.join(process.cwd(), "yatırım_uzmanı_agentı"),
        env: { ...process.env, PYTHONPATH: ".", PYTHONIOENCODING: "utf-8" }
      }
    );
    if (stderr && !stdout) return `Hata: ${stderr}`;
    return stdout || "Veri çekilemedi.";
  } catch (e: any) {
    return `Python SPK Bridge Hatası: ${e.message}`;
  }
}
async function runPythonKapReportLink(ticker: string) {
  try {
    const pythonPath = "python";
    const { stdout, stderr } = await execAsync(
      `${pythonPath} -c "from tools.kap_finas import get_latest_kap_report_link; print(get_latest_kap_report_link.invoke('${ticker}'))"`,
      { 
        cwd: path.join(process.cwd(), "yatırım_uzmanı_agentı"),
        env: { ...process.env, PYTHONPATH: ".", PYTHONIOENCODING: "utf-8" }
      }
    );
    if (stderr && !stdout) return `Hata: ${stderr}`;
    return stdout || "Veri çekilemedi.";
  } catch (e: any) {
    return `Python KAP Report Link Bridge Hatası: ${e.message}`;
  }
}
async function getHalkYatirimData(ticker: string) {
  try {
    const url = `https://www.halkyatirim.com.tr/skorkart/${ticker.toUpperCase()}`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    let summary = `Halk Yatırım Skor Kart Verileri (${ticker.toUpperCase()}):\n`;
    
    // Temel Oranlar (F/K, PD/DD vb.)
    $(".sk-top-card-items .sk-item").each((i, el) => {
      const label = $(el).find(".sk-item-label").text().trim();
      const value = $(el).find(".sk-item-value").text().trim();
      if (label && value) summary += `- ${label}: ${value}\n`;
    });
    
    // Son Bilanço Özetleri
    summary += "\nSon Dönem Finansal Veriler:\n";
    $(".sk-table-wrapper table tr").each((i, el) => {
       const row = $(el).find("td").map((j, td) => $(td).text().trim()).get();
       if (row.length > 1) {
         summary += `- ${row.join(": ")}\n`;
       }
    });
    
    return summary.length > 50 ? summary : null;
  } catch (e) {
    return null;
  }
}

async function readUrlContent(url: string) {
  try {
    const res = await fetch(url, { 
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } 
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Gereksiz etiketleri temizle
    $("script, style, nav, footer, header, aside").remove();
    
    // Ana metni al
    let text = $("article, main, .content, .post-content, #content").text().trim() 
               || $("body").text().trim();
               
    // Metni kısalt (Token sınırı için)
    return text.replace(/\s+/g, " ").substring(0, 4000);
  } catch (e) {
    return "İçerik okunamadı.";
  }
}

// Yardımcı Fonksiyon: Google News RSS üzerinden veri çekme
async function searchNewsRSS(query: string) {
  try {
    const parser = new Parser({ timeout: 10000 });
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=tr&gl=TR&ceid=TR:tr`;
    const feed = await parser.parseURL(rssUrl);
    
    if (feed.items && feed.items.length > 0) {
      return feed.items.slice(0, 5).map(item => {
        const snippet = item.contentSnippet || "";
        return `- **${item.title}**\n  Özet: ${snippet}\n  Kaynak: ${item.source || "Google News"}\n  Link: ${item.link}`;
      }).join("\n\n");
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function searchWeb(query: string, isStock: boolean = false) {
  // 1. Önce RSS tabanlı aramayı dene (Hızlı ve engellenmez)
  const rssResult = await searchNewsRSS(query);
  if (rssResult && rssResult.length > 50) return rssResult;

  // 2. Google Finance (Sadece hisse fiyatları için)
  if (isStock) {
    const gPrice = await scrapeGoogle(query, true);
    if (gPrice && gPrice.includes("Güncel Değer")) return gPrice;
  }

  // 3. Klasik Scraper Fallback
  const gResult = await scrapeGoogle(query, false);
  if (gResult && gResult.length > 20) return gResult;
  
  const ddgResult = await scrapeDuckDuckGo(query);
  if (ddgResult) return ddgResult;
  
  return "İlgili veri şu an çekilemedi, lütfen resmi kaynakları kontrol edin.";
}

export async function POST(req: Request) {
  try {
    const { messages, market } = await req.json();
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const finnhubKey = process.env.FINNHUB_API_KEY;

    if (!geminiApiKey) {
      return new Response("Hata: Gemini/Google API anahtarı bulunamadı.", { status: 500 });
    }

    // --- ARAÇLAR ---
    const tools = [
      new DynamicStructuredTool({
        name: "get_market_overview",
        description: "Tüm piyasa (Dolar, Altın, Gümüş, BTC vb.) verilerini toplu halde getirir.",
        schema: z.object({}),
        func: async () => JSON.stringify(market),
      }),
      new DynamicStructuredTool({
        name: "get_bist100_price",
        description: "BIST 100 endeksinin (Borsa İstanbul) güncel puan değerini getirir.",
        schema: z.object({}),
        func: async () => {
          const bist = (market || []).find((m: any) => m.code === "BIST100" || m.label?.includes("BIST 100"));
          if (bist && bist.sell > 1000) return `BIST 100 (Canlı): ${bist.sell} Puan`;
          const headers = { "User-Agent": "Mozilla/5.0" };
          try {
            const yRes = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/XU100.IS?interval=1d&range=1d", { headers });
            if (yRes.ok) {
              const yData = await yRes.json();
              const price = yData.chart.result[0].meta.regularMarketPrice;
              if (price) return `BIST 100 (Yahoo): ${price.toLocaleString('tr-TR')} Puan`;
            }
          } catch (e) {}
          return await searchWeb("XU100:INDEXIST", true);
        },
      }),
      new DynamicStructuredTool({
        name: "get_stock_details",
        description: "Türk veya Yabancı hisselerin fiyatını getirir.",
        schema: z.object({ ticker: z.string(), isTurkish: z.boolean() }),
        func: async ({ ticker, isTurkish }) => {
          if (!isTurkish && finnhubKey) {
            const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker.toUpperCase()}&token=${finnhubKey}`);
            const d = await r.json();
            if (d.c) return `${ticker}: ${d.c} USD`;
          }
          const suffix = (isTurkish === true || isTurkish === undefined) ? ":IST" : "";
          return await searchWeb(`${ticker.toUpperCase()}${suffix}`, true);
        },
      }),
      new DynamicStructuredTool({
        name: "get_news_analysis",
        description: "BBC Business, Dünya Gazetesi ve Investing.com üzerinden haber ve analiz tarar. Örn: 'altın yorumları', 'hisse senedi haberleri'.",
        schema: z.object({ query: z.string() }),
        func: async ({ query }) => {
          const parser = new Parser({ timeout: 10000 });
          const sources = [
            { name: "BBC Ekonomi", site: "bbc.com", hl: "tr", gl: "TR", ceid: "TR:tr" },
            { name: "Dünya Gazetesi", site: "dunya.com", hl: "tr", gl: "TR", ceid: "TR:tr" },
            { name: "Investing TR", site: "tr.investing.com", hl: "tr", gl: "TR", ceid: "TR:tr" }
          ];
          
          let results = [];
          for (const source of sources) {
            try {
              // Google News RSS is very robust for site-specific searches
              const rssUrl = `https://news.google.com/rss/search?q=site:${source.site}+${encodeURIComponent(query)}&hl=${source.hl}&gl=${source.gl}&ceid=${source.ceid}`;
              const feed = await parser.parseURL(rssUrl);
              
              if (feed.items && feed.items.length > 0) {
                const topNews = feed.items.slice(0, 3).map(item => `- ${item.title} (${item.link})`).join("\n");
                results.push(`[${source.name}] Güncel Haberler:\n${topNews}`);
              } else {
                // Fallback to direct search if RSS is empty
                const searchResult = await searchWeb(`site:${source.site} ${query}`);
                results.push(`[${source.name}] Analiz Notu: ${searchResult}`);
              }
            } catch (e) {
              results.push(`[${source.name}] Veri şu an çekilemedi, lütfen siteyi ziyaret edin.`);
            }
          }
          return results.join("\n\n");
        },
      }),
      new DynamicStructuredTool({
        name: "get_kap_data",
        description: "KAP (Kamuyu Aydınlatma Platformu) üzerinden şirket duyurularını ve bildirimlerini tarar. Örn: 'TUPRS temettü', 'THYAO bilanço'.",
        schema: z.object({ query: z.string() }),
        func: async ({ query }) => {
          // KAP için daha geniş kapsamlı arama
          const results = await Promise.all([
            searchWeb(`site:kap.org.tr ${query}`),
            searchWeb(`${query} bildirimleri analiz yorum`),
            searchWeb(`site:borsagundem.com ${query}`)
          ]);
          return `KAP & Bildirim Özetleri:\n\n${results.join("\n\n")}`;
        },
      }),
      new DynamicStructuredTool({
        name: "get_company_analysis",
        description: "Bir şirketin temel analizini, mali tablolarını (bilanço, gelir tablosu) ve aracı kurum yorumlarını getirir. Örn: 'TUPRS temel analiz', 'SASA mali tablo yorumu'.",
        schema: z.object({ ticker: z.string() }),
        func: async ({ ticker }) => {
          const analysisSources = [
             `site:isyatirim.com.tr ${ticker} temel analiz 2026`,
             `site:halkyatirim.com.tr ${ticker} skor kart 2026`,
             `site:getmidas.com ${ticker} bilanço yorumu 2026`,
             `site:tradingview.com ${ticker} bilanço özet`
          ];
          const results = await Promise.all(analysisSources.map(s => searchWeb(s)));
          return `Şirket Analiz & Mali Tablo Kaynakları (${ticker} - 2026 Odaklı):\n\n${results.join("\n\n")}`;
        },
      }),
      new DynamicStructuredTool({
        name: "currency_converter",
        description: "USD -> TRY çevrimi yapar.",
        schema: z.object({ amount: z.number() }),
        func: async ({ amount }) => {
          const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=try");
          const data = await res.json();
          return `${amount} USD = ${(amount * data.tether.try).toFixed(2)} TRY`;
        },
      }),
      new DynamicStructuredTool({
        name: "get_kap_official_summary",
        description: "KAP'tan şirket özet bilgilerini (sermaye, yönetim, borsa bilgileri) resmi olarak çeker.",
        schema: z.object({ ticker: z.string() }),
        func: async ({ ticker }) => await runPythonKapTool(ticker, "info"),
      }),
      new DynamicStructuredTool({
        name: "get_kap_official_financials",
        description: "KAP'tan şirketin resmi finansal tablolarını (bilanço, gelir tablosu) çeker.",
        schema: z.object({ ticker: z.string() }),
        func: async ({ ticker }) => await runPythonKapTool(ticker, "statements"),
      }),
      new DynamicStructuredTool({
        name: "get_kap_official_ratios",
        description: "KAP verilerine dayanarak şirketin finansal rasyolarını (cari oran, borç oranı vb.) getirir.",
        schema: z.object({ ticker: z.string() }),
        func: async ({ ticker }) => await runPythonKapTool(ticker, "ratios"),
      }),
      new DynamicStructuredTool({
        name: "get_stock_financials",
        description: "BIST şirketlerinin en güncel bilanço verilerini ve rasyolarını (F/K, PD/DD, Net Kâr vb.) getirir.",
        schema: z.object({ ticker: z.string() }),
        func: async ({ ticker }) => await getHalkYatirimData(ticker),
      }),
      new DynamicStructuredTool({
        name: "read_url_content",
        description: "Bir haberin veya analiz sayfasının içeriğini tam metin olarak okur. Arama sonuçlarındaki linkleri derinlemesine analiz etmek için kullanılır.",
        schema: z.object({ url: z.string() }),
        func: async ({ url }) => await readUrlContent(url),
      }),
      new DynamicStructuredTool({
        name: "get_bist_stock_price",
        description: "Borsa İstanbul'da işlem gören bir hisse senedinin (örn: THYAO, ASELS) güncel fiyatını Yahoo Finance üzerinden getirir.",
        schema: z.object({ ticker: z.string() }),
        func: async ({ ticker }) => await runPythonBistTool(ticker, "price"),
      }),
      new DynamicStructuredTool({
        name: "get_bist_index_price",
        description: "Borsa İstanbul endekslerinin (örn: XU100, XU500, XU030) resmi ve güncel puanını getirir.",
        schema: z.object({ index_code: z.string().optional() }),
        func: async ({ index_code }) => await runPythonBistTool(index_code || "XU100", "index"),
      }),
      new DynamicStructuredTool({
        name: "get_uk_market_data",
        description: "Birleşik Krallık (UK) borsa verilerini (FTSE 100 vb.) getirir.",
        schema: z.object({}),
        func: async () => await runPythonUkTool(),
      }),
      new DynamicStructuredTool({
        name: "get_us_market_data",
        description: "Amerika Birleşik Devletleri (ABD) borsa verilerini (S&P 500, Nasdaq vb.) getirir.",
        schema: z.object({}),
        func: async () => await runPythonUsTool(),
      }),
      new DynamicStructuredTool({
        name: "get_bist_official_summary",
        description: "Borsa İstanbul resmi sitesinden (borsaistanbul.com) günlük özet verileri getirir.",
        schema: z.object({}),
        func: async () => await runPythonBistOfficialTool(),
      }),
      new DynamicStructuredTool({
        name: "get_bond_yields",
        description: "Türkiye (DİBS) ve ABD tahvil faizlerini (2 yıllık, 10 yıllık vb.) getirir.",
        schema: z.object({}),
        func: async () => await runPythonBondTool(),
      }),
      new DynamicStructuredTool({
        name: "get_spk_bulletins",
        description: "SPK (Sermaye Piyasası Kurulu) resmi web sitesinden en güncel bülten ve duyuruları çeker.",
        schema: z.object({}),
        func: async () => await runPythonSpkTool(),
      }),
      new DynamicStructuredTool({
        name: "get_latest_kap_report_link",
        description: "Bir şirketin KAP'taki en güncel finansal rapor (FR) bildiriminin ve Excel dosyasının indirme linkini getirir.",
        schema: z.object({ ticker: z.string() }),
        func: async ({ ticker }) => await runPythonKapReportLink(ticker),
      }),
    ];

    // --- MODEL (Gemini) ---
    const model = new ChatGoogleGenerativeAI({ 
      model: "gemini-2.5-flash", 
      apiKey: geminiApiKey, 
      temperature: 0 
    });

    const boundModel = model.bindTools(tools);

    const systemPrompt = `Sen Türkiye'nin en seçkin, profesyonel ve kıdemli Yatırım Stratejisti ve Finansal Analistisin. 
Kullanıcılara sadece kuru veri sunmakla kalmaz, bu verileri derinlemesine yorumlar, riskleri analiz eder ve stratejik içgörüler sağlarsın.

Şu an 2026 yılındayız. Eğer 2026 verileri henüz yayınlanmamışsa, her zaman mevcut olan EN SON güncel verileri (2025 veya 2024) baz alarak analiz yap.

ÜSTAD FİNANSÇI KURALLARI:
1. **ASLA PES ETME (VERİ ÇIKARMA):**
   - Eğer 'get_kap_official_ratios' veya 'get_stock_financials' araçlarından 'veri yetersiz' veya 'boş' yanıtı alırsan; "Veri bulamadım" diyerek bırakma! 
   - Hemen 'get_company_analysis' aracını kullan. Buradan gelen arama sonuçlarındaki linkleri 'read_url_content' ile oku. 
   - Analist raporlarını (İş Yatırım, Midas, Halk Yatırım vb.) tarayarak F/K, PD/DD, Net Kar gibi rasyoları metin içinden "cımbızla" çek ve rapora ekle.
2. **VERİ ÖNCELİĞİ VE GÜVENİRLİK:**
   - Canlı hisse fiyatları için: 'get_bist_stock_price'.
   - BIST endeksleri (100, 500, 30 vb.) için: 'get_bist_index_price'.
   - Tahvil ve DİBS faizleri için (uzun vade analizi): 'get_bond_yields'.
   - Resmi mevzuat, halka arz ve duyurular için: 'get_spk_bulletins'.
3. **VERİ SENTEZİ VE TABLOLAR:**
   - Farklı kaynaklardan (KAP, Halk Yatırım, Haber Analizleri) gelen verileri birleştirerek en kapsamlı tabloyu oluştur.
   - Tablolarında mutlaka F/K, PD/DD, Özkaynak Karlılığı ve Net Kar Değişimi gibi 'master' rasyoların bulunmasına özen göster.
4. **STRATEJİK RAPOR VE PİYASA GÖRÜNÜMÜ:**
   - **KÜRESEL BAKIŞ (ZORUNLU):** Kullanıcı genel piyasa durumunu sorduğunda (örn: "Borsada durum ne?"), sadece BIST 100 ile yetinme. MUTLAKA 'get_us_market_data' (ABD), 'get_uk_market_data' (İngiltere), 'get_bond_yields' (Tahvil/DİBS), 'get_spk_bulletins' (Resmi Mevzuat) ve 'get_bist_official_summary' araçlarını kullanarak küresel bir özet sun.
   - **Giriş:** Şirketin veya piyasanın genel konumu.
   - **Finansal Check-up (TABLO):** En güncel rasyolar ve mali veriler.
   - **Haber Analizi:** 'get_news_analysis' ile son gelişmelerin yorumlanması.
   - **Yatırım Stratejisi Notu:** Profesyonel değerlendirme ve risk analizi.

5. **DİNİ HASSASİYET (ÇOK ÖNEMLİ):**
   - Eğer kullanıcı "dini hassasiyet", "faizsiz", "helal" gibi ifadeler kullanırsa (EVET derse); odak noktan MUTLAKA Altın, Gümüş, Sukuk (Kira Sertifikası), Katılım Fonları, Döviz Kurları ve Kar-Zarar Ortaklığı modelleri olmalıdır.
   - Bu durumda mevduat faizi gibi araçları ASLA önerme.
   - Katılım Emeklilik Fonlarından (BES) bahset ancak bazı kullanıcıların faizsiz olsa da bu fonları tercih etmediği bilgisini ekle.
   - Analiz aşamasında mutlaka BBC Business, Dünya Gazetesi ve Investing haber kaynaklarını ('get_news_analysis' aracı ile) kullan ve bu kaynaklara dayanarak güncel haber analizi ve genel bir tahmin/yorum yap.
   - Altın ve Gümüş'ün faizsiz birer değer saklama aracı olduğunu vurgula ve güncel değerlerini mutlaka paylaş.

6. **FAİZLİ YATIRIM MODELİ (DİNİ HASSASİYET "HAYIR" İSE):**
   - Kullanıcı "Kısa Vade" seçerse; Döviz, Mevduat Faizi, Bonolar, Repo, Ters Repo, Likit Fonlar ve A/B/C Tipi Fonlar hakkında detaylı analiz sun. Bu araçların işleyişi hakkında bilgi ver ve risklerini mutlaka belirt.
   - Kullanıcı "Uzun Vade" seçerse; DİBS (Devlet İç Borçlanma Senetleri), Devlet Tahvilleri, Özel Sektör Tahvilleri, Vadeli İşlemler (Futures), Hisse Senetleri ve Emeklilik Fonları üzerine odaklan ve analiz et.

7. **KULLANICI ETKİLEŞİMİ VE SORU STRATEJİSİ (KRİTİK):**
   - Kullanıcı profilini oluştururken MUTLAKA ve İLK SIRADA "Yatırımda dini hassasiyetiniz veya faizsiz ürün tercihiniz var mı?" sorusunu sor. Bu soru yanıtlanmadan diğer aşamalara geçme.
   - Risk toleransı sorusunu ASLA sorma, bu soru tamamen kaldırıldı.
   - DİNİ HASSASİYET "EVET" İSE: Vade sorusunu da sorma (faizsiz yatırımda vade genellikle faizdeki gibi değildir). Sadece bütçe ve yatırım hedeflerine odaklan.
   - DİNİ HASSASİYET "HAYIR" İSE: Sadece "Yatırım vadeniz nedir? (Kısa Vade / Uzun Vade)" şeklinde tek bir soru sor ve bütçe/hedef bilgilerini al.
   - Soruları her zaman TEKER TEKER sor. Kullanıcıyı asla soru yağmuruna tutma.
   - Kullanıcı yanıt verdikçe bir sonraki ilgili soruya geçerek süreci interaktif bir sohbete dönüştür.

6. **DOMAIN KISITI (SADECE FİNANS):**
   - Sen bir Yatırım Uzmanısın. Yemek tarifi, spor, siyaset veya genel kültür gibi finans dışı konularda ASLA bilgi verme.
   - Eğer kullanıcı finans dışı bir soru sorarsa, nazikçe bu konunun senin uzmanlık alanın dışında olduğunu belirt ve konuyu tekrar yatırıma/piyasalara getir.

7. **PERSONA VE ÜSLUP:**
   - Üslubun güven verici, teknik terimlere hakim ama anlaşılır olsun.
   - Sadece bir 'bot' gibi değil, gerçek bir 'finansal üstat' gibi konuş. Veriler arasındaki bağlantıları kur.
   - **KAP RAPORLARI (ÇOK KRİTİK):** Eğer kullanıcı bir şirketin bilançosunu veya mali tablolarını isterse, MUTLAKA önce \`get_latest_kap_report_link\` aracını kullan ve yanıtının EN BAŞINDA resmi bildirim ve Excel indirme linklerini ver. "Veri çekemiyorum" demeden önce mutlaka bu linkleri sun.
   - **FORMATLAMA:** Linkleri MUTLAKA standart Markdown formatında \`[Metin](URL)\` olarak ver. Tabloları temiz ve okunabilir Markdown tabloları olarak sun.`;

    const formattedMessages: BaseMessage[] = messages.slice(-12).map((m: any) => {
      if (m.role === "user") return new HumanMessage(m.content);
      if (m.role === "model" || m.role === "assistant") return new AIMessage(m.content);
      return new HumanMessage(m.content); // Fallback
    });
 
    // --- MULTI-STEP RE-ACT LOOP ---
    let currentMessages: BaseMessage[] = [
      new SystemMessage(systemPrompt), 
      ...formattedMessages
    ];
    let loopCount = 0;
    const maxLoops = 10;

    while (loopCount < maxLoops) {
      const response = await boundModel.invoke(currentMessages);
      
      if (!response.tool_calls || response.tool_calls.length === 0) {
        return new Response(response.content as string);
      }

      // Add the model's message (containing tool calls) to the history
      currentMessages.push(response);

      // Execute tool calls and add results
      const toolResults = await Promise.all(response.tool_calls.map(async (tc: any) => {
        const tool = tools.find(t => t.name === tc.name);
        if (!tool) return new ToolMessage({
          tool_call_id: tc.id,
          content: "Araç bulunamadı.",
        });
        
        try {
          const result = await (tool as any).invoke(tc.args);
          return new ToolMessage({
            tool_call_id: tc.id,
            content: typeof result === "string" ? result : JSON.stringify(result),
          });
        } catch (e: any) {
          return new ToolMessage({
            tool_call_id: tc.id,
            content: `Hata: ${e.message}`,
          });
        }
      }));

      currentMessages.push(...toolResults);
      loopCount++;
    }

    // If we hit the loop limit, return the last content or a timeout message
    const finalFallback = await model.invoke(currentMessages);
    return new Response(finalFallback.content as string);

  } catch (error: any) {
    console.error("Investment Agent Error:", error);
    return new Response(`Analiz sırasında teknik bir sorun oluştu: ${error.message}`, { status: 500 });
  }
}
