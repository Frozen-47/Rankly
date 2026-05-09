/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Groq from "groq-sdk";
import { ComparisonData } from "../types";

let apiKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GROQ_API_KEY : undefined;
if (!apiKey && typeof process !== 'undefined' && process.env) {
  apiKey = process.env.GROQ_API_KEY;
}

// WARNING: Using dangerouslyAllowBrowser is not recommended for production apps
// as it exposes your API key. For a real production app, you should route these 
// requests through a backend server.
const groq = new Groq({ 
  apiKey: apiKey || '',
  dangerouslyAllowBrowser: true
});

export async function compareProducts(query: string): Promise<ComparisonData> {
  const prompt = `Analyze and compare the following products: "${query}". 
Provide detailed specifications, pros/cons, a Rankly Score (0-100) based on value-for-money, and a final verdict.
If multiple products are found, compare them. If one is found, provide deep analysis.
Try to estimate real-world pricing and specs to the best of your knowledge.

You MUST respond in valid JSON format matching exactly this structure:
{
  "products": [
    {
      "id": "string-id-here",
      "name": "Product Name",
      "price": "$999",
      "rating": 4.5,
      "specs": { "Processor": "M2", "RAM": "16GB" },
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1", "Con 2"],
      "ranklyScore": 85,
      "summary": "Short summary here",
      "url": "https://example.com"
    }
  ],
  "commonSpecs": ["Processor", "RAM"],
  "verdict": "Final synthesized verdict here."
}`;

  const response = await groq.chat.completions.create({
    messages: [
      { 
        role: "system", 
        content: "You are a product comparison expert. Always return data in the requested JSON format." 
      },
      { 
        role: "user", 
        content: prompt 
      }
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" }
  });

  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error("No response from AI");
  
  try {
    const data = JSON.parse(text);
    
    // Validate the response structure
    if (!data.products || !Array.isArray(data.products) || data.products.length === 0) {
      throw new Error("AI returned no products. Please be more specific (e.g., 'iPhone 15 vs Galaxy S24').");
    }
    
    return data as ComparisonData;
  } catch (err: any) {
    console.error("AI Response Parsing/Validation Error:", err);
    console.log("Raw AI Output:", text);
    throw new Error(err.message || "Failed to parse product data.");
  }
}
