import "dotenv/config";

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    EXPO_PUBLIC_OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    EXPO_PUBLIC_MENSA_API_URL: process.env.EXPO_PUBLIC_MENSA_API_URL,
    EXPO_PUBLIC_MENSA_API_KEY: process.env.EXPO_PUBLIC_MENSA_API_KEY,
    EXPO_PUBLIC_MENSA_CANTEEN_ID: process.env.EXPO_PUBLIC_MENSA_CANTEEN_ID,
  },
});
