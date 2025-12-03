/**
 * User Preferences Data Model
 */

import { Allergen, DishLabel } from './Dish';

export interface UserPreferences {
  id: string;
  userId?: string;
  dietaryRestrictions: DishLabel[];
  allergens: Allergen[];
  dislikedIngredients: string[];
  preferredCategories: string[];
  maxCalories?: number;
  minProtein?: number;
  notifications: NotificationPreferences;
  theme: 'light' | 'dark' | 'auto';
  language: 'de' | 'en';
}

export interface NotificationPreferences {
  enabled: boolean;
  dailyMenu: boolean;
  favorites: boolean;
  specialOffers: boolean;
  time?: string; // HH:MM format
}

export const defaultUserPreferences: UserPreferences = {
  id: 'default',
  dietaryRestrictions: [],
  allergens: [],
  dislikedIngredients: [],
  preferredCategories: [],
  notifications: {
    enabled: false,
    dailyMenu: false,
    favorites: false,
    specialOffers: false,
  },
  theme: 'auto',
  language: 'de',
};
