import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from './themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMenuData } from '@/hooks/useMenuData';
import { MenuSection } from './menu-section';
import { Menu } from '@/models/Menu';

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
  const { menu, loading, error } = useMenuData(date, locationId);
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const errorColor = useThemeColor({}, 'error');

  if (loading) {
    return (
        <View style={styles.centered}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}>
            <ActivityIndicator size="small" color={primaryColor} />
          </View>
          <ThemedText style={[styles.stateTitle, { color: textSecondaryColor }]}>
            Menue wird geladen...
          </ThemedText>
        </View>
    );
  }

  if (error) {
    return (
        <View style={styles.centered}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? '#3D1A1A' : '#FEF2F2' }]}>
            <MaterialIcons name="error-outline" size={24} color={errorColor} />
          </View>
          <ThemedText type="subtitle" style={[styles.stateTitle, { color: errorColor }]}>
            Fehler beim Laden
          </ThemedText>
          <ThemedText style={[styles.stateDesc, { color: textSecondaryColor }]}>
            {error.message}
          </ThemedText>
          <ThemedText style={[styles.stateDesc, { color: textSecondaryColor }]}>
            Bitte ueberpruefe deine Internetverbindung.
          </ThemedText>
        </View>
    );
  }

  if (!menu || menu.dishes.length === 0) {
    return (
        <View style={styles.centered}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? '#2E2A0A' : '#FFFBEB' }]}>
            <MaterialIcons name="no-meals" size={24} color="#F59E0B" />
          </View>
          <ThemedText type="subtitle" style={[styles.stateTitle, { color: '#F59E0B' }]}>
            Kein Menue verfuegbar
          </ThemedText>
          <ThemedText style={[styles.stateDesc, { color: textSecondaryColor }]}>
            Fuer den {formatDate(date)} sind keine Menuedaten vorhanden.
          </ThemedText>
        </View>
    );
  }

  const availableCount = menu.dishes.filter(d => d.available).length;
  const dailyMenus: Menu[] = [menu];

  return (
      <View style={styles.container}>
        {/* Date banner */}
        <View style={[styles.dateBanner, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}>
          <MaterialIcons name="calendar-today" size={18} color={primaryColor} />
          <View style={styles.dateBannerText}>
            <ThemedText style={styles.dateTitle}>{formatDate(date)}</ThemedText>
            {locationName ? (
                <ThemedText style={[styles.locationText, { color: textSecondaryColor }]}>
                  {locationName}
                </ThemedText>
            ) : null}
          </View>
          <View style={[styles.countBadge, { backgroundColor: primaryColor + '15' }]}>
            <ThemedText style={[styles.countText, { color: primaryColor }]}>{availableCount}</ThemedText>
          </View>
        </View>

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
    gap: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  stateDesc: {
    textAlign: 'center',
    fontSize: 14,
  },

  // Date banner
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 14,
    borderRadius: 14,
  },
  dateBannerText: {
    flex: 1,
  },
  dateTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  locationText: {
    fontSize: 13,
    marginTop: 2,
  },
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
