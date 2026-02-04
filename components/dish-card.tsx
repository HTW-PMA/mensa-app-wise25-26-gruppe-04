import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Dish, DishLabel } from '@/models/Dish';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const FAVORITES_STORAGE_KEY = '@mensa_app_favorites';

type UserPreferences = {
  dietaryRestrictions: string[];
  allergens: string[];
  maxPrice?: number;
  notificationsEnabled?: boolean;
};

interface DishCardProps {
  dish: Dish;
  userPrefs: UserPreferences;
}

const DIET_LABELS: Record<string, { label: string; icon: string }> = {
  vegan: { label: 'Vegan', icon: 'heart.fill' },
  vegetarian: { label: 'Vegetarisch', icon: 'heart.fill' },
  glutenfree: { label: 'Glutenfrei', icon: 'heart.fill' },
  lactosefree: { label: 'Laktosefrei', icon: 'heart.fill' },
  halal: { label: 'Halal', icon: 'heart.fill' },
  kosher: { label: 'Koscher', icon: 'heart.fill' },
};

const ALLERGEN_LABELS: Record<string, { label: string; patterns: string[] }> = {
  gluten: { label: 'Gluten', patterns: ['gluten', 'weizen', 'roggen', 'gerste', 'dinkel'] },
  milk: { label: 'Milch', patterns: ['milch', 'laktose', 'molke', 'käse', 'butter', 'joghurt'] },
  eggs: { label: 'Eier', patterns: ['ei', 'eier', 'albumin'] },
  fish: { label: 'Fisch', patterns: ['fisch'] },
  shellfish: { label: 'Schalentiere', patterns: ['schalentiere', 'krebstiere', 'garnelen', 'krabben', 'hummer'] },
  nuts: { label: 'Nüsse', patterns: ['nuss', 'nüsse', 'mandel', 'haselnuss', 'walnuss', 'cashew', 'pistazie'] },
  peanuts: { label: 'Erdnüsse', patterns: ['erdnuss', 'erdnüsse', 'peanut'] },
  soy: { label: 'Soja', patterns: ['soja', 'soy'] },
  celery: { label: 'Sellerie', patterns: ['sellerie', 'celery'] },
  mustard: { label: 'Senf', patterns: ['senf', 'mustard'] },
  sesame: { label: 'Sesam', patterns: ['sesam', 'sesame'] },
  sulfites: { label: 'Sulfite', patterns: ['sulfit', 'sulfite', 'schwefeldioxid'] },
};

function normalizeText(input: unknown): string {
  if (!input) return '';
  if (Array.isArray(input)) return input.map((x) => String(x)).join(' ').toLowerCase();
  return String(input).toLowerCase();
}

// versucht Allergene aus möglichen Feldern zu lesen (API kann unterschiedlich sein)
function extractAllergenText(dish: Dish): string {
  const d: any = dish as any;
  return normalizeText([
    d.allergens,
    d.allergenes,
    d.allergenLabels,
    d.allergenCodes,
    d.allergenInfo,
    d.ingredients,
    dish.description,
    dish.labels, // manchmal kommen Labels als Strings rein
  ]);
}

function extractLabelStrings(dish: Dish): string[] {
  const raw = (dish.labels ?? []) as any[];
  return raw.map((x) => String(x).toLowerCase());
}

export const DishCard: React.FC<DishCardProps> = ({ dish, userPrefs }) => {
  const { name, description, price, labels, category, available } = dish;
  const [isFavorite, setIsFavorite] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dish.id]);

  const checkIfFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const favorites: Dish[] = JSON.parse(stored);
        setIsFavorite(favorites.some((fav) => fav.id === dish.id));
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
        favorites = favorites.filter((fav) => fav.id !== dish.id);
      } else {
        favorites.push(dish);
      }

      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // ====== Präferenz- & Allergen-Logik ======
  const matchedPreferences = useMemo(() => {
    const prefs = userPrefs?.dietaryRestrictions ?? [];
    if (prefs.length === 0) return [];

    const labelStrings = extractLabelStrings(dish);
    const hasVegan = labelStrings.includes('vegan') || labels?.includes(DishLabel.VEGAN);
    const hasVegetarian = labelStrings.includes('vegetarian') || labels?.includes(DishLabel.VEGETARIAN);

    return prefs.filter((prefId) => {
      if (prefId === 'vegan') return hasVegan;
      if (prefId === 'vegetarian') return hasVegetarian;
      // die restlichen (glutenfree/lactosefree/halal/kosher) hängen davon ab,
      // ob eure API dazu Daten liefert. Wenn nicht: werden sie hier nicht gematcht.
      // (Dann bleibt’s neutral, aber nichts wird fälschlich behauptet.)
      return false;
    });
  }, [dish, labels, userPrefs]);

  const matchedAllergens = useMemo(() => {
    const selected = userPrefs?.allergens ?? [];
    if (selected.length === 0) return [];

    const text = extractAllergenText(dish);

    return selected.filter((allergenId) => {
      const meta = ALLERGEN_LABELS[allergenId];
      if (!meta) return false;
      return meta.patterns.some((p) => text.includes(p));
    });
  }, [dish, userPrefs]);

  const preferenceLine = matchedPreferences
    .map((id) => DIET_LABELS[id]?.label)
    .filter(Boolean)
    .join(' • ');

  const allergenLine = matchedAllergens
    .map((id) => ALLERGEN_LABELS[id]?.label)
    .filter(Boolean)
    .join(', ');

  if (!available) {
    return (
      <View style={[styles.card, styles.unavailableCard]}>
        <ThemedText style={styles.name} type="subtitle">
          {name}
        </ThemedText>

        {(preferenceLine || allergenLine) ? (
          <View style={styles.indicatorRow}>
            {preferenceLine ? (
              <View style={styles.indicatorChip}>
                <IconSymbol name="heart.fill" size={14} color={theme.error} />
                <ThemedText style={[styles.indicatorText, { color: theme.error }]}>
                  {preferenceLine}
                </ThemedText>
              </View>
            ) : null}

            {allergenLine ? (
              <View style={styles.indicatorChip}>
                <IconSymbol name="exclamationmark.triangle.fill" size={14} color={theme.warning ?? theme.error} />
                <ThemedText style={[styles.indicatorText, { color: theme.warning ?? theme.error }]}>
                  {allergenLine}
                </ThemedText>
              </View>
            ) : null}
          </View>
        ) : null}

        <ThemedText style={styles.unavailableText}>
          {category} – Derzeit nicht verfügbar
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.name} type="subtitle">
            {name}
          </ThemedText>

          {(preferenceLine || allergenLine) ? (
            <View style={styles.indicatorRow}>
              {preferenceLine ? (
                <View style={styles.indicatorChip}>
                  <IconSymbol name="heart.fill" size={14} color={theme.error} />
                  <ThemedText style={[styles.indicatorText, { color: theme.error }]}>
                    {preferenceLine}
                  </ThemedText>
                </View>
              ) : null}

              {allergenLine ? (
                <View style={styles.indicatorChip}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={14} color={theme.warning ?? theme.error} />
                  <ThemedText style={[styles.indicatorText, { color: theme.warning ?? theme.error }]}>
                    {allergenLine}
                  </ThemedText>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.headerRight}>
          <View style={styles.pricesBlock}>
            <View style={styles.priceContainer}>
              <ThemedText style={styles.priceLabel}>Studierende</ThemedText>
              <ThemedText style={styles.priceValue}>{formatPrice(price.student)}</ThemedText>
            </View>
            <View style={styles.priceContainer}>
              <ThemedText style={styles.priceLabel}>Angestellte</ThemedText>
              <ThemedText style={styles.priceValue}>{formatPrice(price.employee)}</ThemedText>
            </View>
            <View style={styles.priceContainer}>
              <ThemedText style={styles.priceLabel}>Gäste</ThemedText>
              <ThemedText style={styles.priceValue}>{formatPrice(price.guest)}</ThemedText>
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

      {description ? <ThemedText style={styles.description}>{description}</ThemedText> : null}

      <View style={styles.footer}>
        <View style={styles.labelsContainer}>
          {labels?.map((label) => {
            const { name: iconName, color } = getLabelIcon(label);
            return (
              <View key={label} style={styles.label}>
                <IconSymbol name={iconName} size={14} color={color} />
                <ThemedText style={[styles.labelText, { color }]}>
                  {String(label).replace('_', ' ')}
                </ThemedText>
              </View>
            );
          })}
        </View>

        <ThemedText style={styles.categoryText}>{category.replace('_', ' ')}</ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: 8,
  },
  unavailableCard: {
    opacity: 0.6,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  unavailableText: {
    fontStyle: 'italic',
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
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
    fontSize: 16,
    fontWeight: '600',
  },

  indicatorRow: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  indicatorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F3F5',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: '600',
  },

  priceContainer: {
    marginLeft: 10,
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
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
    backgroundColor: '#F2F3F5',
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
    color: '#6B7280',
    textTransform: 'capitalize',
  },
});
