import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Menu } from '@/models';
import { MensaOfflineService } from '@/services/offline/mensaOfflineService';

const STORAGE_KEY = '@mensa_app_preferences';

export interface UserPreferences {
  dietaryRestrictions: string[];
  allergens: string[];
  maxPrice: number;
  notificationsEnabled: boolean;
}

// Fallback-Defaults (wenn noch nichts gespeichert wurde)
const DEFAULT_PREFS: UserPreferences = {
  dietaryRestrictions: [],
  allergens: [],
  maxPrice: 10,
  notificationsEnabled: false,
};

// Diese IDs müssen zu deinen Settings passen (tun sie bei dir)
const DIETARY_IDS = new Set([
  'vegetarian',
  'vegan',
  'glutenfree',
  'lactosefree',
  'halal',
  'kosher',
]);

const ALLERGEN_IDS = new Set([
  'gluten',
  'milk',
  'eggs',
  'fish',
  'shellfish',
  'nuts',
  'peanuts',
  'soy',
  'celery',
  'mustard',
  'sesame',
  'sulfites',
]);

// Hilfsfunktion: Preferences laden
async function loadPrefs(): Promise<UserPreferences> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFS;

    const parsed = JSON.parse(stored) as Partial<UserPreferences> | null;

    return {
      dietaryRestrictions: Array.isArray(parsed?.dietaryRestrictions) ? parsed!.dietaryRestrictions : [],
      allergens: Array.isArray(parsed?.allergens) ? parsed!.allergens : [],
      maxPrice: typeof parsed?.maxPrice === 'number' ? parsed!.maxPrice : 10,
      notificationsEnabled: typeof parsed?.notificationsEnabled === 'boolean' ? parsed!.notificationsEnabled : false,
    };
  } catch {
    // Wenn JSON kaputt ist o.ä. -> einfach Defaults
    return DEFAULT_PREFS;
  }
}

// ✅ Diese Funktion müssen wir im nächsten Schritt korrekt an euer Datenmodell anpassen.
// Aktuell: versucht typische Felder zu lesen, sonst neutral.
function getDishMeta(dish: any): { dietary: string[]; allergens: string[]; price?: number } {
  const dietaryRaw =
    dish?.dietary ||
    dish?.dietaries ||
    dish?.labels ||
    dish?.tags ||
    dish?.attributes ||
    [];

  const allergensRaw =
    dish?.allergens ||
    dish?.allergenes ||
    dish?.allergy ||
    dish?.contains ||
    [];

  const dietary = Array.isArray(dietaryRaw)
    ? dietaryRaw.map((x: any) => String(x).toLowerCase()).filter((x: string) => DIETARY_IDS.has(x))
    : [];

  const allergens = Array.isArray(allergensRaw)
    ? allergensRaw.map((x: any) => String(x).toLowerCase()).filter((x: string) => ALLERGEN_IDS.has(x))
    : [];

  const price =
    typeof dish?.price === 'number'
      ? dish.price
      : typeof dish?.studentPrice === 'number'
        ? dish.studentPrice
        : undefined;

  return { dietary, allergens, price };
}

// Filter-Regeln:
// - dietaryRestrictions: nur Gerichte behalten, die alle ausgewählten “Diet”-Labels erfüllen
// - allergens: Gerichte entfernen, die ein ausgewähltes Allergen enthalten
// - maxPrice: optional (falls Preis-Feld vorhanden)
function dishPassesFilters(dish: any, prefs: UserPreferences): boolean {
  const meta = getDishMeta(dish);

  // Allergene: wenn User sagt "ich habe X", dann darf Gericht X NICHT enthalten
  if (prefs.allergens.length > 0) {
    const hit = prefs.allergens.some((a) => meta.allergens.includes(a));
    if (hit) return false;
  }

  // Ernährungspräferenzen (simple): alle gewählten Labels müssen vorhanden sein
  if (prefs.dietaryRestrictions.length > 0) {
    const ok = prefs.dietaryRestrictions.every((d) => meta.dietary.includes(d));
    if (!ok) return false;
  }

  // Preis (nur wenn wir überhaupt Preis erkennen)
  if (typeof meta.price === 'number' && meta.price > prefs.maxPrice) {
    return false;
  }

  return true;
}

// Menü “durchfiltern” – wir versuchen typische Strukturen zu behandeln.
// Falls eure Struktur anders ist, passen wir das gleich an.
function filterMenu(menu: Menu, prefs: UserPreferences): Menu {
  const m: any = menu;

  // Häufig: menu.items oder menu.dishes
  if (Array.isArray(m?.items)) {
    return { ...(menu as any), items: m.items.filter((dish: any) => dishPassesFilters(dish, prefs)) };
  }
  if (Array.isArray(m?.dishes)) {
    return { ...(menu as any), dishes: m.dishes.filter((dish: any) => dishPassesFilters(dish, prefs)) };
  }

  // Häufig: menu.categories -> category.items
  if (Array.isArray(m?.categories)) {
    const categories = m.categories.map((cat: any) => {
      if (Array.isArray(cat?.items)) {
        return { ...cat, items: cat.items.filter((dish: any) => dishPassesFilters(dish, prefs)) };
      }
      return cat;
    });
    return { ...(menu as any), categories };
  }

  // Unknown Struktur -> unverändert zurückgeben
  return menu;
}

export function useMenuData(date?: Date, locationId: string = 'htw') {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [filteredMenu, setFilteredMenu] = useState<Menu | null>(null);

  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFS);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // optional: UI kann anzeigen “aus Cache”
  const [source, setSource] = useState<'network' | 'cache' | null>(null);

  // Preferences laden + bei Änderungen (z.B. wenn man im Settings Screen was toggelt)
  // -> Wir triggern neu über AsyncStorage nicht automatisch.
  // Dafür machen wir gleich einen "reloadPreferences" den du auf Settings-Navigation nutzen kannst.
  const reloadPreferences = async () => {
    const p = await loadPrefs();
    setPreferences(p);
    if (menu) {
      setFilteredMenu(filterMenu(menu, p));
    }
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        const [result, prefs] = await Promise.all([
          MensaOfflineService.getDailyMenu(date || new Date(), locationId),
          loadPrefs(),
        ]);

        setMenu(result.data);
        setSource(result.source);

        setPreferences(prefs);
        setFilteredMenu(filterMenu(result.data, prefs));
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [date, locationId]);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);

      const [result, prefs] = await Promise.all([
        MensaOfflineService.refreshDailyMenu(date || new Date(), locationId),
        loadPrefs(),
      ]);

      setMenu(result.data);
      setSource(result.source);

      setPreferences(prefs);
      setFilteredMenu(filterMenu(result.data, prefs));
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    menu,            // original
    filteredMenu,    // ✅ das ist das “angepasste Menü”
    preferences,     // ✅ damit UI Tags/Warnungen anzeigen kann
    reloadPreferences, // ✅ später wenn man aus Settings zurückkommt
    loading,
    error,
    refresh,
    source,
  };
}
