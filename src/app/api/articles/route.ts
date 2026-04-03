import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { fetchJsonWithTimeout } from "@/lib/security";

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0 Safari/537.36" },
});

// Sistemde mevcut olan ücretsiz çeviri fonksiyonu (Alternatif olarak OpenAI eklenebilir)
async function translateToTurkish(text: string) {
  if (!text) return "";
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|tr`;
    const out = await fetchJsonWithTimeout<{ responseData?: { translatedText?: string } }>(url, 8000);
    return out.responseData?.translatedText?.trim() || text;
  } catch {
    return text;
  }
}

// Haber ve Makale Kaynakları
// Türkiye lokasyonu: hl=tr&gl=TR&ceid=TR:tr
// Global lokasyon (İngilizce Makaleler): hl=en-US&gl=US&ceid=US:en
const FEEDS = [
  { category: "YBS", name: "Yönetim Bilişim Sistemleri", url: "https://news.google.com/rss/search?q=%22Y%C3%B6netim+Bili%C5%9Fim+Sistemleri%22+OR+%22Management+Information+Systems%22&hl=tr&gl=TR&ceid=TR:tr" },
  { category: "Yazılım", name: "Yazılım Teknolojileri", url: "https://news.google.com/rss/search?q=%22Yaz%C4%B1l%C4%B1m+M%C3%BChendisli%C4%9Fi%22+OR+%22Software+Engineering%22+OR+%22Software+Development%22&hl=tr&gl=TR&ceid=TR:tr" },
  { category: "Yapay Zeka", name: "Yapay Zeka Ar-Ge", url: "https://news.google.com/rss/search?q=%22Yapay+Zeka%22+OR+%22Artificial+Intelligence%22+OR+OpenAI+OR+Anthropic+OR+DeepMind&hl=tr&gl=TR&ceid=TR:tr" },
  { category: "Agent", name: "Otonom Agent Sistemleri", url: "https://news.google.com/rss/search?q=%22AI+Agents%22+OR+%22Autonomous+Agents%22+OR+%22Otonom+Ajanlar%22+OR+%22Yapay+Zeka+Ajanlar%C4%B1%22&hl=en-US&gl=US&ceid=US:en" },
  { category: "Kuantum", name: "Kuantum Teknolojileri", url: "https://news.google.com/rss/search?q=%22Kuantum+Bilgisayar%22+OR+%22Quantum+Computing%22&hl=en-US&gl=US&ceid=US:en" },
  { category: "Finans", name: "Küresel Finans Piyasaları", url: "https://news.google.com/rss/search?q=Finans+OR+Ekonomi+OR+Borsa+OR+%22Financial+Markets%22&hl=tr&gl=TR&ceid=TR:tr" },
  { category: "Sigorta", name: "Sigorta ve InsurTech", url: "https://news.google.com/rss/search?q=%22Sigorta+Sekt%C3%B6r%C3%BC%22+OR+%22InsurTech%22+OR+%22Insurance+Technology%22&hl=tr&gl=TR&ceid=TR:tr" },
  { category: "İşletme", name: "İşletme ve Stratejik Yönetim", url: "https://news.google.com/rss/search?q=%22%C4%B0%C5%9Fletme+Y%C3%B6netimi%22+OR+%22Business+Management%22+OR+Giri%C5%9Fimcilik&hl=tr&gl=TR&ceid=TR:tr" }
];

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const chunks = await Promise.all(
      FEEDS.map(async (feed) => {
         const parsed = await parser.parseURL(feed.url).catch(() => null);
         if (!parsed || !parsed.items) return [];
         
         // Her kategori için sadece en yeni ve son 7 güne ait olanları filtrele
         const recentItems = parsed.items.filter(item => {
             const pubDate = new Date(item.isoDate || item.pubDate || Date.now()).getTime();
             return pubDate > sevenDaysAgo;
         });

         // İlk 4 haberle sınırla, API'yi yormayalım
         return recentItems.slice(0, 4).map((item) => ({
             title: item.title ?? "Başlık yok",
             link: item.link ?? "#",
             source: item.source || feed.name,
             category: feed.category,
             publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
         }));
      })
    );

    let allItems = chunks.flat();

    // Tarihe göre yeniden en eskiye sırala (Timeline mantığı)
    allItems = allItems.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

    // Toplam veri sayısını aşmamak adına en güncel 24 makaleyi alalım
    allItems = allItems.slice(0, 24);

    // Otomatik Çeviri ve Yorumlama Döngüsü
    const finalData = await Promise.all(
      allItems.map(async (item) => {
        // Eğer başlık İngilizce harflerden oluşuyorsa veya yabancı kaynaktansa
        // (Tam %100 dil tanıması yapamasak da başlığında İngilizce kelime oranına göre çeviri deneyebiliriz ya da feed bazlı çeviri)
        // Feed yabancıysa (US lokasyonu) direkt çevir.
        const isForeignFeed = ["Agent", "Kuantum"].includes(item.category) || /[a-zA-Z]/.test(item.title);
        
        // Şimdilik sadece "Agent" ve "Kuantum" feed'lerini bilinçli US tabanlı çektiğimiz için garantili çevirtebiliriz. 
        // Ya da içinde "İ", "ş", "ç", "ğ", "ü", "ö" yoksa yabancı sayabiliriz.
        const hasTurkishChars = /[çğıöşüÇĞİÖŞÜ]/.test(item.title);
        let titleTr = item.title;
        let requiresTranslation = (!hasTurkishChars && isForeignFeed) || ["Agent", "Kuantum"].includes(item.category);

        if (requiresTranslation) {
           const translated = await translateToTurkish(item.title);
           if (translated && translated !== item.title) {
               titleTr = translated;
           }
        }

        return {
          ...item,
          titleTr,
          guide: buildReadingNote(item.category),
        };
      })
    );

    return NextResponse.json({
      source: finalData.length ? "live" : "fallback",
      updatedAt: new Date().toISOString(),
      data: finalData.length ? finalData : getFallbackArticles(),
    });
  } catch (err) {
    return NextResponse.json({
      source: "fallback",
      updatedAt: new Date().toISOString(),
      data: getFallbackArticles(),
    });
  }
}

function buildReadingNote(category: string) {
  switch(category) {
      case "YBS": return "Sistem Entegrasyon Notu: Şirketlerin kurumsal kaynak yönetimi ve verimlilik politikalarını etkiler.";
      case "Yazılım": return "Geliştirici Notu: Mimari ve altyapı tasarımında yeni yaklaşımlar veya teknolojiler içerebilir.";
      case "Yapay Zeka": return "İnovasyon Notu: Makine öğrenmesi algoritmaları ve pratik veri işleme uygulamaları sektörü dönüştürüyor.";
      case "Agent": return "Otonom Analiz: Yapay Zeka ajanları insan onayı olmadan görev çözebilen bağımsız yazılımlardır, bu makale yeni kullanım alanlarıdır.";
      case "Kuantum": return "Derin Teknoloji Notu: Kuantum bilgisayarlar mevcut kriptografi (şifreleme) standartlarını tehdit edebilecek güçtedir.";
      case "Finans": return "Ekonomi Notu: Piyasalardaki volatiliteyi (oynaklık) yönetmek veya şirket kârlılıklarını anlamak için kritik okumadır.";
      case "Sigorta": return "InsurTech Notu: Sigorta poliçelerinde blokzincir ve veri analitiği kullanımı müşteri risk puanlarını değiştiriyor.";
      case "İşletme": return "Yönetim Stratejisi: C-Level yönetici kararları, endüstriyel psikoloji veya operasyonel yönetimi baz alır.";
      default: return "Akademik/Endüstriyel Okuma Önerisi.";
  }
}

function getFallbackArticles() {
    return [
        {
            title: "Tedarik zinciri yönetiminde yapay zeka",
            titleTr: "Tedarik zinciri yönetiminde yapay zeka",
            link: "#",
            source: "DergiPark - İşletme Araştırmaları",
            category: "YBS",
            publishedAt: new Date().toISOString(),
            guide: buildReadingNote("YBS")
        },
        {
            title: "Autonomous AI Agents in FinTech",
            titleTr: "FinTech sektöründe Otonom Yapay Zeka Ajanları",
            link: "#",
            source: "Journal of Financial Technology",
            category: "Agent",
            publishedAt: new Date().toISOString(),
            guide: buildReadingNote("Agent")
        }
    ];
}
