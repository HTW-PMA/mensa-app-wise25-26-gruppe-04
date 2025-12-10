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

// HARDCODED API Config (da .env in React Native nicht zuverlässig funktioniert)
const API_BASE_URL = 'https://mensa.gregorflachs.de/api/v1';
const API_KEY = 'lylDptJVKMnASYr0Equ4Wk3lAtHdSmKBcuVHRL5h3Czlj6/BllEEo58Imkbj5M3f+wJwbnkLTMEEM/UHsRlPUSfCMfaf8Bi0zGYzuIAWbGnUtJNFs3f9j1LvJzJy6x+bNuvMqi5h632L2MdJ81NXnfnb1gI12bKtKxLqFTNAHmHLiEx72uh0uATs0xyrewHOujMv9JFIqfdjFIi3YCT0+6zMmkS6pedLvilyMJLy9f/BCMd2Ow7+3rEMbXjuLMJ6lXGofPbt3S1KILzZ7XrxVCxNpye9WSCj1KQdjceLyjX1CPqbXhiexhoTo3lcgQsCTy9S11G5NuAvgtrSMYx4hg==';
const CANTEEN_ID = '5f6b9c6c7c8a9e0017a5f3b7';

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

        const getPrice = (type: string): number | undefined => {
            const found = prices.find(
                (p) => p.priceType.toLowerCase() === type.toLowerCase()
            );
            return found?.price;
        };

        const student = getPrice('Student') ?? getPrice('Studierende') ?? 0;
        const employee = getPrice('Angestellte') ?? student;
        const guest = getPrice('Gäste') ?? employee;

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

    private static mapMenuCardToMenu(card: MensaMenuCard): Menu {
        const dishes = (card.meals || []).map(MensaApiService.mapMealToDish);
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
        const dateStr = date.toISOString().split('T')[0];

        if (!CANTEEN_ID) {
            console.warn(
                '[MensaApiService] Keine Mensa-ID gesetzt – nehme erstes Ergebnis aus /menue.'
            );
        }

        const params = new URLSearchParams({
            loadingtype: 'complete',
            startdate: dateStr,
            enddate: dateStr,
        });

        if (CANTEEN_ID) {
            params.append('canteenId', CANTEEN_ID);
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

        const card = CANTEEN_ID
            ? data.find(
            (c) =>
                c.canteenId === CANTEEN_ID || c.canteeenId === CANTEEN_ID
        ) || data[0]
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

        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        const params = new URLSearchParams({
            loadingtype: 'complete',
            startdate: startStr,
            enddate: endStr,
        });

        if (CANTEEN_ID) {
            params.append('canteenId', CANTEEN_ID);
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
