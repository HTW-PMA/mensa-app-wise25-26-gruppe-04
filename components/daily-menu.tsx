import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from './themed-text';
import { HTWColors } from '@/constants/theme';
import { useMenuData } from '@/hooks/useMenuData';
import { MenuSection } from './menu-section';
import { Menu } from '@/models';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

interface DailyMenuProps {
  date: Date;
  locationId?: string;
  locationName?: string;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
};

export const DailyMenu: React.FC<DailyMenuProps> = ({ date, locationId, locationName }) => {
  // Menü laden (dein Hook liefert filteredMenu)
  const { filteredMenu, loading, error, preferences, source } = useMenuData(date, locationId);

  // User Preferences laden (AsyncStorage)
  const { prefs, loadingPrefs } = useUserPreferences();

  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const dishStats = useMemo(() => {
    const dishes: any[] = filteredMenu?.dishes ?? [];
    const total = dishes.length;
    const veganCount = dishes.filter((d: any) =>
      d.labels?.some((l: string) => l === 'vegan')
    ).length;
    const vegetarianCount = dishes.filter((d: any) =>
      d.labels?.some((l: string) => l === 'vegetarian')
    ).length;
    const hasPrefs = (preferences?.dietaryRestrictions?.length ?? 0) > 0;
    const matchCount = hasPrefs
      ? dishes.filter((d: any) => {
          const labels = (d.labels ?? []).map((l: any) => String(l).toLowerCase());
          return preferences!.dietaryRestrictions.some((pref: string) => labels.includes(pref));
        }).length
      : 0;
    const userAllergens: string[] = preferences?.allergens ?? [];
    const hasAllergens = userAllergens.length > 0;
    const allergenWarnCount = hasAllergens
      ? dishes.filter((d: any) => {
          const dishAllergens: string[] = (d.allergens ?? []).map((a: any) => String(a));
          return userAllergens.some((a: string) => dishAllergens.includes(a));
        }).length
      : 0;
    return { total, veganCount, vegetarianCount, matchCount, hasPrefs, allergenWarnCount, hasAllergens };
  }, [filteredMenu, preferences]);

  if (loading || loadingPrefs) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={HTWColors.primary} />
        <ThemedText style={styles.loadingText}>Menü wird geladen...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ThemedText type="subtitle" style={styles.errorTitle}>
          Fehler beim Laden des Menüs
        </ThemedText>
        <ThemedText style={styles.errorText}>{error.message}</ThemedText>
        <ThemedText style={styles.errorText}>
          Bitte überprüfe deine Internetverbindung und den API-Schlüssel.
        </ThemedText>
      </View>
    );
  }

  // WICHTIG: Wenn filteredMenu durch Filter leer ist, dann zeigt er "Kein Menü"
  // Du willst aber "ALLE Menüs anzeigen" und nur markieren.
  // => Deshalb prüfen wir hier bewusst:
  if (!filteredMenu || filteredMenu.dishes.length === 0) {
    return (
      <View style={styles.centered}>
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          Kein Menü verfügbar
        </ThemedText>
        <ThemedText style={styles.emptyText}>
          Für den {formatDate(date)} sind keine Menüdaten vorhanden.
        </ThemedText>
      </View>
    );
  }

  const dailyMenus: Menu[] = [filteredMenu];

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.dateTitle}>
        {formatDate(date)}
      </ThemedText>

      {locationName ? <ThemedText style={styles.locationText}>{locationName}</ThemedText> : null}

      {/* Offline-Hinweis */}
      {source === 'cache' && (
        <View style={[styles.offlineBanner, { backgroundColor: isDark ? '#2A2000' : '#FFF8E1' }]}>
          <MaterialIcons name="cloud-off" size={16} color="#F59E0B" />
          <ThemedText style={styles.offlineBannerText}>
            Offline-Modus – gespeicherte Daten
          </ThemedText>
        </View>
      )}

      {/* Dish count summary */}
      <View style={[styles.dishCountRow, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}>
        <View style={styles.dishCountItem}>
          <MaterialIcons name="restaurant-menu" size={16} color={primaryColor} />
          <ThemedText style={[styles.dishCountText, { color: primaryColor }]}>
            {dishStats.total} {dishStats.total === 1 ? 'Gericht' : 'Gerichte'}
          </ThemedText>
        </View>
        {dishStats.veganCount > 0 && (
          <View style={styles.dishCountItem}>
            <MaterialIcons name="eco" size={14} color="#4CAF50" />
            <ThemedText style={[styles.dishCountText, { color: '#4CAF50' }]}>
              {dishStats.veganCount} vegan
            </ThemedText>
          </View>
        )}
        {dishStats.vegetarianCount > 0 && (
          <View style={styles.dishCountItem}>
            <MaterialIcons name="grass" size={14} color="#66BB6A" />
            <ThemedText style={[styles.dishCountText, { color: '#66BB6A' }]}>
              {dishStats.vegetarianCount} vegetarisch
            </ThemedText>
          </View>
        )}
        {dishStats.hasPrefs && dishStats.matchCount > 0 && (
          <View style={styles.dishCountItem}>
            <MaterialIcons name="check-circle" size={14} color={primaryColor} />
            <ThemedText style={[styles.dishCountText, { color: primaryColor }]}>
              {dishStats.matchCount} passend
            </ThemedText>
          </View>
        )}
      </View>

      {dailyMenus.map((m) => (
        <MenuSection key={m.id} menu={m} userPrefs={prefs} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: HTWColors.textLight,
  },
  errorTitle: {
    color: HTWColors.error,
    marginBottom: 8,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    color: HTWColors.warning,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
  },
  dateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  locationText: {
    paddingHorizontal: 20,
    marginTop: -14,
    marginBottom: 14,
    color: HTWColors.textLight,
  },
  dishCountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  dishCountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dishCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  offlineBannerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F59E0B',
  },
});
