import requests
import json

url = "https://www.kap.org.tr/tr/api/sirket-finansal-bilgileri"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Content-Type": "application/json",
    "Accept": "application/json"
}
payload = {"mkkMemberOid": "1105"}

try:
    response = requests.post(url, headers=headers, json=payload, timeout=15)
    print(f"Status: {response.status_code}")
    if response.ok:
        data = response.json()
        # Print top level keys or a sample
        print("Keys:", data.keys() if isinstance(data, dict) else "List response")
        with open("kap_response_sample.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("Response saved to kap_response_sample.json")
    else:
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
