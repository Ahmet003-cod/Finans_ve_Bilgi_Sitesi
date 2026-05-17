import requests
from bs4 import BeautifulSoup
from langchain.tools import tool

@tool
def get_gold_silver_prices(query: str = "altın gümüş") -> str:
    """
    Türkiye piyasasındaki (Kapalıçarşı/Serbest Piyasa) güncel Altın ve Gümüş fiyatlarını çeker.
    Gram Altın, Çeyrek Altın, Tam Altın ve Gümüş (Gram) fiyatlarını içerir.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }
    
    try:
        # Altin.in veya doviz.com üzerinden çekilebilir. Burada doviz.com örneği:
        url = "https://www.doviz.com/altin"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            return "Altın/Gümüş fiyatları şu an alınamıyor (HTTP Hatası)."

        soup = BeautifulSoup(response.text, "html.parser")
        
        # doviz.com üzerinde altın fiyatları genellikle tablolarda veya kartlarda bulunur
        # Örnek bir veri çekme mantığı (Sitenin yapısına göre güncellenebilir):
        items = soup.find_all("div", {"class": "item"})
        
        result = "Güncel Altın ve Gümüş Fiyatları (Kapalıçarşı/Serbest Piyasa):\n"
        found = False
        
        for item in items:
            name_tag = item.find("span", {"class": "name"})
            value_tag = item.find("span", {"class": "value"})
            
            if name_tag and value_tag:
                name = name_tag.text.strip()
                value = value_tag.text.strip()
                
                if any(x in name.lower() for x in ["gram altın", "çeyrek", "yarım", "tam", "cumhuriyet", "gümüş"]):
                    result += f"- {name}: {value} TL\n"
                    found = True
        
        if not found:
            # Yedek kaynak veya alternatif seçici (Sitede yapı değişmişse)
            # Genellikle ana sayfada da bulunur
            return "Altın fiyatları çekilemedi, lütfen web aramasını (search) kullanın."

        result += "\nKaynak: doviz.com"
        return result

    except Exception as e:
        return f"Altın/Gümüş verisi çekilirken bir hata oluştu: {str(e)}"

if __name__ == "__main__":
    print(get_gold_silver_prices())
