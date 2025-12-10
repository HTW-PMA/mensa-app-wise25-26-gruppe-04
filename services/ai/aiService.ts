// API Configuration - HARDCODED (da .env in React Native nicht zuverlässig funktioniert)
const OPENAI_API_KEY = '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';
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
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
                    ...history.map((msg) => ({
                        role: msg.role,
                        content: msg.content,
                    })),
                    { role: 'user', content: userMessage },
                ],
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[AI Service] API Error:', errorText);
            return `Fehler: API-Anfrage fehlgeschlagen (${response.status}). ${errorText}`;
        }

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        }

        return 'Keine Antwort von der KI erhalten.';
    } catch (error) {
        console.error('[AI Service] Error:', error);
        return `Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`;
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
 * Answer general questions about the mensa
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

Antworte freundlich, präzise und auf Deutsch.`;

    return getAiResponse(systemPrompt, question, history);
}

// Export default object for backwards compatibility
export default {
    getAiResponse,
    getMealRecommendation,
    getNutritionalInfo,
    answerMensaQuestion,
};
