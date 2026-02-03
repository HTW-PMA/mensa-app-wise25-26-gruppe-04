import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Dish, DishLabel, Allergen } from '@/models/Dish';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserPreferences, ALLERGEN_ID_MAP, ALLERGEN_LABELS } from '@/hooks/useUserPreferences';

const FAVORITES_STORAGE_KEY = '@mensa_app_favorites';

interface DishCardProps {
  dish: Dish;
}

const DIET_LABEL_MAP: Record<string, DishLabel> = {
  vegetarian: DishLabel.VEGETARIAN,
  vegan: DishLabel.VEGAN,
  halal: DishLabel.HALAL,
  kosher: DishLabel.KOSHER,
};

const DIET_ALLERGEN_MAP: Record<string, string> = {
  glutenfree: 'gluten',
  lactosefree: 'milk',
};

function getSustainabilityScore(dish: Dish): number {
  if (dish.sustainability?.co2Bilanz != null) {
    const co2 = dish.sustainability.co2Bilanz;
    if (co2 <= 200) return 5;
    if (co2 <= 500) return 4;
    if (co2 <= 1000) return 3;
    if (co2 <= 2000) return 2;
    return 1;
  }
  const labels = dish.labels ?? [];
  let score = 2;
  if (labels.includes(DishLabel.VEGAN)) score = 5;
  else if (labels.includes(DishLabel.VEGETARIAN)) score = 4;
  if (labels.includes(DishLabel.ORGANIC)) score = Math.min(score + 1, 5);
  if (labels.includes(DishLabel.REGIONAL)) score = Math.min(score + 1, 5);
  return score;
}

function getScoreColor(score: number): string {
  if (score >= 4) return '#22C55E';
  if (score === 3) return '#F59E0B';
  return '#EF4444';
}

export const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const { name, description, price, labels, category, available, allergens: dishAllergens } = dish;
  const [isFavorite, setIsFavorite] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const labelBgColor = useThemeColor({ light: '#F2F3F5', dark: '#2C2C2E' }, 'background');

  const userPrefs = useUserPreferences();

  const getLabelIcon = (label: DishLabel) => {
    switch (label) {
      case DishLabel.VEGAN:
        return { name: 'leaf.fill', color: theme.success };
      case DishLabel.VEGETARIAN:
        return { name: 'carrot.fill', color: theme.success };
      case DishLabel.ORGANIC:
        return { name: 'o.circle.fill', color: theme.primary };
      case DishLabel.REGIONAL:
        return { name: 'map.fill', color: theme.primary };
      default:
        return { name: 'tag.fill', color: theme.text };
    }
  };

  const formatPrice = (p: number) => {
    return (p / 100).toFixed(2).replace('.', ',') + ' \u20AC';
  };

  // Check dietary match
  const dietaryMatch = useMemo(() => {
    if (userPrefs.dietaryRestrictions.length === 0) return null;
    const dishLabels = labels ?? [];
    const da = dishAllergens ?? [];

    for (const dietId of userPrefs.dietaryRestrictions) {
      const requiredLabel = DIET_LABEL_MAP[dietId];
      if (requiredLabel && !dishLabels.includes(requiredLabel)) return false;
    }
    for (const dietId of userPrefs.dietaryRestrictions) {
      const avoidAllergen = DIET_ALLERGEN_MAP[dietId];
      if (avoidAllergen && da.includes(avoidAllergen as Allergen)) return false;
    }
    return true;
  }, [labels, dishAllergens, userPrefs.dietaryRestrictions]);

  // Check allergen warnings
  const allergenWarnings = useMemo(() => {
    if (userPrefs.allergens.length === 0 || !dishAllergens || dishAllergens.length === 0) return [];
    const warnings: string[] = [];
    for (const settingsId of userPrefs.allergens) {
      const allergenValue = ALLERGEN_ID_MAP[settingsId];
      if (allergenValue && dishAllergens.includes(allergenValue as Allergen)) {
        warnings.push(ALLERGEN_LABELS[settingsId] || settingsId);
      }
    }
    return warnings;
  }, [dishAllergens, userPrefs.allergens]);

  const sustainabilityScore = available ? getSustainabilityScore(dish) : 0;
  const scoreColor = getScoreColor(sustainabilityScore);

  useEffect(() => {
    checkIfFavorite();
  }, [dish.id]);

  const checkIfFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const favorites: Dish[] = JSON.parse(stored);
        setIsFavorite(favorites.some(fav => fav.id === dish.id));
      }
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      let favorites: Dish[] = stored ? JSON.parse(stored) : [];

      if (isFavorite) {
        favorites = favorites.filter(fav => fav.id !== dish.id);
      } else {
        favorites.push(dish);
      }

      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (!available) {
    return (
        <View style={[styles.card, styles.unavailableCard, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.name} type="subtitle">
            {name}
          </ThemedText>
          <ThemedText style={[styles.unavailableText, { color: textSecondaryColor }]}>
            {category} – Derzeit nicht verfuegbar
          </ThemedText>
        </View>
    );
  }

  return (
      <View style={[styles.card, { backgroundColor: surfaceColor }]}>
        {/* Allergen warning banner */}
        {allergenWarnings.length > 0 && (
            <View style={[styles.warningBanner, { backgroundColor: isDark ? '#2E0A0A' : '#FEF2F2' }]}>
              <MaterialIcons name="warning" size={16} color="#EF4444" />
              <ThemedText style={styles.warningText}>
                Enthaelt: {allergenWarnings.join(', ')}
              </ThemedText>
            </View>
        )}

        {/* Dietary match banner */}
        {dietaryMatch === true && (
            <View style={[styles.matchBanner, { backgroundColor: isDark ? '#0A2E1A' : '#F0FDF4' }]}>
              <MaterialIcons name="check-circle" size={16} color="#22C55E" />
              <ThemedText style={styles.matchText}>
                Passt zu deinen Praeferenzen
              </ThemedText>
            </View>
        )}

        <View style={styles.header}>
          <ThemedText style={styles.name} type="subtitle">
            {name}
          </ThemedText>
          <View style={styles.headerRight}>
            <View style={styles.pricesBlock}>
              <View style={styles.priceContainer}>
                <ThemedText style={[styles.priceLabel, { color: textSecondaryColor }]}>Studierende</ThemedText>
                <ThemedText style={[styles.priceValue, { color: primaryColor }]}>{formatPrice(price.student)}</ThemedText>
              </View>
              <View style={styles.priceContainer}>
                <ThemedText style={[styles.priceLabel, { color: textSecondaryColor }]}>Angestellte</ThemedText>
                <ThemedText style={[styles.priceValue, { color: primaryColor }]}>{formatPrice(price.employee)}</ThemedText>
              </View>
              <View style={styles.priceContainer}>
                <ThemedText style={[styles.priceLabel, { color: textSecondaryColor }]}>Gaeste</ThemedText>
                <ThemedText style={[styles.priceValue, { color: primaryColor }]}>{formatPrice(price.guest)}</ThemedText>
              </View>
            </View>
            <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
              <IconSymbol
                  name={isFavorite ? 'heart.fill' : 'heart'}
                  size={22}
                  color={isFavorite ? theme.error : theme.icon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {description && (
            <ThemedText style={[styles.description, { color: textSecondaryColor }]}>{description}</ThemedText>
        )}

        {/* Allergen info row */}
        {dishAllergens && dishAllergens.length > 0 && (
            <View style={[styles.allergenRow, { backgroundColor: isDark ? '#1C1C1E' : '#F9FAFB' }]}>
              <MaterialIcons name="info-outline" size={14} color={textSecondaryColor} />
              <ThemedText style={[styles.allergenRowText, { color: textSecondaryColor }]}>
                Allergene: {dishAllergens.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
              </ThemedText>
            </View>
        )}

        <View style={styles.footer}>
          <View style={styles.labelsContainer}>
            {labels?.map((label) => {
              const { name: iconName, color } = getLabelIcon(label);
              return (
                  <View key={label} style={[styles.label, { backgroundColor: labelBgColor }]}>
                    <IconSymbol name={iconName as any} size={14} color={color} />
                    <ThemedText style={[styles.labelText, { color }]}>
                      {label.replace('_', ' ')}
                    </ThemedText>
                  </View>
              );
            })}
          </View>
          <ThemedText style={[styles.categoryText, { color: textSecondaryColor }]}>
            {category.replace('_', ' ')}
          </ThemedText>
        </View>

        {/* Sustainability score row */}
        <TouchableOpacity
            style={[styles.sustainabilityRow, { backgroundColor: isDark ? '#1C1C1E' : '#F9FAFB' }]}
            onPress={() => router.push('/sustainability')}
            activeOpacity={0.7}
        >
          <View style={styles.sustainabilityLeft}>
            <MaterialIcons name="eco" size={16} color={scoreColor} />
            <ThemedText style={[styles.sustainabilityLabel, { color: textSecondaryColor }]}>
              Nachhaltigkeit
            </ThemedText>
          </View>
          <View style={styles.sustainabilityRight}>
            <View style={styles.dotsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                  <View
                      key={i}
                      style={[
                        styles.dot,
                        {
                          backgroundColor: i <= sustainabilityScore ? scoreColor : (isDark ? '#3A3A3C' : '#D1D5DB'),
                        },
                      ]}
                  />
              ))}
            </View>
            <MaterialIcons name="chevron-right" size={18} color={textSecondaryColor} />
          </View>
        </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: 8,
    marginBottom: 12,
  },
  unavailableCard: {
    opacity: 0.6,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  unavailableText: {
    fontStyle: 'italic',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pricesBlock: {
    alignItems: 'flex-end',
    gap: 6,
  },
  favoriteButton: {
    padding: 4,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  priceContainer: {
    marginLeft: 10,
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 10,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 4,
  },
  labelText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  categoryText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },

  // Warning banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
    flex: 1,
  },

  // Match banner
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22C55E',
    flex: 1,
  },

  // Allergen info row
  allergenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  allergenRowText: {
    fontSize: 12,
    flex: 1,
  },

  // Sustainability row
  sustainabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  sustainabilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sustainabilityLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  sustainabilityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
