"""
Çok Kaynaklı Haber Çekme ve Analiz Tool'u
Kaynaklar: tr.investing.com, washingtonpost.com, bbc.com/news/business, dunya.com
"""

import requests
from bs4 import BeautifulSoup
from langchain.tools import tool
from typing import Optional, List
import time
import sys
import os

# Arama tool'unu fallback olarak ekleyelim
try:
    from tools.search_tool import search
except ImportError:
    # Eğer import edilemezse (farklı çalışma dizini vb.)
    def search(q): return "Arama aracı şu an kullanılamıyor."


# ─────────────────────────────────────────────
# YARDIMCI FONKSİYONLAR
# ─────────────────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


def safe_get(url: str, timeout: int = 12) -> Optional[BeautifulSoup]:
    """HTTP GET isteği yapar; başarısızsa None döner."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")
    except Exception as e:
        print(f"[HATA] {url} -> {e}")
        return None


def truncate(text: str, max_chars: int = 300) -> str:
    """Metni belirtilen karakter sayısına kırpar."""
    text = text.strip()
    return text[:max_chars] + "…" if len(text) > max_chars else text


# ─────────────────────────────────────────────
# 1) TR.INVESTING.COM — Ekonomi & Piyasa Haberleri
# ─────────────────────────────────────────────

@tool
def get_investing_tr_news(query: str = "ekonomi") -> str:
    """
    tr.investing.com sitesinden güncel ekonomi ve piyasa haberlerini çeker.
    Haber başlıklarını, özetlerini ve linklerini döner.
    """
    url = "https://tr.investing.com/news/economy"
    soup = safe_get(url)
    if not soup:
        return "tr.investing.com'dan haber alınamadı."

    articles = soup.find_all("article", limit=8)
    if not articles:
        # Alternatif seçici
        articles = soup.select("div.articleItem", limit=8)

    results = ["TR.INVESTING.COM - Ekonomi Haberleri\n" + "-" * 50]

    for art in articles:
        # Başlık
        title_tag = (
            art.find("a", {"class": "title"})
            or art.find("h2")
            or art.find("a")
        )
        # Özet
        summary_tag = art.find("p")
        # Tarih
        time_tag = art.find("time") or art.find("span", {"class": "date"})

        title = title_tag.get_text(strip=True) if title_tag else "Başlık yok"
        href = title_tag.get("href", "") if title_tag else ""
        link = f"https://tr.investing.com{href}" if href.startswith("/") else href
        summary = truncate(summary_tag.get_text(strip=True)) if summary_tag else "Özet yok"
        tarih = time_tag.get_text(strip=True) if time_tag else ""

        results.append(
            f"\n* {title}\n"
            f"   📅 {tarih}\n"
            f"   📝 {summary}\n"
            f"   🔗 {link}"
        )

    if len(results) == 1:
        # Fallback: Arama Motoru
        print(f"[BİLGİ] Investing direct scrap başarısız, search tool deneniyor...")
        return f"TR.INVESTING.COM (Fallback Arama)\n" + "-" * 50 + "\n" + search(f"site:tr.investing.com {query}")

    results.append("\nKaynak: tr.investing.com")
    return "\n".join(results)


# ─────────────────────────────────────────────
# 2) WASHINGTON POST — Araştırmacı Gazetecilik Haberleri
# ─────────────────────────────────────────────

@tool
def get_washingtonpost_investigations(query: str = "investigations") -> str:
    """
    Washington Post'un ulusal araştırma/soruşturma bölümünden haberleri çeker.
    Başlık, özet ve bağlantı bilgilerini döner.
    """
    url = "https://www.washingtonpost.com/national/investigations/"
    soup = safe_get(url)
    if not soup:
        return "Washington Post'tan haber alınamadı."

    # WaPo genellikle <h2>, <h3> ve <a> etiketleriyle haber listeler
    cards = soup.select("div[data-feature-id] a[href*='/investigations/']", limit=8)
    if not cards:
        cards = soup.select("a[href*='/national/']", limit=8)

    seen = set()
    results = ["WASHINGTON POST - Arastirma Haberleri\n" + "-" * 50]

    for a in cards:
        href = a.get("href", "")
        if href in seen or not href:
            continue
        seen.add(href)

        title = a.get_text(strip=True)
        if not title or len(title) < 10:
            continue

        link = href if href.startswith("http") else f"https://www.washingtonpost.com{href}"
        results.append(f"\n* {title}\n   Link: {link}")

    if len(results) == 1:
        # Fallback: Arama Motoru
        print(f"[BİLGİ] WaPo direct scrap başarısız, search tool deneniyor...")
        return f"🗞️ WASHINGTON POST (Fallback Arama)\n" + "─" * 50 + "\n" + search(f"site:washingtonpost.com/national/investigations {query}")

    results.append("\nKaynak: washingtonpost.com/national/investigations/")
    return "\n".join(results)


# ─────────────────────────────────────────────
# 3) BBC NEWS — İş & Ekonomi Haberleri
# ─────────────────────────────────────────────

@tool
def get_bbc_business_news(query: str = "economy business") -> str:
    """
    BBC News İş ve Ekonomi bölümünden güncel İngilizce haberleri çeker.
    Başlık, kısa özet ve bağlantı döner.
    """
    url = "https://www.bbc.com/news/business"
    soup = safe_get(url)
    if not soup:
        return "BBC News'ten haber alınamadı."

    # BBC genellikle <h3> içinde başlık, data-testid attribute kullanır
    cards = soup.select("h3[class*='Headline'], h3[class*='headline']", limit=10)
    if not cards:
        cards = soup.find_all("h3", limit=10)

    results = ["BBC NEWS - Business & Economy\n" + "-" * 50]
    seen = set()

    for h3 in cards:
        title = h3.get_text(strip=True)
        if not title or title in seen or len(title) < 10:
            continue
        seen.add(title)

        # Üst veya yakın <a> etiketi bul
        parent_a = h3.find_parent("a") or h3.find("a")
        href = parent_a.get("href", "") if parent_a else ""
        link = href if href.startswith("http") else f"https://www.bbc.com{href}"

        # Varsa özet paragrafı
        sibling_p = h3.find_next_sibling("p") or (h3.parent.find("p") if h3.parent else None)
        summary = truncate(sibling_p.get_text(strip=True)) if sibling_p else ""

        results.append(
            f"\n* {title}\n"
            + (f"   📝 {summary}\n" if summary else "")
            + f"   🔗 {link}"
        )

    if len(results) == 1:
        # Fallback: Arama Motoru
        print(f"[BİLGİ] BBC direct scrap başarısız, search tool deneniyor...")
        return f"🌍 BBC NEWS (Fallback Arama)\n" + "─" * 50 + "\n" + search(f"site:bbc.com/news/business {query}")

    results.append("\nKaynak: bbc.com/news/business")
    return "\n".join(results)


# ─────────────────────────────────────────────
# 4) DÜNYA GAZETESİ — Türk İş & Ekonomi Haberleri
# ─────────────────────────────────────────────

@tool
def get_dunya_news(query: str = "ekonomi") -> str:
    """
    Dünya Gazetesi (dunya.com) sitesinden güncel Türk ekonomi ve iş haberlerini çeker.
    Başlık, özet ve bağlantı bilgisi döner.
    """
    url = "https://www.dunya.com/"
    soup = safe_get(url)
    if not soup:
        return "Dünya Gazetesi'nden haber alınamadı."

    # dunya.com haber kartları
    cards = soup.select("div.news-item, article.card, div.haber-item", limit=10)
    if not cards:
        # Yedek: <h2>, <h3> içeren bağlantılar
        cards = soup.find_all(["h2", "h3"], limit=10)

    results = ["DUNYA GAZETESI - Ekonomi & Is Haberleri\n" + "-" * 50]
    seen = set()

    for card in cards:
        # Başlık için a etiketi veya span ara
        a_tag = card.find("a") if hasattr(card, "find") else card
        title_tag = card.find(["h2", "h3", "span", "strong"]) or card

        title = title_tag.get_text(strip=True) if title_tag else card.get_text(strip=True)
        title = title.strip()

        if not title or title in seen or len(title) < 8:
            continue
        seen.add(title)

        href = a_tag.get("href", "") if a_tag and a_tag.name == "a" else ""
        if not href:
            parent_a = card.find_parent("a") or card.find("a")
            href = parent_a.get("href", "") if parent_a else ""

        link = href if href.startswith("http") else f"https://www.dunya.com{href}"

        summary_tag = card.find("p")
        summary = truncate(summary_tag.get_text(strip=True)) if summary_tag else ""

        results.append(
            f"\n* {title}\n"
            + (f"   📝 {summary}\n" if summary else "")
            + f"   🔗 {link}"
        )

    if len(results) == 1:
        # Fallback: Arama Motoru
        print(f"[BİLGİ] Dünya direct scrap başarısız, search tool deneniyor...")
        return f"📰 DÜNYA GAZETESİ (Fallback Arama)\n" + "─" * 50 + "\n" + search(f"site:dunya.com {query}")

    results.append("\nKaynak: dunya.com")
    return "\n".join(results)


# ─────────────────────────────────────────────
# 5) HABER ANALİZ TOOL'U — Tüm Kaynakları Birleştirir
# ─────────────────────────────────────────────

@tool
def analyze_all_news_sources(topic: str = "ekonomi") -> str:
    """
    Tüm haber kaynaklarından (Investing TR, Washington Post, BBC, Dünya Gazetesi)
    haberleri çekip birleştirilmiş bir özet ve analiz döner.
    Girdi olarak analiz edilmek istenen konu/anahtar kelime alır.
    Örnek: 'enflasyon', 'dolar', 'faiz', 'borsa', vb.
    """
    print(f"[BİLGİ] '{topic}' konusunda tüm kaynaklar taranıyor...\n")

    sections = []

    # Her kaynak arasında kısa bekleme (rate-limiting önlemi)
    sources = [
        ("TR Investing", get_investing_tr_news),
        ("Washington Post", get_washingtonpost_investigations),
        ("BBC Business", get_bbc_business_news),
        ("Dünya Gazetesi", get_dunya_news),
    ]

    for name, tool_fn in sources:
        print(f"  -> {name} cekiliyor...")
        try:
            result = tool_fn.invoke(topic)
            sections.append(result)
        except Exception as e:
            sections.append(f"[{name}] Hata: {e}")
        time.sleep(1)  # Siteler arasinda 1 sn bekleme

    divider = "\n\n" + "═" * 60 + "\n\n"
    full_report = divider.join(sections)

    summary_header = (
        f"{'═' * 60}\n"
        f"  ÇOKLU KAYNAK HABER ANALİZİ — Konu: {topic.upper()}\n"
        f"{'═' * 60}\n\n"
    )

    return summary_header + full_report


# ─────────────────────────────────────────────
# TEST
# ─────────────────────────────────────────────

if __name__ == "__main__":
    # Windows terminalinde Unicode (Emoji) basma hatasını önlemek için
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    # Tek kaynak testi
    print(get_dunya_news.invoke("ekonomi"))
    print("\n" + "=" * 60 + "\n")
    print(get_bbc_business_news.invoke("economy"))

    # Tüm kaynakları analiz et
    # print(analyze_all_news_sources.invoke("enflasyon"))