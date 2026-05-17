import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function fetchKapMap() {
    console.log('KAP API üzerinden şirket listesi çekiliyor...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto('https://www.kap.org.tr/tr/bist-sirketler', { waitUntil: 'domcontentloaded', timeout: 120000 });
        
        // Browser context içinde fetch yap (CORS ve Bot korumasını aşar)
        const data = await page.evaluate(async () => {
            const res = await fetch('https://www.kap.org.tr/api/memberCompany/bist');
            return await res.json();
        });
        
        if (Array.isArray(data)) {
            const outputPath = path.join(process.cwd(), 'yatırım_uzmanı_agentı', 'tools', 'kap_map.json');
            fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
            console.log(`KAP API verisi başarıyla kaydedildi: ${data.length} şirket.`);
        } else {
            console.error('API verisi dizi değil:', data);
        }
        
    } catch (e) {
        console.error('KAP API çekilirken hata:', e);
    } finally {
        await browser.close();
    }
}

fetchKapMap();
