import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1].content;

    // Load knowledge context
    let knowledgeData = [];
    try {
        const knowledgePath = path.join(process.cwd(), "src/lib/knowledge.json");
        if (fs.existsSync(knowledgePath)) {
            const raw = fs.readFileSync(knowledgePath, "utf-8");
            knowledgeData = JSON.parse(raw);
        }
    } catch (e) {
        console.error("Knowledge read error:", e);
    }

    // Improved keyword-based RAG
    const stopWords = ["ile", "ve", "veya", "hakkında", "ilgili", "bilgi", "ver", "nedir", "nelerdir", "nasıl", "açıkla", "misin"];
    const keywords = latestMessage.toLowerCase()
        .replace(/[.,!?]/g, '')
        .split(" ")
        .filter((w: string) => w.length > 3 && !stopWords.includes(w));
    
    let contextStr = "";
    
    if (knowledgeData.length > 0 && keywords.length > 0) {
        let scoredChunks: { text: string, score: number }[] = [];
        
        for (const doc of knowledgeData) {
            if (doc.chunks) {
                for (const chunk of doc.chunks) {
                    const chunkLower = chunk.toLowerCase();
                    let score = 0;
                    
                    const phrase = keywords.join(" ");
                    if (phrase.length > 5 && chunkLower.includes(phrase)) {
                        score += 50;
                    }
                    
                    for (const kw of keywords) {
                        const regex = new RegExp(kw, 'g');
                        const matches = chunkLower.match(regex);
                        if (matches) {
                            score += matches.length;
                        }
                    }
                    
                    if (score > 0) {
                        scoredChunks.push({
                            text: `Kaynak [${doc.source}]: ${chunk}`,
                            score: score
                        });
                    }
                }
            }
        }
        
        scoredChunks.sort((a, b) => b.score - a.score);
        const topChunks = scoredChunks.slice(0, 7).map(c => c.text);
        
        if (topChunks.length > 0) {
            contextStr = `\n[REFERANS BİLGİ (Aşağıdaki bilgileri kullanarak yanıt ver ve mutlaka kaynakları belirt)]:\n` + topChunks.join("\n...\n");
        }
    }

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!geminiApiKey) {
        return NextResponse.json({ error: "API anahtarı bekleniyor. Lütfen .env dosyasına GEMINI_API_KEY ekleyin." });
    }

    // System prompt
    let systemInstruction = `Sen uzman bir finansal danışman ve ekonomi asistanısın. Şu kurallara KESİNLİKLE uymalısın:
1. Finans dışı sorular (yemek tarifi, spor, genel kültür vb.): Kesinlikle cevap verme ve "Ben sadece finansal konularda yardımcı olmak için tasarlandım, bu soru çalışma alanımın dışında." diyerek reddet.`;

    if (contextStr) {
        systemInstruction += `\n2. Sana sağlanan [REFERANS BİLGİ] metinlerini KULLANARAK cevap ver ve cevabının içinde/sonunda mutlaka HANGİ KAYNAKTAN (örneğin Kaynak: pdf1.pdf) yararlandığını açıkça göster.`;
    } else {
        systemInstruction += `\n2. Finansal bir soru sorulduğunda kendi profesyonel finansal bilgini kullanarak cevapla, ancak cevabının sonuna mutlaka şu notu ekle: "Not: Bu konu yüklenen PDF belgelerinde yer almadığı için genel finansal bilgi birikimimle yanıtlanmıştır."`;
    }
    
    systemInstruction += `\nCevaplarını her zaman şık bir Markdown formatında ver.`;

    const ai = new GoogleGenerativeAI(geminiApiKey);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Convert history to Gemini format
    const history = messages.slice(0, -1).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
        history: [
            { role: "user", parts: [{ text: systemInstruction + (contextStr ? "\n\n" + contextStr : "") }] },
            { role: "model", parts: [{ text: "Anlaşıldı, uzman finans asistanı olarak hazırım." }] },
            ...history
        ],
        generationConfig: {
            temperature: 0.7,
        }
    });

    const result = await chat.sendMessageStream(latestMessage);

    const readableStream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
                }
                controller.close();
            } catch (err) {
                controller.error(err);
            }
        }
    });

    return new Response(readableStream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
    });

  } catch (err) {
    console.error("Chat API Error:", err);
    return NextResponse.json({ error: "Failed to process chat", details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
