/**
 * AI Service
 * Handles AI-powered features like recommendations and nutrition analysis
 */

import { Dish, UserPreferences } from '@/models';

const AI_API_URL = 'https://api.openai.com/v1/chat/completions';
const AI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

export interface AIRecommendation {
  dish: Dish;
  reason: string;
  score: number;
}

export interface NutritionAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  recommendations: string[];
}

export class AIService {
  /**
   * Get personalized dish recommendations
   */
  static async getRecommendations(
    availableDishes: Dish[],
    userPreferences: UserPreferences
  ): Promise<AIRecommendation[]> {
    try {
      const prompt = this.buildRecommendationPrompt(availableDishes, userPreferences);
      
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          messages: [
            {
              role: 'system',
              content: 'Du bist ein Ernährungsberater für eine Mensa-App.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('AI API request failed');
      }

      const data = await response.json();
      return this.parseRecommendations(data.choices[0].message.content);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      throw error;
    }
  }

  /**
   * Analyze nutrition of a dish
   */
  static async analyzeNutrition(dish: Dish): Promise<NutritionAnalysis> {
    try {
      const prompt = `Analysiere die Nährwerte dieses Gerichts: ${dish.name}. 
      Zutaten: ${dish.ingredients?.join(', ')}.
      Gib eine detaillierte Nährwertanalyse zurück.`;

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          messages: [
            {
              role: 'system',
              content: 'Du bist ein Ernährungsexperte.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('AI API request failed');
      }

      const data = await response.json();
      return this.parseNutritionAnalysis(data.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing nutrition:', error);
      throw error;
    }
  }

  /**
   * Chat with AI assistant
   */
  static async chat(message: string, context?: string): Promise<string> {
    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          messages: [
            {
              role: 'system',
              content: 'Du bist ein hilfreicher Assistent für eine Mensa-App der HTW Berlin.',
            },
            ...(context ? [{ role: 'system', content: context }] : []),
            {
              role: 'user',
              content: message,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('AI API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error in AI chat:', error);
      throw error;
    }
  }

  private static buildRecommendationPrompt(
    dishes: Dish[],
    preferences: UserPreferences
  ): string {
    return `Basierend auf folgenden Präferenzen: ${JSON.stringify(preferences)}, 
    empfehle die besten Gerichte aus dieser Liste: ${JSON.stringify(dishes)}`;
  }

  private static parseRecommendations(aiResponse: string): AIRecommendation[] {
    // TODO: Implement proper parsing logic
    return [];
  }

  private static parseNutritionAnalysis(aiResponse: string): NutritionAnalysis {
    // TODO: Implement proper parsing logic
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      healthScore: 0,
      recommendations: [],
    };
  }
}
