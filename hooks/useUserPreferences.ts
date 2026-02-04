import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = '@mensa_app_preferences';

export interface UserPreferences {
  dietaryRestrictions: string[];
  allergens: string[];
  maxPrice: number;
  notificationsEnabled: boolean;
}

const DEFAULT_PREFS: UserPreferences = {
  dietaryRestrictions: [],
  allergens: [],
  maxPrice: 10,
  notificationsEnabled: false,
};

export function useUserPreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  const load = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs(JSON.parse(raw));
      else setPrefs(DEFAULT_PREFS);
    } finally {
      setLoadingPrefs(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { prefs, loadingPrefs, reloadPrefs: load };
}
