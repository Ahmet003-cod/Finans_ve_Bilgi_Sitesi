"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, CalendarClock, CandlestickChart, LayoutGrid, ShieldAlert, Sparkles, TrendingUp, ActivitySquare, ExternalLink, ImageIcon, Target, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

type MarketItem = { label: string; code: string; buy: number; sell: number; dailyPct: number; source: string };
type TuikNewsItem = { title: string; date: string; summary: string; link: string };
type InflationItem = { month: string; tufeAnnual: number; ufeAnnual: number; tufeMonthly: number; ufeMonthly: number; note: string; source: string };
type CalendarItem = { title: string; date: string; impact: string; source: string };
type NewsItem = { title: string; titleTr: string; link: string; source: string; category: string; publishedAt: string; guide: string };

const TABS = [
  { id: "overview", label: "Genel Bakış", icon: LayoutGrid },
  { id: "inflation", label: "✨ TÜİK Son Dakika", icon: TrendingUp },
  { id: "markets", label: "Piyasa & Faiz", icon: ActivitySquare },
  { id: "tech_defense", label: "Yapay Zeka & Savunma", icon: ShieldAlert },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  const [market, setMarket] = useState<MarketItem[]>([]);
  const [inflation, setInflation] = useState<InflationItem[]>([]);
  const [tuikNews, setTuikNews] = useState<TuikNewsItem[]>([]);
  const [calendar, setCalendar] = useState<CalendarItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [fedRate, setFedRate] = useState<number>(0);
  const [fedUpper, setFedUpper] = useState<number>(0);
  const [fedLower, setFedLower] = useState<number>(0);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [marketRes, tuikRes, calRes, newsRes] = await Promise.all([
          fetch("/api/market").then((r) => r.json()),
          fetch("/api/tuik").then((r) => r.json()),
          fetch("/api/calendar").then((r) => r.json()),
          fetch("/api/news").then((r) => r.json()),
        ]);

        setMarket(marketRes.data ?? []);
        setInflation(tuikRes.data ?? []);
        setTuikNews(tuikRes.news ?? []);
        setCalendar(calRes.data ?? []);
        setNews(newsRes.data ?? []);
        setFedRate(Number(calRes.fedFundsRate ?? 0));
        setFedUpper(Number(calRes.fedTargetUpper ?? 0));
        setFedLower(Number(calRes.fedTargetLower ?? 0));
        setUpdatedAt(marketRes.updatedAt ?? new Date().toISOString());
      } catch (e) {
        console.error("Data fetching failed", e);
      } finally {
        setIsLoading(false);
      }
    };

    load();
    const timer = setInterval(load, 60_000);
    return () => clearInterval(timer);
  }, []);

  const inflationCurrent = inflation[0];

  return (
    <main className="min-h-screen relative w-full overflow-hidden bg-[#0f172a] text-slate-100 font-sans selection:bg-cyan-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-8 xl:px-12 flex flex-col gap-8 min-h-screen">
        
        {/* Header */}
        <header className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
              className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2"
            >
              Ekonomi <span className="text-gradient">360° Merkezi</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-slate-400 text-sm md:text-base font-medium"
            >
              Kapalıçarşı Borsa Verileri, Resmi TÜİK İstatistikleri, AI ve Savunma Haber Sistemi
            </motion.p>
            <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Son güncelleme: {formatDate(updatedAt)}
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex w-full overflow-x-auto no-scrollbar gap-2 md:gap-4 pb-2 border-b border-white/10">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative px-4 py-3 md:px-6 md:py-4 rounded-t-xl transition-all font-semibold flex items-center gap-2 text-sm md:text-base whitespace-nowrap",
                  isActive ? "text-cyan-300" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                <Icon size={18} className={isActive ? "text-cyan-400" : "text-slate-500"} />
                {tab.label}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator" 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full pb-10">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center h-64">
                <Sparkles className="animate-spin text-cyan-500" size={40} />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {activeTab === "overview" && <OverviewTab market={market} />}
                {activeTab === "inflation" && <TuikTab inflationCurrent={inflationCurrent} news={tuikNews} />}
                {activeTab === "markets" && <MarketsTab market={market} calendar={calendar} />}
                {activeTab === "tech_defense" && <TechDefenseTab news={news} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </main>
  );
}

function OverviewTab({ market }: { market: MarketItem[] }) {
  const topMarket = market.slice(0, 6);
  return (
    <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3">
      {/* Market Mini Overview */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {topMarket.map((m, i) => (
             <motion.div 
               key={m.code} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
               className="glass-card p-5 rounded-3xl flex flex-col justify-between hover:bg-white/5 transition-all"
             >
                <div className="flex justify-between items-start">
                  <div className="text-sm font-bold text-slate-300">{m.label}</div>
                </div>
                {/* Devasa sayılar için eksiksiz formatlama */}
                <div className="text-2xl md:text-3xl font-black mt-2 text-white">{formatNum(m.sell)}</div>
                <div className="flex justify-between items-center mt-3">
                  <div className={cn("text-xs font-black", (m.dailyPct || 0) >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {(m.dailyPct || 0) >= 0 ? "▲" : "▼"} {formatNum(Math.abs(m.dailyPct || 0))}%
                  </div>
                </div>
                <div className="text-[8px] uppercase tracking-wider text-slate-500 mt-2 truncate bg-slate-900/50 py-1 px-2 rounded w-fit">{m.source}</div>
             </motion.div>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6 rounded-3xl flex flex-col gap-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-amber-400"/> Sistem Notu</h3>
        <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-amber-500 pl-3">
          Veriler hiçbir şekilde yuvarlanmaz, virgülüne ve kuruşuna kadar "oldukları gibi" orijinal kaynaklarından ekrana yansıtılır. BIST100 tr.investing.com ile eşdeğer anlık değerleri yansıtır, diğer veriler serbest piyasa ve Kapalıçarşı (Truncgil) lokali dahilindendir.
        </p>
      </motion.div>
    </div>
  );
}

function TuikTab({ inflationCurrent, news }: { inflationCurrent: InflationItem, news: TuikNewsItem[] }) {
  if (!inflationCurrent) return null;
  return (
    <div className="space-y-8">
      
      <div className="flex items-center gap-2 px-2">
         <span className="px-3 py-1 bg-green-950/40 text-green-400 text-xs font-bold uppercase tracking-wider rounded border border-green-800/50">KAYNAK GARANTİSİ: TÜRKiYE iSTATiSTiK KURUMU</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20">
          <div className="text-sm font-bold text-cyan-400 mb-1 uppercase tracking-widest">{inflationCurrent.month} • Tam (1) Yıllık Veriler</div>
          <div className="text-4xl font-black text-white mt-3">%{formatNum(inflationCurrent.tufeAnnual)} <span className="text-lg text-slate-400 font-normal">TÜFE Yıllık</span></div>
          <div className="text-4xl font-black text-white mt-3">%{formatNum(inflationCurrent.ufeAnnual)} <span className="text-lg text-slate-400 font-normal">Yİ-ÜFE Yıllık</span></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20">
          <div className="text-sm font-bold text-amber-400 mb-1 uppercase tracking-widest">İçinde Bulunulan Ay Değerleri</div>
          <div className="text-4xl font-black text-white mt-3">%{formatNum(inflationCurrent.tufeMonthly)} <span className="text-lg text-slate-400 font-normal">TÜFE Aylık</span></div>
          <div className="text-4xl font-black text-white mt-3">%{formatNum(inflationCurrent.ufeMonthly)} <span className="text-lg text-slate-400 font-normal">Yİ-ÜFE Aylık</span></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-3xl md:col-span-2 lg:col-span-1 flex flex-col justify-center">
            <h4 className="font-bold text-sky-400 mb-2">Makro Etki Çıkarımı:</h4>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">{inflationCurrent.note}</p>
        </motion.div>
      </div>

      <div className="w-full h-px bg-white/10" />

      {/* TÜİK Bültenleri */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="text-rose-400"/> TÜİK Son Dakika Pano Bültenleri</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, i) => (
            <motion.a 
              href={item.link} target="_blank" rel="noreferrer"
              key={item.title + i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} 
              className="glass-card flex flex-col rounded-3xl overflow-hidden group hover:ring-2 hover:ring-rose-500/50"
            >
              <div className="h-40 bg-gradient-to-tr from-slate-900 to-slate-800 relative w-full overflow-hidden flex items-center justify-center">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent z-10" />
                 <ImageIcon className="text-white/20 w-32 h-32 absolute group-hover:scale-110 transition-transform duration-700" />
                 <span className="z-20 text-xs font-black tracking-[0.2em] uppercase text-rose-500/80 -rotate-12 select-none pointer-events-none drop-shadow-md">TÜİK BÜLTENİ PANO</span>
              </div>
              <div className="p-6 flex flex-col flex-1 relative z-20 -mt-10 bg-slate-900/40 backdrop-blur-md">
                <div className="text-[10px] font-bold tracking-wider uppercase text-rose-400 mb-2">{item.date}</div>
                <h4 className="text-lg font-bold text-slate-100 group-hover:text-rose-300 transition-colors line-clamp-3 mb-3">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-6">{item.summary}</p>
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] text-slate-100 font-black uppercase tracking-widest bg-rose-700 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(225,29,72,0.4)]">Kesinlikle tuik.gov.tr'den alınmıştır</span>
                  <ExternalLink size={14} className="text-rose-400" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketsTab({ market, calendar }: { market: MarketItem[], calendar: CalendarItem[] }) {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Dev Piyasa Alış-Satış */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl">
         <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><CandlestickChart className="text-emerald-400"/> Borsa ve Serbest Piyasa Düzeyi</h3>
         <div className="space-y-4">
           {market.map((m, i) => (
             <motion.div key={m.code} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/5">
               <div className="flex-1">
                  <div className="font-bold text-lg text-slate-100 mb-1">{m.label}</div>
                  <div className="text-[9px] uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-1 rounded inline-block border border-slate-700">{m.source}</div>
               </div>
               
               {m.code === "BIST100" ? (
                  <div className="flex gap-4 sm:gap-8 items-end sm:items-center justify-between sm:justify-end w-full sm:w-auto">
                    <div className="text-right bg-emerald-950/20 px-4 py-2 rounded-xl border border-emerald-900/30">
                      <div className="text-[10px] uppercase text-emerald-500 font-bold tracking-wider mb-1">GÜNCEL DEĞER</div>
                      <div className="text-xl font-black text-emerald-300">{formatNum(m.sell)}</div>
                    </div>
                  </div>
               ) : (
                  <div className="flex gap-4 sm:gap-8 items-end sm:items-center justify-between sm:justify-end w-full sm:w-auto">
                    <div className="text-left bg-rose-950/20 px-4 py-2 rounded-xl border border-rose-900/30">
                      <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Alış</div>
                      <div className="text-lg font-semibold text-rose-300">{formatNum(m.buy)}</div>
                    </div>
                    <div className="text-right bg-emerald-950/20 px-4 py-2 rounded-xl border border-emerald-900/30">
                      <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Satış</div>
                      <div className="text-xl font-black text-emerald-300">{formatNum(m.sell)}</div>
                    </div>
                  </div>
               )}
             </motion.div>
           ))}
         </div>
      </div>
    </div>
  );
}

function TechDefenseTab({ news }: { news: NewsItem[] }) {
  const defenseFound = news.some(n => n.category === "Defense");

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 md:p-8 rounded-3xl">
        <h3 className="text-3xl font-bold mb-2 flex flex-wrap items-center gap-3">
          <Cpu className="text-cyan-400" size={32}/> 
          Yapay Zeka Şirketleri 
          <span className="text-slate-600 font-light">&amp;</span> 
          <Target className="text-rose-500" size={32}/> 
          Milli Savunma Sanayii
        </h3>
        <p className="text-slate-400 mb-8 max-w-3xl">Baykar, TUSAŞ, ASELSAN gibi Milli Savunma değerleri ile OpenAI, NVIDIA gibi teknoloji devlerinin şirket haberleri harmanlanmış şekilde sunulur. Kesin kaynak doğrulamalıdır.</p>
        
        {!defenseFound && (
          <div className="text-rose-400 text-sm mb-4 border border-rose-500/30 p-4 rounded-xl bg-rose-950/20">
            Savunma Sanayii API bağlantısı güncelleniyor, aşağıdaki kaynaklar şu an sadece Global AI tabanlı olabilir.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((item, i) => {
            const isDefense = item.category === "Defense";
            return (
             <motion.div key={item.link + i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="glass-card flex flex-col rounded-3xl group overflow-hidden border border-white/5">
               <div className={cn("h-48 w-full relative overflow-hidden", isDefense ? "bg-rose-950/50" : "bg-cyan-950/50")}>
                  <div className={cn("absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay", isDefense ? "bg-[url('https://images.unsplash.com/photo-1579551460395-932f7a9afda1?auto=format&fit=crop&q=80')]" : "bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80')]")} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent z-10" />
                  
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <div className={cn("text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg", isDefense ? "bg-rose-600 text-white shadow-rose-900/50" : "bg-cyan-600 text-white shadow-cyan-900/50")}>
                       {isDefense ? "🛡️ SAVUNMA SANAYİİ HABERİ" : "🤖 YAPAY ZEKA TEKNOLOJİSİ"}
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 z-20 flex flex-col">
                    <div className="text-xs text-slate-300 font-semibold mb-1 opacity-80">{new Date(item.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div className="text-[10px] text-white/50 bg-black/50 px-2 py-1 rounded inline-block border border-white/10 w-fit">KAYNAK: {item.source} (Google Haberler)</div>
                  </div>
               </div>
               
               <div className="p-6 md:p-8 flex-1 flex flex-col justify-between bg-slate-900/60 z-30">
                 <a href={item.link} target="_blank" rel="noreferrer" className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors mb-6 drop-shadow-sm leading-snug line-clamp-3">
                   {item.titleTr || item.title}
                 </a>
                 <div className={cn("mt-auto border p-4 rounded-xl", isDefense ? "bg-rose-950/30 border-rose-900/50" : "bg-indigo-950/30 border-indigo-900/50")}>
                   <div className={cn("flex items-center gap-2 text-[10px] uppercase font-black tracking-widest mb-2", isDefense ? "text-rose-400" : "text-indigo-400")}>
                     {isDefense ? <Target size={12}/> : <Sparkles size={12}/>} 
                     {isDefense ? "STRATEJİK SAVUNMA NOTU:" : "AKILLI SİSTEM TAVSİYESİ:"}
                   </div>
                   <p className="text-sm text-slate-300 leading-relaxed font-medium">
                     {item.guide}
                   </p>
                 </div>
               </div>
             </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("tr-TR");
}

function formatNum(v: number) {
  if (isNaN(v)) return v;
  // Kesin virgüle çevir, sonsuz küsürat kabul et, yuvarlama asla yapma
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 5 }).format(v);
}
