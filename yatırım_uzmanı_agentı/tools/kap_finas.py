"""
KAP (Kamuyu Aydınlatma Platformu) Finansal Analiz Tool'u
=========================================================
BIST şirketlerinin finansal tablolarını, rasyolarını ve
bildirimlerini kap.org.tr'den çeken LangChain tool seti.

Bağımlılıklar:
    pip install requests beautifulsoup4 langchain pandas

Kullanım:
    from kap_financial_tool import (
        get_kap_company_info,
        get_kap_financial_statements,
        get_kap_financial_ratios,
        get_kap_disclosures,
        get_kap_full_analysis,
    )
"""

import re
import time
from datetime import date, datetime
from typing import Optional

import requests
from bs4 import BeautifulSoup
from langchain.tools import tool

# ─────────────────────────────────────────────────────────────────
# SABITLER & YARDIMCI FONKSİYONLAR
# ─────────────────────────────────────────────────────────────────

BASE_URL = "https://www.kap.org.tr"
API_BASE = "https://www.kap.org.tr/tr"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "tr-TR,tr;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://www.kap.org.tr/tr/",
}

# KAP JSON API endpoint'leri (browser network tab'dan alınan gerçek endpoint'ler)
KAP_API = {
    "company_list":        f"{BASE_URL}/api/memberCompany/bist",
    "company_summary":     f"{BASE_URL}/tr/sirket-bilgileri/ozet/{{member_oid}}",
    "financial_data":      f"{BASE_URL}/tr/sirket-finansal-bilgileri/{{member_oid}}",
    "disclosures":         f"{BASE_URL}/tr/sirket-bildirimleri/{{member_oid}}",
    "financial_reports":   f"{BASE_URL}/tr/sirket-bilgileri/finansal-tablo/{{member_oid}}",
    "bist_companies":      f"{BASE_URL}/tr/bist-sirketler",
}


def safe_get_html(url: str, timeout: int = 15) -> Optional[BeautifulSoup]:
    """HTML sayfası çeker, BeautifulSoup döner; hata olursa None."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=timeout)
        r.raise_for_status()
        return BeautifulSoup(r.text, "html.parser")
    except Exception as e:
        print(f"[HTML HATA] {url} -> {e}")
        return None


def safe_get_json(url: str, timeout: int = 15) -> Optional[dict | list]:
    """JSON endpoint'i çeker; hata olursa None döner."""
    try:
        r = requests.get(url, headers={**HEADERS, "Accept": "application/json"}, timeout=timeout)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"[JSON HATA] {url} -> {e}")
        return None


def fmt(val) -> str:
    """Sayısal değerleri binlik ayraçlı stringe çevirir."""
    try:
        return f"{float(str(val).replace(',', '').replace('.', '').strip()):,.0f}"
    except Exception:
        return str(val).strip()


def section(title: str) -> str:
    return f"\n{'-' * 55}\n  {title}\n{'-' * 55}"


# ─────────────────────────────────────────────────────────────────
# 1) ŞİRKET ARAMA — Ticker'dan member_oid Bul
# ─────────────────────────────────────────────────────────────────

def find_company_by_ticker(ticker: str) -> Optional[dict]:
    """
    BIST şirket listesinden ticker (örn. 'BIMAS') ile eşleşen
    şirketi bulur ve {name, ticker, member_oid, url} döner.
    """
    ticker = ticker.upper().strip()
    
    # 0. YEDEK: Yerel Haritayı (kap_map.json) kontrol et
    import json
    import os
    map_path = os.path.join(os.path.dirname(__file__), "kap_map.json")
    if os.path.exists(map_path):
        try:
            with open(map_path, "r", encoding="utf-8") as f:
                kap_map = json.load(f)
                if ticker in kap_map:
                    oid = kap_map[ticker]
                    return {
                        "name": ticker,
                        "ticker": ticker,
                        "member_oid": str(oid),
                        "city": "",
                        "url": f"{BASE_URL}/tr/sirket-ozet/{oid}",
                    }
        except:
            pass

    # KAP JSON API'yi dene
    data = safe_get_json(KAP_API["company_list"])
    if isinstance(data, list):
        for c in data:
            code = (c.get("memberCode") or c.get("ticker") or "").upper()
            if code == ticker:
                oid = c.get("memberOid") or c.get("oid") or c.get("id", "")
                return {
                    "name":       c.get("title") or c.get("memberTitle", ""),
                    "ticker":     code,
                    "member_oid": str(oid),
                    "city":       c.get("city", ""),
                    "url":        f"{BASE_URL}/tr/sirket-ozet/{oid}",
                }

    # 3. YEDEK: Arama Motoru ile OID bulma (ÇOK ROBUST)
    print(f"  [BILGI] {ticker} icin arama motoru uzerinden OID araniyor...")
    search_url = f"https://duckduckgo.com/html/?q={ticker}+site:kap.org.tr+sirket-ozet"
    try:
        r = requests.get(search_url, headers=HEADERS, timeout=10)
        if r.status_code == 200:
            match = re.search(r"kap\.org\.tr/tr/sirket-ozet/(\d+)", r.text)
            if not match:
                match = re.search(r"kap\.org\.tr/tr/sirket-bilgileri/ozet/(\d+)", r.text)
            
            if match:
                oid = match.group(1)
                print(f"  [BILGI] OID bulundu: {oid}")
                return {
                    "name":       ticker,
                    "ticker":     ticker,
                    "member_oid": oid,
                    "city":       "",
                    "url":        f"{BASE_URL}/tr/sirket-ozet/{oid}",
                }
    except Exception as e:
        print(f"  [HATA] Arama motoru yedeği başarısız: {e}")

    # Yedek: HTML tablosunu tara
    soup = safe_get_html(KAP_API["bist_companies"])
    if not soup:
        return None

    for row in soup.select("table tr"):
        cells = row.find_all("td")
        if len(cells) >= 2:
            code_cell = cells[0].get_text(strip=True).upper()
            if code_cell == ticker:
                link = cells[1].find("a") or cells[0].find("a")
                href = link["href"] if link else ""
                oid = href.rstrip("/").split("/")[-1] if href else ""
                return {
                    "name":       cells[1].get_text(strip=True) if len(cells) > 1 else ticker,
                    "ticker":     ticker,
                    "member_oid": oid,
                    "city":       cells[2].get_text(strip=True) if len(cells) > 2 else "",
                    "url":        f"{BASE_URL}{href}" if href.startswith("/") else href,
                }
    return None


# ─────────────────────────────────────────────────────────────────
# 2) ŞİRKET GENEL BİLGİLERİ
# ─────────────────────────────────────────────────────────────────

@tool
def get_kap_official_summary(ticker: str) -> str:
    """
    BIST sirketinin KAP'taki resmi ozet bilgilerini (sermaye, yonetim, iletisim vb.) getirir.
    Girdi: Hisse senedi kodu (örn. 'THYAO', 'EREGL', 'SISE').
    """
    company = find_company_by_ticker(ticker.upper().strip())
    if not company:
        return f"'{ticker}' kodu için KAP'ta şirket bulunamadı."

    oid = company["member_oid"]
    url = KAP_API["summary"].format(member_oid=oid)
    soup = safe_get_html(url)

    if not soup:
        return f"{ticker} şirket özeti sayfası açılamadı. URL: {url}"

    lines = [section(f"SIRKET: {company['name']} ({ticker.upper()}) - KAP Sirket Bilgileri")]
    
    # Bilgi tablosunu bul
    info_table = soup.find("div", {"class": "info-table-container"}) or soup.find("table")
    if info_table:
        rows = info_table.find_all("tr")
        for row in rows:
            cells = row.find_all(["th", "td"])
            if len(cells) >= 2:
                label = cells[0].get_text(strip=True)
                val = cells[1].get_text(strip=True)
                if label and val:
                    lines.append(f"  {label:<25}: {val}")
    
    lines.append(f"\n  Kaynak: {url}")
    return "\n".join(lines)

@tool
def get_latest_kap_report_link(ticker: str) -> str:
    """
    Sirketin KAP'taki en guncel finansal rapor (FR) bildiriminin linkini getirir.
    Kullaniciya dogrudan indirilebilir veya incelenebilir resmi linki sunar.
    """
    company = find_company_by_ticker(ticker.upper().strip())
    if not company:
        return f"'{ticker}' kodu için KAP'ta şirket bulunamadı."
    
    oid = company["member_oid"]
    # 1. Deneme: Sirket bildirimleri sayfasi (FR filtreli)
    url = f"https://www.kap.org.tr/tr/api/disclosure/member/{oid}/disclosures?disclosureType=FR"
    
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        if res.ok and "application/json" in res.headers.get("Content-Type", ""):
            data = res.json()
            if data and len(data) > 0:
                latest = data[0]
                disc_id = latest.get("disclosureIndex")
                publish_date = latest.get("publishDate", "")
                report_url = f"https://www.kap.org.tr/tr/Bildirim/{disc_id}"
                excel_url = f"https://www.kap.org.tr/tr/api/disclosure/download/financial/excel/{disc_id}"
                return (f"{ticker} En Guncel KAP Finansal Raporu ({publish_date}):\n"
                        f"- Bildirim Sayfasi: {report_url}\n"
                        f"- Excel Indirme: {excel_url}")

        # 2. Deneme: DuckDuckGo ile Bildirim ID bulma
        print(f"  [BILGI] {ticker} icin bildirim ID araniyor...")
        search_q = f"{ticker}+site:kap.org.tr+finansal+rapor"
        search_url = f"https://duckduckgo.com/html/?q={search_q}"
        r_s = requests.get(search_url, headers=HEADERS, timeout=10)
        if r_s.ok:
            # Bildirim linklerini ara: kap.org.tr/tr/Bildirim/123456
            match = re.search(r"kap\.org\.tr/tr/Bildirim/(\d+)", r_s.text)
            if match:
                disc_id = match.group(1)
                report_url = f"https://www.kap.org.tr/tr/Bildirim/{disc_id}"
                excel_url = f"https://www.kap.org.tr/tr/api/disclosure/download/financial/excel/{disc_id}"
                return (f"{ticker} En Guncel KAP Finansal Raporu (Arama ile Bulundu):\n"
                        f"- Bildirim Sayfasi: {report_url}\n"
                        f"- Excel Indirme: {excel_url}")

    except Exception as e:
        print(f"KAP rapor linki hatasi: {e}")
    
    # Fallback: Sirket genel ozet sayfasi
    return (f"{ticker} için doğrudan rapor linki oluşturulamadı. \n"
            f"Lütfen şu sayfadan 'Finansal Bilgiler' sekmesine bakın: {company['url']}")

@tool
def get_kap_company_info(ticker: str) -> str:
    """
    KAP'tan bir BIST şirketinin genel bilgilerini çeker.
    Girdi: Hisse senedi kodu (örn. 'BIMAS', 'THYAO', 'EREGL').
    Çıktı: Şirket unvanı, sektör, faaliyet konusu, yönetim,
           sermaye, bağımsız denetçi, borsa bilgileri.
    """
    company = find_company_by_ticker(ticker)
    if not company:
        return f"'{ticker}' kodu için KAP'ta şirket bulunamadı."

    oid = company["member_oid"]
    soup = safe_get_html(KAP_API["company_summary"].format(member_oid=oid))
    if not soup:
        return f"{ticker} şirket özet sayfası açılamadı."

    lines = [section(f"SIRKET: {company['name']} ({ticker}) - KAP Sirket Bilgileri")]
    lines.append(f"  Sehir   : {company['city']}")
    lines.append(f"  KAP URL : {company['url']}")

    # Genel bilgi tablosu - Daha robust selectorler
    tables = soup.find_all("table") or soup.select(".table, .grid")
    for table in tables:
        rows = table.find_all("tr")
        for row in rows:
            cells = row.find_all(["th", "td"])
            if len(cells) >= 2:
                key = cells[0].get_text(strip=True)
                val = cells[1].get_text(strip=True)
                if key and val and len(key) < 50:
                    lines.append(f"  {key:<30}: {val}")

    # Yönetim kurulu
    mgmt_header = soup.find(string=re.compile("Yönetim Kurulu|Board of Directors", re.I))
    if mgmt_header:
        mgmt_section = mgmt_header.find_parent()
        if mgmt_section:
            lines.append("\n  Yonetim Kurulu:")
            ul = mgmt_section.find_next("ul") or mgmt_section.find_parent().find_next("ul")
            if ul:
                for li in ul.find_all("li"):
                    lines.append(f"     * {li.get_text(strip=True)}")

    if len(lines) <= 3:
        lines.append("  (Detaylı bilgi için lütfen KAP sayfasını ziyaret edin.)")

    lines.append(f"\n  Kaynak: {BASE_URL}/tr/sirket-ozet/{oid}")
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────
# 3) FİNANSAL TABLOLAR (Bilanço, Gelir Tablosu, Nakit Akışı)
# ─────────────────────────────────────────────────────────────────

@tool
def get_kap_financial_statements(ticker_and_period: str) -> str:
    """
    KAP'tan şirketin finansal tablolarını çeker.
    Girdi formatı: 'TICKER' veya 'TICKER:YIL' (örn. 'BIMAS' veya 'BIMAS:2024').
    Bilanço (aktif/pasif), gelir tablosu ve nakit akış tablosunu döner.
    """
    # Girdiden ticker ve yılı ayır
    parts = ticker_and_period.strip().upper().split(":")
    ticker = parts[0].strip()
    year   = parts[1].strip() if len(parts) > 1 else str(date.today().year - 1)

    company = find_company_by_ticker(ticker)
    if not company:
        return f"'{ticker}' kodu için KAP'ta şirket bulunamadı."

    oid = company["member_oid"]
    url = KAP_API["financial_data"].format(member_oid=oid)
    soup = safe_get_html(url)
    if not soup:
        return f"{ticker} finansal bilgi sayfası açılamadı. URL: {url}"

    lines = [section(f"TABLO: {company['name']} ({ticker}) - Finansal Tablolar ({year})")]

    # Seçili finansal kalemler tabloları
    tables = soup.find_all("table")
    parsed_any = False

    # Daha geniş anahtar kelime listesi
    keywords = ["aktif", "pasif", "gelir", "gider", "kar", "zarar", "nakit", "ozkaynak", 
                "borc", "varlik", "satis", "hasilat", "donen", "duran", "yukumluluk"]

    for tbl in tables:
        caption = tbl.find(["caption", "th", "thead"])
        caption_text = caption.get_text(strip=True) if caption else ""

        rows = tbl.find_all("tr")
        if len(rows) < 2:
            continue

        # Tablo içeriğini kontrol et
        row_sample = " ".join(r.get_text(strip=True).lower() for r in rows[:10])
        
        if any(k in row_sample for k in keywords) or any(k in caption_text.lower() for k in keywords):
            tbl_title = caption_text or "Finansal Tablo Verisi"
            lines.append(f"\n  [TABLO] {tbl_title}")
            lines.append(f"  {'-' * 60}")

            for row in rows:
                cells = row.find_all(["th", "td"])
                if len(cells) >= 2:
                    label = cells[0].get_text(strip=True)
                    # Sütunları temizle ve hizala
                    values = [re.sub(r"\s+", " ", c.get_text(strip=True)) for c in cells[1:]]
                    if label and len(label) < 120 and any(re.search(r"\d", v) for v in values):
                        lines.append(f"  {label:<45} | {' | '.join(values)}")
                        parsed_any = True

    if not parsed_any:
        # Yedek: Sayfadaki tüm anlamlı satırları tara
        lines.append("\n  (Otomatik tablo ayristirma basarisiz — sayfadaki tum finansal satirlar listeleniyor:)")
        for tag in soup.find_all(["div", "tr", "p"]):
            txt = tag.get_text(strip=True, separator=" ")
            # Eğer satırda hem bir finansal anahtar kelime hem de bir sayı varsa
            if any(k in txt.lower() for k in keywords) and re.search(r"\d{3,}", txt) and len(txt) < 200:
                lines.append(f"  - {txt}")
                parsed_any = True

    lines.append(f"\n  Kaynak URL: {url}")
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────
# 4) FİNANSAL RASYOLAR (Hesaplama + KAP Verisinden)
# ─────────────────────────────────────────────────────────────────

@tool
def get_kap_financial_ratios(ticker: str) -> str:
    """
    BIST şirketinin temel finansal rasyolarını hesaplar ve döner.
    Likidite, karlılık, kaldıraç ve verimlilik rasyolarını içerir.
    Girdi: Hisse senedi kodu (örn. 'EREGL', 'SISE', 'KCHOL').
    """
    company = find_company_by_ticker(ticker.upper().strip())
    if not company:
        return f"'{ticker}' kodu için KAP'ta şirket bulunamadı."

    oid  = company["member_oid"]
    url  = KAP_API["financial_data"].format(member_oid=oid)
    soup = safe_get_html(url)

    lines = [section(f"RASYO: {company['name']} ({ticker.upper()}) - Finansal Rasyolar")]

    # ── Veriden kalem eşleştirme sözlüğü ──────────────────────────
    kalemler = {
        "dönen_varlıklar":       ["Dönen Varlıklar", "Current Assets"],
        "kısa_borç":             ["Kısa Vadeli Yükümlülükler", "Current Liabilities"],
        "nakit":                 ["Nakit ve Nakit Benzerleri", "Cash"],
        "stok":                  ["Stoklar", "Inventories"],
        "toplam_aktif":          ["Toplam Varlıklar", "Total Assets"],
        "toplam_borç":           ["Toplam Yükümlülükler", "Total Liabilities"],
        "özkaynak":              ["Özkaynaklar", "Total Equity"],
        "net_kar":               ["Dönem Net Karı", "Net Profit", "Net Income"],
        "brüt_kar":              ["Brüt Kar", "Gross Profit"],
        "satış_gelirleri":       ["Satış Gelirleri", "Revenue", "Hasılat"],
        "faiz_gideri":           ["Finansman Giderleri", "Finance Costs"],
        "favök":                 ["FAVÖK", "EBITDA"],
        "uzun_vadeli_borç":      ["Uzun Vadeli Yükümlülükler", "Non-current Liabilities"],
        "faaliyet_karı":         ["Faaliyet Karı", "Operating Profit"],
    }

    extracted = {}

    if soup:
        all_text = soup.get_text(separator="\n")
        rows = soup.find_all("tr")
        for row in rows:
            cells = row.find_all(["th", "td"])
            if len(cells) < 2:
                continue
            label = cells[0].get_text(strip=True)
            val_text = cells[-1].get_text(strip=True)  # en son sütun = güncel dönem

            for key, aliases in kalemler.items():
                if key in extracted:
                    continue
                if any(alias.lower() in label.lower() for alias in aliases):
                    # Sayıyı temizle
                    num_str = re.sub(r"[^\d,.-]", "", val_text).replace(",", "")
                    try:
                        extracted[key] = float(num_str)
                    except ValueError:
                        pass

    # ── Rasyo Hesaplama ────────────────────────────────────────────
    def ratio(num_key, den_key, label, fmt_str=".2f", multiplier=1.0):
        n = extracted.get(num_key)
        d = extracted.get(den_key)
        if n is not None and d and d != 0:
            val = (n / d) * multiplier
            lines.append(f"  {label:<45}: {val:{fmt_str}}")
        else:
            lines.append(f"  {label:<45}: — (veri yetersiz)")

    lines.append("\n  LİKİDİTE RASYOLARI")
    lines.append(f"  {'=' * 50}")
    ratio("dönen_varlıklar", "kısa_borç",
          "Cari Oran (Donen Varliklar / Kisa Borc)")
    
    dv = extracted.get("dönen_varlıklar")
    st = extracted.get("stok", 0)
    kb = extracted.get("kısa_borç")
    if dv and kb and kb != 0:
        lines.append(f"  {'Asit-Test Oranı ((Donen-Stok) / Kisa Borc)':<45}: {(dv - st) / kb:.2f}")
    else:
        lines.append(f"  {'Asit-Test Orani':<45}: - (veri yetersiz)")
    
    ratio("nakit", "kısa_borç", "Nakit Orani (Nakit / Kisa Borc)")

    lines.append("\n  KARLILIK RASYOLARI")
    lines.append(f"  {'=' * 50}")
    ratio("brüt_kar",       "satış_gelirleri", "Brut Kar Marji (%)",     ".1f", 100)
    ratio("faaliyet_karı",  "satış_gelirleri", "Faaliyet Kar Marji (%)", ".1f", 100)
    ratio("net_kar",        "satış_gelirleri", "Net Kar Marji (%)",      ".1f", 100)
    ratio("net_kar",        "toplam_aktif",    "ROA - Aktif Karliligi (%)", ".1f", 100)
    ratio("net_kar",        "özkaynak",        "ROE - Ozkaynak Karliligi (%)", ".1f", 100)

    lines.append("\n  KALDIRAC (BORCLULUK) RASYOLARI")
    lines.append(f"  {'=' * 50}")
    ratio("toplam_borç",       "toplam_aktif",  "Borc Orani (Toplam Borc / Aktif)")
    ratio("toplam_borç",       "özkaynak",      "Borc/Ozkaynak Orani")
    ratio("uzun_vadeli_borç",  "özkaynak",      "Uzun Vadeli Borc / Ozkaynak")
    
    ta = extracted.get("toplam_aktif")
    oz = extracted.get("özkaynak")
    if ta and oz and oz != 0:
        lines.append(f"  {'Finansal Kaldirac (Aktif / Ozkaynak)':<45}: {ta / oz:.2f}x")

    lines.append("\n  VERİMLİLİK RASYOLARI")
    lines.append(f"  {'=' * 50}")
    ratio("satış_gelirleri", "toplam_aktif",   "Aktif Devir Hizi (Satis / Aktif)")
    ratio("satış_gelirleri", "stok",           "Stok Devir Hizi (Satis / Stok)")

    if extracted:
        lines.append("\n  Kullanilan Ham Veriler (Bin TL)")
        lines.append(f"  {'-' * 50}")
        for k, v in extracted.items():
            lines.append(f"  {k.replace('_', ' ').title():<40}: {v:>20,.0f}")
    else:
        lines.append("\n  (!) Finansal kalemler otomatik cekilemedi.")
        lines.append("      Lutfen get_kap_financial_statements() ile ham veriyi inceleyin.")

    lines.append(f"\n  Kaynak: {url}")
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────
# 5) KAMUYU AYDINLATMA BİLDİRİMLERİ
# ─────────────────────────────────────────────────────────────────

@tool
def get_kap_disclosures(ticker_and_type: str) -> str:
    """
    KAP'tan şirkete ait son bildirimleri çeker.
    Girdi formatı: 'TICKER' veya 'TICKER:TUR'
    Türler: FR=Finansal Rapor, ODA=Özel Durum, DG=Diğer, TUMU=Hepsi
    Örnek: 'THYAO:FR' veya 'BIMAS:ODA' veya 'EREGL'
    """
    parts    = ticker_and_type.strip().upper().split(":")
    ticker   = parts[0].strip()
    bil_type = parts[1].strip() if len(parts) > 1 else "TUMU"

    company = find_company_by_ticker(ticker)
    if not company:
        return f"'{ticker}' kodu için KAP'ta şirket bulunamadı."

    oid = company["member_oid"]

    # ── Bildirim listesi sayfası ───────────────────────────────────
    detail_url = KAP_API["company_summary"].format(member_oid=oid)
    soup = safe_get_html(detail_url)

    lines = [section(f"BILDIRIM: {company['name']} ({ticker}) - KAP Bildirimleri ({bil_type})")]

    # Şirket özet sayfasındaki bildirim tablosunu çek
    found = False
    if soup:
        # Bildirim tablosu genellikle son bildirimler bölümündedir
        disclosure_section = (
            soup.find("div", {"id": re.compile("disclosure|bildirim", re.I)})
            or soup.find("section", string=re.compile("Bildirim|Disclosure", re.I))
        )

        tables = soup.find_all("table")
        for tbl in tables:
            headers = [th.get_text(strip=True).lower() for th in tbl.find_all("th")]
            if any(k in " ".join(headers) for k in ["bildirim", "tarih", "konu", "disclosure"]):
                rows = tbl.find_all("tr")[1:]  # başlık satırını atla
                for row in rows[:15]:
                    cells = row.find_all("td")
                    if len(cells) >= 2:
                        tarih  = cells[0].get_text(strip=True) if len(cells) > 0 else ""
                        konu   = cells[1].get_text(strip=True) if len(cells) > 1 else ""
                        tur    = cells[2].get_text(strip=True) if len(cells) > 2 else ""
                        link_a = row.find("a")
                        href   = link_a["href"] if link_a else ""
                        link   = f"{BASE_URL}{href}" if href.startswith("/") else href

                        # Tür filtresi
                        if bil_type not in ("TUMU", "ALL") and bil_type not in tur.upper():
                            continue

                        lines.append(f"\n  📌 [{tarih}] {konu}")
                        if tur:
                            lines.append(f"     Tür : {tur}")
                        if link:
                            lines.append(f"     Link: {link}")
                        found = True

    if not found:
        # JSON API denemesi
        api_url = f"{BASE_URL}/tr/api/disclosure/member/{oid}/disclosures"
        data = safe_get_json(api_url)
        if isinstance(data, list) and data:
            for item in data[:12]:
                tarih  = item.get("publishDate", item.get("date", ""))[:10]
                konu   = item.get("subject", item.get("title", "Konu yok"))
                tur    = item.get("disclosureClass", item.get("type", ""))
                doc_id = item.get("disclosureIndex", item.get("id", ""))
                link   = f"{BASE_URL}/tr/bildirim/{doc_id}" if doc_id else ""

                if bil_type not in ("TUMU", "ALL") and bil_type not in tur.upper():
                    continue

                lines.append(f"\n  📌 [{tarih}] {konu}")
                lines.append(f"     Tür : {tur}")
                if link:
                    lines.append(f"     Link: {link}")
                found = True

    if not found:
        lines.append(f"\n  Bildirim bulunamadı. Doğrudan KAP'ı ziyaret edin:")
        lines.append(f"  {BASE_URL}/tr/bildirim-sorgu")

    lines.append(f"\n  Kaynak: {detail_url}")
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────
# 6) FİNANSAL RAPORLAR — PDF/XLS LİSTESİ
# ─────────────────────────────────────────────────────────────────

@tool
def get_kap_financial_reports_list(ticker_and_year: str) -> str:
    """
    KAP'ta şirkete ait finansal rapor dosyalarının listesini döner.
    Yıllık, 6 aylık ve 3 aylık raporların PDF/XLS linklerini içerir.
    Girdi: 'TICKER' veya 'TICKER:YIL' (örn. 'SISE:2024')
    """
    parts  = ticker_and_year.strip().upper().split(":")
    ticker = parts[0].strip()
    year   = parts[1].strip() if len(parts) > 1 else str(date.today().year - 1)

    company = find_company_by_ticker(ticker)
    if not company:
        return f"'{ticker}' kodu için şirket bulunamadı."

    oid = company["member_oid"]
    # KAP finansal tablo indirme sayfası
    url = KAP_API["financial_reports"].format(member_oid=oid)
    soup = safe_get_html(url)

    lines = [section(f"📁 {company['name']} ({ticker}) — Finansal Rapor Dosyaları ({year})")]

    if soup:
        # PDF/XLS linkleri
        links_found = 0
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if any(ext in href.lower() for ext in [".pdf", ".xls", ".xlsx", "download", "file"]):
                label = a.get_text(strip=True) or a.get("title", "Dosya")
                if year in label or year in href:
                    full = f"{BASE_URL}{href}" if href.startswith("/") else href
                    lines.append(f"\n  📎 {label}")
                    lines.append(f"     {full}")
                    links_found += 1

        if links_found == 0:
            # Tüm dosyaları listele (yıl filtresi olmadan)
            for a in soup.find_all("a", href=True)[:20]:
                href = a["href"]
                if any(ext in href.lower() for ext in [".pdf", ".xls", "download"]):
                    label = a.get_text(strip=True) or "Dosya"
                    full  = f"{BASE_URL}{href}" if href.startswith("/") else href
                    lines.append(f"\n  📎 {label}")
                    lines.append(f"     {full}")
                    links_found += 1

        if links_found == 0:
            lines.append("  Dosya bulunamadı. Lütfen KAP sayfasını manuel inceleyin.")

    lines.append(f"\n  KAP Finansal Tablo Sayfası: {url}")
    lines.append(f"  Genel Finansal Bilgiler   : {BASE_URL}/tr/sirket-finansal-bilgileri/{oid}")
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────
# 7) TAM ANALİZ — Tüm Tool'ları Birleştirir
# ─────────────────────────────────────────────────────────────────

@tool
def get_kap_full_analysis(ticker_and_year: str) -> str:
    """
    Belirtilen BIST şirketinin KAP'taki tüm finansal verilerini
    tek rapor halinde derler:
      • Şirket genel bilgileri
      • Finansal tablolar (bilanço, gelir, nakit akışı)
      • Hesaplanmış finansal rasyolar
      • Son KAP bildirimleri
      • Finansal rapor dosya linkleri

    Girdi: 'TICKER' veya 'TICKER:YIL'
    Örnek: 'BIMAS' veya 'THYAO:2024'
    """
    parts  = ticker_and_year.strip().upper().split(":")
    ticker = parts[0].strip()
    year   = parts[1].strip() if len(parts) > 1 else str(date.today().year - 1)

    header = (
        f"\n{'#' * 60}\n"
        f"  KAP TAM FINANSAL ANALIZ RAPORU\n"
        f"  Sirket : {ticker}  |  Donem : {year}\n"
        f"  Tarih  : {datetime.now().strftime('%d.%m.%Y %H:%M')}\n"
        f"{'#' * 60}\n"
    )

    steps = [
        ("Şirket Bilgileri",        lambda: get_kap_company_info.invoke(ticker)),
        ("Finansal Tablolar",       lambda: get_kap_financial_statements.invoke(f"{ticker}:{year}")),
        ("Finansal Rasyolar",       lambda: get_kap_financial_ratios.invoke(ticker)),
        ("KAP Bildirimleri (FR)",   lambda: get_kap_disclosures.invoke(f"{ticker}:FR")),
        ("Finansal Rapor Dosyaları",lambda: get_kap_financial_reports_list.invoke(f"{ticker}:{year}")),
    ]

    sections = [header]
    for name, fn in steps:
        print(f"  -> {name} cekiliyor...")
        try:
            result = fn()
            sections.append(result)
        except Exception as e:
            sections.append(f"\n[HATA — {name}]: {e}")
        time.sleep(0.8)  # Rate-limit önlemi

    sections.append(
        f"\n{'─' * 60}\n"
        f"  ⚠️  NOT: KAP verileri halka açık olup gecikmeli güncellenebilir.\n"
        f"  Anlık veriler için: {BASE_URL}/tr/bist-sirketler\n"
        f"{'─' * 60}"
    )

    return "\n\n".join(sections)


# ─────────────────────────────────────────────────────────────────
# 8) BIST ŞİRKET LİSTESİ
# ─────────────────────────────────────────────────────────────────

@tool
def get_bist_company_list(sector_filter: str = "") -> str:
    """
    KAP'taki tüm BIST şirketlerini listeler.
    İsteğe bağlı sektör filtresi uygulanabilir.
    Girdi: Sektör adı (boş bırakılırsa tüm şirketler).
    Çıktı: Ticker, şirket adı, şehir bilgileri.
    """
    data = safe_get_json(KAP_API["company_list"])
    lines = [section("🏦 BIST Şirket Listesi (KAP)")]

    if isinstance(data, list) and data:
        count = 0
        for c in data:
            name   = c.get("title") or c.get("memberTitle", "")
            code   = (c.get("memberCode") or c.get("ticker", "")).upper()
            city   = c.get("city", "")
            sector = c.get("sector") or c.get("industry", "")

            if sector_filter and sector_filter.lower() not in (name + sector).lower():
                continue

            lines.append(f"  {code:<8} {name:<50} {city:<15} {sector}")
            count += 1

        lines.append(f"\n  Toplam: {count} şirket")
    else:
        # Yedek: HTML tablo
        soup = safe_get_html(KAP_API["bist_companies"])
        if soup:
            rows = soup.select("table tr")[1:]
            count = 0
            for row in rows:
                cells = row.find_all("td")
                if len(cells) >= 2:
                    code = cells[0].get_text(strip=True).upper()
                    name = cells[1].get_text(strip=True) if len(cells) > 1 else ""
                    city = cells[2].get_text(strip=True) if len(cells) > 2 else ""
                    if sector_filter and sector_filter.lower() not in (name + city).lower():
                        continue
                    lines.append(f"  {code:<8} {name:<50} {city}")
                    count += 1
            lines.append(f"\n  Toplam: {count} şirket")
        else:
            lines.append("  Şirket listesi çekilemedi.")

    lines.append(f"\n  Kaynak: {KAP_API['bist_companies']}")
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────
# TEST & DEMO
# ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    ticker = sys.argv[1] if len(sys.argv) > 1 else "BIMAS"

    print("=" * 60)
    print(f"  KAP Finansal Analiz Tool — Test: {ticker}")
    print("=" * 60)

    # Hızlı test: sadece şirket bilgisi ve rasyolar
    print(get_kap_company_info.invoke(ticker))
    print(get_kap_financial_ratios.invoke(ticker))
    print(get_kap_disclosures.invoke(f"{ticker}:FR"))

    # Tam analiz (daha yavaş):
    # print(get_kap_full_analysis.invoke(ticker))