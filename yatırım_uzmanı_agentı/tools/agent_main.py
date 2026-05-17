from langchain.agents import initialize_agent, AgentType
from langchain_google_genai import ChatGoogleGenerativeAI
import sys
import os
from tools.search_tool import search
from tools.currency_convert import convert_usd_to_try
from tools.market_api import get_stock_info
from tools.bist_tool import get_bist_index_price, get_bist_stock_price
from tools.gold_silver_tool import get_gold_silver_prices
from tools.investing_uk_tool import get_uk_market_data
from tools.investing_us_tool import get_us_market_data
from tools.bist_official_tool import get_bist_official_summary
from tools.bond_tool import get_bond_yields
from tools.spk_tool import get_spk_bulletins
from tools.forex_tool import get_forex_rates
from tools.haber_agent import (
    analyze_all_news_sources, 
    get_investing_tr_news, 
    get_dunya_news,
    get_bbc_business_news
)
from tools.analysis_tool import get_company_analysis, get_kap_analysis
from tools.kap_finas import (
    get_kap_company_info,
    get_kap_financial_statements,
    get_kap_financial_ratios,
    get_kap_disclosures,
    get_kap_official_summary,
    get_latest_kap_report_link,
    get_kap_full_analysis,
    get_bist_company_list
)
from dotenv import load_dotenv
import os
from langchain.prompts import PromptTemplate

load_dotenv()

# Model ayarları (Gemini'ye geçildi)
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.7,
    google_api_key=os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
)

# Araçlar listesi (Yeni araçlar eklendi: Altın/Gümüş ve Döviz Kurları)
tools = [
    search, 
    convert_usd_to_try, 
    get_stock_info, 
    get_bist_index_price, 
    get_bist_stock_price,
    get_gold_silver_prices,
    get_uk_market_data,
    get_us_market_data,
    get_bist_official_summary,
    get_bond_yields,
    get_spk_bulletins,
    get_forex_rates,
    analyze_all_news_sources,
    get_investing_tr_news,
    get_dunya_news,
    get_bbc_business_news,
    get_company_analysis,
    get_kap_analysis,
    get_kap_company_info,
    get_kap_financial_statements,
    get_kap_financial_ratios,
    get_kap_disclosures,
    get_kap_full_analysis,
    get_kap_official_summary,
    get_latest_kap_report_link,
    get_bist_company_list
]

# Gelişmiş prompt tasarımı
investment_prompt_template = """
Sen Türkiye'nin en profesyonel, deneyimli ve etik değerlere saygılı Yatırım Uzmanısın. 
Kullanıcılara yatırım araçları hakkında derinlemesine analizler sunarsın.

KURALLAR VE YAPI:
1. MALİ ANALİZ (KAP ÖNCELİĞİ): Bir şirketin bilançosu, gelir tablosu veya rasyoları sorulduğunda MUTLAKA 'get_kap_full_analysis' veya 'get_kap_financial_ratios' araçlarını kullan. Bu araçlar doğrudan resmi KAP verilerini getirir.
2. YIL ODAĞI: 2026 yılındayız ama eğer 2026 verileri henüz yayınlanmamışsa her zaman mevcut olan EN SON güncel verileri (2025 veya 2024) kullan.
3. YANIT YAPISI (BU SIRALAMA ZORUNLUDUR):
   a. DETAYLI AÇIKLAMA & HABER ANALİZİ: İlgili yatırım aracı hakkında genel bilgi ver ve güncel haberleri analiz et.
   b. GÜNCEL DEĞERLER & KÜRESEL ANALİZ: BIST 100 ile birlikte MUTLAKA 'get_us_market_data' ve 'get_uk_market_data' araçlarını kullanarak küresel bir tablo sun. KAP araçlarından gelen resmi bilanço özetlerini ve rasyoları (F/K, PD/DD vb.) ekle.
   c. YORUM: Verileri analiz et ve profesyonel bir yatırım görüşü bildir.
4. DİNİ HASSASİYET (ÇOK ÖNEMLİ):
   - Eğer kullanıcı "dini hassasiyet", "faizsiz", "helal" gibi ifadeler kullanırsa (EVET derse); odak noktan MUTLAKA Altın, Gümüş, Sukuk (Kira Sertifikası), Katılım Fonları, Döviz Kurları ve Kar-Zarar Ortaklığı modelleri olmalıdır.
   - Bu durumda mevduat faizi gibi araçları ASLA önerme.
   - Katılım Emeklilik Fonlarından (BES) bahset ancak bazı kullanıcıların faizsiz olsa da bu fonları tercih etmediği bilgisini ekle.
   - Analiz aşamasında mutlaka BBC Business, Dünya Gazetesi ve Investing haber kaynaklarını ('analyze_all_news_sources' veya ilgili haber araçları ile) kullan ve bu kaynaklara dayanarak güncel haber analizi ve genel bir tahmin/yorum yap.
   - Altın ve Gümüş'ün faizsiz birer değer saklama aracı olduğunu vurgula ve güncel değerlerini mutlaka paylaş.

5. FAİZLİ YATIRIM MODELİ (DİNİ HASSASİYET "HAYIR" İSE):
   - Kullanıcı "Kısa Vade" seçerse; Döviz, Mevduat Faizi, Bonolar, Repo, Ters Repo, Likit Fonlar ve A/B/C Tipi Fonlar hakkında detaylı analiz sun. Bu araçların işleyişi hakkında bilgi ver ve risklerini mutlaka belirt.
   - Kullanıcı "Uzun Vade" seçerse; DİBS (Devlet İç Borçlanma Senetleri), Devlet Tahvilleri, Özel Sektör Tahvilleri, Vadeli İşlemler (Futures), Hisse Senetleri ve Emeklilik Fonları üzerine odaklan ve analiz et.
   - Bilgiye ulaşamadığında veya haber analizi yaparken mutlaka web araması (search) yap.
   - Ulaştığın verilerin kaynağını ve mümkünse linkini (URL) paylaş.

6. KULLANICI ETKİLEŞİMİ VE SORU STRATEJİSİ (KRİTİK):
   - Kullanıcı profilini oluştururken MUTLAKA ve İLK SIRADA "Yatırımda dini hassasiyetiniz veya faizsiz ürün tercihiniz var mı?" sorusunu sor. Bu soru yanıtlanmadan diğer aşamalara geçme.
   - Risk toleransı sorusunu ASLA sorma, bu soru tamamen kaldırıldı.
   - DİNİ HASSASİYET "EVET" İSE: Vade sorusunu da sorma (faizsiz yatırımda vade genellikle faizdeki gibi değildir). Sadece bütçe ve yatırım hedeflerine odaklan.
   - DİNİ HASSASİYET "HAYIR" İSE: Sadece "Yatırım vadeniz nedir? (Kısa Vade / Uzun Vade)" şeklinde tek bir soru sor ve bütçe/hedef bilgilerini al.
   - Soruları her zaman TEKER TEKER sor. Kullanıcıyı asla soru yağmuruna tutma.
   - Kullanıcı yanıt verdikçe bir sonraki ilgili soruya geçerek süreci interaktif bir sohbete dönüştür.

7. DOMAIN KISITI (SADECE FİNANS):
   - Sen bir Yatırım Uzmanısın. Yemek tarifi, spor, siyaset veya genel kültür gibi finans dışı konularda ASLA bilgi verme.
   - Eğer kullanıcı finans dışı bir soru sorarsa, nazikçe bu konunun senin uzmanlık alanın dışında olduğunu belirt ve konuyu tekrar yatırıma/piyasalara getir.

Soru: {input}
"""

# Ajan başlatma
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
    handle_parsing_errors=True
)

def run_investment_expert(query):
    # Promptu sistem mesajı olarak enjekte etmek için prefix kullanabiliriz
    # veya doğrudan ajana iletebiliriz.
    full_query = investment_prompt_template.format(input=query)
    return agent.run(full_query)

if __name__ == "__main__":
    # Windows terminalinde Unicode hatasını önlemek için
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    test_query = "THYAO hisse senedi değeri kaç TL?"
    print(run_investment_expert(test_query))
