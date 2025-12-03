/**
 * App Constants
 */

export const APP_CONSTANTS = {
  APP_NAME: 'HTW Mensa App',
  APP_VERSION: '1.0.0',
  
  MENSA: {
    NAME: 'HTW Berlin Mensa',
    ADDRESS: 'Wilhelminenhofstraße 75A, 12459 Berlin',
    PHONE: '+49 30 5019-0',
    EMAIL: 'info@htw-berlin.de',
  },
  
  OPENING_HOURS: {
    MONDAY_FRIDAY: {
      START: '11:00',
      END: '14:30',
    },
    WEEKEND: {
      CLOSED: true,
    },
  },
  
  PRICE_CATEGORIES: {
    STUDENT: 'student',
    EMPLOYEE: 'employee',
    GUEST: 'guest',
  },
  
  STORAGE_KEYS: {
    USER_PREFERENCES: '@mensa_app:user_preferences',
    FAVORITES: '@mensa_app:favorites',
    THEME: '@mensa_app:theme',
  },
  
  AI_FEATURES: {
    MAX_MESSAGE_LENGTH: 500,
    CHAT_HISTORY_LIMIT: 50,
    RECOMMENDATION_LIMIT: 5,
  },
};

export const ALLERGEN_LABELS: Record<string, string> = {
  gluten: 'Gluten',
  crustaceans: 'Krebstiere',
  eggs: 'Eier',
  fish: 'Fisch',
  peanuts: 'Erdnüsse',
  soybeans: 'Soja',
  milk: 'Milch',
  nuts: 'Nüsse',
  celery: 'Sellerie',
  mustard: 'Senf',
  sesame: 'Sesam',
  sulphites: 'Sulfite',
  lupin: 'Lupinen',
  molluscs: 'Weichtiere',
};

export const DISH_LABEL_ICONS: Record<string, string> = {
  vegetarian: '🥗',
  vegan: '🌱',
  organic: '🌾',
  regional: '🏞️',
  fair_trade: '🤝',
  halal: '☪️',
  kosher: '✡️',
};
