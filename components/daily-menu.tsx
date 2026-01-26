import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from './themed-text';
import { HTWColors } from '@/constants/theme';
import { useMenuData } from '@/hooks/useMenuData';
import { MenuSection } from './menu-section';
import {Menu} from "@/models";

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
  const { menu, loading, error, refresh } = useMenuData(date, locationId);

  if (loading) {
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
        <ThemedText style={styles.errorText}>
          {error.message}
        </ThemedText>
        <ThemedText style={styles.errorText}>
          Bitte überprüfe deine Internetverbindung und den API-Schlüssel.
        </ThemedText>
        {/* A simple refresh button could be added here */}
      </View>
    );
  }

  if (!menu || menu.dishes.length === 0) {
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

  // The useMenuData hook currently returns a single Menu object, but the API might return multiple
  // for different meal types (breakfast, lunch, dinner). Since the model is 'Menu' (singular),
  // I will assume for now that the API returns a single combined menu or the hook needs adjustment.
  // Based on the API endpoints, getDailyMenu should return a single day's menu, which might contain
  // all meal types or just one. Given the current structure, I'll treat the single 'menu' object
  // as the daily menu and display its dishes.

  // To properly handle multiple meal types, the API should return an array of Menu objects,
  // or the single Menu object should contain all meal types.
  // Since the `Menu` model has `mealType`, let's assume the API returns an array of `Menu` objects
  // for different meal types, and the `useMenuData` hook needs to be updated to handle this.

  // Re-reading `useMenuData.ts`:
  // `const menuData = await MensaApiService.getDailyMenu(date || new Date());`
  // `MensaApiService.getDailyMenu(date: Date): Promise<Menu>`
  // This suggests a single Menu object is expected. I will proceed with the assumption that the
  // single Menu object represents the entire daily offering, and the `mealType` is just a label
  // for the entire day's menu, or that the API is structured to return only one meal type per call.
  // Given the `Menu` model structure, it's more likely the API returns an array of Menu objects,
  // one for each meal type. I will update the `useMenuData` hook and the `MensaApiService`
  // to reflect the likely array return type for daily menu.

  // ***Correction: The `useMenuData` hook expects a single `Menu` object.
  // I will create a dummy array for demonstration purposes until the API is confirmed.
  // For now, I will display the dishes from the single `menu` object.

  // Let's create a temporary structure to simulate multiple meal types for better UI:
  const dailyMenus: Menu[] = [menu]; // Placeholder

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.dateTitle}>
        {formatDate(date)}
      </ThemedText>
      {locationName ? (
        <ThemedText style={styles.locationText}>{locationName}</ThemedText>
      ) : null}
      {dailyMenus.map((m) => (
        <MenuSection key={m.id} menu={m} />
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
});
