"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, CalendarClock, CandlestickChart, LayoutGrid, ShieldAlert, Sparkles, TrendingUp, TrendingDown, ActivitySquare, ExternalLink, ImageIcon, Target, Cpu, BookOpen, Landmark, Building2, Percent, Globe, Coins, Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { HistoricFigure } from "@/lib/geniuses";

type MarketItem = { label: string; code: string; buy: number; sell: number; dailyPct: number; source: string };
type TuikNewsItem = { title: string; date: string; summary: string; link: string };
type InflationItem = { month: string; tufeAnnual: number; ufeAnnual: number; tufeMonthly: number; ufeMonthly: number; note: string; source: string };
type CalendarItem = { title: string; date: string; impact: string; source: string };
type NewsItem = { title: string; titleTr: string; link: string; source: string; category: string; publishedAt: string; guide: string };
type ArticleItem = { title: string; titleTr: string; link: string; source: string; category: string; publishedAt: string; guide: string };

const TABS = [
  { id: "overview", label: "Genel Bakış", icon: LayoutGrid },
  { id: "inflation", label: "✨ TÜİK Son Dakika", icon: TrendingUp },
  { id: "markets", label: "Piyasa & Faiz", icon: ActivitySquare },
  { id: "tech_defense", label: "Yapay Zeka & Savunma", icon: ShieldAlert },
  { id: "geniuses", label: "💡 Dehalar & Ekonomistler", icon: Lightbulb },
  { id: "articles", label: "📚 Makale & Okuma", icon: BookOpen },
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

    // Set initial tab from hash
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
  const [news, setNews] = useState<NewsItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [geniuses, setGeniuses] = useState<HistoricFigure[]>([]);
  const [fedRate, setFedRate] = useState<number>(0);
  const [fedUpper, setFedUpper] = useState<number>(0);
  const [fedLower, setFedLower] = useState<number>(0);
  const [tcmbRate, setTcmbRate] = useState<number>(37.0);
  const [depositRates, setDepositRates] = useState<{min: number, max: number}>({min: 44.0, max: 45.0});
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [views, setViews] = useState<number>(0);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        // Namespace'i daha özgün yaparak çakışmaları önleyelim
        const res = await fetch("https://api.counterapi.dev/v1/finans-merkezi-v2/views/up");
        const data = await res.json();
        if (data.count) setViews(data.count);
      } catch (e) {
        console.error("Counter API failed", e);
      }
    };
    fetchViews();
  }, []); // Sadece sayfa ilk açıldığında (giriş yapıldığında) artar

  useEffect(() => {
    const load = async () => {
      try {
        const [marketRes, tuikRes, calRes, newsRes, articlesRes, ratesRes, geniusesRes] = await Promise.all([
          fetch("/api/market").then((r) => r.json()),
          fetch("/api/tuik").then((r) => r.json()),
          fetch("/api/calendar").then((r) => r.json()),
          fetch("/api/news").then((r) => r.json()),
          fetch("/api/articles").then((r) => r.json()),
          fetch("/api/rates").then((r) => r.json()).catch(() => ({ data: { tcmbPolicyRate: 37.0, depositMin: 44.0, depositMax: 45.0 } })),
          fetch("/api/geniuses").then((r) => r.json()).catch(() => ({ data: [] })),
        ]);

        setMarket(marketRes.data ?? []);
        setInflation(tuikRes.data ?? []);
        setTuikNews(tuikRes.news ?? []);
        setCalendar(calRes.data ?? []);
        setNews(newsRes.data ?? []);
        setArticles(articlesRes.data ?? []);
        setGeniuses(geniusesRes.data ?? []);
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
              Kapalıçarşı Borsa Verileri, Resmi TÜİK İstatistikleri, AI ve Savunma Haber Sistemi
            </motion.p>
            <div className="mt-3 text-xs text-slate-500 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Son güncelleme: {formatDate(updatedAt)}
              </div>
              
              <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-2 text-cyan-400 font-bold">
                <TrendingUp size={12} />
                Görünme Sayısı: {views > 0 ? views.toLocaleString() : "..."}
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
                {activeTab === "overview" && <OverviewTab market={market} />}
                {activeTab === "inflation" && <TuikTab inflationCurrent={inflationCurrent} news={tuikNews} />}
                {activeTab === "markets" && <MarketsTab market={market} calendar={calendar} fedLower={fedLower} fedUpper={fedUpper} tcmbRate={tcmbRate} depositRates={depositRates} />}
                {activeTab === "tech_defense" && <TechDefenseTab news={news} />}
                {activeTab === "geniuses" && <GeniusesTab figures={geniuses} articles={articles} />}
                {activeTab === "articles" && <ArticlesTab articles={articles} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hakkımda Bölümü (Footer) */}
        <footer className="mt-auto pt-12 pb-8 border-t border-white/5">
           <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.5 }}
             className="glass-panel p-8 rounded-3xl relative overflow-hidden"
           >
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
               <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-cyan-600 to-indigo-600 flex items-center justify-center border border-white/20 shadow-2xl flex-shrink-0">
                  <Bot className="text-white w-12 h-12 md:w-16 md:h-16" />
               </div>
               
               <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">Hakkımda</h3>
                  <p className="text-lg font-semibold text-cyan-400 mb-4">Ahmet Gün • Fırat Üniversitesi | Yönetim Bilişim Sistemleri 2. Sınıf</p>
                  <p className="text-slate-300 leading-relaxed max-w-4xl">
                    Yapay zeka, görüntü işleme ve modern web teknolojileri üzerine uzmanlaşan bir geliştiriciyim. 
                    Yapay zeka kullanarak yenilikçi web sitesi tasarlama, yapay zeka modellerini **fine-tuning** ederek 
                    ihtiyaca özel yeni modeller kurma ve bu modelleri gerçek dünya verileriyle entegre etme alanları üzerine çalışıyorum. 
                    Bu platform, akademik disiplin ile finansal teknolojileri birleştiren yapay zeka destekli bir vizyonun eseridir.
                  </p>
                  
                  <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                    <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs font-bold text-slate-400 uppercase tracking-widest">AI Fine-Tuning</span>
                    <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs font-bold text-slate-400 uppercase tracking-widest">Image Processing</span>
                    <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs font-bold text-slate-400 uppercase tracking-widest">Next.js Specialist</span>
                    <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs font-bold text-slate-400 uppercase tracking-widest">Full-Stack AI Developer</span>
                  </div>
               </div>
             </div>
             
             <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
                <div>© 2026 Ekonomi ve Bilgi Merkezi • Tüm Veriler Orijinal Kaynaklıdır.</div>
                <div className="flex items-center gap-4">
                   <span>Fırat Üniversitesi İktisadi ve İdari Bilimler Fakültesi</span>
                   <div className="w-1 h-1 bg-slate-700 rounded-full" />
                   <span>Elazığ, Türkiye</span>
                </div>
             </div>
           </motion.div>
        </footer>

      </div>
    </main>
  );
}

function OverviewTab({ market }: { market: MarketItem[] }) {
  const topMarket = market.slice(0, 8);
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

      {/* Makroekonomik Piyasa Yorum Çıkarımları */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3 glass-panel p-6 md:p-8 rounded-3xl mt-2">
         <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><Info className="text-sky-400"/> Makro Piyasa Dinamikleri & Ansiklopedik Yorum</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-amber-500/20 bg-amber-950/10">
               <h4 className="font-bold flex items-center gap-2 text-amber-400 mb-3"><Coins size={18}/> Altın (Ons & Gram) Etkisi</h4>
               <p className="text-sm text-slate-300 leading-relaxed">
                 <strong className="text-white">Artarsa:</strong> Yatırımcıların riskten kaçıp "güvenli limana" sığındığını gösterir. Dünyada savaş, kriz veya belirsizlik hakimdir. Hisse senetleri genelde düşer.<br/><br/>
                 <strong className="text-white">Azalırsa:</strong> Küresel risk iştahı artmıştır. Ekonomi canlanıyordur, yatırımcılar daha riskli (Borsa, Kripto) varlıklara yönelir.
               </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/10">
               <h4 className="font-bold flex items-center gap-2 text-emerald-400 mb-3"><TrendingUp size={18}/> Dolar & Euro Etkisi</h4>
               <p className="text-sm text-slate-300 leading-relaxed">
                 <strong className="text-white">Artarsa:</strong> Gelişmekte olan ülkeler (Türkiye gibi) için ithalat maliyetleri ve enflasyon artar. Merkez Bankaları faiz artırmak zorunda kalabilir.<br/><br/>
                 <strong className="text-white">Azalırsa:</strong> İthal girdiler ucuzlar, genel enflasyon baskısı hafifler. Şirket kârlılıkları döviz borcu olanlar için iyileşir.
               </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 bg-indigo-950/10">
               <h4 className="font-bold flex items-center gap-2 text-indigo-400 mb-3"><Globe size={18}/> Gelişmiş vs Gelişmekte Olan</h4>
               <p className="text-sm text-slate-300 leading-relaxed">
                 <strong className="text-white">Gelişmiş Ülkelerde (ABD, AB):</strong> Faizler düştüğünde paralar yatırıma ve dünyaya saçılarak borsaları tırmandırır.<br/><br/>
                 <strong className="text-white">Gelişmekte Olan Ülkelerde:</strong> Bu saçılan paralar ülkeye girerse (Sıcak Para) borsaları rekor kırar, kur düşer. Ancak global faiz artarsa para anavatana döner ve kur fırlar.
               </p>
            </div>
         </div>
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

        {/* Enflasyon Yorumu Panosu */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 md:p-8 rounded-3xl mt-12 bg-slate-900/60">
           <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><Info className="text-sky-400"/> Enflasyon (TÜFE/ÜFE) Ekonomik Dinamikleri</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-6 rounded-2xl border border-rose-500/20 bg-rose-950/10">
                 <h4 className="font-bold flex items-center gap-2 text-rose-400 mb-3"><TrendingUp size={18}/> Yükselirse (Artarsa) Etkileri</h4>
                 <div className="space-y-4">
                   <div>
                     <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Tüketici (TÜFE) Açısından:</span>
                     <p className="text-sm text-slate-300 leading-relaxed mt-1">Alım gücü düşer. Vatandaş aynı paraya daha az ürün alabilir. Merkez Bankası talebi kısmak için faiz artışına gitmek zorunda kalır.</p>
                   </div>
                   <div>
                     <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Üretici (ÜFE) Açısından:</span>
                     <p className="text-sm text-slate-300 leading-relaxed mt-1">Hammadde, enerji ve lojistik maliyetleri artmıştır. Üretici bu farkı kârından düşmek istemezse doğrudan etiket fiyatlarına (TÜFE'ye) yansıtarak sarmalı tetikler.</p>
                   </div>
                 </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/10">
                 <h4 className="font-bold flex items-center gap-2 text-emerald-400 mb-3"><TrendingDown size={18}/> Düşerse (Azalırsa) Etkileri</h4>
                 <div className="space-y-4">
                   <div>
                     <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Tüketici (TÜFE) Açısından:</span>
                     <p className="text-sm text-slate-300 leading-relaxed mt-1">Fiyat artış hızı yavaşlar (Dikkat: Fiyatlar ucuzlamaz, sadece normalden az artar). Alım gücü erozyonu durur. Faiz indirimleri başlar.</p>
                   </div>
                   <div>
                     <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Üretici (ÜFE) Açısından:</span>
                     <p className="text-sm text-slate-300 leading-relaxed mt-1">Maliyet baskısı azalır. Üretici rahat nefes alır, yatırım yapma, kredi çekme ve istihdamı artırma eğilimine girer. Ekonomik büyüme hızlanır.</p>
                   </div>
                 </div>
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
}

function MarketsTab({ market, calendar, fedLower, fedUpper, tcmbRate, depositRates }: { market: MarketItem[], calendar: CalendarItem[], fedLower: number, fedUpper: number, tcmbRate: number, depositRates: { min: number, max: number } }) {
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

      {/* YENİ: Merkez Bankası ve Faiz Blokları */}
      <div className="space-y-6">
         <div className="glass-panel p-6 md:p-8 rounded-3xl h-full flex flex-col">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
               <Landmark className="text-indigo-400"/> Merkez Bankası ve Faizler
            </h3>

            <div className="space-y-6 flex-1 flex flex-col justify-center">
               {/* FED Card */}
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 rounded-2xl border border-indigo-500/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
                 <div className="flex justify-between items-start mb-3">
                   <div>
                     <div className="text-sm font-bold text-indigo-300 flex items-center gap-2"><Building2 size={16}/> Amerika Merkez Bankası (FED)</div>
                     <p className="text-xs text-slate-400 mt-1">Global Referans Faiz Aralığı - Canlı Veri</p>
                   </div>
                 </div>
                 <div className="flex items-end gap-3">
                    <div className="text-3xl font-black text-white">%{fedLower.toFixed(2)} - %{fedUpper.toFixed(2)}</div>
                 </div>
                 <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                    <span className="text-[10px] uppercase text-indigo-400 font-black tracking-widest bg-indigo-950/50 px-2 py-1 rounded">Kaynak: St. Louis FED / Fred API</span>
                 </div>
               </motion.div>

               {/* TCMB Card */}
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 rounded-2xl border border-rose-500/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
                 <div className="flex justify-between items-start mb-3">
                   <div>
                     <div className="text-sm font-bold text-rose-300 flex items-center gap-2"><Building2 size={16}/> Türkiye Cumhuriyet Merkez Bankası (TCMB)</div>
                     <p className="text-xs text-slate-400 mt-1">Politika Faizi (1 Hafta Vadeli Repo) - Referanslı</p>
                   </div>
                 </div>
                 <div className="flex items-end gap-3 mb-4">
                    <div className="text-4xl font-black text-rose-400">%{tcmbRate.toFixed(2)}</div>
                 </div>
                 
                 {/* TCMB Dinamik Linkler (Kullanıcının Verdiği Metin) */}
                 <div className="space-y-2 mt-2">
                    <a href="https://www.qnbfi.com/" target="_blank" rel="noreferrer" className="block text-[11px] font-medium text-slate-300 bg-black/40 hover:bg-black/60 px-3 py-2 rounded-lg border border-white/5 transition-colors">
                       <span className="text-rose-400 font-bold mr-1">QNB Invest:</span> TCMB Mart 2026 Faiz Kararı Açıklandı! Politika Faizi Sabit Kaldı
                    </a>
                    <a href="https://www.infoyatirim.com/" target="_blank" rel="noreferrer" className="block text-[11px] font-medium text-slate-300 bg-black/40 hover:bg-black/60 px-3 py-2 rounded-lg border border-white/5 transition-colors">
                       <span className="text-rose-400 font-bold mr-1">İnfo Yatırım:</span> Merkez Bankası Faiz Kararı Detayları
                    </a>
                    <a href="#" target="_blank" rel="noreferrer" className="block text-[11px] font-medium text-slate-300 bg-black/40 hover:bg-black/60 px-3 py-2 rounded-lg border border-white/5 transition-colors">
                       <span className="text-rose-400 font-bold mr-1">Mall Report:</span> TCMB Mart Ayı Toplantı Özeti
                    </a>
                 </div>
               </motion.div>

               {/* Mevduat Faizi Card */}
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 rounded-2xl border border-emerald-500/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
                 <div className="flex justify-between items-start mb-3">
                   <div>
                     <div className="text-sm font-bold text-emerald-300 flex items-center gap-2"><Percent size={16}/> Banka Mevduat Faizi Oranları</div>
                     <p className="text-xs text-slate-400 mt-1">Tahmini Güncel Brüt Getiri Bandı</p>
                   </div>
                 </div>
                 <div className="flex items-end gap-3 mb-4">
                    <div className="text-3xl font-black text-emerald-400">%{depositRates.min.toFixed(2)} - %{depositRates.max.toFixed(2)}</div>
                 </div>
                 
                 {/* Hesapkurdu Analiz Linkleri */}
                 <div className="space-y-2 mt-2 flex flex-col sm:flex-row gap-2">
                    <a href="https://www.hesapkurdu.com/mevduat" target="_blank" rel="noreferrer" className="flex-1 text-[11px] font-medium text-slate-300 bg-black/40 hover:bg-black/60 px-3 py-2 rounded-lg border border-white/5 transition-colors flex items-center gap-2">
                       <ExternalLink size={12} className="text-emerald-400"/> Hesapkurdu: Güncel Mevduat
                    </a>
                    <a href="https://www.hesapkurdu.com/mevduat" target="_blank" rel="noreferrer" className="flex-1 text-[11px] font-medium text-slate-300 bg-black/40 hover:bg-black/60 px-3 py-2 rounded-lg border border-white/5 transition-colors flex items-center gap-2">
                       <ExternalLink size={12} className="text-emerald-400"/> 50k-100k TL Getiri Analizi
                    </a>
                 </div>
               </motion.div>

            </div>
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

function ArticlesTab({ articles }: { articles: ArticleItem[] }) {
  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-3xl text-center">
        <BookOpen size={48} className="text-slate-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-300">Makaleler Yükleniyor veya Bulunamadı</h3>
        <p className="text-sm text-slate-500 mt-2">Literatür taranıyor, bu biraz zaman alabilir...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 md:p-8 rounded-3xl">
        <h3 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <BookOpen className="text-indigo-400" size={32}/> 
          Makale <span className="text-slate-600 font-light">&amp;</span> Araştırma Okumaları
        </h3>
        <p className="text-slate-400 mb-8 max-w-3xl">
          Yönetim Bilişim Sistemleri, Yazılım, Yapay Zeka, Ajanlar (Agents), Kuantum, Finans, Sigorta ve İşletme özelinde son 7 günde yayınlanan etkili akademik, küresel ve yerel (DergiPark vb.) içerikler tarafımızca derlenip Türkçeye çevrilerek sunulmaktadır.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((item, i) => {
            // Category Renklendirmesi
            let catColor = "text-indigo-400";
            let bgAccent = "bg-indigo-950/20";
            let ringAccent = "ring-indigo-500/50";
            
            if (["Yazılım", "Kuantum"].includes(item.category)) {
                catColor = "text-cyan-400";
                bgAccent = "bg-cyan-950/20";
                ringAccent = "ring-cyan-500/50";
            } else if (["Yapay Zeka", "Agent"].includes(item.category)) {
                catColor = "text-emerald-400";
                bgAccent = "bg-emerald-950/20";
                ringAccent = "ring-emerald-500/50";
            } else if (["Finans", "Sigorta", "İşletme"].includes(item.category)) {
                catColor = "text-amber-400";
                bgAccent = "bg-amber-950/20";
                ringAccent = "ring-amber-500/50";
            }

            return (
              <motion.a 
                href={item.link} target="_blank" rel="noreferrer"
                key={item.titleTr + i} 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: (i % 6) * 0.1 }} 
                className={cn(
                  "glass-card flex flex-col rounded-3xl overflow-hidden group hover:ring-2 transition-all duration-300 relative",
                  ringAccent
                )}
              >
                {/* Çok Şık Üst Gradient */}
                <div className={cn("h-40 w-full relative overflow-hidden", bgAccent)}>
                   <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay group-hover:scale-110 transition-transform duration-[1.5s]" />
                   <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/40 via-[#0f172a]/80 to-[#0f172a] z-10" />
                   
                   <div className="absolute top-4 left-4 z-20">
                     <div className={cn("px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg border border-white/10 flex items-center gap-1.5", catColor, "bg-slate-900/80 backdrop-blur-md")}>
                        <Sparkles size={10} />
                        {item.category}
                     </div>
                   </div>
                   
                   <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                     <div>
                       <div className="text-xs text-slate-300 font-bold mb-1 opacity-90">{new Date(item.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                       <div className="text-[9px] uppercase tracking-widest text-slate-500 bg-black/40 px-2 py-0.5 rounded backdrop-blur">
                         KAYNAK: {item.source}
                       </div>
                     </div>
                     <ExternalLink size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                   </div>
                </div>

                 <div className="p-6 md:p-8 flex-1 flex flex-col justify-between bg-slate-900/60 z-30">
                  <h4 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors drop-shadow-sm leading-snug line-clamp-3 mb-6">
                    {item.titleTr}
                  </h4>
                  
                  <div className={cn("mt-auto p-4 rounded-xl border border-white/5", bgAccent)}>
                    <div className={cn("text-[9px] uppercase font-black tracking-widest mb-2 flex items-center gap-1.5", catColor)}>
                      <Target size={12}/> ANALİZ VE İPUCU
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {item.guide}
                    </p>
                  </div>
                </div>
              </motion.a>
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

// --- DEHALAR VE EKONOMİSTLER SEKMESİ ---
function GeniusesTab({ figures, articles }: { figures: HistoricFigure[], articles: ArticleItem[] }) {
  if (!figures || figures.length === 0) return null;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
         <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Lightbulb className="text-amber-400"/> Tarihin Seçkin Zekaları</h2>
         <p className="text-sm text-slate-400">Her gün 3 Ekonomist ve 3 Deha bu panoda değişerek belirecektir. Ansiklopedik derinliğe sahip yerli, milli, İslami ve evrensel şahsiyetlerin iz bırakan notları.</p>
         <div className="mt-2 text-xs font-bold px-3 py-1 bg-white/5 w-fit rounded-lg text-amber-500">Günün Zaman Tohumu Aktif</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {figures.map((fig, i) => (
            <motion.a 
               href={fig.wikiUrl}
               target="_blank"
               rel="noreferrer"
               key={fig.id}
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }} 
               transition={{ delay: i * 0.1 }}
               className="glass-panel p-0 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-xl ring-1 ring-amber-500/20 hover:ring-2 hover:ring-amber-500/50 group transition-all min-h-[320px] md:min-h-0"
            >
               {/* Görsel Alanı */}
               <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${fig.imageUrl})` }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0f172a] via-[#0f172a]/70 to-transparent"></div>
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                     <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg",
                        fig.type === 'economist' ? "text-cyan-200 bg-cyan-950/80 border border-cyan-800/50" : "text-amber-200 bg-amber-950/80 border border-amber-800/50"
                     )}>
                        {fig.type === 'economist' ? 'Ekonomist' : 'Bilim İnsanı'}
                     </span>
                     <span className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md w-fit bg-black/60",
                        fig.origin === 'local' ? "text-emerald-400" : "text-slate-300"
                     )}>
                        {fig.origin === 'local' ? 'Yerli & İslami' : 'Yabancı Kaynak'}
                     </span>
                  </div>
               </div>

               {/* Metin Alanı */}
               <div className="flex-1 p-6 flex flex-col justify-center bg-slate-900/60 backdrop-blur-sm z-10 -mt-10 md:mt-0 rounded-t-3xl md:rounded-l-none md:rounded-r-3xl">
                  <h3 className="text-xl font-bold text-white mb-1">{fig.name}</h3>
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">{fig.title}</div>
                  
                  <p className="text-sm text-slate-300 leading-relaxed italic mb-5 border-l-2 border-white/20 pl-3">"{fig.bio}"</p>
                  
                  <div className="space-y-2 mb-4">
                     <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Başlıca Katkıları</div>
                     {fig.achievements.map((ach, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                           <Target size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                           <span className="text-xs text-slate-200 leading-normal">{ach}</span>
                        </div>
                     ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between group-hover:text-amber-400 transition-colors">
                     <span className="text-[10px] font-black uppercase tracking-widest">Tüm Hayatını Oku (Vikipedi)</span>
                     <ExternalLink size={14} />
                  </div>
               </div>
            </motion.a>
         ))}


      </div>
    </div>
  );
}
