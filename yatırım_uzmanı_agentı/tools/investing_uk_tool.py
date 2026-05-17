import requests
from bs4 import BeautifulSoup
import re
from langchain.tools import tool

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

@tool
def get_uk_market_data(query: str = "") -> str:
    """Birleşik Krallık (UK) borsası (FTSE 100, FTSE 250 vb.) verilerini Yahoo Finance üzerinden çeker."""
    indices = {
        "FTSE 100": "^FTSE",
        "FTSE 250": "^FTMC",
        "FTSE All-Share": "^FTAS"
    }
    
    lines = ["=== Birlesik Krallik (UK) Borsa Verileri (Yahoo Finance) ==="]
    
    try:
        for name, ticker in indices.items():
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range=1d"
            res = requests.get(url, headers=HEADERS, timeout=10)
            if res.ok:
                data = res.json()
                meta = data["chart"]["result"][0]["meta"]
                price = meta.get("regularMarketPrice")
                prev_close = meta.get("previousClose") or meta.get("chartPreviousClose")
                
                if price and prev_close:
                    change = price - prev_close
                    change_pct = (change / prev_close) * 100
                    status = "Yukselis" if change > 0 else "Dusus"
                    lines.append(f"{name}: {price:,.2f} | Degisim: {change:+.2f} ({change_pct:+.2f}%) | {status}")
                elif price:
                    lines.append(f"{name}: {price:,.2f} | Degisim verisi alinamadi.")
                else:
                    lines.append(f"{name}: Fiyat verisi alinamadi.")
            else:
                lines.append(f"{name}: Veri alinamadi.")
        
        return "\n".join(lines)
    except Exception as e:
        return f"UK veri hatasi: {str(e)}"

if __name__ == "__main__":
    print(get_uk_market_data.invoke(""))
