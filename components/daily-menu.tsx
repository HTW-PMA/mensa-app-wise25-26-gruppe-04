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
  const surfaceColor = useThemeColor({}, 'surface');

  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={[styles.stateText, { color: textSecondaryColor }]}>
          Menu wird geladen...
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateContainer}>
        <View style={[styles.stateIconCircle, { backgroundColor: '#FEE2E2' }]}>
          <MaterialIcons name="wifi-off" size={28} color="#EF4444" />
        </View>
        <ThemedText style={styles.stateTitle}>Fehler beim Laden</ThemedText>
        <ThemedText style={[styles.stateText, { color: textSecondaryColor }]}>
          {error.message}
        </ThemedText>
        <ThemedText style={[styles.stateText, { color: textSecondaryColor }]}>
          Bitte Internetverbindung pruefen.
        </ThemedText>
      </View>
    );
  }

  if (!menu || menu.dishes.length === 0) {
    return (
      <View style={styles.stateContainer}>
        <View style={[styles.stateIconCircle, { backgroundColor: isDark ? '#2C2C2E' : '#F2F3F5' }]}>
          <MaterialIcons name="no-meals" size={28} color={textSecondaryColor} />
        </View>
        <ThemedText style={styles.stateTitle}>Kein Menu verfuegbar</ThemedText>
        <ThemedText style={[styles.stateText, { color: textSecondaryColor }]}>
          Fuer {formatDate(date)} sind keine Daten vorhanden.
        </ThemedText>
      </View>
    );
  }

  const dailyMenus: Menu[] = [menu];
  const dishCount = menu.dishes.filter(d => d.available).length;

  return (
    <View style={styles.container}>
      {/* Date banner */}
      <View style={[styles.dateBanner, { backgroundColor: isDark ? '#1C1C1E' : surfaceColor }]}>
        <View style={styles.dateBannerLeft}>
          <MaterialIcons name="calendar-today" size={18} color={primaryColor} />
          <View>
            <ThemedText style={styles.dateTitle}>{formatDate(date)}</ThemedText>
            {locationName && (
              <ThemedText style={[styles.locationText, { color: textSecondaryColor }]}>
                {locationName}
              </ThemedText>
            )}
          </View>
        </View>
        <View style={[styles.dishCountBadge, { backgroundColor: primaryColor + '15' }]}>
          <ThemedText style={[styles.dishCountText, { color: primaryColor }]}>
            {dishCount} {dishCount === 1 ? 'Gericht' : 'Gerichte'}
          </ThemedText>
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
    paddingTop: 12,
  },

  // State screens (loading, error, empty)
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 72,
    paddingHorizontal: 32,
    gap: 10,
  },
  stateIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  stateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Date banner
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  dateBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dateTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 12,
    marginTop: 1,
  },
  dishCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  dishCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
