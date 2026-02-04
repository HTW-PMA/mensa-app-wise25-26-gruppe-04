import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from './themed-text';
import { HTWColors } from '@/constants/theme';
import { useMenuData } from '@/hooks/useMenuData';
import { MenuSection } from './menu-section';
import { Menu } from '@/models';
import { useUserPreferences } from '@/hooks/useUserPreferences';

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
  const { filteredMenu, loading, error } = useMenuData(date, locationId);

  // User Preferences laden (AsyncStorage)
  const { prefs, loadingPrefs } = useUserPreferences();

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
});
