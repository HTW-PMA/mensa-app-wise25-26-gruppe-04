import AsyncStorage from '@react-native-async-storage/async-storage';
import { MensaApiService } from '../api/mensaApi';
import { Dish } from '@/models/Dish';

// API Configuration - HARDCODED (da .env in React Native nicht zuverlässig funktioniert)
const OPENAI_API_KEY = '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';
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const MODEL_NAME = 'gpt-4o-mini';

const STORAGE_KEY = '@mensa_app_preferences';
const FAVORITES_STORAGE_KEY = '@mensa_app_favorites';

/**
 * Base function to communicate with the OpenAI Chat API using fetch.
 */
export async function getAiResponse(
    systemPrompt: string,
    userMessage: string,
    history: { role: 'user' | 'assistant', content: string }[] = [],
    functions?: any[]
): Promise<string> {
    if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 20) {
        return 'Bitte setze deinen OpenAI API-Key in services/ai/aiService.ts';
    }

    try {
        const requestBody: any = {
            model: MODEL_NAME,
            messages: [
                { role: 'system', content: systemPrompt },
                ...history.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
                { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 1000,
        };

        if (functions && functions.length > 0) {
            requestBody.functions = functions;
            requestBody.function_call = 'auto';
        }

        const response = await fetch(OPENAI_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[AI Service] API Error:', errorText);
            return `Fehler: API-Anfrage fehlgeschlagen (${response.status}). ${errorText}`;
        }

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            const message = data.choices[0].message;

            // Check if function call was requested
            if (message.function_call) {
                const functionName = message.function_call.name;
                const functionArgs = JSON.parse(message.function_call.arguments);

                // Execute the function
                const functionResult = await executeFunctionCall(functionName, functionArgs);

                // Return the result
                return functionResult;
            }

            return message.content;
        }

        return 'Keine Antwort von der KI erhalten.';
    } catch (error) {
        console.error('[AI Service] Error:', error);
        return `Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`;
    }
}

/**
 * Execute function calls from AI
 */
async function executeFunctionCall(functionName: string, args: any): Promise<string> {
    try {
        switch (functionName) {
            case 'get_menu_for_date':
                return await getMenuForDate(args.date);

            case 'set_dietary_preference':
                return await setDietaryPreference(args.preference, args.enabled);

            case 'set_allergen':
                return await setAllergen(args.allergen, args.enabled);

            case 'check_favorite_availability':
                return await checkFavoriteAvailability();

            default:
                return `Unbekannte Funktion: ${functionName}`;
        }
    } catch (error) {
        console.error('[AI Service] Function execution error:', error);
        return `Fehler beim Ausführen der Funktion: ${error instanceof Error ? error.message : 'Unbekannt'}`;
    }
}

/**
 * Get menu for a specific date
 */
async function getMenuForDate(dateString: string): Promise<string> {
    try {
        const date = new Date(dateString);
        const menu = await MensaApiService.getDailyMenu(date);

        if (!menu || menu.dishes.length === 0) {
            return `Für den ${date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })} sind keine Menüdaten verfügbar.`;
        }

        const dishList = menu.dishes
            .map((dish: Dish) => `- ${dish.name} (${(dish.price.student / 100).toFixed(2)}€)`)
            .join('\n');

        return `Menü für ${date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })}:\n\n${dishList}`;
    } catch (error) {
        return `Fehler beim Laden des Menüs: ${error instanceof Error ? error.message : 'Unbekannt'}`;
    }
}

/**
 * Set dietary preference
 */
async function setDietaryPreference(preference: string, enabled: boolean): Promise<string> {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const preferences = stored ? JSON.parse(stored) : { dietaryRestrictions: [], allergens: [], maxPrice: 10 };

        if (enabled) {
            if (!preferences.dietaryRestrictions.includes(preference)) {
                preferences.dietaryRestrictions.push(preference);
            }
        } else {
            preferences.dietaryRestrictions = preferences.dietaryRestrictions.filter((p: string) => p !== preference);
        }

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

        return `Ernährungspräferenz "${preference}" wurde ${enabled ? 'aktiviert' : 'deaktiviert'}.`;
    } catch (error) {
        return `Fehler beim Setzen der Präferenz: ${error instanceof Error ? error.message : 'Unbekannt'}`;
    }
}

/**
 * Set allergen
 */
async function setAllergen(allergen: string, enabled: boolean): Promise<string> {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const preferences = stored ? JSON.parse(stored) : { dietaryRestrictions: [], allergens: [], maxPrice: 10 };

        if (enabled) {
            if (!preferences.allergens.includes(allergen)) {
                preferences.allergens.push(allergen);
            }
        } else {
            preferences.allergens = preferences.allergens.filter((a: string) => a !== allergen);
        }

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

        return `Allergen "${allergen}" wurde ${enabled ? 'hinzugefügt' : 'entfernt'}.`;
    } catch (error) {
        return `Fehler beim Setzen des Allergens: ${error instanceof Error ? error.message : 'Unbekannt'}`;
    }
}

/**
 * Check when favorite dishes are available
 */
async function checkFavoriteAvailability(): Promise<string> {
    try {
        const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!stored) {
            return 'Du hast noch keine Favoriten gespeichert.';
        }

        const favorites = JSON.parse(stored);
        if (favorites.length === 0) {
            return 'Du hast noch keine Favoriten gespeichert.';
        }

        // Check next 7 days
        const results: string[] = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + i);

            try {
                const menu = await MensaApiService.getDailyMenu(checkDate);
                if (menu && menu.dishes.length > 0) {
                    const matchingDishes = menu.dishes.filter((dish: Dish) =>
                        favorites.some((fav: any) => fav.name === dish.name)
                    );

                    if (matchingDishes.length > 0) {
                        const dateStr = checkDate.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' });
                        const dishNames = matchingDishes.map((d: Dish) => d.name).join(', ');
                        results.push(`${dateStr}: ${dishNames}`);
                    }
                }
            } catch (error) {
                // Skip this day if error
            }
        }

        if (results.length === 0) {
            return 'In den nächsten 7 Tagen sind keine deiner Favoriten verfügbar.';
        }

        return `Deine Favoriten sind verfügbar:\n\n${results.join('\n')}`;
    } catch (error) {
        return `Fehler beim Prüfen der Favoriten: ${error instanceof Error ? error.message : 'Unbekannt'}`;
    }
}

/**
 * Get meal recommendations based on user preferences
 */
export async function getMealRecommendation(
    userPreferences: string,
    availableMeals: string[]
): Promise<string> {
    const systemPrompt = `Du bist ein hilfreicher Ernährungsberater für die HTW Berlin Mensa. 
Gib personalisierte Empfehlungen basierend auf den Präferenzen des Nutzers.
Antworte auf Deutsch, freundlich und präzise.`;

    const userMessage = `Meine Präferenzen: ${userPreferences}
Verfügbare Gerichte heute: ${availableMeals.join(', ')}

Was empfiehlst du mir?`;

    return getAiResponse(systemPrompt, userMessage);
}

/**
 * Get nutritional information about a meal
 */
export async function getNutritionalInfo(mealName: string): Promise<string> {
    const systemPrompt = `Du bist ein Ernährungsexperte. Gib detaillierte Informationen über Nährwerte, 
Allergene und gesundheitliche Aspekte von Gerichten. Antworte auf Deutsch.`;

    const userMessage = `Gib mir Informationen über: ${mealName}`;

    return getAiResponse(systemPrompt, userMessage);
}

/**
 * Answer general questions about the mensa with function calling support
 */
export async function answerMensaQuestion(
    question: string,
    history: { role: 'user' | 'assistant', content: string }[] = []
): Promise<string> {
    const systemPrompt = `Du bist der KI-Assistent der HTW Berlin Mensa-App. 
Beantworte Fragen über:
- Öffnungszeiten (Mo-Fr 11:00-14:30, Sa-So geschlossen)
- Menüs und Gerichte
- Ernährungsberatung
- Allergene und Nährwerte
- Nachhaltigkeit der Gerichte

Du kannst auch Einstellungen in der App ändern und Menüdaten abrufen.

Verfügbare Funktionen:
- Menü für ein bestimmtes Datum abrufen
- Ernährungspräferenzen setzen (vegetarian, vegan, glutenfree, lactosefree, halal, kosher)
- Allergene hinzufügen/entfernen (gluten, milk, eggs, fish, shellfish, nuts, peanuts, soy, celery, mustard, sesame, sulfites)
- Prüfen, wann Favoriten verfügbar sind

Antworte freundlich, präzise und auf Deutsch.`;

    const functions = [
        {
            name: 'get_menu_for_date',
            description: 'Ruft das Menü für ein bestimmtes Datum ab',
            parameters: {
                type: 'object',
                properties: {
                    date: {
                        type: 'string',
                        description: 'Das Datum im Format YYYY-MM-DD',
                    },
                },
                required: ['date'],
            },
        },
        {
            name: 'set_dietary_preference',
            description: 'Setzt oder entfernt eine Ernährungspräferenz',
            parameters: {
                type: 'object',
                properties: {
                    preference: {
                        type: 'string',
                        enum: ['vegetarian', 'vegan', 'glutenfree', 'lactosefree', 'halal', 'kosher'],
                        description: 'Die Ernährungspräferenz',
                    },
                    enabled: {
                        type: 'boolean',
                        description: 'True zum Aktivieren, False zum Deaktivieren',
                    },
                },
                required: ['preference', 'enabled'],
            },
        },
        {
            name: 'set_allergen',
            description: 'Fügt ein Allergen hinzu oder entfernt es',
            parameters: {
                type: 'object',
                properties: {
                    allergen: {
                        type: 'string',
                        enum: ['gluten', 'milk', 'eggs', 'fish', 'shellfish', 'nuts', 'peanuts', 'soy', 'celery', 'mustard', 'sesame', 'sulfites'],
                        description: 'Das Allergen',
                    },
                    enabled: {
                        type: 'boolean',
                        description: 'True zum Hinzufügen, False zum Entfernen',
                    },
                },
                required: ['allergen', 'enabled'],
            },
        },
        {
            name: 'check_favorite_availability',
            description: 'Prüft, wann die Favoriten-Gerichte in den nächsten 7 Tagen verfügbar sind',
            parameters: {
                type: 'object',
                properties: {},
            },
        },
    ];

    return getAiResponse(systemPrompt, question, history, functions);
}

// Export default object for backwards compatibility
export default {
    getAiResponse,
    getMealRecommendation,
    getNutritionalInfo,
    answerMensaQuestion,
};