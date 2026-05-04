// src/services/geminiService.ts
import { Product } from '../types';

export const getAIRecommendation = async (products: Product[]): Promise<string> => {
  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recommendation from server');
    }

    const data = await response.json();
    return data.recommendation;
  } catch (error) {
    console.error("AI Service Error:", error);
    return "Sorry, the AI insight engine is currently unavailable. Please try again later.";
  }
};