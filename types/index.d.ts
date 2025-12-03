/**
 * Global Type Definitions
 */

declare module '@/models' {
  export * from '../models';
}

declare module '@/services/api/mensaApi' {
  export * from '../services/api/mensaApi';
}

declare module '@/services/ai/aiService' {
  export * from '../services/ai/aiService';
}

declare module '@/config/api.config' {
  export * from '../config/api.config';
}

declare module '@/config/constants' {
  export * from '../config/constants';
}

// Environment variables
declare module '@env' {
  export const EXPO_PUBLIC_MENSA_API_URL: string;
  export const EXPO_PUBLIC_OPENAI_API_KEY: string;
}
