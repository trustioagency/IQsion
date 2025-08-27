import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" 
});

export interface MarketAnalysisResult {
  summary: string;
  trends: string[];
  competitors: { name: string; analysis: string }[];
  opportunities: string[];
  risks: string[];
  targetAudience: string;
}

export interface PerformanceInsight {
  metric: string;
  insight: string;
  recommendation: string;
  priority: 'Yüksek' | 'Orta' | 'Düşük';
}

export async function analyzeMarket(
  industry: string,
  websiteUrl?: string,
  competitors?: string
): Promise<MarketAnalysisResult> {
  try {
    const prompt = `
    ${industry} sektöründe faaliyet gösteren bir e-ticaret işletmesi için pazar analizi yapın.
    ${websiteUrl ? `Website: ${websiteUrl}` : ''}
    ${competitors ? `Ana rakipler: ${competitors}` : ''}
    
    Aşağıdaki JSON formatında yanıt verin:
    {
      "summary": "Genel pazar durumu özeti",
      "trends": ["trend1", "trend2", "trend3"],
      "competitors": [{"name": "Rakip Adı", "analysis": "Analiz"}],
      "opportunities": ["fırsat1", "fırsat2"],
      "risks": ["risk1", "risk2"],
      "targetAudience": "Hedef kitle analizi"
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            trends: {
              type: "array",
              items: { type: "string" }
            },
            competitors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  analysis: { type: "string" }
                }
              }
            },
            opportunities: {
              type: "array",
              items: { type: "string" }
            },
            risks: {
              type: "array", 
              items: { type: "string" }
            },
            targetAudience: { type: "string" }
          },
          required: ["summary", "trends", "competitors", "opportunities", "risks", "targetAudience"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    throw new Error(`Failed to analyze market: ${error}`);
  }
}

export async function analyzePerformance(
  metricsData: any
): Promise<PerformanceInsight[]> {
  try {
    const prompt = `
    Aşağıdaki pazarlama performans verilerini analiz edin ve öneriler sunun:
    ${JSON.stringify(metricsData)}
    
    Her metrik için insight ve öneriler sağlayın. JSON formatında yanıt verin:
    [
      {
        "metric": "ROAS",
        "insight": "Mevcut durum analizi",
        "recommendation": "Yapılması gereken eylem",
        "priority": "Yüksek"
      }
    ]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              metric: { type: "string" },
              insight: { type: "string" },
              recommendation: { type: "string" },
              priority: { 
                type: "string",
                enum: ["Yüksek", "Orta", "Düşük"]
              }
            },
            required: ["metric", "insight", "recommendation", "priority"]
          }
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    throw new Error(`Failed to analyze performance: ${error}`);
  }
}

export async function generateRecommendations(
  context: string,
  userQuery: string
): Promise<string> {
  try {
    const prompt = `
    Context: ${context}
    User Question: ${userQuery}
    
    Pazarlama uzmanı olarak detaylı ve uygulanabilir öneriler sunun. 
    Türkçe olarak yanıtlayın.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Yanıt oluşturulamadı";
  } catch (error) {
    throw new Error(`Failed to generate recommendations: ${error}`);
  }
}
