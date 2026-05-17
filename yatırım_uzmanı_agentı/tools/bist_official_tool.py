import requests
from bs4 import BeautifulSoup
from langchain.tools import tool

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

@tool
def get_bist_official_summary(query: str = "") -> str:
    """Borsa İstanbul (BIST) resmi web sitesinden (borsaistanbul.com) günlük özet verileri çeker."""
    url = "https://www.borsaistanbul.com/tr/"
    try:
        res = requests.get(url, headers=HEADERS, timeout=15)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")
        
        lines = ["=== Borsa Istanbul Resmi Ozeti ==="]
        
        # Borsa İstanbul anasayfasında genellikle 'p-header__indices' veya benzeri sınıflarda veriler olur
        # Ancak dinamik yapı nedeniyle en garantisi tablo veya liste taramak
        indices = soup.select(".index-item, .p-header__indices-item, .market-summary-item")
        
        if not indices:
            # Alternatif: Sayfadaki tüm sayısal değer içeren ve başlığı olan divleri bul
            for item in soup.find_all("div", class_=lambda x: x and "index" in x.lower()):
                text = item.get_text(strip=True, separator=" ")
                if any(kw in text.upper() for kw in ["BIST", "ENDEKS", "FIYAT"]):
                    lines.append(text)
        else:
            for item in indices:
                lines.append(item.get_text(strip=True, separator=" "))

        if len(lines) <= 1:
            # Fallback: Haberler veya duyurular kısmından başlıkları al
            news = soup.select(".p-news__item-title, .news-title")
            if news:
                lines.append("\nSon Duyurular:")
                for n in news[:5]:
                    lines.append(f"- {n.get_text(strip=True)}")
            else:
                return "Borsa Istanbul sitesinden veri su an cekilemedi. Site yapisi degismis olabilir."

        return "\n".join(lines)
    except Exception as e:
        return f"Borsa Istanbul resmi site hatasi: {str(e)}"

if __name__ == "__main__":
    print(get_bist_official_summary.invoke(""))
