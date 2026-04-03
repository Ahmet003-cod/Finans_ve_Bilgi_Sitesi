import { NextResponse } from "next/server";
import { historicFigures, HistoricFigure } from "@/lib/geniuses";

export const dynamic = "force-dynamic";

// Basit PRNG (Güne göre her zaman aynı sonucu veren rastgeleleyici)
function mulberry32(a: number) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Güne özel, deterministik eleman seçer
function pickRandom<T>(array: T[], count: number, prng: () => number): T[] {
    const copy = [...array];
    const result: T[] = [];
    for(let i=0; i < count; i++) {
        if(copy.length === 0) break;
        const index = Math.floor(prng() * copy.length);
        result.push(copy.splice(index, 1)[0]);
    }
    return result;
}

export async function GET() {
    // 1. O günkü tarihi bul ve sayısal bir seed (Tohum) çıkar
    const d = new Date();
    // Türkiye saatine göre tarihi standardize edip string al (Yıl-Ay-Gün)
    const seedString = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
    let baseSeed = 0;
    for (let i = 0; i < seedString.length; i++) {
        baseSeed = (baseSeed << 5) - baseSeed + seedString.charCodeAt(i);
        baseSeed |= 0; 
    }
    
    // Algoritma başlatıcı (PRNG)
    const randomFunc = mulberry32(baseSeed);

    // 2. Filtreler
    const localGeniuses = historicFigures.filter(f => f.type === 'genius' && f.origin === 'local');
    const foreignGeniuses = historicFigures.filter(f => f.type === 'genius' && f.origin === 'foreign');
    const localEconomists = historicFigures.filter(f => f.type === 'economist' && f.origin === 'local');
    const foreignEconomists = historicFigures.filter(f => f.type === 'economist' && f.origin === 'foreign');

    // 3. Kullanıcının Kuralı: Toplam 3 Ekonomist, 3 Deha 
    // Alt Kural: 2 Yerli(İslam), 1 Yabancı şeklinde ayarlayacağız (Toplam: 4 İslam, 2 Yabancı olacak)
    const selectedGenLocal = pickRandom(localGeniuses, 2, randomFunc);
    const selectedGenForeign = pickRandom(foreignGeniuses, 1, randomFunc);

    const selectedEcoLocal = pickRandom(localEconomists, 2, randomFunc);
    const selectedEcoForeign = pickRandom(foreignEconomists, 1, randomFunc);

    // Hepsini birleştir 
    const dailyFigures: HistoricFigure[] = [
        ...selectedGenLocal,
        ...selectedGenForeign,
        ...selectedEcoLocal,
        ...selectedEcoForeign
    ];

    // Array'i her gün belirli sırayla göstermek için bir kez daha kendi içinde hafifçe karıştıralım
    const finalized = pickRandom(dailyFigures, dailyFigures.length, randomFunc);

    return NextResponse.json({
        dateSeed: seedString,
        data: finalized
    });
}
