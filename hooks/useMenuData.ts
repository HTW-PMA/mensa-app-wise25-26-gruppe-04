/**
 * useMenuData Hook
 * Custom hook for fetching and managing menu data
 */

import { useState, useEffect } from 'react';
import { Menu } from '@/models';
import { MensaApiService } from '@/services/api/mensaApi';

export function useMenuData(date?: Date) {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const menuData = await MensaApiService.getDailyMenu(date || new Date());
        setMenu(menuData);
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
      const menuData = await MensaApiService.getDailyMenu(date || new Date());
      setMenu(menuData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    menu,
    loading,
    error,
    refresh,
  };
}
