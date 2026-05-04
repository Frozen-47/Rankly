import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getAIRecommendation(products: Product[]): Promise<string> {
  if (products.length === 0) return "";

  const productsInfo = products.map(p => `
    Product: ${p.name}
    Price: ₹${p.price}
    Rating: ${p.rating}
    Specs: ${JSON.stringify(p.specs)}
  `).join("\n");

  const prompt = `
    You are an expert tech reviewer for a site called "Rankly".
    Given the following list of smartphones, provide a concise (max 100 words) recommendation for which one is the "Best Value" and which one is the "Performance King".
    Explain briefly why. Use a professional but engaging tone.
    
    ${productsInfo}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "No recommendation available at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Our AI reviewer is currently offline, but you can see the rankings based on our algorithm below!";
  }
}
