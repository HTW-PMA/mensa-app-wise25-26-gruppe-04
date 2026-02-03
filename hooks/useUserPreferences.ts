import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mensa_app_preferences';

export interface UserPrefsData {
  dietaryRestrictions: string[];
  allergens: string[];
}

const EMPTY: UserPrefsData = { dietaryRestrictions: [], allergens: [] };

// Maps settings allergen IDs to Dish.allergens enum values
export const ALLERGEN_ID_MAP: Record<string, string> = {
  gluten: 'gluten',
  milk: 'milk',
  eggs: 'eggs',
  fish: 'fish',
  shellfish: 'crustaceans',
  nuts: 'nuts',
  peanuts: 'peanuts',
  soy: 'soybeans',
  celery: 'celery',
  mustard: 'mustard',
  sesame: 'sesame',
  sulfites: 'sulphites',
};

// Human-readable names for allergens
export const ALLERGEN_LABELS: Record<string, string> = {
  gluten: 'Gluten',
  milk: 'Milch',
  eggs: 'Eier',
  fish: 'Fisch',
  shellfish: 'Schalentiere',
  nuts: 'Nuesse',
  peanuts: 'Erdnuesse',
  soy: 'Soja',
  celery: 'Sellerie',
  mustard: 'Senf',
  sesame: 'Sesam',
  sulfites: 'Sulfite',
};

export function useUserPreferences(): UserPrefsData {
  const [prefs, setPrefs] = useState<UserPrefsData>(EMPTY);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw && mounted) {
        try {
          const parsed = JSON.parse(raw);
          setPrefs({
            dietaryRestrictions: parsed.dietaryRestrictions ?? [],
            allergens: parsed.allergens ?? [],
          });
        } catch {
          // ignore parse errors
        }
      }
    });
    return () => { mounted = false; };
  }, []);

  return prefs;
}
