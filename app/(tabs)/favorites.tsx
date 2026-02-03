import { StyleSheet, ScrollView, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dish } from '@/models/Dish';
import { DishCard, onFavoritesChanged } from '@/components/dish-card';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

const FAVORITES_STORAGE_KEY = '@mensa_app_favorites';

type FilterType = 'all' | 'main_course' | 'soup' | 'salad' | 'dessert' | 'side_dish';

const FILTER_OPTIONS: { id: FilterType; label: string; icon: React.ComponentProps<typeof MaterialIcons>['name'] }[] = [
  { id: 'all', label: 'Alle', icon: 'apps' },
  { id: 'main_course', label: 'Hauptgericht', icon: 'restaurant' },
  { id: 'soup', label: 'Suppe', icon: 'soup-kitchen' },
  { id: 'salad', label: 'Salat', icon: 'eco' },
  { id: 'side_dish', label: 'Beilage', icon: 'rice-bowl' },
  { id: 'dessert', label: 'Dessert', icon: 'icecream' },
];

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const errorColor = useThemeColor({}, 'error');

  const loadFavorites = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reload on tab focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  // Live reload when DishCard toggles a favorite
  useEffect(() => {
    const unsub = onFavoritesChanged(() => {
      loadFavorites();
    });
    return unsub;
  }, [loadFavorites]);

  // Filtered dishes
  const filteredFavorites = useMemo(() => {
    if (activeFilter === 'all') return favorites;
    return favorites.filter((d) => d.category === activeFilter);
  }, [favorites, activeFilter]);

  // Stats
  const stats = useMemo(() => {
    if (favorites.length === 0) return null;
    const categories = new Map<string, number>();
    let totalPrice = 0;
    for (const d of favorites) {
      categories.set(d.category, (categories.get(d.category) || 0) + 1);
      totalPrice += d.price.student;
    }
    const avgPrice = totalPrice / favorites.length;
    const topCategory = [...categories.entries()].sort((a, b) => b[1] - a[1])[0];
    return { avgPrice, topCategory, categories };
  }, [favorites]);

  const removeSingleFavorite = async (dishId: string) => {
    try {
      const updated = favorites.filter((d) => d.id !== dishId);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      setFavorites(updated);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const clearAllFavorites = () => {
    Alert.alert(
      'Alle Favoriten entfernen',
      `Moechtest du wirklich alle ${favorites.length} gespeicherten Gerichte entfernen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Alle entfernen',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
              setFavorites([]);
            } catch (error) {
              console.error('Error clearing favorites:', error);
            }
          },
        },
      ]
    );
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2).replace('.', ',') + ' \u20AC';
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      main_course: 'Hauptgerichte',
      soup: 'Suppen',
      salad: 'Salate',
      side_dish: 'Beilagen',
      dessert: 'Desserts',
      beverage: 'Getraenke',
    };
    return map[cat] || cat;
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <ThemedText type="title">Favoriten</ThemedText>
                <ThemedText style={[styles.headerSubtitle, { color: textSecondaryColor }]}>
                  Deine gespeicherten Gerichte
                </ThemedText>
              </View>
              {favorites.length > 0 && (
                <View style={[styles.countBadge, { backgroundColor: primaryColor }]}>
                  <ThemedText style={styles.countText}>{favorites.length}</ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Loading state */}
          {isLoading && (
            <View style={styles.stateContainer}>
              <View style={[styles.stateIconCircle, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}>
                <ActivityIndicator size="small" color={primaryColor} />
              </View>
              <ThemedText style={[styles.stateTitle, { color: textSecondaryColor }]}>
                Favoriten werden geladen...
              </ThemedText>
            </View>
          )}

          {/* Empty state */}
          {!isLoading && favorites.length === 0 && (
            <View style={styles.stateContainer}>
              <View style={[styles.stateIconCircle, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}>
                <MaterialIcons name="favorite-border" size={32} color={textSecondaryColor} />
              </View>
              <ThemedText style={styles.stateTitle}>Noch keine Favoriten</ThemedText>
              <ThemedText style={[styles.stateDesc, { color: textSecondaryColor }]}>
                Tippe auf das Herz-Symbol bei einem Gericht im Menuplan, um es hier zu speichern.
              </ThemedText>
              <View style={[styles.hintCard, { backgroundColor: isDark ? '#1A2A3D' : '#EFF6FF' }]}>
                <MaterialIcons name="lightbulb" size={20} color={primaryColor} />
                <ThemedText style={[styles.hintText, { color: textSecondaryColor }]}>
                  Deine Favoriten werden lokal gespeichert und bleiben auch nach dem Schliessen der App erhalten.
                </ThemedText>
              </View>
            </View>
          )}

          {/* Favorites content */}
          {!isLoading && favorites.length > 0 && (
            <View style={styles.content}>

              {/* Stats cards */}
              {stats && (
                <View style={styles.statsRow}>
                  <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}>
                    <MaterialIcons name="payments" size={22} color={primaryColor} />
                    <ThemedText style={[styles.statValue, { color: primaryColor }]}>
                      {formatPrice(stats.avgPrice)}
                    </ThemedText>
                    <ThemedText style={[styles.statLabel, { color: textSecondaryColor }]}>
                      Durchschnittspreis
                    </ThemedText>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}>
                    <MaterialIcons name="category" size={22} color={primaryColor} />
                    <ThemedText style={[styles.statValue, { color: primaryColor }]}>
                      {stats.topCategory ? stats.topCategory[1] : 0}
                    </ThemedText>
                    <ThemedText style={[styles.statLabel, { color: textSecondaryColor }]}>
                      {stats.topCategory ? getCategoryLabel(stats.topCategory[0]) : 'Kategorie'}
                    </ThemedText>
                  </View>
                </View>
              )}

              {/* Category filter pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <View style={styles.filterRow}>
                  {FILTER_OPTIONS.map((opt) => {
                    const isActive = activeFilter === opt.id;
                    const count = opt.id === 'all'
                      ? favorites.length
                      : favorites.filter((d) => d.category === opt.id).length;
                    if (opt.id !== 'all' && count === 0) return null;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.filterPill,
                          {
                            backgroundColor: isActive ? primaryColor : (isDark ? '#2C2C2E' : '#F2F3F5'),
                          },
                        ]}
                        onPress={() => setActiveFilter(opt.id)}
                        activeOpacity={0.7}
                      >
                        <MaterialIcons
                          name={opt.icon}
                          size={14}
                          color={isActive ? '#fff' : textSecondaryColor}
                        />
                        <ThemedText style={[
                          styles.filterPillText,
                          { color: isActive ? '#fff' : undefined },
                        ]}>
                          {opt.label}
                        </ThemedText>
                        <View style={[
                          styles.filterPillCount,
                          { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : (isDark ? '#3A3A3C' : '#E5E7EB') },
                        ]}>
                          <ThemedText style={[
                            styles.filterPillCountText,
                            { color: isActive ? '#fff' : textSecondaryColor },
                          ]}>
                            {count}
                          </ThemedText>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Filtered info */}
              {activeFilter !== 'all' && (
                <View style={[styles.filteredBanner, { backgroundColor: isDark ? '#0A2E1A' : '#F0FDF4' }]}>
                  <MaterialIcons name="filter-list" size={16} color="#22C55E" />
                  <ThemedText style={styles.filteredBannerText}>
                    {filteredFavorites.length} {filteredFavorites.length === 1 ? 'Ergebnis' : 'Ergebnisse'}
                  </ThemedText>
                  <TouchableOpacity onPress={() => setActiveFilter('all')}>
                    <MaterialIcons name="close" size={18} color="#22C55E" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Dish cards with remove button */}
              <View style={styles.dishList}>
                {filteredFavorites.map((dish) => (
                  <View key={dish.id}>
                    <DishCard dish={dish} />
                    <TouchableOpacity
                      style={[styles.removeRow, { backgroundColor: isDark ? '#2C2C2E' : '#F9FAFB' }]}
                      onPress={() => {
                        Alert.alert(
                          'Favorit entfernen',
                          `"${dish.name}" aus deinen Favoriten entfernen?`,
                          [
                            { text: 'Abbrechen', style: 'cancel' },
                            {
                              text: 'Entfernen',
                              style: 'destructive',
                              onPress: () => removeSingleFavorite(dish.id),
                            },
                          ]
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="remove-circle-outline" size={16} color={errorColor} />
                      <ThemedText style={[styles.removeRowText, { color: errorColor }]}>
                        Aus Favoriten entfernen
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Clear all button */}
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: isDark ? '#3D1A1A' : '#FEF2F2' }]}
                onPress={clearAllFavorites}
                activeOpacity={0.7}
              >
                <MaterialIcons name="delete-outline" size={20} color={errorColor} />
                <ThemedText style={[styles.clearButtonText, { color: errorColor }]}>
                  Alle Favoriten entfernen ({favorites.length})
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },

  // Header
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
  },
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // State (loading / empty)
  stateContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  stateIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  stateDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
  },
  hintText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },

  // Content
  content: {
    paddingHorizontal: 16,
    gap: 14,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Filter pills
  filterScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterPillCount: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillCountText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Filtered banner
  filteredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  filteredBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22C55E',
    flex: 1,
  },

  // Dish list
  dishList: {
    gap: 4,
  },

  // Remove row under each card
  removeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: -6,
    marginBottom: 12,
  },
  removeRowText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Clear button
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 14,
    marginTop: 4,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
