# Finans + AI Dashboard

Koyu tema destekli, dashboard tarzinda bir ekonomi ve yapay zeka haber portalidir.

## Ozellikler

- Canli piyasa kartlari: Altin, USD/TRY, EUR/TRY, BIST 100, BIST 50
- TUFE/UFE gosterimi (son 2 ay) - grafik paneli
- Ekonomik takvim bolumu (Fed ve kritik olaylar)
- RSS tabanli AI / teknoloji haber akisi
- "Hoca Savar" analiz sekmesi (sinav odakli yorum)
- Veriler istemci tarafinda her 1 dakikada bir yenilenir

## Kullanilan Teknolojiler

- Next.js (App Router)
- Tailwind CSS
- lucide-react
- cheerio (scraping)
- rss-parser (haber)
- OpenAI API (opsiyonel AI ozet)

## Kurulum

```bash
npm install
npm run dev
```

Tarayicidan `http://localhost:3000` adresini ac.

## Ortam Degiskenleri

`.env.local` dosyasi olusturup asagidaki degiskenleri tanimlayabilirsin:

```bash
OPENAI_API_KEY=...
COLLECTAPI_KEY=...
```

- `OPENAI_API_KEY` yoksa uygulama yerel kurallarla ozet uretir.
- `COLLECTAPI_KEY` yoksa TUFE/UFE tarafi fallback veriye doner.

## API Uclari

- `GET /api/market`
- `GET /api/tuik`
- `GET /api/calendar`
- `GET /api/news`
- `POST /api/highlights`
