import { NextResponse } from "next/server";
import { financialTerms } from "@/lib/conceptsList";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from '@google/generative-ai';
export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
  try {
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    
    // Select 4 concepts for the day
    const getSelection = (pool: string[], count: number, offset: number) => {
        const start = (offset * count) % pool.length;
        const selection = [];
        for (let i = 0; i < count; i++) {
            selection.push(pool[(start + i) % pool.length]);
        }
        return selection;
    };

    const selectedTerms = getSelection(financialTerms, 4, dayIndex);

    // Read knowledge.json to find context
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

    // Prepare context by doing a simple keyword search across chunks
    let contextStr = "";
    if (knowledgeData.length > 0) {
        for (const term of selectedTerms) {
            let foundChunks = [];
            for (const doc of knowledgeData) {
                if (doc.chunks) {
                    for (const chunk of doc.chunks) {
                        if (chunk.toLowerCase().includes(term.toLowerCase())) {
                            foundChunks.push(chunk);
                            if (foundChunks.length >= 2) break; // limit context size
                        }
                    }
                }
            }
            if (foundChunks.length > 0) {
                // Her chunk'ı kısaltalım ki token sınırı aşılmasın ve hızlı yanıt gelsin
                const safeChunks = foundChunks.map(c => c.substring(0, 500));
                contextStr += `\n[Context for ${term}]: ` + safeChunks.join(" ");
            }
        }
    }
    
    // Genel bir sınır daha koyalım
    if (contextStr.length > 3000) {
        contextStr = contextStr.substring(0, 3000) + "...";
    }

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!geminiApiKey) {
        // Fallback if no API key
        return NextResponse.json({
            data: selectedTerms.map(t => ({
                term: t,
                definition: "API anahtarı bekleniyor. Lütfen .env dosyasına GEMINI_API_KEY ekleyin.",
                example: "Örnek veri yüklenemedi."
            }))
        });
    }

    const prompt = `
Aşağıdaki 4 finansal kavramı açıkla ve her biri için akılda kalıcı, günlük hayattan (öğrenci/vatandaş seviyesinde) pratik bir örnek ver.
Gerekirse aşağıdaki sağlanan ek PDF bağlam (context) verilerini kullanarak yorumla.
Lütfen sadece aşağıdaki JSON formatında yanıt ver, başka hiçbir metin ekleme.

Format:
{
  "data": [
    {
      "term": "Kavram Adı",
      "definition": "Akademik ama anlaşılır kısa tanım",
      "example": "Günlük hayattan pratik bir örnek"
    }
  ]
}

Kavramlar: ${selectedTerms.join(", ")}

Bağlam Verisi:
${contextStr}
`;

    const ai = new GoogleGenerativeAI(geminiApiKey);
    const model = ai.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const contentResult = await model.generateContent(prompt);
    const resultText = contentResult.response.text();

    let parsed = JSON.parse(resultText);
    let finalResult = parsed.data ? parsed.data : parsed; // handle wrapper

    return NextResponse.json({ data: finalResult });
  } catch (err) {
    console.error("Concepts API Error:", err);
    return NextResponse.json({ error: "Failed to fetch concepts", details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
