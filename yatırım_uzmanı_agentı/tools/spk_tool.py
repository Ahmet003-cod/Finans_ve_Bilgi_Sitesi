import requests
from bs4 import BeautifulSoup
from langchain.tools import tool

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

@tool
def get_spk_bulletins(query: str = "") -> str:
    """SPK (Sermaye Piyasasi Kurulu) resmi web sitesinden en guncel bultenleri ve duyurulari çeker."""
    base_url = "https://spk.gov.tr"
    bulletins_url = f"{base_url}/bultenler"
    announcements_url = f"{base_url}/duyurular"
    
    lines = ["=== SPK Resmi Duyurular ve Bultenler ==="]
    
    # 1. Bultenleri Cek
    try:
        res_b = requests.get(bulletins_url, headers=HEADERS, timeout=15, verify=False)
        if res_b.ok:
            soup_b = BeautifulSoup(res_b.text, "html.parser")
            # SPK sitesinde bultenler genellikle bir liste veya tablo icindedir
            # 'list-group-item' veya benzeri siniflari tasiyor olabilirler
            bulten_links = soup_b.select("a[href*='/bultenler/']")
            lines.append("\nGuncel SPK Bultenleri:")
            seen = set()
            for link in bulten_links[:5]:
                text = link.get_text(strip=True)
                href = link.get("href")
                if text and text not in seen:
                    full_url = f"{base_url}{href}" if href.startswith("/") else href
                    lines.append(f"- {text} ({full_url})")
                    seen.add(text)
    except Exception as e:
        lines.append(f"SPK Bulten hatasi: {str(e)}")

    # 2. Duyurulari Cek
    try:
        res_d = requests.get(announcements_url, headers=HEADERS, timeout=15, verify=False)
        if res_d.ok:
            soup_d = BeautifulSoup(res_d.text, "html.parser")
            duyuru_links = soup_d.select("a[href*='/duyurular/']")
            lines.append("\nGuncel SPK Duyurulari:")
            seen_d = set()
            for link in duyuru_links[:5]:
                text = link.get_text(strip=True)
                href = link.get("href")
                if text and text not in seen_d:
                    full_url = f"{base_url}{href}" if href.startswith("/") else href
                    lines.append(f"- {text} ({full_url})")
                    seen_d.add(text)
    except Exception as e:
        lines.append(f"SPK Duyuru hatasi: {str(e)}")

    if len(lines) <= 2:
        return "SPK verileri su an cekilemedi. Lutfen siteyi manuel kontrol edin: " + base_url

    return "\n".join(lines)

if __name__ == "__main__":
    print(get_spk_bulletins.invoke(""))
