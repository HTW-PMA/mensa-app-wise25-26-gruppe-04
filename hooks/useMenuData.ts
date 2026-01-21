import { useState, useEffect } from 'react';
import { Menu } from '@/models';
import { MensaOfflineService } from '@/services/offline/mensaOfflineService';

export function useMenuData(date?: Date) {
    const [menu, setMenu] = useState<Menu | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // optional: UI kann anzeigen “aus Cache”
    const [source, setSource] = useState<'network' | 'cache' | null>(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                setLoading(true);
                setError(null);

                const result = await MensaOfflineService.getDailyMenu(date || new Date());
                setMenu(result.data);
                setSource(result.source);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [date]);

    const refresh = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await MensaOfflineService.refreshDailyMenu(date || new Date());
            setMenu(result.data);
            setSource(result.source);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { menu, loading, error, refresh, source };
}
