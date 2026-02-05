import "dotenv/config";

export default ({ config }) => {
  const extra = { ...(config.extra ?? {}) };

  // Env Vars nur überschreiben, wenn gesetzt (wie bei dir)
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

  // WICHTIG: EAS-ProjectId fest drin lassen
  extra.eas = {
    ...(extra.eas ?? {}),
    projectId: "3e9f4af8-8657-4562-8f7a-e85a5cd12397",
  };

  return {
    ...config,


    slug: "htw-mensa-app",

    name: config.name ?? "UniMensa Berlin",

    owner: "gruppe-04",
    extra,
  };
};
