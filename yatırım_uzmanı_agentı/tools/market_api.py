"""
finhub api key ile hisse senetleri bilgilerini alalım

"""
from langchain.tools import tool#langchainin agennt sistemşnde kullanılacak fonksiyonları tanımlamak için kullnaılan tool dekoratoru
import requests #http istekleri için kullnıla kütüphane
import os
from dotenv import load_dotenv

load_dotenv() #.env dosyasindaki api key erişmek için kullnılır

@tool# langchaini kullanarak bu fonnksiyonu ulaşır
def get_stock_info(ticker:str)-> str:
    """
    bir hisse sendei sembolü için güncel fiyat örneği döner
    ticker=hisse sendinin sembolü
    outpu:
    istediğimiz çıktıyı sağlama
    
    """
    try:
        #.env dosyasında api key anahtrını al
        api_key=os.getenv("FİNNHUP_APİ_KEY")
        #eğer api anahtari yoksa şu hatay mesajısnı versin
        if not api_key:
            return "Api key anahtarı bullunamadı veya okunamadı"
        
        #finhub sitesinde belirli bir bilgileri almak için bir url tanimla
        url=f"https://finnhub.io/api/v1/quote?symbol={ticker}&token={api_key}"

        #Apiye get istedği gönder
        response=requests.get(url)
        #eğr istek başarısız ise 403,404,500
        if response.status_code!=200:
            return f" Api Hatasi={response.status_code}"
        
        #apiden gelen yaniti çöz
        data=response.json()
        #json içinden gelen güncel fiyatı (c) ,aciliş fiyatı (o) ,en düşük fiyatı(I)
        current=data.get("c")#current price
        open_=data.get("o")#opening price 
        high=data.get("h")#days high price
        low=data.get("l")# days low price

        return (
            f"{ticker} hisse bilgisi :\n"
            f"- Güncel Fiyatı={current} USD\n"
            f"Açılışı:{open_} USD \n"
            f"Gün İçin En yüksek:{high} USD\n"
            f"Gün içi en düşük fiyat {low} USD"
        )
    except Exception as e:
        return f"Hata oluştu:{e}"
    
if __name__=="__name__":
    print(get_stock_info({"ticker":"GOOGL"}))



        

