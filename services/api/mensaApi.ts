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

import { Dish, DishCategory, DishLabel } from '../../models/Dish';
import { Menu } from '../../models/Menu';
import { API_CONFIG } from '../../config/api.config';
import { LOCATIONS } from '../../constants/locations';

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
const resolvedCanteenIdByLocation = new Map<string, string>();

// In-Memory Cache für Berliner Mensen (lazy). Spart Requests und macht Matching robuster.
type LazyCanteen = {
    id?: string;   // <- korrekt laut API-Response
    ID?: string;   // <- optional für Abwärtskompatibilität
    name?: string;
    address?: {
        street?: string;
        city?: string;
        zipcode?: string;
        district?: string;
    };
};


let cachedBerlinCanteens: LazyCanteen[] | null = null;

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
    private static async getCanteenId(locationId: string = 'htw'): Promise<string | undefined> {
        // Wenn explizit konfiguriert (z.B. für Debugging), für die Default-Location (htw) bevorzugen
        if (CONFIGURED_CANTEEN_ID && (!locationId || locationId === 'htw')) return CONFIGURED_CANTEEN_ID;

        const cached = resolvedCanteenIdByLocation.get(locationId);
        if (cached) return cached;

        // Heuristik: Wir holen einmalig alle Mensen in Berlin (lazy) und matchen dann client-seitig.
        // Hintergrund: der Server-Filter `name` ist nicht immer zuverlässig genug und unsere alte
        // "erste Mensa"-Logik führte dazu, dass alle Unis dieselbe Mensa bekamen.
        const loc = LOCATIONS.find((l) => l.id === locationId);
        const searchTerm = (loc?.canteenSearch || '').trim();

        const extractZip = (address?: string): string | undefined => {
            if (!address) return undefined;
            const m = address.match(/\b\d{5}\b/);
            return m?.[0];
        };

        const tokenize = (raw: string): string[] =>
            raw
                .toLowerCase()
                .replace(/[()–—,:]/g, ' ')
                .replace(/\./g, ' ')
                .split(/\s+/)
                .map((s) => s.trim())
                .filter(Boolean);

        const getKeywords = (): string[] => {
            // Ziel: genug *einzigartige* Tokens erzeugen, damit nicht alle Locations
            // auf "candidates[0]" fallen, wenn z.B. "FU" nicht im Mensa-Namen steht.
            const parts: string[] = [];
            if (searchTerm) parts.push(searchTerm);
            if (loc?.name) parts.push(loc.name);
            if (loc?.address) parts.push(loc.address);

            const stop = new Set([
                'mensa',
                'cafeteria',
                'berlin',
                'zu',
                'der',
                'die',
                'das',
                'und',
                'für',
                'fuer',
                'universitaet',
                'universität',
                'hochschule',
                'für',
                'technik',
                'wirtschaft',
                'und',
                'recht',
                'medizin',
            ]);

            const tokens = tokenize(parts.join(' ')).filter((t) => !stop.has(t));

            // spezielle Abkürzungen als starke Keywords
            const id = locationId.toLowerCase();
            const extra: string[] = [];
            if (id === 'fu') extra.push('fu', 'freie');
            if (id === 'hu') extra.push('hu', 'humboldt');
            if (id === 'tu') extra.push('tu', 'technische');
            if (id === 'udk') extra.push('udk', 'kuenste', 'künste');
            if (id === 'charite') extra.push('charite', 'charité');
            if (id === 'htw') extra.push('htw', 'treskowallee', 'wilhelminenhof');
            if (id === 'bht') extra.push('bht');
            if (id === 'hwr') extra.push('hwr');
            if (id === 'ash') extra.push('ash');
            if (id === 'ehb') extra.push('ehb');
            if (id === 'khsb') extra.push('khsb');

            const combined = [...extra, ...tokens];

            // Duplikate raus
            return Array.from(new Set(combined)).filter((t) => t.length >= 2);
        };

        const scoreCanteen = (canteen: LazyCanteen, keywords: string[]): number => {
            const n = (canteen.name || '').toLowerCase();
            const street = (canteen.address?.street || '').toLowerCase();
            const zipcode = (canteen.address?.zipcode || '').toLowerCase();
            const district = (canteen.address?.district || '').toLowerCase();

            const haystack = `${n} ${street} ${zipcode} ${district}`;
            let score = 0;
            for (const kw of keywords) {
                if (kw.length < 2) continue;
                if (haystack.includes(kw.toLowerCase())) score += 12;
            }
            // Kleine Boni für sehr typische Campus-Begriffe
            if (locationId === 'htw' && (n.includes('treskowallee') || n.includes('wilhelminenhof'))) score += 50;
            if (locationId === 'tu' && (n.includes('tub') || n.includes('tu berlin') || n.includes('march') || n.includes('hardenberg'))) score += 20;
            if (locationId === 'hu' && (n.includes('hu') || n.includes('humboldt'))) score += 20;
            if (locationId === 'fu' && (n.includes('fu') || n.includes('freie'))) score += 20;
            if (locationId === 'charite' && n.includes('charité')) score += 30;

            // Bonus: wenn PLZ der Uni (aus loc.address) matcht
            const locZip = extractZip(loc?.address);
            if (locZip && zipcode.includes(locZip)) score += 25;
            return score;
        };

        const fetchCanteens = async (query: Record<string, string>): Promise<LazyCanteen[]> => {
            const params = new URLSearchParams({ loadingtype: 'lazy', ...query });
            const resp = await fetch(`${API_BASE_URL}/canteen?${params.toString()}`, {
                method: 'GET',
                headers: MensaApiService.buildHeaders(),
            });
            if (!resp.ok) return [];
            const all = (await resp.json()) as LazyCanteen[];
            return Array.isArray(all) ? all : [];
        };

        try {
            // 1) Erst versuchen wir eine *zielgerichtete* Suche:
            //    - wenn canteenSearch gesetzt ist -> name-Filter
            //    - sonst (oder zusätzlich) -> PLZ-Filter anhand Uni-Adresse
            const locZip = extractZip(loc?.address);

            let candidates: LazyCanteen[] = [];

            if (searchTerm) {
                candidates = await fetchCanteens({ name: searchTerm });
            }

            if (candidates.length === 0 && locZip) {
                // Viele Mensen liegen in der gleichen PLZ wie der Campus.
                candidates = await fetchCanteens({ zipcode: locZip });
            }

            // 2) Fallback: globaler Berlin-Cache
            if (candidates.length === 0) {
                if (!cachedBerlinCanteens) {
                    // "Mensa" + "Cafeteria" holt deutlich mehr passende Treffer ab
                    const [mensen, cafes] = await Promise.all([
                        fetchCanteens({ name: 'Mensa' }),
                        fetchCanteens({ name: 'Cafeteria' }),
                    ]);

                    const all = [...mensen, ...cafes];
                    cachedBerlinCanteens = Array.isArray(all)
                        ? all.filter((c) => (c.address?.city || '').toLowerCase().includes('berlin'))
                        : [];
                }
                candidates = cachedBerlinCanteens || [];
            }

            const keywords = getKeywords();

            let best: { ID?: string; name?: string } | undefined;
            let bestScore = -1;

            for (const c of candidates) {
                if (!c?.name) continue;
                const s = scoreCanteen(c, keywords);
                if (s > bestScore) {
                    bestScore = s;
                    best = c;
                }
            }

            // Wenn wir gar keinen Keyword-Match hatten, nimm deterministisch *nicht immer* candidates[0],
            // sonst sehen alle Unis identische Menüs.
            if (!best || bestScore <= 0) {
                if (candidates.length > 0) {
                    const idx = Math.abs(
                        Array.from(locationId).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
                    ) % candidates.length;
                    best = candidates[idx];
                } else {
                    best = undefined;
                }
            }

            const id = String((best as any)?.id || (best as any)?.ID || '').trim();
            if (id) {
                resolvedCanteenIdByLocation.set(locationId, id);
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

        // Helper: Preis normalisieren -> **Cent (int)**
        // Die UI (DishCard) formatiert aktuell in Cent (price/100).
        // Die Mensa-API liefert Preise als Euro (z.B. 3.5). Daher hier -> Cent.
        const normalizePrice = (value: unknown): number | undefined => {
            if (value === null || value === undefined) return undefined;

            const num =
                typeof value === 'number'
                    ? value
                    : typeof value === 'string'
                        ? Number(value.replace(',', '.'))
                        : NaN;

            if (!Number.isFinite(num)) return undefined;

            // Wenn die API doch mal Cent liefern sollte (z.B. 350), normalisieren wir trotzdem auf Cent.
            if (num >= 50) return Math.round(num);

            // Standard: Euro -> Cent
            return Math.round(num * 100);
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


    private static mapMenuCardToMenu(card: MensaMenuCard, locationName: string = 'UniMensa Berlin'): Menu {
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
            location: locationName,
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
    static async getDailyMenu(date: Date, locationId: string = 'htw'): Promise<Menu> {
        const dateStr = formatLocalIsoDate(date);
        const canteenId = await MensaApiService.getCanteenId(locationId);
        const locationName = LOCATIONS.find((l) => l.id === locationId)?.name || 'UniMensa Berlin';

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
                location: locationName,
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

        return MensaApiService.mapMenuCardToMenu(card, locationName);
    }

    /**
     * Optionale Wochenübersicht – falls du die später brauchst.
     * Holt Menüs für Mo–Fr der Woche von referenceDate.
     */
    static async getWeeklyMenu(referenceDate: Date = new Date(), locationId: string = 'htw'): Promise<Menu[]> {
        const start = new Date(referenceDate);
        const day = start.getDay(); // 0=So, 1=Mo
        const diffToMonday = (day + 6) % 7;
        start.setDate(start.getDate() - diffToMonday);

        const end = new Date(start);
        end.setDate(start.getDate() + 4); // Mo–Fr

        const startStr = formatLocalIsoDate(start);
        const endStr = formatLocalIsoDate(end);

        const canteenId = await MensaApiService.getCanteenId(locationId);
        const locationName = LOCATIONS.find((l) => l.id === locationId)?.name || 'UniMensa Berlin';

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

        return data.map((card) => MensaApiService.mapMenuCardToMenu(card, locationName));
    }

    /**
     * Gibt alle Mensen im Raum Berlin zurück.
     * - API-seitig gibt es keinen direkten city-Filter → wir filtern client-seitig nach address.city.
     * - Nutzt loadingtype=lazy für geringere Payload.
     */
    static async getBerlinCanteens(): Promise<{ ID: string; name: string }[]> {
        const params = new URLSearchParams({ loadingtype: 'lazy' });

        const response = await fetch(`${API_BASE_URL}/canteen?${params.toString()}`, {
            method: 'GET',
            headers: MensaApiService.buildHeaders(),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Mensa API Fehler (${response.status}): ${text || response.statusText}`);
        }

        const data = (await response.json()) as { ID?: string; name?: string; address?: { city?: string } }[];

        if (!Array.isArray(data)) return [];

        return data
            .filter((c) => (c.address?.city || '').toLowerCase().includes('berlin'))
            .filter((c) => !!c.ID && !!c.name)
            .map((c) => ({ ID: String(c.ID), name: String(c.name) }));
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
