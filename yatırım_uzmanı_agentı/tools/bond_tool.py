import requests
from bs4 import BeautifulSoup
from langchain.tools import tool

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

@tool
def get_bond_yields(query: str = "") -> str:
    """Turkiye (DIBS) ve ABD (US Treasury) tahvil faizlerini (2 yillik, 10 yillik vb.) getirir."""
    lines = ["=== Tahvil ve DIBS Faizleri (Guncel) ==="]
    
    # -- 1. Turkiye DIBS (Bigpara Fallback or Yahoo) --
    try:
        # Yahoo Finance Tickers for Bonds (Some are harder to get via free API)
        # We can try to scrape a summary page or use known tickers
        bonds = {
            "ABD 10 Yillik": "^TNX",
            "ABD 2 Yillik": "^IRX", # 13-week bill as proxy or ^ZYZ (not standard)
            "ABD 5 Yillik": "^FVX"
        }
        
        for name, ticker in bonds.items():
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range=1d"
            res = requests.get(url, headers=HEADERS, timeout=10)
            if res.ok:
                data = res.json()
                price = data["chart"]["result"][0]["meta"]["regularMarketPrice"]
                # Yahoo bond prices are usually yields (e.g., 4.25 means 4.25%)
                lines.append(f"{name}: %{price:.2f}")

        # Turkiye 2Y and 10Y (Bigpara scrape)
        url_tr = "https://bigpara.hurriyet.com.tr/tahvil/"
        res_tr = requests.get(url_tr, headers=HEADERS, timeout=10)
        if res_tr.ok:
            soup = BeautifulSoup(res_tr.text, "html.parser")
            # Bigpara tahvil tablosu genellikle 'li' veya 'tr' icinde olur
            items = soup.select("li, tr, .tahvilRow")
            for item in items:
                text = item.get_text().upper()
                if "TÜRKİYE 10 Y" in text or "TR 10Y" in text:
                    val = item.get_text(strip=True, separator=" ").replace("TÜRKİYE 10 YILLIK TAHVİL", "").strip()
                    lines.append(f"Turkiye 10 Yillik Tahvil: %{val}")
                    break
            for item in items:
                text = item.get_text().upper()
                if "TÜRKİYE 2 Y" in text or "TR 2Y" in text:
                    val = item.get_text(strip=True, separator=" ").replace("TÜRKİYE 2 YILLIK TAHVİL", "").strip()
                    lines.append(f"Turkiye 2 Yillik Tahvil: %{val}")
                    break

        if len(lines) <= 1:
            return "Tahvil verileri su an cekilemedi."

        return "\n".join(lines)
    except Exception as e:
        return f"Tahvil verisi hatasi: {str(e)}"

if __name__ == "__main__":
    print(get_bond_yields.invoke(""))
