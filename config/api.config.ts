/**
 * API Configuration
 */
import Constants from 'expo-constants';

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return Constants.expoConfig?.extra?.[key] || defaultValue;
};

export const API_CONFIG = {
    MENSA_API: {
        // <-- NEU: Standard-Basis-URL aus der mensa.gregorflachs.de API
        BASE_URL:
            getEnvVar('EXPO_PUBLIC_MENSA_API_URL', 'https://mensa.gregorflachs.de/api/v1'),
        TIMEOUT: 10000, // 10 seconds
        API_KEY: getEnvVar('EXPO_PUBLIC_MENSA_API_KEY', ''),
        // Optional: Wenn gesetzt, wird genau diese Mensa verwendet.
        // Wenn leer, versucht der Service automatisch eine passende HTW-Mensa zu finden.
        CANTEEN_ID: getEnvVar('EXPO_PUBLIC_MENSA_CANTEEN_ID', ''),
        RETRY_ATTEMPTS: 3,
    },
  
 AI_API: {
   BASE_URL: 'https://api.x.ai/v1',
   API_KEY: getEnvVar('EXPO_PUBLIC_OPENAI_API_KEY', ''),
   MODEL: 'grok-2-latest',
   MAX_TOKENS: 1000,
   TEMPERATURE: 0.7,
 },

};

export const ENDPOINTS = {
  // Hinweis: Die Mensa-API hat die Endpunkte /menue und /meal (nicht /menu oder /dishes)
  MENSA: {
    CANTEEN: '/canteen',
    MENUE: '/menue',
    MEAL: '/meal',
    ADDITIVE: '/additive',
    BADGE: '/badge',
    MEAL_REVIEW: '/mealreview',
    CANTEEN_REVIEW: '/canteenreview',
  },
};
