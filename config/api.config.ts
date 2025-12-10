/**
 * API Configuration
 */

export const API_CONFIG = {
    MENSA_API: {
        // <-- NEU: Standard-Basis-URL aus der mensa.gregorflachs.de API
        BASE_URL:
            process.env.EXPO_PUBLIC_MENSA_API_URL ||
            'https://mensa.gregorflachs.de/api/v1',
        TIMEOUT: 10000, // 10 seconds
        API_KEY: process.env.EXPO_PUBLIC_MENSA_API_KEY || '',
        RETRY_ATTEMPTS: 3,
    },
  
  AI_API: {
    BASE_URL: 'https://api.openai.com/v1',
    API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
    MODEL: 'gpt-4.1-mini',
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7,
  },
};

export const ENDPOINTS = {
  MENU: {
    DAILY: '/menu/daily',
    WEEKLY: '/menu/weekly',
    SEARCH: '/dishes/search',
  },
  DISHES: {
    DETAILS: '/dishes',
    FAVORITES: '/dishes/favorites',
  },
};
