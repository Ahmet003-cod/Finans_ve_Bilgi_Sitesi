export type MarketItem = {
  label: string;
  code: string;
  buy: number;
  sell: number;
  dailyPct: number;
  source: string;
};

export type InflationPoint = {
  month: string;
  tufeAnnual: number;
  ufeAnnual: number;
  tufeDeltaFromPrev: number;
  ufeDeltaFromPrev: number;
  note: string;
};

export type CalendarItem = {
  title: string;
  date: string;
  impact: "Yuksek" | "Orta" | "Dusuk";
  source: string;
};

export type NewsItem = {
  title: string;
  titleTr: string;
  link: string;
  source: string;
  publishedAt: string;
  guide: string;
};

export const fallbackMarket: MarketItem[] = [
  { label: "Dolar (USD/TRY)", code: "USD", buy: 45.08, sell: 45.15, dailyPct: 0.31, source: "Yedek veri (2026)" },
  { label: "Euro (EUR/TRY)", code: "EUR", buy: 48.95, sell: 49.02, dailyPct: 0.22, source: "Yedek veri (2026)" },
  { label: "Borsa Istanbul (BIST 100)", code: "BIST100", buy: 12850.5, sell: 12850.5, dailyPct: 1.2, source: "Yedek veri (2026)" },
  { label: "Bitcoin (BTC/USD)", code: "BTC", buy: 85200.0, sell: 85200.0, dailyPct: 2.5, source: "Yedek veri (2026)" },
  { label: "Gram Altin", code: "GRAM", buy: 4498.2, sell: 4520.5, dailyPct: 0.82, source: "Yedek veri (2026)" },
  { label: "Ceyrek Altin", code: "CEYREK", buy: 7130.1, sell: 7182.5, dailyPct: 0.8, source: "Yedek veri (2026)" },
  { label: "Yarim Altin", code: "YARIM", buy: 14260.2, sell: 14365.0, dailyPct: 0.8, source: "Yedek veri (2026)" },
  { label: "Tam Altin", code: "TAM", buy: 28520.0, sell: 28730.0, dailyPct: 0.8, source: "Yedek veri (2026)" },
  { label: "Gumus (Gram)", code: "SILVER", buy: 55.50, sell: 56.10, dailyPct: 1.1, source: "Yedek veri (2026)" },
];

export const fallbackInflation: InflationPoint[] = [
  {
    month: "Ocak 2026",
    tufeAnnual: 42.5,
    ufeAnnual: 26.9,
    tufeDeltaFromPrev: 1.2,
    ufeDeltaFromPrev: 0.9,
    note: "TUFE yukselisi tuketici fiyatlarini, UFE yukselisi uretim maliyetlerini baskilar.",
  },
  {
    month: "Subat 2026",
    tufeAnnual: 41.7,
    ufeAnnual: 25.8,
    tufeDeltaFromPrev: -0.8,
    ufeDeltaFromPrev: -1.1,
    note: "Yillik ivmenin yavaslamasi faiz beklentilerini ve kur oynakligini etkileyebilir.",
  },
];

export const fallbackCalendar: CalendarItem[] = [
  { title: "Fed Faiz Karari", date: "2026-04-18", impact: "Yuksek", source: "Investing (ornek)" },
  { title: "TCMB Faiz Toplantisi", date: "2026-04-25", impact: "Yuksek", source: "Takvim (ornek)" },
  { title: "ABD Tarim Disi Istihdam", date: "2026-04-05", impact: "Orta", source: "Takvim (ornek)" },
];

export const fallbackNews: NewsItem[] = [
  {
    title: "Open-source AI agents are transforming software workflows",
    titleTr: "Acik kaynak AI ajanlari yazilim is akisini donusturuyor",
    link: "https://example.com/ai-finans",
    source: "AI RSS",
    publishedAt: new Date().toISOString(),
    guide: "Indirme: GitHub reposunu klonla. Kullanim: README'deki kurulum adimlariyla modeli bagla.",
  },
  {
    title: "A new multimodal model improves chart and document understanding",
    titleTr: "Yeni bir cok modlu model grafik ve dokuman analizini gelistiriyor",
    link: "https://example.com/ai-analiz",
    source: "AI RSS",
    publishedAt: new Date().toISOString(),
    guide: "Kullanim: API anahtari al, ornek istemlerle test et, sonra kendi verinle ince ayar yap.",
  },
  {
    title: "How to deploy local LLM assistants on laptops",
    titleTr: "Laptopta yerel LLM asistanlari nasil kurulur",
    link: "https://example.com/ai-bulut",
    source: "AI RSS",
    publishedAt: new Date().toISOString(),
    guide: "Indirme: Uygun model dosyasini indir. Kullanim: Yerel runtime ile calistirip prompt semalari tanimla.",
  },
];
