import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Menu } from '@/models/Menu';
import { Dish, DishLabel } from '@/models/Dish';
import { ThemedText } from './themed-text';
import { DishCard } from './dish-card';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserPreferences, ALLERGEN_ID_MAP } from '@/hooks/useUserPreferences';

interface MenuSectionProps {
  menu: Menu;
}

const MEAL_TYPE_CONFIG: Record<string, {
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
}> = {
  breakfast: { label: 'Fruehstueck', icon: 'free-breakfast' },
  lunch: { label: 'Mittagessen', icon: 'restaurant' },
  dinner: { label: 'Abendessen', icon: 'dinner-dining' },
};

// Same mappings as in dish-card.tsx
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

function dishMatchesPrefs(
  dish: Dish,
  dietaryRestrictions: string[],
  allergens: string[],
): boolean {
  if (!dish.available) return false;

  const dishLabels = dish.labels ?? [];
  const dishAllergens = dish.allergens ?? [];

  // Check label-based diets (vegetarian, vegan, halal, kosher)
  for (const dietId of dietaryRestrictions) {
    const requiredLabel = DIET_LABEL_MAP[dietId];
    if (requiredLabel && !dishLabels.includes(requiredLabel)) {
      return false;
    }
  }

  // Check allergen-based diets (glutenfree, lactosefree)
  for (const dietId of dietaryRestrictions) {
    const avoidAllergen = DIET_ALLERGEN_MAP[dietId];
    if (avoidAllergen && dishAllergens.includes(avoidAllergen as any)) {
      return false;
    }
  }

  // Check user-selected allergens
  for (const settingsId of allergens) {
    const allergenValue = ALLERGEN_ID_MAP[settingsId];
    if (allergenValue && dishAllergens.includes(allergenValue as any)) {
      return false;
    }
  }

  return true;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ menu }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const userPrefs = useUserPreferences();
  const { mealType, dishes, openingHours } = menu;

  const config = MEAL_TYPE_CONFIG[mealType] || { label: mealType, icon: 'restaurant' as const };
  const time = openingHours ? `${openingHours.start} – ${openingHours.end}` : null;
  const availableCount = dishes.filter(d => d.available).length;

  const hasFilters = userPrefs.dietaryRestrictions.length > 0 || userPrefs.allergens.length > 0;

  const { matching, rest } = useMemo(() => {
    if (!hasFilters) return { matching: [], rest: dishes };

    const m: Dish[] = [];
    const r: Dish[] = [];
    for (const dish of dishes) {
      if (dishMatchesPrefs(dish, userPrefs.dietaryRestrictions, userPrefs.allergens)) {
        m.push(dish);
      } else {
        r.push(dish);
      }
    }
    return { matching: m, rest: r };
  }, [dishes, userPrefs.dietaryRestrictions, userPrefs.allergens, hasFilters]);

  if (dishes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}>
            <MaterialIcons name={config.icon} size={18} color={primaryColor} />
          </View>
          <View style={styles.sectionHeaderText}>
            <ThemedText style={styles.sectionTitle}>{config.label}</ThemedText>
            {time && (
              <ThemedText style={[styles.timeText, { color: textSecondaryColor }]}>{time}</ThemedText>
            )}
          </View>
        </View>
        <ThemedText style={[styles.emptyText, { color: textSecondaryColor }]}>
          Keine Gerichte fuer diesen Zeitraum verfuegbar.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}>
          <MaterialIcons name={config.icon} size={18} color={primaryColor} />
        </View>
        <View style={styles.sectionHeaderText}>
          <ThemedText style={styles.sectionTitle}>{config.label}</ThemedText>
          {time && (
            <ThemedText style={[styles.timeText, { color: textSecondaryColor }]}>{time}</ThemedText>
          )}
        </View>
        <View style={[styles.countBadge, { backgroundColor: primaryColor + '15' }]}>
          <ThemedText style={[styles.countText, { color: primaryColor }]}>{availableCount}</ThemedText>
        </View>
      </View>

      {/* If filters are active: show matching first, then rest */}
      {hasFilters && matching.length > 0 && (
        <>
          {/* Matching header */}
          <View style={[styles.filterBanner, { backgroundColor: isDark ? '#0A2E1A' : '#F0FDF4' }]}>
            <MaterialIcons name="check-circle" size={16} color="#22C55E" />
            <ThemedText style={styles.filterBannerText}>
              {matching.length} {matching.length === 1 ? 'Gericht passt' : 'Gerichte passen'} zu deinen Filtern
            </ThemedText>
          </View>

          <View style={styles.dishesContainer}>
            {matching.map((dish, index) => (
              <DishCard key={dish.id || `match-${index}`} dish={dish} />
            ))}
          </View>

          {/* Separator + rest */}
          {rest.length > 0 && (
            <>
              <View style={styles.separator}>
                <View style={[styles.separatorLine, { backgroundColor: isDark ? '#2C2C2E' : '#E5E7EB' }]} />
                <ThemedText style={[styles.separatorText, { color: textSecondaryColor }]}>
                  Weitere Gerichte ({rest.length})
                </ThemedText>
                <View style={[styles.separatorLine, { backgroundColor: isDark ? '#2C2C2E' : '#E5E7EB' }]} />
              </View>
              <View style={styles.dishesContainer}>
                {rest.map((dish, index) => (
                  <DishCard key={dish.id || `rest-${index}`} dish={dish} />
                ))}
              </View>
            </>
          )}
        </>
      )}

      {/* If filters active but nothing matches */}
      {hasFilters && matching.length === 0 && (
        <>
          <View style={[styles.filterBanner, { backgroundColor: isDark ? '#2E2A0A' : '#FFFBEB' }]}>
            <MaterialIcons name="info" size={16} color="#F59E0B" />
            <ThemedText style={[styles.filterBannerText, { color: '#F59E0B' }]}>
              Kein Gericht passt zu deinen Filtern
            </ThemedText>
          </View>
          <View style={styles.dishesContainer}>
            {dishes.map((dish, index) => (
              <DishCard key={dish.id || `dish-${index}`} dish={dish} />
            ))}
          </View>
        </>
      )}

      {/* No filters: show all normally */}
      {!hasFilters && (
        <View style={styles.dishesContainer}>
          {dishes.map((dish, index) => (
            <DishCard key={dish.id || `dish-${index}`} dish={dish} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    marginTop: 1,
  },
  countBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Filter banner
  filterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  filterBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22C55E',
    flex: 1,
  },

  // Separator
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    fontSize: 12,
    fontWeight: '500',
  },

  dishesContainer: {
    gap: 10,
  },
  emptyText: {
    fontStyle: 'italic',
    marginLeft: 46,
  },
});
