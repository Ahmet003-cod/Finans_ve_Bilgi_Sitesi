"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, CalendarClock, CandlestickChart, LayoutGrid, Sparkles, TrendingUp, TrendingDown, ActivitySquare, ExternalLink, ImageIcon, Target, Cpu, Landmark, Building2, Percent, Globe, Coins, Info, Lightbulb, ArrowRightLeft, BookOpen, MessageSquare, Send, User, Wallet, ShieldCheck, Clock, Search, BarChart3, PieChart, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { HistoricFigure } from "@/lib/geniuses";

type MarketItem = { label: string; code: string; buy: number; sell: number; dailyPct: number; source: string };
type TuikNewsItem = { title: string; date: string; summary: string; link: string };
type InflationItem = { month: string; tufeAnnual: number; ufeAnnual: number; tufeMonthly: number; ufeMonthly: number; note: string; source: string };
type CalendarItem = { title: string; date: string; impact: string; source: string };
type NewsItem = { title: string; titleTr: string; link: string; source: string; category: string; publishedAt: string; guide: string };

const TABS = [
  { id: "inflation", label: "✨ TÜİK Son Dakika", icon: TrendingUp },
  { id: "markets", label: "Piyasa & Faiz", icon: ActivitySquare },
  { id: "economists", label: "💡 Ekonomistler", icon: Lightbulb },
  { id: "concepts", label: "📖 Finans Kavramları", icon: BookOpen },
  { id: "investment_agent", label: "🚀 Yatırım Uzmanı", icon: Target },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  // Sync tab with URL hash for back button support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (TABS.find(t => t.id === hash)) {
        setActiveTab(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    window.location.hash = id;
  };

  const [market, setMarket] = useState<MarketItem[]>([]);
  const [inflation, setInflation] = useState<InflationItem[]>([]);
  const [tuikNews, setTuikNews] = useState<TuikNewsItem[]>([]);
  const [calendar, setCalendar] = useState<CalendarItem[]>([]);
  const [economists, setEconomists] = useState<HistoricFigure[]>([]);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [fedRate, setFedRate] = useState<number>(0);
  const [fedUpper, setFedUpper] = useState<number>(0);
  const [fedLower, setFedLower] = useState<number>(0);
  const [tcmbRate, setTcmbRate] = useState<number>(37.0);
  const [depositRates, setDepositRates] = useState<{min: number, max: number}>({min: 44.0, max: 45.0});
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [marketRes, tuikRes, calRes, ratesRes, geniusesRes] = await Promise.all([
          fetch("/api/market").then((r) => r.json()).catch(() => ({ data: [], updatedAt: new Date().toISOString() })),
          fetch("/api/tuik").then((r) => { if (!r.ok) throw new Error(`tuik ${r.status}`); return r.json(); }).catch(() => ({ data: [], news: [] })),
          fetch("/api/calendar").then((r) => r.json()).catch(() => ({ data: [], fedFundsRate: 0, fedTargetUpper: 0, fedTargetLower: 0 })),
          fetch("/api/rates").then((r) => r.json()).catch(() => ({ data: { tcmbPolicyRate: 37.0, depositMin: 44.0, depositMax: 45.0 } })),
          fetch("/api/geniuses").then((r) => r.json()).catch(() => ({ data: [] })),
        ]);

        fetch("/api/concepts")
          .then((r) => r.json())
          .then((res) => setConcepts(res.data ?? []))
          .catch(() => setConcepts([]));

        setMarket(marketRes.data ?? []);
        setInflation(tuikRes.data ?? []);
        setTuikNews(tuikRes.news ?? []);
        setCalendar(calRes.data ?? []);
        setEconomists(geniusesRes.data ?? []);
        setFedRate(Number(calRes.fedFundsRate ?? 0));
        setFedUpper(Number(calRes.fedTargetUpper ?? 0));
        setFedLower(Number(calRes.fedTargetLower ?? 0));
        
        if (ratesRes && ratesRes.data) {
           setTcmbRate(Number(ratesRes.data.tcmbPolicyRate ?? 37.0));
           setDepositRates({
              min: Number(ratesRes.data.depositMin ?? 44.0),
              max: Number(ratesRes.data.depositMax ?? 45.0)
           });
        }
        
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
              Ekonomi <span className="text-gradient">ve Bilgi Merkezi</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-slate-400 text-sm md:text-base font-medium"
            >
              TÜİK, KAP, Borsa İstanbul, Kapalıçarşı ve küresel kaynaklardan derlenen anlık finans ve analiz merkezi.
            </motion.p>
            <div className="mt-3 text-xs text-slate-500 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Son güncelleme: {formatDate(updatedAt)}
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex w-full overflow-x-auto no-scrollbar gap-1 md:gap-2 pb-2 border-b border-white/10">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "relative px-3 py-2 md:px-4 md:py-3 rounded-t-xl transition-all font-semibold flex items-center gap-1.5 md:gap-2 text-xs md:text-sm whitespace-nowrap",
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
                {activeTab === "inflation" && <TuikTab inflationCurrent={inflationCurrent} news={tuikNews} />}
                {activeTab === "markets" && <MarketsTab market={market} calendar={calendar} fedLower={fedLower} fedUpper={fedUpper} tcmbRate={tcmbRate} depositRates={depositRates} />}
                {activeTab === "economists" && <EconomistsTab figures={economists} />}
                {activeTab === "concepts" && <ConceptsTab concepts={concepts} chatMessages={chatMessages} setChatMessages={setChatMessages} chatInput={chatInput} setChatInput={setChatInput} isChatLoading={isChatLoading} setIsChatLoading={setIsChatLoading} />}
                {activeTab === "investment_agent" && <InvestmentAgentTab market={market} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* News Ticker (Marquee) */}
        <div className="mt-auto pt-4 mb-4">
           <div className="glass-panel py-3 rounded-2xl overflow-hidden relative border-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0f172a] to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0f172a] to-transparent z-10" />
              
              <div className="flex whitespace-nowrap animate-marquee gap-12 items-center">
                 {tuikNews.map((n, i) => (
                    <div key={`tuik-${i}`} className="flex items-center gap-3 text-xs font-medium">
                       <span className="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">TÜİK SON DAKİKA</span>
                       <span className="text-slate-300">{n.title}</span>
                       <span className="w-1 h-1 bg-slate-600 rounded-full" />
                    </div>
                 ))}
                 {market.slice(0, 5).map((m, i) => (
                    <div key={`market-${i}`} className="flex items-center gap-3 text-xs font-medium">
                       <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">PİYASA</span>
                       <span className="text-slate-300">{m.label}:</span>
                       <span className={m.dailyPct >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {formatNum(m.sell)} ({m.dailyPct >= 0 ? "+" : ""}{m.dailyPct}%)
                       </span>
                       <span className="w-1 h-1 bg-slate-600 rounded-full" />
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-12 pb-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
            <div>© 2026 Ekonomi ve Bilgi Merkezi • Tüm Veriler Orijinal Kaynaklıdır.</div>
            <div className="flex items-center gap-4">
              <span>Elazığ, Türkiye</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

// --- ALT BİLEŞENLER ---

function TuikTab({ inflationCurrent, news }: { inflationCurrent: InflationItem, news: TuikNewsItem[] }) {
  if (!inflationCurrent) return null;
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-cyan-950/20">
          <div className="text-xs font-bold text-cyan-400 mb-1 uppercase">{inflationCurrent.month} Yıllık</div>
          <div className="text-3xl font-black text-white">%{formatNum(inflationCurrent.tufeAnnual)} <span className="text-sm font-normal opacity-60">TÜFE</span></div>
          <div className="text-3xl font-black text-white mt-2">%{formatNum(inflationCurrent.ufeAnnual)} <span className="text-sm font-normal opacity-60">Yİ-ÜFE</span></div>
        </motion.div>
        <motion.div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-amber-950/20">
          <div className="text-xs font-bold text-amber-400 mb-1 uppercase">Aylık Değişim</div>
          <div className="text-3xl font-black text-white">%{formatNum(inflationCurrent.tufeMonthly)} <span className="text-sm font-normal opacity-60">TÜFE</span></div>
          <div className="text-3xl font-black text-white mt-2">%{formatNum(inflationCurrent.ufeMonthly)} <span className="text-sm font-normal opacity-60">Yİ-ÜFE</span></div>
        </motion.div>
        <motion.div className="glass-panel p-6 rounded-3xl">
          <h4 className="font-bold text-sky-400 mb-2">Analiz:</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{inflationCurrent.note}</p>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.slice(0, 6).map((item, i) => (
          <a href={item.link} target="_blank" rel="noreferrer" key={i} className="glass-card p-5 rounded-2xl group border border-white/5 hover:ring-2 hover:ring-rose-500/50 transition-all">
            <div className="flex justify-between items-start mb-2">
              <div className="text-[10px] text-rose-400 font-bold">{item.date}</div>
              <div className="text-[10px] bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Kaynak: TÜİK</div>
            </div>
            <h4 className="text-sm font-bold text-slate-100 line-clamp-2 mb-2 group-hover:text-rose-300">{item.title}</h4>
            <p className="text-xs text-slate-400 line-clamp-3">{item.summary}</p>
          </a>
        ))}
      </div>

      {/* Eğitici Bilgi Pankartları (TÜİK) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ÜFE Grubu */}
        <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400"><TrendingUp size={20}/></div>
            <h4 className="font-bold text-lg text-white">ÜFE Artarsa (Maliyetler Yükselirse)</h4>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Üretim maliyetleri artar. Fabrikanın ödediği elektrik ve hammadde zamlanırsa, bu durum aylar sonra tezgahtaki ürüne zam olarak yansır.
          </p>
          <div className="p-3 bg-rose-500/10 rounded-xl text-[11px] text-rose-300 italic border border-rose-500/20">
            <strong>GÜNLÜK HAYAT:</strong> Fırıncının aldığı un ve maya zamlanırsa, bir süre sonra mahalledeki ekmek fiyatı kaçınılmaz olarak artar.
          </div>
        </div>
        <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><TrendingDown size={20}/></div>
            <h4 className="font-bold text-lg text-white">ÜFE Azalırsa (Maliyetler Düşerse)</h4>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Üretimdeki baskı azalır. Hammadde ucuzlayınca üretici nefes alır, bu da zamların durmasına hatta bazı ürünlerin ucuzlamasına yol açar.
          </p>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-[11px] text-emerald-300 italic border border-emerald-500/20">
            <strong>GÜNLÜK HAYAT:</strong> Mazot fiyatı düşerse, tarladaki domatesin şehre gelme masrafı azalır ve pazardaki fiyatlar aşağı çekilebilir.
          </div>
        </div>

        {/* TÜFE Grubu */}
        <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400"><TrendingUp size={20}/></div>
            <h4 className="font-bold text-lg text-white">TÜFE Artarsa (Hayat Pahalılaşırsa)</h4>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Market ve çarşı fiyatları yükselir. Alım gücü düştüğü için aynı maaşla geçen aya göre daha az ürün satın alınabilir hale gelinir.
          </p>
          <div className="p-3 bg-amber-500/10 rounded-xl text-[11px] text-amber-300 italic border border-amber-500/20">
            <strong>GÜNLÜK HAYAT:</strong> Geçen ay 500 TL'ye dolan pazar arabası, bu ay ancak 650 TL'ye doluyorsa TÜFE artmış demektir.
          </div>
        </div>
        <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-cyan-500 bg-gradient-to-r from-cyan-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400"><TrendingDown size={20}/></div>
            <h4 className="font-bold text-lg text-white">TÜFE Azalırsa (Enflasyon Düşerse)</h4>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Fiyat artış hızı yavaşlar. Fiyatların uçuşu durunca paramızın değeri korunur, insanların geleceğe dair kaygıları azalır.
          </p>
          <div className="p-3 bg-cyan-500/10 rounded-xl text-[11px] text-cyan-300 italic border border-cyan-500/20">
            <strong>GÜNLÜK HAYAT:</strong> Kantindeki tost fiyatı aylardır değişmiyorsa veya artış hızı yavaşlamışsa, enflasyon kontrol altına alınıyor demektir.
          </div>
        </div>
      </div>

      <div className="mt-6 glass-panel p-4 rounded-2xl bg-white/5 border border-white/10 text-center italic text-xs text-slate-400">
        "Kısaca: ÜFE mutfaktaki (fabrikadaki) hazırlık maliyetidir, TÜFE ise masaya gelen tabağın (marketin) fiyatıdır."
      </div>
    </div>
  );
}

function MarketsTab({ market, calendar, fedLower, fedUpper, tcmbRate, depositRates }: any) {
  const bistData = market.find((m: any) => m.code === "BIST100");

  return (
    <div className="space-y-8">
      {/* BIST 100 Hero Card */}
      {bistData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border-indigo-500/20"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-xl">
                <BarChart3 className="text-indigo-400 w-10 h-10" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-bold text-white">Borsa İstanbul</h3>
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-md border border-indigo-500/30 uppercase tracking-wider">BIST 100</span>
                </div>
                <p className="text-slate-400 text-sm font-medium">Türkiye'nin en büyük 100 şirketinin performans endeksi</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="text-5xl font-black text-white tracking-tighter flex items-baseline gap-2">
                {formatNum(bistData.sell)}
                <span className="text-lg font-bold text-slate-500 uppercase tracking-widest">Puan</span>
              </div>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-sm border shadow-lg",
                  bistData.dailyPct >= 0 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                )}>
                  {bistData.dailyPct >= 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                  %{bistData.dailyPct >= 0 ? "+" : ""}{formatNum(bistData.dailyPct)}
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">{bistData.source}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CandlestickChart size={20} className="text-emerald-400"/> Canlı Piyasa Fiyatları</h3>
          <div className="space-y-3">
            {market.map((m: any, i: number) => (
              <div key={i} className="glass-card p-4 rounded-xl flex flex-col gap-2 border border-white/5 group hover:bg-white/5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{m.label}</span>
                  <div className="flex gap-4">
                    <span className="text-xs text-rose-400">Alış: {formatNum(m.buy)}</span>
                    <span className="text-sm font-bold text-emerald-400">Satış: {formatNum(m.sell)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium italic">
                  <div className="flex items-center gap-1">
                    <div className={cn("w-1.5 h-1.5 rounded-full", m.dailyPct >= 0 ? "bg-emerald-500" : "bg-rose-500")} />
                    Değişim: {m.dailyPct >= 0 ? "+" : ""}{m.dailyPct}%
                  </div>
                  <span>{m.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-indigo-300"><Landmark size={20}/> Merkez Bankası Faizleri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-black/20 rounded-xl">
                <div className="text-[10px] text-slate-500 font-bold mb-1">TCMB POLİTİKA</div>
                <div className="text-2xl font-black text-rose-400">%{tcmbRate.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-black/20 rounded-xl">
                <div className="text-[10px] text-slate-500 font-bold mb-1">FED HEDEF</div>
                <div className="text-2xl font-black text-indigo-400">%{fedLower.toFixed(2)}-{fedUpper.toFixed(2)}</div>
              </div>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-emerald-300"><Percent size={20}/> Mevduat Faizi Oranları</h3>
            <div className="text-3xl font-black text-emerald-400">%{depositRates.min.toFixed(1)} - %{depositRates.max.toFixed(1)}</div>
            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-tighter italic">Bankaların sunduğu ortalama brüt faiz aralığıdır.</p>
          </div>
        </div>
      </div>

      {/* Eğitici Bilgi Pankartları (Piyasa & Faiz - Artış) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-3xl border-t-4 border-t-rose-500 bg-gradient-to-b from-rose-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400"><Percent size={18}/></div>
            <h4 className="font-bold text-sm text-white">Faiz Artarsa</h4>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Kredi çekmek (araba, ev) zorlaşır. Harcamalar azalır, enflasyonu düşürmek için kullanılır. Tasarruf eden kazanır.
          </p>
        </div>
        <div className="glass-panel p-5 rounded-3xl border-t-4 border-t-emerald-500 bg-gradient-to-b from-emerald-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Coins size={18}/></div>
            <h4 className="font-bold text-sm text-white">Altın Artarsa</h4>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Piyasalarda risk veya savaş korkusu vardır. Yatırımcı parayı korumak için "güvenli liman" olan altına kaçar.
          </p>
        </div>
        <div className="glass-panel p-5 rounded-3xl border-t-4 border-t-cyan-500 bg-gradient-to-b from-cyan-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400"><Globe size={18}/></div>
            <h4 className="font-bold text-sm text-white">Dolar Artarsa</h4>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            İthal ettiğimiz her şey (benzin, telefon) zamlanır. Maliyetler artınca iğneden ipliğe her şeye zam gelir.
          </p>
        </div>
        <div className="glass-panel p-5 rounded-3xl border-t-4 border-t-indigo-500 bg-gradient-to-b from-indigo-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><BarChart3 size={18}/></div>
            <h4 className="font-bold text-sm text-white">Borsa Artarsa</h4>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Şirketlerin değeri ve ekonomiye güven artar. Tasarrufunu borsada değerlendiren yatırımcılar kazanır.
          </p>
        </div>
      </div>

      {/* Eğitici Bilgi Pankartları (Piyasa & Faiz - Azalış) */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-3xl border-t-4 border-t-emerald-500/50 bg-gradient-to-b from-emerald-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Percent size={18}/></div>
            <h4 className="font-bold text-sm text-white">Faiz Düşerse</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Kredi çekmek kolaylaşır. Ev ve araba satışları artar, piyasa canlanır. Ancak enflasyon riski doğabilir.
          </p>
        </div>
        <div className="glass-panel p-5 rounded-3xl border-t-4 border-t-rose-500/50 bg-gradient-to-b from-rose-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500"><Coins size={18}/></div>
            <h4 className="font-bold text-sm text-white">Altın Düşerse</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Dünyada işler yolunda gidiyor demektir. Güven artar, yatırımcılar "güvenli liman" yerine borsaya veya üretime yönelir.
          </p>
        </div>
        <div className="glass-panel p-5 rounded-3xl border-t-4 border-t-sky-500/50 bg-gradient-to-b from-sky-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-500"><Globe size={18}/></div>
            <h4 className="font-bold text-sm text-white">Dolar Düşerse</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            İthal hammadde maliyeti azalır. Mazot ve benzin fiyatları düşebilir, bu da genel fiyat artışlarını frenler.
          </p>
        </div>
        <div className="glass-panel p-5 rounded-3xl border-t-4 border-t-slate-500/50 bg-gradient-to-b from-slate-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-slate-500/10 rounded-lg text-slate-400"><BarChart3 size={18}/></div>
            <h4 className="font-bold text-sm text-white">Borsa Düşerse</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Ekonomide belirsizlik veya şirket karlarında düşüş olabilir. Yatırımcılar beklemeye geçer, güven azalmış olabilir.
          </p>
        </div>
      </div>
    </div>
  );
}

function EconomistsTab({ figures }: { figures: HistoricFigure[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {figures.map((fig, i) => (
        <a 
          href={fig.wikiUrl} 
          target="_blank" 
          rel="noreferrer" 
          key={i} 
          className="glass-panel p-6 rounded-[2rem] flex flex-col items-center text-center gap-4 group hover:ring-2 hover:ring-amber-500/50 transition-all hover:bg-white/5"
        >
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 border-4 border-white/5 group-hover:border-amber-500/30 transition-colors shadow-2xl">
            <img 
              src={fig.imageUrl} 
              alt={fig.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <h4 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">{fig.name}</h4>
            <div className="px-3 py-1 bg-amber-500/10 rounded-full inline-block self-center">
              <p className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">{fig.title}</p>
            </div>
            <p className="text-xs text-slate-400 line-clamp-4 leading-relaxed mt-2">{fig.bio}</p>
          </div>
          <div className="mt-2 w-full pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 group-hover:text-amber-500 transition-colors">
            WIKIPEDIA'DA GÖR <ExternalLink size={12} />
          </div>
        </a>
      ))}
    </div>
  );
}

function ConceptsTab({ concepts, chatMessages, setChatMessages, chatInput, setChatInput, isChatLoading, setIsChatLoading }: any) {
  const handleChatSubmit = async (e: any) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const userMessage = { role: "user", content: chatInput };
    setChatMessages((prev: any) => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...chatMessages, userMessage] }),
      });
      if (!res.ok) throw new Error("API Hatası");
      setChatMessages((prev: any) => [...prev, { role: "model", content: "" }]);
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunkValue = decoder.decode(value, { stream: true });
        
        setChatMessages((prev: any) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === "model") {
            newMessages[newMessages.length - 1] = {
              ...lastMsg,
              content: lastMsg.content + chunkValue
            };
          }
          return newMessages;
        });
      }
    } catch (err) {
      setChatMessages((prev: any) => [...prev, { role: "model", content: "Bir hata oluştu." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {concepts.map((c: any, i: number) => (
          <div key={i} className="glass-panel p-6 rounded-3xl bg-slate-900/40 border border-white/5">
            <h4 className="text-lg font-bold text-cyan-400 mb-2">{c.term}</h4>
            <p className="text-sm text-slate-300 mb-4">{c.definition}</p>
            <div className="p-3 bg-black/30 rounded-xl text-xs text-slate-400 italic">"{c.example}"</div>
          </div>
        ))}
      </div>
      <div className="glass-panel rounded-3xl overflow-hidden h-[500px] flex flex-col bg-slate-900/80 border border-white/10">
        <div className="p-4 bg-black/20 border-b border-white/10 font-bold text-cyan-400 flex items-center gap-2"><Bot size={18}/> Ekonomi Asistanı</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg: any, i: number) => (
            <div key={i} className={cn("max-w-[85%] p-3 rounded-2xl text-sm", msg.role === 'user' ? "ml-auto bg-slate-800 text-slate-200" : "mr-auto bg-cyan-950/20 text-slate-300 border border-cyan-900/30")}>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isChatLoading && <div className="text-xs text-cyan-500 animate-pulse">Asistan düşünüyor...</div>}
        </div>
        <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/5 flex gap-2">
          <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Sorunuzu yazın..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none" />
          <button type="submit" className="bg-cyan-600 px-4 py-2 rounded-xl"><Send size={16}/></button>
        </form>
      </div>
    </div>
  );
}

function InvestmentAgentTab({ market }: { market: MarketItem[] }) {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { 
          role: "model", 
          content: "Merhaba! Ben sizin profesyonel **Yatırım Uzmanı Agent**'ınızım. 🚀\n\nFinansal hedeflerinize ulaşmanız için size özel, veriye dayalı ve rasyonel yatırım stratejileri geliştirebilirim. Borsa İstanbul, Amerika ve Londra piyasalarındaki hisse senetlerini detaylı olarak inceleyebilir; KAP (Kamuyu Aydınlatma Platformu) verilerini, SPK bültenlerini ve Investing.com, Dünya Gazetesi, BBC Business gibi kaynaklardan güncel finansal haberleri analiz edebilirim.\n\nSizin için en uygun portföyü hazırlayabilmem adına; bütçenizi, yatırım vadenizi veya dini hassasiyetlerinizi paylaşabilir ya da doğrudan aklınızdaki bir yatırım aracı hakkında analiz isteyebilirsiniz. Nasıl yardımcı olabilirim?" 
        }
      ]);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/investment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], market }),
      });

      if (!res.ok) throw new Error("API Hatası");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      setMessages(prev => [...prev, { role: "model", content: "" }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => {
          const newMsgs = [...prev];
          const lastIndex = newMsgs.length - 1;
          const lastMsg = newMsgs[lastIndex];
          
          if (lastMsg && lastMsg.role === "model") {
            newMsgs[lastIndex] = {
              ...lastMsg,
              content: lastMsg.content + chunk
            };
          }
          return newMsgs;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "model", content: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 h-[700px] flex flex-col">
      <div className="flex items-center gap-3 mb-6 flex-shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Target className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Yatırım Uzmanı Agent</h2>
          <p className="text-slate-400 text-xs">LangChain Destekli Canlı Piyasa Analisti</p>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col border border-white/10 bg-slate-900/40 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border",
                msg.role === 'user' ? "bg-slate-800 border-slate-700" : "bg-cyan-950/40 border-cyan-500/20"
              )}>
                {msg.role === 'user' ? <User size={14} className="text-slate-400" /> : <Bot size={14} className="text-cyan-400" />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-slate-800 text-slate-200 rounded-tr-none" 
                  : "bg-slate-900/60 text-slate-300 border border-white/5 rounded-tl-none"
              )}>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-4 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center animate-pulse">
                <Bot size={14} className="text-cyan-400" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 rounded-tl-none flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                </div>
                <span className="text-xs text-cyan-500 font-bold uppercase tracking-widest ml-2">Piyasalar Analiz Ediliyor...</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-black/20 border-t border-white/5 flex gap-3 flex-shrink-0">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Yatırım planınızı buraya yazın (Örn: 500.000 TL bütçem var, kısa vadeli faizsiz önerin)..."
            className="flex-1 bg-slate-900/80 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-white placeholder:text-slate-500"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 rounded-2xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <Send size={20} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}

// --- UTILS ---

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("tr-TR");
}

function formatNum(v: number) {
  if (isNaN(v)) return v;
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 5 }).format(v);
}
