import axios from 'axios';

// NOTE: In a real-world application, the API key should be securely stored and accessed
// via a backend proxy or a serverless function to prevent exposure.
// For this implementation, we use an environment variable placeholder.
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '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';
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const MODEL_NAME = 'gpt-4.1-mini'; // As specified by the user

const api = axios.create({
    baseURL: OPENAI_ENDPOINT,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
});

/**
 * Base function to communicate with the OpenAI Chat API.
 * @param systemPrompt The system message to guide the model's behavior.
 * @param userMessage The user's message/request.
 * @returns The model's response text.
 */
export async function getAiResponse(systemPrompt: string, userMessage: string, history: { role: 'user' | 'assistant', content: string }[] = []): Promise<string> {
    if (OPENAI_API_KEY === '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') {
        console.error('OpenAI API Key is not configured.');
        return 'Error: AI service is not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY.';
    }

    try {
        const response = await api.post('', {
            model: MODEL_NAME,
            messages: [
                { role: 'system', content: systemPrompt },
                ...history,
                { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
        });

        const content = response.data.choices[0]?.message?.content;
        return content || 'No response from AI.';
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        // Return a user-friendly error message
        return 'An error occurred while communicating with the AI service.';
    }
}

// --- Feature-specific functions will be added here in subsequent phases ---

/**
 * Handles the conversational interface, maintaining chat history.
 * @param history The current chat history (messages).
 * @returns The AI's response message.
 */
export async function chat(history: { role: 'user' | 'assistant', content: string }[]): Promise<string> {
    if (OPENAI_API_KEY === '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') {
        console.error('OpenAI API Key is not configured.');
        return 'Error: AI service is not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY.';
    }

    const systemPrompt = `You are a friendly and helpful AI assistant for a university cafeteria (Mensa) app. Your name is Mensa-Bot.
  Your primary function is to answer questions about the available dishes, ingredients, nutrition, and general dietary advice.
  Keep your answers concise and in German.`;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
    ];

    try {
        const response = await api.post('', {
            model: MODEL_NAME,
            messages: messages,
            temperature: 0.8,
        });

        const content = response.data.choices[0]?.message?.content;
        return content || 'No response from AI.';
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return 'An error occurred while communicating with the AI service.';
    }
}

/**
 * Generates a detailed nutritional analysis and health rating for a given dish.
 * @param dish The dish to analyze.
 * @returns A string containing the detailed nutritional analysis and health rating.
 */
export async function analyzeNutrition(dish: Dish): Promise<string> {
    const systemPrompt = `You are an expert nutritionist and AI assistant for a university cafeteria (Mensa) app. Your task is to provide a detailed nutritional analysis and a health rating for a dish.
  The analysis should be based on the dish's name and ingredients.
  The output MUST be a structured, detailed analysis in German, including:
  1. Estimated nutritional values (calories, protein, fat, carbs - use typical values for the ingredients).
  2. A brief health assessment (e.g., 'ausgewogen', 'hoher Fettgehalt').
  3. A final health rating from 1 (poor) to 5 (excellent).
  
  Dish Details: ${JSON.stringify(dish)}`;

    const userMessage = `Please provide a detailed nutritional analysis and health rating for the dish: ${dish.name}.`;

    return getAiResponse(systemPrompt, userMessage);
}

/**
 * Generates personalized dish recommendations based on user preferences and available dishes.
 * @param dishes The list of available dishes.
 * @param preferences The user's preferences.
 * @returns A string containing the personalized recommendation.
 */
export async function personalizedRecommendation(dishes: Dish[], preferences: UserPreferences): Promise<string> {
    const systemPrompt = `You are an AI assistant for a university cafeteria (Mensa) app. Your task is to provide a personalized dish recommendation.
  Analyze the user's preferences and the list of available dishes.
  The output MUST be a short, friendly, and convincing recommendation in German, highlighting why the dish is a good fit.
  Do not include any preamble or postamble, just the recommendation text.
  
  User Preferences: ${JSON.stringify(preferences)}
  Available Dishes: ${JSON.stringify(dishes)}`;

    const userMessage = "Please recommend the best dish for me today based on my preferences and the available menu.";

    return getAiResponse(systemPrompt, userMessage);
}

// Placeholder for data structures (assuming they exist elsewhere, e.g., in models/ or types/)
// For demonstration, we define a minimal structure for a dish.
export interface Dish {
    id: string;
    name: string;
    ingredients: string[];
    allergens: string[];
    price: number;
    category: string;
    // Add more fields as needed for the app's data model
}

export interface UserPreferences {
    dietaryRestrictions: string[]; // e.g., 'vegan', 'gluten-free'
    favoriteIngredients: string[];
    dislikedIngredients: string[];
    maxPrice: number;
    // Add more fields as needed
}

/// Placeholder for the main AI service object to be used by the app components
export const aiService = {
    personalizedRecommendation,
    analyzeNutrition,
    chat,
};
