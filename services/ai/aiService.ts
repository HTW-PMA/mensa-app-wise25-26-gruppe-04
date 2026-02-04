import AsyncStorage from '@react-native-async-storage/async-storage';
import { MensaApiService } from '../api/mensaApi';
import { Dish } from '@/models/Dish';
import { API_CONFIG } from '@/config/api.config';
import { notifyPreferencesChanged } from '@/hooks/useUserPreferences';
import { UNIVERSITIES, University, Canteen } from '@/constants/universities';

const OPENAI_ENDPOINT = `${API_CONFIG.AI_API.BASE_URL}/chat`;
const MODEL_NAME = API_CONFIG.AI_API.MODEL;

const STORAGE_KEY = '@mensa_app_preferences';
const FAVORITES_STORAGE_KEY = '@mensa_app_favorites';
const UNIVERSITY_STORAGE_KEY = 'selected_university';
const CANTEEN_STORAGE_KEY = 'selected_canteen';

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

function formatDish(dish: Dish): string {
    const parts: string[] = [dish.name];
    if (dish.labels && dish.labels.length > 0) {
        parts.push(`[${dish.labels.join(', ')}]`);
    }
    parts.push(`${(dish.price.student / 100).toFixed(2)}€`);
    if (dish.allergens && dish.allergens.length > 0) {
        parts.push(`Allergene: ${dish.allergens.join(', ')}`);
    }
    if (dish.sustainability?.co2Bilanz != null) {
        parts.push(`CO2: ${dish.sustainability.co2Bilanz}g`);
    }
    return parts.join(' | ');
}

async function loadPreferences(): Promise<{
    dietaryRestrictions: string[];
    allergens: string[];
    maxPrice: number;
    notificationsEnabled: boolean;
}> {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return { dietaryRestrictions: [], allergens: [], maxPrice: 10, notificationsEnabled: false };
}

/**
 * Load the user's selected university and canteen from AsyncStorage.
 */
async function loadSelectedLocation(): Promise<{
    university: University;
    canteen: Canteen;
}> {
    const defaultUni = UNIVERSITIES[0];
    const defaultCanteen = defaultUni.canteens.find((c) => c.hasMenu) || defaultUni.canteens[0];

    try {
        const [savedUniId, savedCanteenId] = await Promise.all([
            AsyncStorage.getItem(UNIVERSITY_STORAGE_KEY),
            AsyncStorage.getItem(CANTEEN_STORAGE_KEY),
        ]);

        const university = (savedUniId && UNIVERSITIES.find((u) => u.id === savedUniId)) || defaultUni;

        let canteen: Canteen | undefined;
        if (savedCanteenId) {
            canteen = university.canteens.find((c) => c.id === savedCanteenId);
        }
        if (!canteen) {
            canteen = university.canteens.find((c) => c.hasMenu) || university.canteens[0];
        }

        return { university, canteen };
    } catch {
        return { university: defaultUni, canteen: defaultCanteen };
    }
}

async function fetchMenuText(date: Date, canteenId: string, canteenName: string): Promise<string> {
    try {
        const menu = await MensaApiService.getDailyMenu(date, canteenId);
        if (!menu || menu.dishes.length === 0) {
            return `Keine Gerichte verfügbar für ${date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })} (${canteenName}).`;
        }
        const header = date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' });
        const lines = menu.dishes.map((d, i) => `${i + 1}. ${formatDish(d)}`);
        return `Menü ${header} – ${canteenName}:\n${lines.join('\n')}`;
    } catch (error) {
        return `Menüdaten für ${canteenName} konnten nicht geladen werden: ${error instanceof Error ? error.message : 'Unbekannt'}`;
    }
}

async function fetchFavoritesText(): Promise<string> {
    try {
        const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!stored) return 'Keine Favoriten gespeichert.';
        const favorites = JSON.parse(stored);
        if (!Array.isArray(favorites) || favorites.length === 0) return 'Keine Favoriten gespeichert.';
        return `Favoriten des Nutzers: ${favorites.map((f: any) => f.name || f).join(', ')}`;
    } catch {
        return 'Favoriten konnten nicht geladen werden.';
    }
}

// -------------------------------------------------------------------
// Action-Tag Parsing & Execution
// -------------------------------------------------------------------

const ACTION_REGEX = /\[ACTION:(set_preference|set_allergen):(\w+):(true|false)\]/g;

async function executeActions(text: string): Promise<string> {
    const actions = [...text.matchAll(ACTION_REGEX)];
    if (actions.length === 0) return text;

    const prefs = await loadPreferences();
    let changed = false;

    for (const match of actions) {
        const [, action, value, enabledStr] = match;
        const enabled = enabledStr === 'true';

        if (action === 'set_preference') {
            if (enabled && !prefs.dietaryRestrictions.includes(value)) {
                prefs.dietaryRestrictions.push(value);
                changed = true;
            } else if (!enabled) {
                const before = prefs.dietaryRestrictions.length;
                prefs.dietaryRestrictions = prefs.dietaryRestrictions.filter((p: string) => p !== value);
                if (prefs.dietaryRestrictions.length !== before) changed = true;
            }
        } else if (action === 'set_allergen') {
            if (enabled && !prefs.allergens.includes(value)) {
                prefs.allergens.push(value);
                changed = true;
            } else if (!enabled) {
                const before = prefs.allergens.length;
                prefs.allergens = prefs.allergens.filter((a: string) => a !== value);
                if (prefs.allergens.length !== before) changed = true;
            }
        }
    }

    if (changed) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
        notifyPreferencesChanged();
    }

    // Remove action tags from visible text
    return text.replace(ACTION_REGEX, '').replace(/\n{3,}/g, '\n\n').trim();
}

// -------------------------------------------------------------------
// Core AI Communication
// -------------------------------------------------------------------

export async function getAiResponse(
    systemPrompt: string,
    userMessage: string,
    history: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
    try {
        const requestBody = {
            model: MODEL_NAME,
            messages: [
                { role: 'system', content: systemPrompt },
                ...history.map((msg) => ({ role: msg.role, content: msg.content })),
                { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 1500,
        };

        const response = await fetch(OPENAI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[AI Service] API Error:', errorText);
            return `Fehler: API-Anfrage fehlgeschlagen (${response.status}).`;
        }

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content || 'Keine Antwort erhalten.';
        }

        return 'Keine Antwort von der KI erhalten.';
    } catch (error) {
        console.error('[AI Service] Error:', error);
        return `Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`;
    }
}

// -------------------------------------------------------------------
// Main chat function
// -------------------------------------------------------------------

export async function answerMensaQuestion(
    question: string,
    history: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayReadable = today.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    // --- Load user's selected location ---
    const { university, canteen } = await loadSelectedLocation();

    // --- Pre-fetch context data in parallel ---
    const questionLower = question.toLowerCase();

    // Determine which dates to fetch
    const datesToFetch: Date[] = [today];

    const tomorrowKeywords = ['morgen', 'nächst', 'naechst'];
    const weekKeywords = ['woche', 'übermorgen', 'uebermorgen', 'freitag', 'donnerstag', 'mittwoch', 'dienstag', 'montag'];

    if (tomorrowKeywords.some((k) => questionLower.includes(k))) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        datesToFetch.push(tomorrow);
    }

    if (weekKeywords.some((k) => questionLower.includes(k))) {
        for (let i = 1; i <= 5; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            if (d.getDay() >= 1 && d.getDay() <= 5) {
                if (!datesToFetch.some((existing) => existing.toDateString() === d.toDateString())) {
                    datesToFetch.push(d);
                }
            }
        }
    }

    const [prefs, favorites, ...menuTexts] = await Promise.all([
        loadPreferences(),
        fetchFavoritesText(),
        ...datesToFetch.map((d) => fetchMenuText(d, canteen.id, canteen.fullName)),
    ]);

    const menuContext = menuTexts.join('\n\n');

    const dietLabel = prefs.dietaryRestrictions.length > 0
        ? prefs.dietaryRestrictions.join(', ')
        : 'keine';
    const allergenLabel = prefs.allergens.length > 0
        ? prefs.allergens.join(', ')
        : 'keine';

    // Build available universities list for context
    const uniList = UNIVERSITIES.map((u) => `${u.name} (${u.canteens.filter((c) => c.hasMenu).length} Mensen)`).join(', ');

    const systemPrompt = `Du bist der KI-Assistent der UniMensa Berlin App – einer App für ALLE Berliner Universitäten und Hochschulen.
Heute ist ${todayReadable} (${todayStr}).

AKTUELL AUSGEWÄHLTE MENSA:
- Universität: ${university.name}
- Mensa: ${canteen.fullName}
- Adresse: ${canteen.address}

VERFÜGBARE UNIVERSITÄTEN IN DER APP:
${uniList}

AKTUELLE MENÜDATEN für "${canteen.fullName}" (direkt aus der Mensa-API):
${menuContext}

NUTZER-EINSTELLUNGEN:
- Ernährungspräferenzen: ${dietLabel}
- Allergen-Warnungen: ${allergenLabel}
${favorites}

DEINE AUFGABEN:
1. Beantworte Fragen zu Menüs basierend auf den obigen echten Menüdaten. Erfinde KEINE Gerichte.
2. Die Daten beziehen sich auf die aktuell ausgewählte Mensa "${canteen.fullName}" der ${university.name}.
3. Gib personalisierte Empfehlungen basierend auf den Nutzer-Einstellungen.
4. Wenn Allergene des Nutzers in einem Gericht vorkommen, weise DEUTLICH darauf hin.
5. Öffnungszeiten: Mo-Fr 11:00-14:30, Sa-So geschlossen.
6. Wenn der Nutzer nach einer anderen Uni/Mensa fragt, erkläre, dass er die Mensa über das Menü-Tab oben wechseln kann.
7. Erkläre Gerichte, Zutaten, Nährwerte und Allergene wenn danach gefragt wird.

EINSTELLUNGEN ÄNDERN:
Wenn der Nutzer seine Einstellungen ändern möchte (z.B. "Ich bin vegan", "Ich habe eine Glutenunverträglichkeit", "Entferne vegan"), füge am Ende deiner Antwort den passenden Action-Tag ein:

Ernährungspräferenzen (vegetarian, vegan, glutenfree, lactosefree, halal, kosher):
[ACTION:set_preference:WERT:true] zum Aktivieren
[ACTION:set_preference:WERT:false] zum Deaktivieren

Allergen-Warnungen (gluten, milk, eggs, fish, shellfish, nuts, peanuts, soy, celery, mustard, sesame, sulfites, lupin, molluscs):
[ACTION:set_allergen:WERT:true] zum Hinzufügen
[ACTION:set_allergen:WERT:false] zum Entfernen

Beispiele:
- Nutzer sagt "Ich bin vegan" -> Antworte bestätigend + [ACTION:set_preference:vegan:true]
- Nutzer sagt "Ich vertrage kein Gluten" -> Antworte bestätigend + [ACTION:set_preference:glutenfree:true][ACTION:set_allergen:gluten:true]
- Nutzer sagt "Entferne vegan" -> Antworte bestätigend + [ACTION:set_preference:vegan:false]

WICHTIG: Die Action-Tags werden automatisch entfernt und vom Nutzer nicht gesehen. Schreibe trotzdem eine natürliche Bestätigung.

Antworte freundlich, präzise und auf Deutsch. Nutze die echten Menüdaten oben.`;

    const rawResponse = await getAiResponse(systemPrompt, question, history);

    // Parse and execute any action tags, then return clean text
    return executeActions(rawResponse);
}

// -------------------------------------------------------------------
// Standalone helpers (kept for backwards compatibility)
// -------------------------------------------------------------------

export async function getMealRecommendation(
    userPreferences: string,
    availableMeals: string[]
): Promise<string> {
    const systemPrompt = `Du bist ein hilfreicher Ernährungsberater für Berliner Uni-Mensen.
Gib personalisierte Empfehlungen basierend auf den Präferenzen des Nutzers.
Antworte auf Deutsch, freundlich und präzise.`;

    const userMessage = `Meine Präferenzen: ${userPreferences}
Verfügbare Gerichte heute: ${availableMeals.join(', ')}

Was empfiehlst du mir?`;

    return getAiResponse(systemPrompt, userMessage);
}

export async function getNutritionalInfo(mealName: string): Promise<string> {
    const systemPrompt = `Du bist ein Ernährungsexperte. Gib detaillierte Informationen über Nährwerte,
Allergene und gesundheitliche Aspekte von Gerichten. Antworte auf Deutsch.`;

    const userMessage = `Gib mir Informationen über: ${mealName}`;

    return getAiResponse(systemPrompt, userMessage);
}

export default {
    getAiResponse,
    getMealRecommendation,
    getNutritionalInfo,
    answerMensaQuestion,
};
