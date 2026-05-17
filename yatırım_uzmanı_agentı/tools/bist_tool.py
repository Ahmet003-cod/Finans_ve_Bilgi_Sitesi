import requests
from bs4 import BeautifulSoup
from langchain.tools import tool

@tool
def get_bist_index_price(index_code: str = "XU100") -> str:
    """
    Borsa İstanbul endekslerinin (örn: XU100, XU500, XU030) güncel puanını çeker.
    """
    index_code = index_code.upper().replace("BIST", "").strip()
    if not index_code.startswith("XU"):
        if index_code == "100": index_code = "XU100"
        elif index_code == "500": index_code = "XU500"
        elif index_code == "30": index_code = "XU030"
        else: index_code = f"XU{index_code}"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    }

    # Yahoo Finance API (En stabil)
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{index_code}.IS"
        params = {"interval": "1d", "range": "1d"}
        res = requests.get(url, headers=headers, params=params, timeout=10)
        if res.status_code == 200:
            data = res.json()
            price = data["chart"]["result"][0]["meta"]["regularMarketPrice"]
            return f"BIST {index_code.replace('XU', '')} Endeksi (Yahoo Finance): {price:,.2f} Puan"
    except Exception as e:
        print(f"[Yahoo Finance {index_code} hatasi] {e}")

    return f"X {index_code} endeks verisi alinamadi."

@tool
def get_bist_stock_price(ticker: str) -> str:
    """
    Borsa İstanbul'da işlem gören bir hisse senedinin (örn: THYAO, ASELS, EREGL) 
    güncel fiyatını ve günlük değişimini getirir.
    """
    ticker = ticker.upper().replace(".IS", "")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/124.0.0.0 Safari/537.36",
    }

    # -- 1. Kaynak: Yahoo Finance (En stabil) --
    try:
        yahoo_ticker = f"{ticker}.IS"
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{yahoo_ticker}"
        params = {"interval": "1d", "range": "1d"}
        res = requests.get(url, headers=headers, params=params, timeout=10)
        if res.status_code == 200:
            data = res.json()
            result = data["chart"]["result"][0]
            price = result["meta"].get("regularMarketPrice")
            prev_close = result["meta"].get("previousClose") or result["meta"].get("chartPreviousClose")
            
            if price is None:
                return f"X {ticker} fiyat verisi alinamadi."
            
            if prev_close:
                change = price - prev_close
                change_pct = (change / prev_close) * 100
                change_str = f"%{change_pct:+.2f} ({change:+.2f} TL)"
            else:
                change_str = "Veri yok"
            
            return (
                f"{ticker} Hisse Bilgisi (Yahoo Finance):\n"
                f"- Güncel Fiyat: {price:,.2f} TL\n"
                f"- Günlük Değişim: {change_str}\n"
                f"- Önceki Kapaniş: {prev_close:,.2f} TL" if prev_close else ""
            )
    except Exception as e:
        print(f"[Yahoo Finance {ticker} hatasi] {e}")

    # -- 2. Kaynak: Bigpara (Fallback) --
    try:
        url = f"https://bigpara.hurriyet.com.tr/borsa/hisse-fiyatlari/{ticker}-detay/"
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, "html.parser")
            price_tag = soup.find("span", {"id": "lastPrice"}) or soup.find("div", {"class": "priceTxt"})
            if price_tag:
                return f"{ticker} Hisse Bilgisi (Bigpara): {price_tag.text.strip()} TL"
    except Exception as e:
        print(f"[Bigpara {ticker} hatasi] {e}")

    return f"X {ticker} hisse senedi verisi alinamadi. Lütfen sembolün dogrulugunu kontrol edin (Örn: THYAO)."


if __name__ == "__main__":
    print(get_bist_index_price.invoke("XU100"))
    print("-" * 30)
    print(get_bist_stock_price("THYAO"))