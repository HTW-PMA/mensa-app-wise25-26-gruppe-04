import { useState, useEffect, useCallback } from 'react';
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

// Simple event emitter so settings changes propagate to all consumers
type Listener = () => void;
const listeners = new Set<Listener>();

export function notifyPreferencesChanged(): void {
  listeners.forEach((fn) => fn());
}

export function useUserPreferences(): UserPrefsData {
  const [prefs, setPrefs] = useState<UserPrefsData>(EMPTY);

  const load = useCallback(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setPrefs({
            dietaryRestrictions: parsed.dietaryRestrictions ?? [],
            allergens: parsed.allergens ?? [],
          });
        } catch {
          // ignore parse errors
        }
      } else {
        setPrefs(EMPTY);
      }
    });
  }, []);

  useEffect(() => {
    load();
    listeners.add(load);
    return () => { listeners.delete(load); };
  }, [load]);

  return prefs;
}
