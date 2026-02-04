import "dotenv/config";

export default ({ config }) => {
  const extra = { ...config.extra };

  // Only override app.json values when env vars are actually set
  if (process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
    extra.EXPO_PUBLIC_OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  }
  if (process.env.EXPO_PUBLIC_MENSA_API_URL) {
    extra.EXPO_PUBLIC_MENSA_API_URL = process.env.EXPO_PUBLIC_MENSA_API_URL;
  }
  if (process.env.EXPO_PUBLIC_MENSA_API_KEY) {
    extra.EXPO_PUBLIC_MENSA_API_KEY = process.env.EXPO_PUBLIC_MENSA_API_KEY;
  }
  if (process.env.EXPO_PUBLIC_MENSA_CANTEEN_ID) {
    extra.EXPO_PUBLIC_MENSA_CANTEEN_ID = process.env.EXPO_PUBLIC_MENSA_CANTEEN_ID;
  }

  return {
    ...config,
    extra,
  };
};
