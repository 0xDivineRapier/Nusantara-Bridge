import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getMarketInsight = async (
  amount: string, 
  currency: string, 
  currentRate: number
): Promise<string> => {
  if (!apiKey) return "AI Insights unavailable: API Key missing.";

  try {
    const prompt = `
      Act as a senior crypto financial analyst. 
      A user plans to bridge ${amount} ${currency} to IDR.
      The current market rate is ${currentRate.toLocaleString('id-ID')} IDR per ${currency}.
      
      Briefly analyze:
      1. Is this a favorable rate compared to the 7-day average?
      2. Mention volatility risks for this pair.
      3. Give a recommendation (Wait or Swap).
      
      Keep it under 100 words. Format as plain text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate insights.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI temporarily unavailable.";
  }
};