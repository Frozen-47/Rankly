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

async function extractTextFromUrls(query: string): Promise<string> {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = query.match(urlRegex);
  if (!urls) return '';

  let combinedContent = '';
  for (const url of urls) {
    try {
      // Use a public CORS proxy to fetch the raw HTML of the provided URLs
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
      if (!response.ok) continue;
      
      const html = await response.text();
      // Basic extraction: remove scripts, styles, and HTML tags to get raw text
      const text = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]*>?/gm, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 15000); // limit to ~15k chars per URL to fit in context window
      
      combinedContent += `\n\n--- Content from ${url} ---\n${text}\n--- End Content ---\n`;
    } catch (e) {
      console.error(`Failed to fetch ${url}`, e);
    }
  }
  return combinedContent;
}

export async function compareProducts(query: string): Promise<ComparisonData> {
  const urlContent = await extractTextFromUrls(query);

  const prompt = `Analyze and compare the following products based on the query: "${query}". 
${urlContent ? `\nWe attempted to fetch the webpage content for the URLs provided:\n${urlContent}\n\nIMPORTANT: If the webpage content above appears to be an anti-bot page (e.g., "Robot Check", "automated access", "Cloudflare"), IGNORE the webpage content entirely. Instead, try to deduce the product from the URL slug itself or the rest of the user's query. If you absolutely cannot identify the product (e.g., it is a short URL with no product name), DO NOT guess. Instead, return a JSON object with a single "error" field explaining that the product could not be identified from the link, and ask the user to provide the product name.` : ''}
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
        content: "You are an expert product comparison engine. ALWAYS prioritize the most up-to-date and modern products available (e.g., 2023-2024 releases) unless the user asks for older models. If the user's query implies a regional currency (e.g., 'under 15000' implies INR ₹), format your prices in that local currency instead of defaulting to USD. Always return data in the requested JSON format." 
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
      if (data.error) throw new Error(data.error);
      throw new Error("AI returned no products. Please be more specific (e.g., 'iPhone 15 vs Galaxy S24').");
    }
    
    return data as ComparisonData;
  } catch (err: any) {
    console.error("AI Response Parsing/Validation Error:", err);
    console.log("Raw AI Output:", text);
    throw new Error(err.message || "Failed to parse product data.");
  }
}
