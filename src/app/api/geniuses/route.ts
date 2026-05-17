import { NextResponse } from "next/server";
import { historicFiguresRegistry, HistoricFigure, historicFigures as fallbackFigures } from "@/lib/geniuses";

export const dynamic = "force-dynamic";

/**
 * Wikipedia API'den özet ve görsel çeken yardımcı fonksiyon
 */
async function fetchWikiData(slug: string, lang: "tr" | "en" = "tr"): Promise<Partial<HistoricFigure>> {
  try {
    const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`, {
      next: { revalidate: 86400 } // 24 saat önbelleğe al
    });
    
    if (!res.ok) {
        if (lang === "tr") return fetchWikiData(slug, "en"); // Türkçe yoksa İngilizce dene
        return {};
    }

    const data = await res.json();
    
    return {
      title: data.description || "",
      bio: data.extract || "",
      imageUrl: data.originalimage?.source || data.thumbnail?.source || "",
      wikiUrl: data.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${slug}`,
      achievements: [data.description].filter(Boolean)
    };
  } catch (e) {
    console.error(`Wiki fetch error for ${slug}:`, e);
    return {};
  }
}

/**
 * Gün bazlı deterministik seçim ve Wikipedia entegrasyonu
 */
export async function GET() {
  try {
    // 1. O günün "Offset" değerini hesapla
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    
    // 2. Filtreler: Sadece Ekonomistler
    const economistsPool = historicFiguresRegistry.filter(f => f.type === "economist");

    // 3. Sıralı Seçim (Günde 4 Ekonomist)
    const getSelection = (pool: HistoricFigure[], count: number, offset: number) => {
        const start = (offset * count) % pool.length;
        const selection = [];
        for (let i = 0; i < count; i++) {
            selection.push(pool[(start + i) % pool.length]);
        }
        return selection;
    };

    const selectedEconomists = getSelection(economistsPool, 4, dayIndex);

    // 4. Wikipedia'dan verileri çek (Paralel)
    const dataWithWiki = await Promise.all(
        selectedEconomists.map(async (fig) => {
            const wikiData = await fetchWikiData(fig.wikiSlug);
            return {
                ...fig,
                ...wikiData,
                bio: wikiData.bio || "Bu ekonomist hakkında detaylı bilgi Wikipedia üzerinde mevcuttur.",
                imageUrl: wikiData.imageUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop"
            };
        })
    );

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      data: dataWithWiki.length > 0 ? dataWithWiki : fallbackFigures
    });

  } catch (err) {
    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      data: fallbackFigures,
      error: "API failed, returning fallback data"
    });
  }
}
