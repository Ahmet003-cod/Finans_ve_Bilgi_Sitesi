from langchain_community.tools import DuckDuckGoSearchResults
from langchain.tools import tool

# DuckDuckGo arama motorunun bir örneğini oluştur (Sonuçları ve linkleri getiren versiyon)
_search = DuckDuckGoSearchResults()

@tool
def search(query: str) -> str:
    """
    Web üzerinde arama yapar. Güncel haberler, piyasa yorumları ve genel bilgiler için kullanılır.
    Sonuçlar başlık, içerik ve kaynak linki içerir.
    """
    try:
        return _search.run(query)
    except Exception as e:
        return f"Arama sırasında bir hata oluştu: {str(e)}"

if __name__ == "__main__":
    query = "altın gümüş katılım fonları haberleri"
    result = search.run(query)
    print(f"Arama sonucu:\n{result}")