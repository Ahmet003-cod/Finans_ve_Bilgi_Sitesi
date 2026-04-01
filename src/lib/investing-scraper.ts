import puppeteer from 'puppeteer-extra';
// @ts-ignore
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';

// Cloudflare korumasını atlamak için eklentiyi aktifleştir
puppeteer.use(StealthPlugin());

export type InvestingResult = {
  price?: number;
  changePct?: number;
};

export async function fetchInvestingData(urls: string[]): Promise<Record<string, InvestingResult>> {
  const results: Record<string, InvestingResult> = {};
  
  if (!urls.length) return results;

  let browser;
  try {
    // Tarayıcıyı tamamen gizli modda ama eklentilerle başlat
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const url of urls) {
      try {
        const page = await browser.newPage();
        
        // Tarayıcı parmak izi görünümü, sahte çözünürlük vs.
        await page.setViewport({ width: 1366, height: 768 });
        
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Cloudflare challenge aşaması ortalama 2-3 sn sürer, bekleyelim veya belirli elementi görene kadar bekleyelim
        // Ancak time limit veya timeout yapmalıyız
        try {
           await page.waitForSelector('[data-test="instrument-price-last"]', { timeout: 10000 });
        } catch(e) { /* timeout if UI differs or CF blocked too long */ }
        
        const html = await page.content();
        const $ = cheerio.load(html);

        const priceStr = $('[data-test="instrument-price-last"]').text().trim();
        const pctStr = $('[data-test="instrument-price-change-percent"]').text().trim();
        
        let price = 0;
        let changePct = 0;

        if (priceStr) {
           price = parseFloat(priceStr.replace(/\./g, '').replace(/,/g, '.'));
        } else {
           // Eski Investing UI fallback
           const pOld = $('.text-5xl').first().text().trim() || $('#last_last').text().trim();
           if (pOld) price = parseFloat(pOld.replace(/\./g, '').replace(/,/g, '.'));
        }

        if (pctStr) {
           const match = pctStr.match(/([+-]?\d+\.?\d*)%/); 
           if (match) {
             changePct = parseFloat(match[1]);
           }
        } else {
           const pctOld = $('.instrument-price_change-percent__19cas').text().trim() || $('#pcp').text().trim();
           const matchOld = pctOld.match(/([+-]?\d+\.?\d*)/);
           if (matchOld) changePct = parseFloat(matchOld[1]);
        }
        
        if (price > 0 && !isNaN(price)) {
           results[url] = { price, changePct };
        }

        await page.close();
      } catch (err) {
         console.error(`Error scraping ${url}:`, err);
      }
    }
  } catch (error) {
    console.error("Puppeteer launch error:", error);
  } finally {
    if (browser) {
      await browser.close().catch(console.error);
    }
  }

  return results;
}
