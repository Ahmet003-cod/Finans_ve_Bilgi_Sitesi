import requests
from bs4 import BeautifulSoup
from langchain.tools import tool

@tool
def get_forex_rates(query: str = "döviz kurları") -> str:
    """
    USD, EUR ve GBP gibi temel döviz kurlarının Türk Lirası karşısındaki güncel alış ve satış fiyatlarını çeker.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }
    
    try:
        url = "https://www.doviz.com/"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            return "Döviz kurları şu an alınamıyor (HTTP Hatası)."

        soup = BeautifulSoup(response.text, "html.parser")
        
        # doviz.com ana sayfasındaki kur kutularını çekelim
        # Genellikle <div class="item" data-type="currency"> içinde bulunurlar
        items = soup.find_all("div", {"class": "item"})
        
        result = "Güncel Döviz Kurları (TRY):\n"
        found = False
        
        for item in items:
            name_tag = item.find("span", {"class": "name"})
            value_tag = item.find("span", {"class": "value"})
            
            if name_tag and value_tag:
                name = name_tag.text.strip()
                value = value_tag.text.strip()
                
                if name in ["DOLAR", "EURO", "STERLİN"]:
                    result += f"- {name}: {value} TL\n"
                    found = True
        
        if not found:
            return "Döviz kurları çekilemedi, lütfen web aramasını (search) kullanın."

        result += "\nKaynak: doviz.com"
        return result

    except Exception as e:
        return f"Döviz kurları çekilirken bir hata oluştu: {str(e)}"

if __name__ == "__main__":
    print(get_forex_rates())
