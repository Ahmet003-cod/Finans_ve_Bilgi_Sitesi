import requests
from bs4 import BeautifulSoup
from langchain.tools import tool
from tools.search_tool import search

@tool
def get_company_analysis(ticker: str) -> str:
    """
    Bir şirketin mali tablolarını, rasyolarını (F/K, PD/DD) ve aracı kurum analizlerini getirir.
    Örn: 'TUPRS', 'THYAO'
    """
    query = f"{ticker} hisse temel analiz mali tablolar yorumu halk yatırım iş yatırım"
    return search.run(query)

@tool
def get_kap_analysis(ticker: str) -> str:
    """
    Şirketin KAP (Kamuyu Aydınlatma Platformu) üzerindeki son bildirimlerini ve temettü/bedelsiz gibi önemli haberlerini analiz eder.
    """
    query = f"site:kap.org.tr {ticker} son bildirimler temettü bedelsiz"
    return search.run(query)
