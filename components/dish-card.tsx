import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Dish, DishLabel } from '@/models/Dish';
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

function getSustainabilityScore(dish: Dish): number {
  const co2 = dish.sustainability?.co2Bilanz;
  if (co2 != null) {
    if (co2 <= 200) return 5;
    if (co2 <= 500) return 4;
    if (co2 <= 1000) return 3;
    if (co2 <= 1500) return 2;
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
  if (score >= 4) return '#4CAF50';
  if (score === 3) return '#FFC107';
  return '#EF4444';
}

// Dietary preference IDs that map to DishLabel
const DIET_LABEL_MAP: Record<string, DishLabel> = {
  vegetarian: DishLabel.VEGETARIAN,
  vegan: DishLabel.VEGAN,
  halal: DishLabel.HALAL,
  kosher: DishLabel.KOSHER,
};

// Dietary IDs that mean "avoid this allergen"
const DIET_ALLERGEN_MAP: Record<string, string> = {
  glutenfree: 'gluten',
  lactosefree: 'milk',
};

export const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const { name, description, price, labels, category, available } = dish;
  const [isFavorite, setIsFavorite] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const userPrefs = useUserPreferences();

  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const labelBgColor = useThemeColor({ light: '#F2F3F5', dark: '#2C2C2E' }, 'background');

  const sustainabilityScore = useMemo(() => getSustainabilityScore(dish), [dish]);
  const scoreColor = useMemo(() => getScoreColor(sustainabilityScore), [sustainabilityScore]);

  // Allergen check: find allergens in the dish that the user has marked
  const matchedAllergens = useMemo(() => {
    const dishAllergens = dish.allergens ?? [];
    if (dishAllergens.length === 0 || userPrefs.allergens.length === 0) return [];

    const matched: string[] = [];
    for (const settingsId of userPrefs.allergens) {
      const dishAllergenValue = ALLERGEN_ID_MAP[settingsId];
      if (dishAllergenValue && dishAllergens.includes(dishAllergenValue as any)) {
        matched.push(settingsId);
      }
    }
    return matched;
  }, [dish.allergens, userPrefs.allergens]);

  // Dietary-based allergen warnings (glutenfree → warn if has gluten, lactosefree → warn if has milk)
  const dietaryAllergenWarnings = useMemo(() => {
    const dishAllergens = dish.allergens ?? [];
    const warnings: string[] = [];
    for (const dietId of userPrefs.dietaryRestrictions) {
      const allergenValue = DIET_ALLERGEN_MAP[dietId];
      if (allergenValue && dishAllergens.includes(allergenValue as any)) {
        warnings.push(dietId === 'glutenfree' ? 'Gluten' : 'Laktose');
      }
    }
    return warnings;
  }, [dish.allergens, userPrefs.dietaryRestrictions]);

  // All warnings combined
  const allWarnings = useMemo(() => {
    const allergenLabels = matchedAllergens.map(id => ALLERGEN_LABELS[id] || id);
    return [...allergenLabels, ...dietaryAllergenWarnings];
  }, [matchedAllergens, dietaryAllergenWarnings]);

  const hasWarning = allWarnings.length > 0;

  // Dietary match: does the dish match the user's label-based dietary preferences?
  const dietaryMatch = useMemo(() => {
    const dishLabels = dish.labels ?? [];
    const labelDiets = userPrefs.dietaryRestrictions.filter(id => DIET_LABEL_MAP[id]);
    if (labelDiets.length === 0) return null;

    const allMatch = labelDiets.every(id => {
      const requiredLabel = DIET_LABEL_MAP[id];
      return dishLabels.includes(requiredLabel);
    });

    return allMatch ? 'match' : 'no-match';
  }, [dish.labels, userPrefs.dietaryRestrictions]);

  const hasPrefsSet = userPrefs.dietaryRestrictions.length > 0 || userPrefs.allergens.length > 0;

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

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2).replace('.', ',') + ' €';
  };

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
      <View
        style={[
          styles.card,
          { backgroundColor: surfaceColor },
          hasWarning && styles.warningCard,
        ]}
      >
        {/* Allergen Warning Banner */}
        {hasWarning && (
          <View style={[styles.warningBanner, { backgroundColor: isDark ? '#3B1010' : '#FEF2F2' }]}>
            <MaterialIcons name="warning" size={16} color="#EF4444" />
            <ThemedText style={styles.warningText}>
              Enthaelt: {allWarnings.join(', ')}
            </ThemedText>
          </View>
        )}

        {/* Dietary Match Badge */}
        {!hasWarning && dietaryMatch === 'match' && hasPrefsSet && (
          <View style={[styles.matchBanner, { backgroundColor: isDark ? '#0A2E1A' : '#F0FDF4' }]}>
            <MaterialIcons name="check-circle" size={16} color="#22C55E" />
            <ThemedText style={styles.matchText}>Passt zu deinen Praeferenzen</ThemedText>
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

        {/* Dish allergens list (all allergens, not just warnings) */}
        {dish.allergens && dish.allergens.length > 0 && (
          <View style={styles.allergensRow}>
            <MaterialIcons name="info-outline" size={13} color={textSecondaryColor} />
            <ThemedText style={[styles.allergensText, { color: textSecondaryColor }]}>
              Allergene: {dish.allergens.map(a => {
                // Find human-readable label
                const entry = Object.entries(ALLERGEN_ID_MAP).find(([, v]) => v === a);
                return entry ? (ALLERGEN_LABELS[entry[0]] || a) : a;
              }).join(', ')}
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
        </View>

        <TouchableOpacity
            style={styles.sustainabilityRow}
            onPress={() => router.push('/sustainability' as any)}
            activeOpacity={0.7}
        >
          <View style={styles.dotsContainer}>
            {[1, 2, 3, 4, 5].map((i) => (
                <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: i <= sustainabilityScore ? scoreColor : (isDark ? '#3A3A3C' : '#E0E0E0'),
                      },
                    ]}
                />
            ))}
          </View>
          <ThemedText style={[styles.sustainabilityLabel, { color: textSecondaryColor }]}>
            Nachhaltigkeit
          </ThemedText>
          <IconSymbol name={'arrow.up.right' as any} size={14} color={textSecondaryColor} />
        </TouchableOpacity>

        <ThemedText style={[styles.categoryText, { color: textSecondaryColor }]}>
          {category.replace('_', ' ')}
        </ThemedText>
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
  warningCard: {
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  unavailableCard: {
    opacity: 0.6,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  unavailableText: {
    fontStyle: 'italic',
  },

  // Warning & match banners
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
    flex: 1,
  },
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22C55E',
    flex: 1,
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

  // Allergens info row
  allergensRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    paddingVertical: 2,
  },
  allergensText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
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
  sustainabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sustainabilityLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
});
