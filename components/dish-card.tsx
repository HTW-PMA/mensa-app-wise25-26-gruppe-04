import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Allergen, Dish, DishLabel } from '@/models/Dish';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateSustainabilityScore, getScoreColor } from '@/utils/sustainabilityScore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAVORITES_STORAGE_KEY = '@mensa_app_favorites';

// Simple event emitter for favorite changes
type Listener = () => void;
const favoritesListeners = new Set<Listener>();

export function onFavoritesChanged(listener: Listener): () => void {
  favoritesListeners.add(listener);
  return () => { favoritesListeners.delete(listener); };
}

function emitFavoritesChanged() {
  favoritesListeners.forEach((fn) => fn());
}

type UserPreferences = {
  dietaryRestrictions: string[];
  allergens: string[];
  maxPrice?: number;
  notificationsEnabled?: boolean;
};

interface DishCardProps {
  dish: Dish;
  userPrefs?: UserPreferences;
}

const DIET_LABELS: Record<string, { label: string; icon: string }> = {
  vegan: { label: 'Vegan', icon: 'heart.fill' },
  vegetarian: { label: 'Vegetarisch', icon: 'heart.fill' },
  glutenfree: { label: 'Glutenfrei', icon: 'heart.fill' },
  lactosefree: { label: 'Laktosefrei', icon: 'heart.fill' },
  halal: { label: 'Halal', icon: 'heart.fill' },
  kosher: { label: 'Koscher', icon: 'heart.fill' },
};

// Maps Allergen enum values to German display labels (EU-LMIV 14 Hauptallergene)
const ALLERGEN_DISPLAY: Record<string, string> = {
  [Allergen.GLUTEN]: 'Gluten',
  [Allergen.CRUSTACEANS]: 'Krebstiere',
  [Allergen.EGGS]: 'Eier',
  [Allergen.FISH]: 'Fisch',
  [Allergen.PEANUTS]: 'Erdnüsse',
  [Allergen.SOYBEANS]: 'Soja',
  [Allergen.MILK]: 'Milch / Laktose',
  [Allergen.NUTS]: 'Schalenfrüchte',
  [Allergen.CELERY]: 'Sellerie',
  [Allergen.MUSTARD]: 'Senf',
  [Allergen.SESAME]: 'Sesam',
  [Allergen.SULPHITES]: 'Sulfite',
  [Allergen.LUPIN]: 'Lupinen',
  [Allergen.MOLLUSCS]: 'Weichtiere',
};

function extractLabelStrings(dish: Dish): string[] {
  const raw = (dish.labels ?? []) as any[];
  return raw.map((x) => String(x).toLowerCase());
}

export const DishCard: React.FC<DishCardProps> = ({ dish, userPrefs }) => {
  const { name, description, price, labels, category, available } = dish;
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const sustainabilityResult = useMemo(() => calculateSustainabilityScore(dish), [dish]);
  const scoreColor = getScoreColor(sustainabilityResult.score);

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

  const dishKey = dish.id || dish.name;

  useEffect(() => {
    checkIfFavorite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dishKey]);

  const isSameDish = (a: Dish, b: Dish): boolean => {
    if (a.id && b.id) return a.id === b.id;
    return a.name === b.name;
  };

  const checkIfFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const favorites: Dish[] = JSON.parse(stored);
        setIsFavorite(favorites.some((fav) => isSameDish(fav, dish)));
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
        favorites = favorites.filter((fav) => !isSameDish(fav, dish));
      } else {
        favorites.push(dish);
      }

      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
      emitFavoritesChanged();
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

  // All allergens detected in the dish (always shown, regardless of user selection)
  const allDishAllergens = dish.allergens ?? [];
  const dishAllergenSet = useMemo(
    () => new Set(allDishAllergens.map((a) => String(a))),
    [allDishAllergens],
  );

  // Match allergens: user's selected allergen IDs that are present in this dish
  const matchedAllergens = useMemo(() => {
    const selected = userPrefs?.allergens ?? [];
    if (selected.length === 0 || dishAllergenSet.size === 0) return [] as string[];
    return selected.filter((id) => dishAllergenSet.has(id));
  }, [userPrefs, dishAllergenSet]);

  const preferenceLine = matchedPreferences
    .map((id) => DIET_LABELS[id]?.label)
    .filter(Boolean)
    .join(' • ');

  const allergenLine = matchedAllergens
    .map((id) => ALLERGEN_DISPLAY[id] ?? id)
    .join(', ');

  const isHighlighted = matchedPreferences.length > 0;
  const hasAllergenWarning = matchedAllergens.length > 0;

  if (!available) {
    return (
      <View style={[styles.card, styles.unavailableCard]}>
        <ThemedText style={styles.name} type="subtitle">
          {name}
        </ThemedText>

        {/* Allergen info on unavailable dishes */}
        <View style={styles.allergenChipsRow}>
          {allDishAllergens.length > 0 ? (
            allDishAllergens.map((a) => {
              const isUserAllergen = matchedAllergens.includes(a as string);
              return (
                <View
                  key={a}
                  style={[
                    styles.allergenChip,
                    isUserAllergen
                      ? { backgroundColor: colorScheme === 'dark' ? '#5C1A1A' : '#FEE2E2' }
                      : { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F3F5' },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.allergenChipText,
                      isUserAllergen ? { color: '#EF4444', fontWeight: '700' } : { color: '#6B7280' },
                    ]}
                  >
                    {ALLERGEN_DISPLAY[a] ?? a}
                  </ThemedText>
                </View>
              );
            })
          ) : (
            <View style={[styles.allergenChip, { backgroundColor: colorScheme === 'dark' ? '#1A3D1A' : '#ECFDF5' }]}>
              <ThemedText style={[styles.allergenChipText, { color: '#22C55E' }]}>
                Keine Allergene erkannt
              </ThemedText>
            </View>
          )}
        </View>

        <ThemedText style={styles.unavailableText}>
          {category} – Derzeit nicht verfügbar
        </ThemedText>
      </View>
    );
  }

  // Determine card style: allergen warning takes visual priority over preference match
  const cardHighlightStyle = hasAllergenWarning
    ? {
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
        backgroundColor: colorScheme === 'dark' ? '#3D1A1A' : '#FEF2F2',
      }
    : isHighlighted
      ? {
          borderLeftWidth: 4,
          borderLeftColor: theme.primary,
          backgroundColor: colorScheme === 'dark' ? '#0A2E1A' : '#F0FDF4',
        }
      : undefined;

  return (
    <View style={[styles.card, cardHighlightStyle]}>
      {/* Allergen warning banner */}
      {hasAllergenWarning && (
        <View style={[styles.allergenBanner, { backgroundColor: colorScheme === 'dark' ? '#5C1A1A' : '#FEE2E2' }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#EF4444" />
          <View style={styles.allergenBannerContent}>
            <ThemedText style={styles.allergenBannerTitle}>Allergen-Warnung</ThemedText>
            <ThemedText style={styles.allergenBannerText}>
              Enthält: {allergenLine}
            </ThemedText>
          </View>
        </View>
      )}
      {/* Preference match banner */}
      {isHighlighted && !hasAllergenWarning && (
        <View style={styles.matchBanner}>
          <IconSymbol name="checkmark.seal.fill" size={16} color={theme.primary} />
          <ThemedText style={[styles.matchBannerText, { color: theme.primary }]}>
            Passt zu deinen Präferenzen: {preferenceLine}
          </ThemedText>
        </View>
      )}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.name} type="subtitle">
            {name}
          </ThemedText>

          {/* Always show allergen info */}
          <View style={styles.allergenChipsRow}>
            {allDishAllergens.length > 0 ? (
              allDishAllergens.map((a) => {
                const isUserAllergen = matchedAllergens.includes(a as string);
                return (
                  <View
                    key={a}
                    style={[
                      styles.allergenChip,
                      isUserAllergen
                        ? { backgroundColor: colorScheme === 'dark' ? '#5C1A1A' : '#FEE2E2' }
                        : { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F3F5' },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.allergenChipText,
                        isUserAllergen ? { color: '#EF4444', fontWeight: '700' } : { color: '#6B7280' },
                      ]}
                    >
                      {ALLERGEN_DISPLAY[a] ?? a}
                    </ThemedText>
                  </View>
                );
              })
            ) : (
              <View style={[styles.allergenChip, { backgroundColor: colorScheme === 'dark' ? '#1A3D1A' : '#ECFDF5' }]}>
                <ThemedText style={[styles.allergenChipText, { color: '#22C55E' }]}>
                  Keine Allergene erkannt
                </ThemedText>
              </View>
            )}
          </View>
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

      {/* Sustainability Score */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setShowBreakdown(!showBreakdown);
        }}
        style={[styles.scoreRow, { backgroundColor: isDark ? '#1A2E0A' : '#F0F9E8' }]}
      >
        <IconSymbol name="leaf.fill" size={14} color={scoreColor} />
        <View style={styles.dotsRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[
                styles.scoreDot,
                {
                  backgroundColor: i <= sustainabilityResult.score ? scoreColor : (isDark ? '#3A3A3C' : '#E0E0E0'),
                },
              ]}
            />
          ))}
        </View>
        <ThemedText style={[styles.scoreLabel, { color: scoreColor }]}>
          {sustainabilityResult.score}/5
        </ThemedText>
        <IconSymbol
          name={showBreakdown ? 'chevron.up' : 'chevron.down'}
          size={12}
          color={isDark ? '#8E8E93' : '#6B7280'}
        />
      </TouchableOpacity>

      {showBreakdown && (
        <View style={[styles.breakdownPanel, { backgroundColor: isDark ? '#1C1C1E' : '#F9FAFB' }]}>
          {sustainabilityResult.criteria.map((c) => (
            <View key={c.name} style={styles.breakdownRow}>
              <View style={styles.breakdownHeader}>
                <ThemedText style={styles.breakdownName}>{c.name}</ThemedText>
                <ThemedText
                  style={[
                    styles.breakdownPoints,
                    { color: c.gained >= c.max ? '#4CAF50' : (c.gained > 0 ? '#FFC107' : '#EF4444') },
                  ]}
                >
                  {c.gained}/{c.max}
                </ThemedText>
              </View>
              <ThemedText style={[styles.breakdownExplanation, { color: isDark ? '#8E8E93' : '#6B7280' }]}>
                {c.explanation}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

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
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  matchBannerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  allergenBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  allergenBannerContent: {
    flex: 1,
  },
  allergenBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EF4444',
  },
  allergenBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 1,
  },
  allergenChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  allergenChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  allergenChipText: {
    fontSize: 10,
    fontWeight: '600',
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
  // Sustainability score
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  scoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  breakdownPanel: {
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  breakdownRow: {
    gap: 2,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownName: {
    fontSize: 12,
    fontWeight: '600',
  },
  breakdownPoints: {
    fontSize: 12,
    fontWeight: '700',
  },
  breakdownExplanation: {
    fontSize: 11,
    lineHeight: 15,
  },
});
