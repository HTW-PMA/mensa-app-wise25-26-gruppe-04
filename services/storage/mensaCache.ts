import { getJson, setJson } from './jsonStorage';
import { Menu } from '@/models';

const KEY_PREFIX = '@mensa_app:cache';
const KEY_CANTEENS = `${KEY_PREFIX}:canteens`;
const KEY_CANTEEN_ID = `${KEY_PREFIX}:canteenId`;
const KEY_MENU_INDEX = `${KEY_PREFIX}:menuIndex`; // Liste aller gespeicherten Menü-Keys

const MENU_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 Tage

type CacheEntry<T> = {
    savedAt: number;
    data: T;
};

function menuKey(canteenId: string | undefined, dateIso: string) {
    // canteenId kann leer sein, wenn Auto-Resolve nicht klappt → trotzdem eindeutig speichern
    return `${KEY_PREFIX}:menu:${canteenId || 'unknown'}:${dateIso}`;
}

export async function saveResolvedCanteenId(id: string) {
    await setJson(KEY_CANTEEN_ID, { savedAt: Date.now(), data: id } satisfies CacheEntry<string>);
}

export async function loadResolvedCanteenId(): Promise<string | null> {
    const entry = await getJson<CacheEntry<string>>(KEY_CANTEEN_ID);
    return entry?.data ?? null;
}

export async function saveCanteens(canteens: unknown) {
    await setJson(KEY_CANTEENS, { savedAt: Date.now(), data: canteens } satisfies CacheEntry<unknown>);
}

export async function loadCanteens<T = unknown>(): Promise<CacheEntry<T> | null> {
    return await getJson<CacheEntry<T>>(KEY_CANTEENS);
}

async function addToMenuIndex(key: string) {
    const idx = (await getJson<string[]>(KEY_MENU_INDEX)) ?? [];
    if (!idx.includes(key)) {
        idx.push(key);
        await setJson(KEY_MENU_INDEX, idx);
    }
}

export async function saveMenu(
    canteenId: string | undefined,
    dateIso: string,
    menu: Menu
) {
    const key = menuKey(canteenId, dateIso);
    await setJson(key, { savedAt: Date.now(), data: menu } satisfies CacheEntry<Menu>);
    await addToMenuIndex(key);
}

export async function loadMenu(
    canteenId: string | undefined,
    dateIso: string
): Promise<CacheEntry<Menu> | null> {
    const key = menuKey(canteenId, dateIso);
    return await getJson<CacheEntry<Menu>>(key);
}

export async function cleanupOldMenus() {
    const keys = (await getJson<string[]>(KEY_MENU_INDEX)) ?? [];
    if (keys.length === 0) return;

    const now = Date.now();
    const keep: string[] = [];

    for (const k of keys) {
        const entry = await getJson<CacheEntry<Menu>>(k);
        if (!entry) continue;

        const age = now - entry.savedAt;
        if (age <= MENU_TTL_MS) {
            keep.push(k);
        } else {
            // zu alt → löschen
            // (wir nutzen hier AsyncStorage direkt, um Abhängigkeiten klein zu halten)
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.removeItem(k);
        }
    }

    await setJson(KEY_MENU_INDEX, keep);
}
