// server.ts
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json()); // Make sure this is here so Express can parse JSON bodies!

// Initialize Gemini safely on the server
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

// ... your existing /api/products route ...

// NEW: AI Recommendation Route
app.post('/api/recommend', async (req, res) => {
  try {
    const { products } = req.body;
    
    const prompt = `
      You are an expert tech reviewer. Analyze these products and recommend the best one based on specs, price, and rating. 
      Products: ${JSON.stringify(products)}
      Keep it concise, formatting it in Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ recommendation: response.text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to generate recommendation" });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));