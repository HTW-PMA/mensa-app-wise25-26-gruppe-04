/**
 * Mensa API Service
 * Bindet die API von mensa.gregorflachs.de an das App-Datenmodell an.
 *
 * Nutzt:
 *  - GET /menue   für Tages- und Wochenpläne
 *  - GET /meal    für Gerichtssuche & Details
 *
 * API-Doku: siehe mensaapi.yml
 */

import { Menu, Dish, DishCategory, DishLabel } from '@/models';
import { API_CONFIG } from '@/config/api.config';

/**
 * WICHTIG:
 * - Die API liefert Datumswerte in UTC.
 * - Für Filter (startdate/enddate) soll aber der *lokale* Kalendertag (Europe/Berlin)
 *   übergeben werden, sonst rutscht das Datum je nach Uhrzeit um einen Tag.
 */

const API_BASE_URL = API_CONFIG.MENSA_API.BASE_URL;
const API_KEY = API_CONFIG.MENSA_API.API_KEY;

// Optional via .env / app.json extra (EXPO_PUBLIC_MENSA_CANTEEN_ID). Falls leer,
// wird automatisch versucht eine passende HTW-Mensa zu finden.
const CONFIGURED_CANTEEN_ID = (API_CONFIG.MENSA_API.CANTEEN_ID || '').trim() || undefined;

// In-Memory Cache für die Canteen-ID (damit /canteen nicht bei jedem Render aufgerufen wird)
let resolvedCanteenId: string | null = null;

const formatLocalIsoDate = (date: Date): string => {
    // YYYY-MM-DD im *lokalen* Kalender (nicht UTC)
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// --- Typen für die Mensa-API (vereinfacht) -------------------------

type MensaPrice = {
    price: number;
    priceType: string; // "Student" | "Angestellte" | "Gäste"
};

type MensaBadge = {
    ID: string;
    name: string;
    description?: string;
};

type MensaMeal = {
    ID: string;
    name: string;
    category?: string;
    prices: MensaPrice[];
    additives?: any[];
    badges?: MensaBadge[];
    waterBilanz?: number;
    co2Bilanz?: number;
};

type MensaMenuCard = {
    date: string;
    canteeenId?: string; // Tippfehler im Schema, daher beide Varianten
    canteenId?: string;
    meals: MensaMeal[];
};

// -------------------------------------------------------------------

export class MensaApiService {
    // Gemeinsame Header (inkl. X-API-KEY)
    private static buildHeaders() {
        if (!API_KEY) {
            console.warn(
                '[MensaApiService] Kein Mensa API Key konfiguriert.'
            );
        }

        return {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-API-KEY': API_KEY,
        };
    }

    /**
     * Bestimmt die Mensa (canteenId), die für Menüabfragen verwendet wird.
     *
     * Warum?
     * - Viele Implementierungsfehler entstehen durch eine falsche/alte Canteen-ID.
     * - Wenn die ID nicht konfiguriert ist, versuchen wir automatisch eine HTW-Mensa zu finden.
     */
    private static async getCanteenId(): Promise<string | undefined> {
        if (CONFIGURED_CANTEEN_ID) return CONFIGURED_CANTEEN_ID;
        if (resolvedCanteenId) return resolvedCanteenId;

        try {
            const params = new URLSearchParams({
                loadingtype: 'lazy',
                clickandcollect: 'false',
                // name-Filter reduziert Payload und ist schneller
                name: 'Mensa HTW',
            });

            const resp = await fetch(`${API_BASE_URL}/canteen?${params.toString()}`, {
                method: 'GET',
                headers: MensaApiService.buildHeaders(),
            });

            if (!resp.ok) {
                // Wir wollen Menü-Fetches nicht hart failen, nur weil Auto-Resolve nicht klappt.
                console.warn(
                    `[MensaApiService] /canteen Auto-Resolve fehlgeschlagen (${resp.status}). Menüs werden ohne canteenId gefiltert.`
                );
                return undefined;
            }

            const canteens = (await resp.json()) as Array<{ ID?: string; name?: string }>;
            const best = Array.isArray(canteens)
                ? canteens.find((c) => (c.name || '').toLowerCase().includes('treskowallee'))
                  || canteens[0]
                : undefined;

            const id = (best?.ID || '').trim();
            if (id) {
                resolvedCanteenId = id;
                return id;
            }
        } catch (e) {
            console.warn(
                '[MensaApiService] /canteen Auto-Resolve Fehler. Menüs werden ohne canteenId gefiltert.',
                e
            );
        }

        return undefined;
    }

    // Kategorie-Mapping von API-Strings -> DishCategory Enum
    private static mapCategory(raw?: string): DishCategory {
        const value = (raw || '').toLowerCase();

        if (value.includes('suppe')) return DishCategory.SOUP;
        if (value.includes('salat')) return DishCategory.SALAD;
        if (value.includes('dessert') || value.includes('nachtisch') || value.includes('nachspeise')) {
            return DishCategory.DESSERT;
        }
        if (value.includes('beilage')) return DishCategory.SIDE_DISH;

        // Default
        return DishCategory.MAIN_COURSE;
    }

    // Badges der Mensa-API -> Labels im UI
    private static mapBadges(badges?: MensaBadge[]): DishLabel[] {
        if (!badges) return [];

        return badges.reduce<DishLabel[]>((acc, badge) => {
            const n = badge.name.toLowerCase();

            if (n.includes('vegan') && !acc.includes(DishLabel.VEGAN)) {
                acc.push(DishLabel.VEGAN);
            } else if (n.includes('vegetar') && !acc.includes(DishLabel.VEGETARIAN)) {
                acc.push(DishLabel.VEGETARIAN);
            } else if (n.includes('bio') && !acc.includes(DishLabel.ORGANIC)) {
                acc.push(DishLabel.ORGANIC);
            } else if (n.includes('regional') && !acc.includes(DishLabel.REGIONAL)) {
                acc.push(DishLabel.REGIONAL);
            } else if (n.includes('fair') && !acc.includes(DishLabel.FAIR_TRADE)) {
                acc.push(DishLabel.FAIR_TRADE);
            } else if (n.includes('halal') && !acc.includes(DishLabel.HALAL)) {
                acc.push(DishLabel.HALAL);
            } else if (n.includes('koscher') && !acc.includes(DishLabel.KOSHER)) {
                acc.push(DishLabel.KOSHER);
            }

            return acc;
        }, []);
    }

    // Ein Mensa-Meal -> Dish Modell der App
    private static mapMealToDish(meal: MensaMeal): Dish {
        const prices = meal.prices || [];

        // Helper: Preis normalisieren (String -> number, Cent -> Euro)
        const normalizePrice = (value: unknown): number | undefined => {
            if (value === null || value === undefined) return undefined;

            const num =
                typeof value === 'number'
                    ? value
                    : typeof value === 'string'
                        ? Number(value.replace(',', '.'))
                        : NaN;

            if (!Number.isFinite(num)) return undefined;

            // Heuristik: Wenn der Wert "zu groß" ist, ist er sehr wahrscheinlich in Cent (z.B. 350 -> 3.50)
            if (num >= 50) return Math.round(num) / 100;

            return num;
        };

        // Helper: priceType normalisieren (Umlaute/Leerzeichen)
        const normalizeType = (t: string) =>
            t
                .toLowerCase()
                .replace(/\s+/g, '')
                .replace('ä', 'ae')
                .replace('ö', 'oe')
                .replace('ü', 'ue')
                .replace('ß', 'ss');

        const getPrice = (types: string[]): number | undefined => {
            const wanted = new Set(types.map(normalizeType));
            const found = prices.find((p) => wanted.has(normalizeType(String(p.priceType ?? ''))));
            return normalizePrice((found as any)?.price);
        };

        const student = getPrice(['Student', 'Studierende', 'Studenten']) ?? 0;
        const employee = getPrice(['Angestellte', 'Mitarbeiter', 'Employee', 'Employees']) ?? student;
        const guest = getPrice(['Gäste', 'Gaeste', 'Guest', 'Guests']) ?? employee;

        return {
            id: meal.ID,
            name: meal.name,
            description: undefined, // Mensa-API hat keine Beschreibung, nur Namen
            category: MensaApiService.mapCategory(meal.category),
            price: {
                student,
                employee,
                guest,
            },
            nutrition: undefined, // waterBilanz / co2Bilanz könntest du hier später mappen
            allergens: [], // Additives könntest du auf Allergen-Enum mappen, wenn gewünscht
            ingredients: undefined,
            labels: MensaApiService.mapBadges(meal.badges),
            imageUrl: undefined,
            available: true,
        };
    }

    // Sortierreihenfolge für die Anzeige (Suppe -> Salat -> Hauptgericht -> Beilage -> Dessert -> Getränke)
    private static categoryOrder(cat: DishCategory): number {
        switch (cat) {
            case DishCategory.SOUP:
                return 1;
            case DishCategory.SALAD:
                return 2;
            case DishCategory.MAIN_COURSE:
                return 3;
            case DishCategory.SIDE_DISH:
                return 4;
            case DishCategory.DESSERT:
                return 5;
            case DishCategory.BEVERAGE:
                return 6;
            default:
                return 99;
        }
    }


    private static mapMenuCardToMenu(card: MensaMenuCard): Menu {
        const dishes = (card.meals || [])
            .map(MensaApiService.mapMealToDish)
            .sort((a, b) => {
                const c = MensaApiService.categoryOrder(a.category) - MensaApiService.categoryOrder(b.category);
                if (c !== 0) return c;
                return a.name.localeCompare(b.name, 'de');
            });
        const date = card.date;
        const id = card.canteenId || card.canteeenId || `mensa-${date}`;

        return {
            id,
            date,
            mealType: 'lunch', // Mensa-API unterscheidet nicht nach breakfast/lunch/dinner
            dishes,
            location: 'HTW Berlin Mensa',
            openingHours: {
                // Optional: könntest du aus /canteen und businessDays holen
                start: '11:00',
                end: '14:30',
            },
        };
    }

    /**
     * Holt das Tages-Menü für ein Datum (für die konfigurierte Mensa).
     *
     * Verwendet:
     *   GET /menue?loadingtype=complete&canteenId=...&startdate=YYYY-MM-DD&enddate=YYYY-MM-DD
     */
    static async getDailyMenu(date: Date): Promise<Menu> {
        const dateStr = formatLocalIsoDate(date);
        const canteenId = await MensaApiService.getCanteenId();

        const params = new URLSearchParams({
            loadingtype: 'complete',
            startdate: dateStr,
            enddate: dateStr,
        });

        if (canteenId) {
            params.append('canteenId', canteenId);
        }

        const response = await fetch(
            `${API_BASE_URL}/menue?${params.toString()}`,
            {
                method: 'GET',
                headers: MensaApiService.buildHeaders(),
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(
                `Mensa API Fehler (${response.status}): ${
                    text || response.statusText
                }`
            );
        }

        const data = (await response.json()) as MensaMenuCard[];

        // Kein Menü für diesen Tag => leeres Menü zurückgeben,
        // damit die UI "kein Menü verfügbar" anzeigen kann.
        if (!Array.isArray(data) || data.length === 0) {
            return {
                id: `empty-${dateStr}`,
                date: dateStr,
                mealType: 'lunch',
                dishes: [],
                location: 'HTW Berlin Mensa',
                openingHours: {
                    start: '',
                    end: '',
                },
            };
        }

        const card = canteenId
            ?
              data.find((c) => c.canteenId === canteenId || c.canteeenId === canteenId) ||
              data[0]
            : data[0];

        return MensaApiService.mapMenuCardToMenu(card);
    }

    /**
     * Optionale Wochenübersicht – falls du die später brauchst.
     * Holt Menüs für Mo–Fr der Woche von referenceDate.
     */
    static async getWeeklyMenu(referenceDate: Date = new Date()): Promise<Menu[]> {
        const start = new Date(referenceDate);
        const day = start.getDay(); // 0=So, 1=Mo
        const diffToMonday = (day + 6) % 7;
        start.setDate(start.getDate() - diffToMonday);

        const end = new Date(start);
        end.setDate(start.getDate() + 4); // Mo–Fr

        const startStr = formatLocalIsoDate(start);
        const endStr = formatLocalIsoDate(end);

        const canteenId = await MensaApiService.getCanteenId();

        const params = new URLSearchParams({
            loadingtype: 'complete',
            startdate: startStr,
            enddate: endStr,
        });

        if (canteenId) params.append('canteenId', canteenId);

        const response = await fetch(
            `${API_BASE_URL}/menue?${params.toString()}`,
            {
                method: 'GET',
                headers: MensaApiService.buildHeaders(),
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(
                `Mensa API Fehler (${response.status}): ${
                    text || response.statusText
                }`
            );
        }

        const data = (await response.json()) as MensaMenuCard[];
        if (!Array.isArray(data)) return [];

        return data.map(MensaApiService.mapMenuCardToMenu);
    }

    /**
     * Suche nach Gerichten (optional, falls du später ein Suchfeld nutzt).
     * Nutzt GET /meal?name=...&loadingtype=mealonly
     */
    static async searchDishes(query: string): Promise<Dish[]> {
        const params = new URLSearchParams({
            loadingtype: 'mealonly',
            name: query,
        });

        const response = await fetch(
            `${API_BASE_URL}/meal?${params.toString()}`,
            {
                method: 'GET',
                headers: MensaApiService.buildHeaders(),
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(
                `Mensa API Fehler (${response.status}): ${
                    text || response.statusText
                }`
            );
        }

        const data = (await response.json()) as MensaMeal[];
        if (!Array.isArray(data)) return [];

        return data.map(MensaApiService.mapMealToDish);
    }

    /**
     * Gericht-Details by ID (nutzt /meal mit ID-Filter).
     */
    static async getDishDetails(dishId: string): Promise<Dish> {
        const params = new URLSearchParams({
            loadingtype: 'complete',
            ID: dishId,
        });

        const response = await fetch(
            `${API_BASE_URL}/meal?${params.toString()}`,
            {
                method: 'GET',
                headers: MensaApiService.buildHeaders(),
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(
                `Mensa API Fehler (${response.status}): ${
                    text || response.statusText
                }`
            );
        }

        const data = (await response.json()) as MensaMeal[];

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Gericht nicht gefunden');
        }

        return MensaApiService.mapMealToDish(data[0]);
    }
}
