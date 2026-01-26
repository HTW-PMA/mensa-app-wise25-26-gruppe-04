/**
 * MenuCard Component
 * Displays a single dish as a card
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Dish } from '@/models';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HTWColors } from '@/constants/theme';

interface MenuCardProps {
  dish: Dish;
  onPress?: () => void;
}

export function MenuCard({ dish, onPress }: MenuCardProps) {
  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2).replace('.', ',') + ' €';
  };

  return (
    <Pressable onPress={onPress}>
      <ThemedView style={styles.card}>
        <View style={styles.header}>
          <ThemedText type="defaultSemiBold" style={styles.name}>
            {dish.name}
          </ThemedText>
          <View style={styles.pricesBlock}>
            <View style={styles.priceContainer}>
              <ThemedText style={styles.price}>{formatPrice(dish.price.student)}</ThemedText>
              <ThemedText style={styles.priceLabel}>Studierende</ThemedText>
            </View>
            <View style={styles.priceContainer}>
              <ThemedText style={styles.price}>{formatPrice(dish.price.employee)}</ThemedText>
              <ThemedText style={styles.priceLabel}>Angestellte</ThemedText>
            </View>
            <View style={styles.priceContainer}>
              <ThemedText style={styles.price}>{formatPrice(dish.price.guest)}</ThemedText>
              <ThemedText style={styles.priceLabel}>Gäste</ThemedText>
            </View>
          </View>
        </View>

        {dish.description && (
          <ThemedText style={styles.description}>
            {dish.description}
          </ThemedText>
        )}

        {dish.labels && dish.labels.length > 0 && (
          <View style={styles.labelsContainer}>
            {dish.labels.map((label) => (
              <View key={label} style={styles.label}>
                <Text style={styles.labelText}>{label}</Text>
              </View>
            ))}
          </View>
        )}

        {dish.nutrition && (
          <View style={styles.nutritionContainer}>
            <ThemedText style={styles.nutritionText}>
              {dish.nutrition.calories} kcal
            </ThemedText>
            <ThemedText style={styles.nutritionText}>
              P: {dish.nutrition.protein}g
            </ThemedText>
            <ThemedText style={styles.nutritionText}>
              C: {dish.nutrition.carbohydrates}g
            </ThemedText>
            <ThemedText style={styles.nutritionText}>
              F: {dish.nutrition.fat}g
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    flex: 1,
    fontSize: 16,
  },
  pricesBlock: {
    alignItems: 'flex-end',
    gap: 6,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    backgroundColor: HTWColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  labelText: {
    color: '#fff',
    fontSize: 12,
  },
  nutritionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  nutritionText: {
    fontSize: 12,
    opacity: 0.7,
  },
});
