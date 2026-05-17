import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { takeRateLimit } from "@/lib/security";

type Payload = {
  market: Array<{ label: string; price: number }>;
  inflation: Array<{ month: string; tufe: number; ufe: number }>;
  calendar: Array<{ title: string; date: string }>;
};

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const rate = takeRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Cok fazla istek gonderildi. Lutfen 1 dakika sonra tekrar dene." },
      { status: 429 },
    );
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Gecersiz JSON payload." }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json({ error: "Eksik veya gecersiz alanlar var." }, { status: 400 });
  }

  const quickFallback = buildFallback(body);
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!geminiApiKey) {
    return NextResponse.json({ source: "local-rule", summary: quickFallback });
  }

  try {
    const ai = new GoogleGenerativeAI(geminiApiKey);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Sen ekonomi dersi ogrencilerine yardim eden bir asistansin.
Kisa, anlasilir ve sinav odakli yaz.

Veri:
- Piyasa: ${JSON.stringify(body.market)}
- Enflasyon: ${JSON.stringify(body.inflation)}
- Takvim: ${JSON.stringify(body.calendar)}

3 baslik ver:
1) One Cikanlar
2) Sinavda Nasil Sorulur?
3) Olasi Sonuc / Yorum
`.trim();

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 280,
        temperature: 0.7,
      }
    });

    const summary = result.response.text() || quickFallback;

    return NextResponse.json({ source: "gemini", summary });
  } catch (error) {
    console.error("Highlights API Error:", error);
    return NextResponse.json({ source: "local-rule", summary: quickFallback });
  }
}

function buildFallback(body: Payload) {
  const gold = body.market.find((m) => m.label.includes("Altin"))?.price ?? 0;
  const usd = body.market.find((m) => m.label.includes("USD"))?.price ?? 0;
  const latest = body.inflation[body.inflation.length - 1];
  const nextEvent = body.calendar[0]?.title ?? "Kritik takvim olayi";

  return [
    "1) One Cikanlar",
    `- Gram altin seviyesi: ${gold.toFixed(2)}. USD/TRY: ${usd.toFixed(2)}.`,
    `- Son ay TUFE: ${latest?.tufe ?? 0} ve UFE: ${latest?.ufe ?? 0}.`,
    `- Yaklasan olay: ${nextEvent}.`,
    "",
    "2) Sinavda Nasil Sorulur?",
    "- Enflasyon, kur ve faiz kararlarinin birbiriyle iliskisini yorum sorusu gelebilir.",
    "- 'Altin yukselirken kur ve risk algisi nasil etkili olur?' tipi analiz sorusu beklenir.",
    "",
    "3) Olasi Sonuc / Yorum",
    "- Enflasyon yuksek seyrederse sikilastirma beklentisi artar, bu da borsa ve kur oynakligini etkileyebilir.",
  ].join("\n");
}

function isValidPayload(body: Payload) {
  const marketOk = Array.isArray(body.market) && body.market.length <= 15;
  const inflationOk = Array.isArray(body.inflation) && body.inflation.length <= 6;
  const calendarOk = Array.isArray(body.calendar) && body.calendar.length <= 10;
  return marketOk && inflationOk && calendarOk;
}
