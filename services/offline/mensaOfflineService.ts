import { MensaApiService } from '@/services/api/mensaApi';
import { format } from 'date-fns';
import { Menu } from '@/models';
import { cleanupOldMenus, loadMenu, saveMenu } from '@/services/storage/mensaCache';

// eure API nutzt YYYY-MM-DD (lokal) → wir speichern denselben Key
function toIsoDateLocal(d: Date) {
    return format(d, 'yyyy-MM-dd');
}

type Result<T> = {
    data: T;
    source: 'network' | 'cache';
    savedAt?: number;
};

export class MensaOfflineService {
    static async getDailyMenu(date: Date, locationId: string = 'htw'): Promise<Result<Menu>> {
        const dateIso = toIsoDateLocal(date);

        // optional: gelegentlich aufräumen
        cleanupOldMenus().catch(() => {});

        try {
            // Netzwerk zuerst
            const menu = await MensaApiService.getDailyMenu(date, locationId);

            // canteenId steckt bei euch in menu.id nicht zuverlässig → wir speichern ohne canteenId (oder "unknown")
            // wir verwenden locationId als Cache-Key, damit jede Uni ihren eigenen Cache hat
            await saveMenu(locationId, dateIso, menu);

            return { data: menu, source: 'network' };
        } catch (e) {
            // Fallback: Cache
            const cached = await loadMenu(locationId, dateIso);
            if (cached?.data) {
                return { data: cached.data, source: 'cache', savedAt: cached.savedAt };
            }
            throw e; // nichts im Cache → echter Fehler
        }
    }

    static async refreshDailyMenu(date: Date, locationId: string = 'htw'): Promise<Result<Menu>> {
        // “Force refresh”: einfach getDailyMenu aufrufen, aber ohne Cache-Fallback:
        const dateIso = toIsoDateLocal(date);
        const menu = await MensaApiService.getDailyMenu(date, locationId);
        await saveMenu(locationId, dateIso, menu);
        return { data: menu, source: 'network' };
    }
}
