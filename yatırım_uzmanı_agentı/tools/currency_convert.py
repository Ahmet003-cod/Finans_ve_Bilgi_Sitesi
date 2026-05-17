from typing import Union
from langchain_core.tools import tool
import requests


@tool
def convert_usd_to_try(amount: Union[float, str]) -> str:
    """Verilen USD miktarını CoinGecko API üzerinden güncel kur ile Türk Lirası'na çevirir."""

    # String gelirse sayısal olmayanları temizle ("100 usd" → 100.0)
    if isinstance(amount, str):
        amount = float("".join(filter(lambda c: c.isdigit() or c == ".", amount)))

    # CoinGecko: tether (USDT ≈ 1 USD) fiyatını TRY cinsinden al
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {
        "ids": "tether",          # USDT ≈ 1 USD
        "vs_currencies": "try"    # TRY cinsinden fiyat
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        try_rate = data["tether"]["try"]

        result = amount * try_rate

        return (
            f"{amount:.2f} USD = {result:.2f} TRY\n"
            f"Güncel kur: 1 USD ≈ {try_rate:.4f} TRY\n"
            f"(Kaynak: CoinGecko - USDT/TRY)"
        )

    except requests.exceptions.RequestException as e:
        return f"API isteği başarısız oldu: {str(e)}"
    except KeyError:
        return "API yanıtında TRY kuru bulunamadı."
    except ValueError as e:
        return f"Geçersiz miktar değeri: {str(e)}"


# --- TEST SENARYOLARI ---
if __name__ == "__main__":
    tests = [
        ("Normal float", {"amount": 100}),
        ("String input '250 usd'", {"amount": "250 usd"}),
        ("Küçük miktar", {"amount": 1}),
        ("Büyük miktar", {"amount": 10000}),
    ]

    for name, args in tests:
        print(f"\n{'='*40}")
        print(f"TEST: {name}")
        print(convert_usd_to_try.invoke(args))
    print("=" * 40)