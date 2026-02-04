import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu } from '@/models/Menu';
import { ThemedText } from './themed-text';
import { DishCard } from './dish-card';
import { HTWColors } from '@/constants/theme';

type UserPreferences = {
  dietaryRestrictions: string[];
  allergens: string[];
  maxPrice?: number;
  notificationsEnabled?: boolean;
};

interface MenuSectionProps {
  menu: Menu;
  userPrefs: UserPreferences;
}

const mealTypeMap: Record<Menu['mealType'], string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
};

export const MenuSection: React.FC<MenuSectionProps> = ({ menu, userPrefs }) => {
  const { mealType, dishes, openingHours } = menu;

  const title = mealTypeMap[mealType] || String(mealType);
  const time = `${openingHours.start} - ${openingHours.end}`;

  if (!dishes || dishes.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText style={styles.time}>{time}</ThemedText>
        <ThemedText style={styles.emptyText}>
          Keine Gerichte für diesen Zeitraum verfügbar.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText style={styles.time}>{time}</ThemedText>
      </View>

      <View style={styles.dishesContainer}>
        {dishes.map((dish) => (
          <DishCard
            key={dish.id ?? `${dish.name}-${dish.category}-${dish.price?.student ?? 'x'}`}
            dish={dish}
            userPrefs={userPrefs}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HTWColors.primary,
  },
  time: {
    fontSize: 14,
    color: HTWColors.textLight,
  },
  dishesContainer: {
    gap: 12,
  },
  emptyText: {
    marginTop: 10,
    fontStyle: 'italic',
    color: HTWColors.textLight,
  },
});
