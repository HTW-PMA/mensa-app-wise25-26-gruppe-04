import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Menu } from '@/models';
import { MensaOfflineService } from '@/services/offline/mensaOfflineService';
import { onPreferencesChanged } from './useUserPreferences';

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
  'crustaceans',
  'eggs',
  'fish',
  'peanuts',
  'soybeans',
  'milk',
  'nuts',
  'celery',
  'mustard',
  'sesame',
  'sulphites',
  'lupin',
  'molluscs',
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

// Check if a dish matches the user's dietary preferences
function dishMatchesDiet(dish: any, prefs: UserPreferences): boolean {
  if (prefs.dietaryRestrictions.length === 0) return false;
  const meta = getDishMeta(dish);
  return prefs.dietaryRestrictions.every((d) => meta.dietary.includes(d));
}

// Check if a dish contains any of the user's selected allergens
function dishHasUserAllergen(dish: any, prefs: UserPreferences): boolean {
  if (prefs.allergens.length === 0) return false;
  const dishAllergens = Array.isArray(dish?.allergens)
    ? dish.allergens.map((a: any) => String(a))
    : [];
  if (dishAllergens.length === 0) return false;
  return prefs.allergens.some((a) => dishAllergens.includes(a));
}

// Sort dishes: preference matches first, then neutral, then allergen warnings last
function sortMenu(menu: Menu, prefs: UserPreferences): Menu {
  const m: any = menu;
  const hasDietFilters = prefs.dietaryRestrictions.length > 0;
  const hasAllergenFilters = prefs.allergens.length > 0;

  const sortDishes = (dishes: any[]) => {
    if (!hasDietFilters && !hasAllergenFilters) return dishes;
    return [...dishes].sort((a, b) => {
      const aRank = dishMatchesDiet(a, prefs) ? 0 : dishHasUserAllergen(a, prefs) ? 2 : 1;
      const bRank = dishMatchesDiet(b, prefs) ? 0 : dishHasUserAllergen(b, prefs) ? 2 : 1;
      return aRank - bRank;
    });
  };

  if (Array.isArray(m?.items)) {
    return { ...(menu as any), items: sortDishes(m.items) };
  }
  if (Array.isArray(m?.dishes)) {
    return { ...(menu as any), dishes: sortDishes(m.dishes) };
  }
  if (Array.isArray(m?.categories)) {
    const categories = m.categories.map((cat: any) => {
      if (Array.isArray(cat?.items)) {
        return { ...cat, items: sortDishes(cat.items) };
      }
      return cat;
    });
    return { ...(menu as any), categories };
  }

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

  const reloadPreferences = async () => {
    const p = await loadPrefs();
    setPreferences(p);
    if (menu) {
      setFilteredMenu(sortMenu(menu, p));
    }
  };

  // Automatically reload when preferences change from settings
  useEffect(() => {
    return onPreferencesChanged(() => {
      reloadPreferences();
    });
  }, [menu]);

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
        setFilteredMenu(sortMenu(result.data, prefs));
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
      setFilteredMenu(sortMenu(result.data, prefs));
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
