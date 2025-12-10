// API Configuration
import { API_CONFIG } from '@/config/api.config';

const OPENAI_API_KEY = API_CONFIG.AI_API.API_KEY;
const OPENAI_ENDPOINT = `${API_CONFIG.AI_API.BASE_URL}/chat/completions`;
const MODEL_NAME = 'gpt-4o-mini';

/**
 * Base function to communicate with the OpenAI Chat API using fetch.
 */
export async function getAiResponse(
    systemPrompt: string,
    userMessage: string,
    history: { role: 'user' | 'assistant', content: string }[] = []
): Promise<string> {
    if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 20) {
        return 'Bitte setze deinen OpenAI API-Key in services/ai/aiService.ts';
    }

    try {
        const response = await fetch(OPENAI_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...history,
                    { role: 'user', content: userMessage },
                ],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('OpenAI API Error:', error);

            if (response.status === 401) {
                return 'Fehler: API-Key ungültig. Bitte überprüfe deinen OpenAI API-Key.';
            } else if (response.status === 429) {
                return 'Zu viele Anfragen. Bitte warte einen Moment.';
            }

            return 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        return content || 'Keine Antwort vom AI-Service.';
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return 'Ein Fehler ist bei der Kommunikation mit dem AI-Service aufgetreten.';
    }
}

/**
 * Handles the conversational interface, maintaining chat history.
 */
export async function chat(history: { role: 'user' | 'assistant', content: string }[]): Promise<string> {
    // FIXED: Removed hardcoded key check
    if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 20) {
        return 'Bitte setze deinen OpenAI API-Key in services/ai/aiService.ts';
    }

    const systemPrompt = `Du bist ein freundlicher und hilfsbereiter KI-Assistent für eine Universitäts-Mensa-App. Dein Name ist Mensa-Bot.
Deine Hauptaufgabe ist es, Fragen zu verfügbaren Gerichten, Zutaten, Nährwerten und allgemeiner Ernährungsberatung zu beantworten.
Halte deine Antworten präzise und auf Deutsch.`;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
    ];

    try {
        const response = await fetch(OPENAI_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: messages,
                temperature: 0.8,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('OpenAI API Error:', error);

            if (response.status === 401) {
                return 'Fehler: API-Key ungültig.';
            } else if (response.status === 429) {
                return 'Zu viele Anfragen. Bitte warte einen Moment.';
            }

            return 'Ein Fehler ist aufgetreten.';
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        return content || 'Keine Antwort vom AI-Service.';
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return 'Ein Fehler ist bei der Kommunikation mit dem AI-Service aufgetreten.';
    }
}

/**
 * Generates a detailed nutritional analysis and health rating for a given dish.
 */
export async function analyzeNutrition(dish: Dish): Promise<string> {
    const systemPrompt = `Du bist ein Ernährungsexperte und KI-Assistent für eine Universitäts-Mensa-App. 
Deine Aufgabe ist es, eine detaillierte Nährwertanalyse und Gesundheitsbewertung für ein Gericht zu erstellen.
Die Analyse sollte auf dem Namen und den Zutaten des Gerichts basieren.
Die Ausgabe MUSS eine strukturierte, detaillierte Analyse auf Deutsch sein, einschließlich:
1. Geschätzte Nährwerte (Kalorien, Protein, Fett, Kohlenhydrate).
2. Eine kurze Gesundheitsbewertung (z.B. 'ausgewogen', 'hoher Fettgehalt').
3. Eine abschließende Gesundheitsbewertung von 1 (schlecht) bis 5 (ausgezeichnet).

Gericht-Details: ${JSON.stringify(dish)}`;

    const userMessage = `Bitte erstelle eine detaillierte Nährwertanalyse und Gesundheitsbewertung für das Gericht: ${dish.name}.`;

    return getAiResponse(systemPrompt, userMessage);
}

/**
 * Generates personalized dish recommendations based on user preferences and available dishes.
 */
export async function personalizedRecommendation(dishes: Dish[], preferences: UserPreferences): Promise<string> {
    const systemPrompt = `Du bist ein KI-Assistent für eine Universitäts-Mensa-App. 
Deine Aufgabe ist es, eine personalisierte Gerichtsempfehlung zu geben.
Analysiere die Präferenzen des Nutzers und die Liste der verfügbaren Gerichte.
Die Ausgabe MUSS eine kurze, freundliche und überzeugende Empfehlung auf Deutsch sein, die erklärt, warum das Gericht gut passt.
Keine Einleitung oder Schlussformel, nur der Empfehlungstext.

Nutzerpräferenzen: ${JSON.stringify(preferences)}
Verfügbare Gerichte: ${JSON.stringify(dishes)}`;

    const userMessage = "Bitte empfehle mir das beste Gericht für heute basierend auf meinen Präferenzen und dem verfügbaren Menü.";

    return getAiResponse(systemPrompt, userMessage);
}

// Data structures
export interface Dish {
    id: string;
    name: string;
    ingredients: string[];
    allergens: string[];
    price: number;
    category: string;
}

export interface UserPreferences {
    dietaryRestrictions: string[];
    favoriteIngredients: string[];
    dislikedIngredients: string[];
    maxPrice: number;
}

// Main AI service object - WICHTIG: Muss exportiert werden!
export const AIService = {
    personalizedRecommendation,
    analyzeNutrition,
    chat,
};

// Default export für Kompatibilität
export const aiService = AIService;
